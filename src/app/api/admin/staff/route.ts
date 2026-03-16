import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { StaffRole } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

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

        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

        const staffRaw = await prisma.barista.findMany({
            where: {
                businessId: user.businessId
            },
            include: {
                expenses: {
                    where: {
                        category: 'ADVANCE',
                        date: { gte: startOfMonth }
                    },
                    select: { id: true, amount: true, date: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const staff = staffRaw.map(s => {
            const totalAdvances = s.expenses?.reduce((sum, e) => sum + (Number(e.amount) || 0), 0) || 0;
            return {
                ...s,
                totalAdvances,
                remainingPayment: (Number(s.salary) || 0) - totalAdvances,
                expenses: s.expenses || []
            };
        });

        return NextResponse.json(staff);
    } catch (error) {
        console.error('Staff fetch error:', error);
        return NextResponse.json(
            { error: 'Personel listesi getirilemedi' },
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
        const { name, email, phone, role, salary, password, startDate, pinCode } = body;

        if (!name || !email) {
            return NextResponse.json(
                { error: 'İsim ve E-posta zorunludur.' },
                { status: 400 }
            );
        }

        // Check unique email
        const existing = await prisma.barista.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json(
                { error: 'Bu e-posta adresi zaten kayıtlı.' },
                { status: 400 }
            );
        }

        // Hash the password or PIN
        // Re-using password or pinCode as basis for passwordHash
        const rawPassword = password || pinCode || '123456';
        const passwordHash = await bcrypt.hash(rawPassword, 10);

        const staff = await prisma.barista.create({
            data: {
                businessId: user.businessId,
                name,
                email,
                phone,
                role: role as StaffRole || 'BARISTA',
                salary: parseFloat(salary?.toString()) || 0,
                startDate: startDate ? new Date(startDate) : new Date(),
                passwordHash,
                isActive: true,
                pinCode: pinCode || null
            }
        });

        return NextResponse.json(staff);
    } catch (error) {
        console.error('Staff creation error:', error);
        return NextResponse.json(
            { error: 'Personel oluşturulamadı' },
            { status: 500 }
        );
    }
}
