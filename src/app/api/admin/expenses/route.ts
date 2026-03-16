import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ExpenseCategory } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Helper to get user from request
const getUser = (request: NextRequest) => {
    let token = request.cookies.get('auth-token')?.value;
    if (!token) {
        const authHeader = request.headers.get('authorization');
        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }
    return token ? verifyToken(token) : null;
};

export async function GET(request: NextRequest) {
    try {
        const user = getUser(request);
        if (!user?.businessId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const monthParam = searchParams.get('month');
        const yearParam = searchParams.get('year');

        const now = new Date();
        const month = monthParam ? parseInt(monthParam) : now.getMonth() + 1;
        const year = yearParam ? parseInt(yearParam) : now.getFullYear();

        const startDate = new Date(Date.UTC(year, month - 1, 1, -3, 0, 0, 0));
        const endDate = new Date(Date.UTC(year, month, 0, 20, 59, 59, 999));

        const getTRDate = (date: Date) => {
            const trDate = new Date(date.getTime() + (3 * 60 * 60 * 1000));
            return trDate.toISOString().split('T')[0];
        };

        const dateFilter = {
            businessId: user.businessId,
            date: {
                gte: startDate,
                lte: endDate
            }
        };

        const paymentDateFilter = {
            order: {
                businessId: user.businessId,
                isDeleted: false
            },
            createdAt: {
                gte: startDate,
                lte: endDate
            }
        };

        // 1. Get Expenses
        const expenses = await prisma.expense.findMany({
            where: dateFilter,
            orderBy: {
                date: 'desc'
            },
            include: {
                staff: {
                    select: { name: true }
                }
            }
        });

        const totalExpenses = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

        // 2. Get Revenue (Include Orders and Staff Consumptions)
        const paymentsAggregate = await prisma.payment.aggregate({
            where: {
                status: 'COMPLETED',
                ...paymentDateFilter
            },
            _sum: {
                amount: true
            }
        });

        const staffConsumptionsWithItems = await prisma.staffConsumption.findMany({
            where: {
                staff: { businessId: user.businessId },
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                items: {
                    where: {
                        staffPrice: { gt: 0 }
                    }
                }
            }
        });

        const allStaffItems = staffConsumptionsWithItems.flatMap(sc =>
            sc.items.map(item => ({
                amount: (Number(item.staffPrice) || 0) * (Number(item.quantity) || 0),
                createdAt: sc.createdAt,
                paymentMethod: sc.paymentMethod
            }))
        );

        const totalStaffRevenue = allStaffItems.reduce((sum, item) => sum + item.amount, 0);
        const totalRevenue = (paymentsAggregate._sum.amount || 0) + totalStaffRevenue;

        const dailyMap = new Map<string, any>();
        const dailyOrderSets = new Map<string, Set<string>>();
        const currentDataDay = new Date(startDate.getTime() + (3 * 60 * 60 * 1000));
        const endDataDay = new Date(endDate.getTime() + (3 * 60 * 60 * 1000));

        while (currentDataDay <= endDataDay) {
            const dayKey = currentDataDay.toISOString().split('T')[0];
            dailyMap.set(dayKey, {
                date: dayKey,
                totalSales: 0,
                cashSales: 0,
                cardSales: 0,
                totalExpenses: 0,
                netProfit: 0,
                orderCount: 0
            });
            dailyOrderSets.set(dayKey, new Set());
            currentDataDay.setUTCDate(currentDataDay.getUTCDate() + 1);
        }

        const allPayments = await prisma.payment.findMany({
            where: {
                status: 'COMPLETED',
                ...paymentDateFilter
            },
            select: {
                amount: true,
                method: true,
                createdAt: true,
                orderId: true
            }
        });

        allPayments.forEach(p => {
            const dayKey = getTRDate(p.createdAt);
            if (dailyMap.has(dayKey)) {
                const entry = dailyMap.get(dayKey);
                entry.totalSales += Number(p.amount) || 0;
                if (p.method === 'CASH') entry.cashSales += Number(p.amount) || 0;
                else entry.cardSales += Number(p.amount) || 0;
                dailyOrderSets.get(dayKey)!.add(p.orderId);
            }
        });

        allStaffItems.forEach(si => {
            const dayKey = getTRDate(si.createdAt);
            if (dailyMap.has(dayKey)) {
                const entry = dailyMap.get(dayKey);
                entry.totalSales += si.amount;
                if (si.paymentMethod === 'CREDIT_CARD') {
                    entry.cardSales += si.amount;
                } else {
                    entry.cashSales += si.amount;
                }
            }
        });

        dailyOrderSets.forEach((orderSet, dayKey) => {
            if (dailyMap.has(dayKey)) {
                dailyMap.get(dayKey).orderCount = orderSet.size;
            }
        });

        expenses.forEach(e => {
            const dayKey = getTRDate(e.date);
            if (dailyMap.has(dayKey)) {
                const entry = dailyMap.get(dayKey);
                entry.totalExpenses += Number(e.amount) || 0;
            }
        });

        const dailyBreakdown = Array.from(dailyMap.values()).map(day => ({
            ...day,
            netProfit: day.totalSales - day.totalExpenses
        })).sort((a, b) => a.date.localeCompare(b.date));

        const ingredients = await prisma.ingredient.findMany({
            where: { businessId: user.businessId }
        });
        const totalStockValue = ingredients.reduce((sum, i) => sum + ((Number(i.stock) || 0) * (Number(i.costPerUnit) || 0)), 0);

        return NextResponse.json({
            expenses,
            summary: {
                totalRevenue,
                totalExpenses,
                netProfit: totalRevenue - totalExpenses,
                totalStockValue,
                adjustedProfit: (totalRevenue - totalExpenses) + totalStockValue
            },
            dailyBreakdown
        });
    } catch (error) {
        console.error('Expenses fetch error:', error);
        return NextResponse.json(
            { error: 'Giderler ve finansal veriler getirilemedi' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = getUser(request);
        if (!user?.businessId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { description, amount, category, date, staffId } = body;

        if (!description || !amount || !category) {
            return NextResponse.json(
                { error: 'Eksik bilgi: Açıklama, Tutar ve Kategori zorunludur.' },
                { status: 400 }
            );
        }

        const expense = await prisma.expense.create({
            data: {
                businessId: user.businessId,
                description,
                amount: parseFloat(amount?.toString()) || 0,
                category: category as ExpenseCategory,
                date: date ? new Date(date) : new Date(),
                staffId: staffId || null,
            }
        });

        return NextResponse.json(expense);
    } catch (error) {
        console.error('Expense creation error:', error);
        return NextResponse.json(
            { error: 'Gider oluşturulamadı' },
            { status: 500 }
        );
    }
}
