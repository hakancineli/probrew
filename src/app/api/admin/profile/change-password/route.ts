import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { verifyToken } from '@/lib/auth';

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

export async function POST(request: NextRequest) {
    try {
        const user = getUser(request);
        if (!user?.businessId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: 'Mevcut şifre ve yeni şifre gereklidir' },
                { status: 400 }
            );
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: 'Yeni şifre en az 6 karakter olmalıdır' },
                { status: 400 }
            );
        }

        // Find Staff - Scoped to Business
        const staff = await prisma.barista.findFirst({
            where: { id: user.userId, businessId: user.businessId }
        });

        if (!staff) {
            return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
        }

        // Verify Current Password
        const isValid = await bcrypt.compare(currentPassword, staff.passwordHash);
        if (!isValid) {
            return NextResponse.json({ error: 'Mevcut şifre hatalı' }, { status: 401 });
        }

        // Hash New Password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);

        // Update
        await prisma.barista.update({
            where: { id: user.userId },
            data: { passwordHash: hash }
        });

        return NextResponse.json({ message: 'Şifreniz başarıyla değiştirildi.' });

    } catch (error) {
        console.error('Password change error:', error);
        return NextResponse.json(
            { error: 'Şifre değiştirilemedi' },
            { status: 500 }
        );
    }
}
