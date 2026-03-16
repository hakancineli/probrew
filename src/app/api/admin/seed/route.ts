import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { seedDemoData } from '@/lib/demoSeed';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const businessId = decoded.businessId;

    if (!businessId) return NextResponse.json({ error: 'No business found in token' }, { status: 400 });

    const success = await seedDemoData(businessId);

    if (success) {
      return NextResponse.json({ message: 'Demo data seeded successfully' });
    } else {
      return NextResponse.json({ error: 'Seeding failed' }, { status: 500 });
    }
  } catch (error) {
    console.error('Seed route error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
