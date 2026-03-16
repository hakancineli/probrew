import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('auth-token')?.value || 
                     request.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = verifyToken(token);
        if (!user?.businessId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Get all active staff for the specific business
        const activeStaff = await prisma.barista.findMany({
            where: { isActive: true, businessId: user.businessId }
        });

        if (activeStaff.length === 0) {
            return NextResponse.json({ message: 'Aktif personel bulunamadı.' });
        }

        // 2. Create expense records for each staff member
        const transactions = activeStaff.map(staff => {
            if (staff.salary <= 0) return null;

            return prisma.expense.create({
                data: {
                    businessId: user.businessId,
                    description: `Maaş Ödemesi: ${staff.name}`,
                    amount: staff.salary,
                    category: 'SALARY',
                    date: new Date(),
                    staffId: staff.id
                }
            });
        }).filter(t => t !== null); // Filter out nulls

        if (transactions.length > 0) {
            // @ts-ignore - filtering nulls might not satisfy TS strict check perfectly without type guard, relying on runtime
            await prisma.$transaction(transactions);
        }

        return NextResponse.json({
            success: true,
            processedCount: transactions.length,
            message: `${transactions.length} personelin maaşı gider olarak işlendi.`
        });

    } catch (error) {
        console.error('Process salaries error:', error);
        return NextResponse.json(
            { error: 'Maaşlar işlenirken hata oluştu' },
            { status: 500 }
        );
    }
}
