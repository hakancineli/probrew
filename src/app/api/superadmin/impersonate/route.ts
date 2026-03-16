import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
    try {
        const superadminRole = request.headers.get('x-user-role');
        const superadminEmail = request.headers.get('x-user-email');

        if (superadminRole !== 'SUPERADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { businessId } = await request.json();

        if (!businessId) {
            return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
        }

        // Find a manager for this business
        const manager = await prisma.barista.findFirst({
            where: { 
                businessId,
                role: 'MANAGER',
                isActive: true
            }
        });

        if (!manager) {
            return NextResponse.json({ error: 'Bu işletme için aktif bir yönetici bulunamadı.' }, { status: 404 });
        }

        // Generate JWT token as the manager
        const token = jwt.sign(
            {
                userId: manager.id,
                email: manager.email,
                businessId: manager.businessId,
                role: 'MANAGER'
            },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '2h' } // Short duration for impersonation
        );

        // Audit Log
        await prisma.auditLog.create({
            data: {
                businessId: businessId,
                action: 'SUPERADMIN_IMPERSONATION',
                entity: 'Auth',
                entityId: manager.id,
                userEmail: superadminEmail || 'SuperAdmin',
                newData: { targetManager: manager.email }
            }
        });

        const response = NextResponse.json({ 
            success: true, 
            redirect: '/admin',
            message: `${manager.businessId} işletmesine yönetici olarak bağlanıldı.`
        });

        // Set the auth cookie
        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 2 * 60 * 60, // 2 hours
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Impersonation error:', error);
        return NextResponse.json({ error: 'Impersonation failed' }, { status: 500 });
    }
}
