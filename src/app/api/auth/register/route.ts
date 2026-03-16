import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { seedDemoData } from '@/lib/demoSeed';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      phone, 
      birthDate, 
      businessId,
      isBusinessOwner,
      businessName 
    } = data;

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: 'Email ve şifre zorunludur' }, { status: 400 });
    }

    if (!isBusinessOwner && !businessId) {
      return NextResponse.json({ error: 'İşletme seçimi zorunludur' }, { status: 400 });
    }

    if (isBusinessOwner && !businessName) {
      return NextResponse.json({ error: 'İşletme adı zorunludur' }, { status: 400 });
    }

    // Check if user already exists (Check both User and Barista tables)
    const existingUser = await prisma.user.findUnique({ where: { email } });
    const existingStaff = await prisma.barista.findUnique({ where: { email } });

    if (existingUser || existingStaff) {
      return NextResponse.json(
        { error: 'Bu e-posta adresi zaten kayıtlı' },
        { status: 409 }
      );
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    let finalBusinessId = businessId;

    // 1. Handle Business Creation if isBusinessOwner
    if (isBusinessOwner) {
      const slug = businessName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      // Check if slug exists
      const existingBusiness = await prisma.business.findUnique({ where: { slug } });
      const finalSlug = existingBusiness ? `${slug}-${Math.floor(Math.random() * 1000)}` : slug;

      const business = await prisma.business.create({
        data: {
          name: businessName,
          slug: finalSlug,
          primaryColor: '#2563EB',
          secondaryColor: '#1E40AF',
        }
      });
      
      finalBusinessId = business.id;

      // Create Manager Account (Barista table)
      const manager = await prisma.barista.create({
        data: {
          email,
          passwordHash,
          name: `${firstName || ''} ${lastName || ''}`.trim() || 'İşletme Sahibi',
          businessId: finalBusinessId,
          role: 'MANAGER',
          isActive: true,
        }
      });

      // Seed Demo Data (Products, Tables, Register)
      await seedDemoData(finalBusinessId);

      // Generate JWT
      const token = jwt.sign(
        { userId: manager.id, email: manager.email, businessId: manager.businessId, role: 'MANAGER', isStaff: true },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '12h' }
      );

      const response = NextResponse.json({
        message: 'İşletme ve yönetici hesabı başarıyla oluşturuldu',
        user: { id: manager.id, email: manager.email, name: manager.name },
        token,
        role: 'MANAGER'
      });

      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 12 * 60 * 60,
        path: '/',
      });

      return response;
    }

    // 2. Regular Customer Registration
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: firstName || null,
        lastName: lastName || null,
        phone: phone || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        loyaltyPin: phone ? phone.replace(/\D/g, '').slice(-4) : null,
        businessId: finalBusinessId
      }
    });

    await prisma.userPoints.create({
      data: {
        userId: user.id,
        points: 0,
        tier: 'BRONZE',
      }
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, businessId: user.businessId, role: 'CUSTOMER' },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
      message: 'Kullanıcı başarıyla oluşturuldu',
      user: { id: user.id, email: user.email, firstName: user.firstName },
      token,
      role: 'CUSTOMER'
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Kayıt sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}