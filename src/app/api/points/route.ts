import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

// Helper to get user and business from request
const getAuthUser = async (request: NextRequest) => {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as {
      userId: string;
      businessId?: string;
    };

    // Find user and their business context
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { business: true }
    });

    return user;
  } catch (err) {
    return null;
  }
};

// GET user points
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }

    // Get user points
    const userPoints = await prisma.userPoints.findUnique({
      where: { userId: user.id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            businessId: true
          }
        }
      }
    });

    if (!userPoints) {
      // Auto-initialize points if missing
      const initialPoints = await prisma.userPoints.create({
        data: {
          userId: user.id,
          points: 0,
          tier: 'BRONZE'
        },
        include: { user: true }
      });
      return NextResponse.json({
        points: initialPoints.points,
        tier: initialPoints.tier,
        user: {
          firstName: initialPoints.user.firstName,
          lastName: initialPoints.user.lastName,
          email: initialPoints.user.email
        }
      });
    }

    return NextResponse.json({
      points: userPoints.points,
      tier: userPoints.tier,
      user: {
        firstName: userPoints.user.firstName,
        lastName: userPoints.user.lastName,
        email: userPoints.user.email
      }
    });

  } catch (error) {
    console.error('Get points error:', error);
    return NextResponse.json(
      { error: 'Puanlar alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST to add points
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }

    const body = await request.json();
    const { points, transactionType, description, referenceId, businessId } = body;

    // Validate business context
    // If businessId is provided in body, verify it matches user's business
    if (businessId && user.businessId && businessId !== user.businessId) {
      return NextResponse.json({ error: 'Yetkisiz işletme erişimi' }, { status: 403 });
    }

    // Validate input
    if (!points || !transactionType) {
      return NextResponse.json(
        { error: 'Puan ve işlem türü zorunludur' },
        { status: 400 }
      );
    }

    const pointsNum = parseInt(points?.toString()) || 0;

    // Get or Create current user points
    let currentUserPoints = await prisma.userPoints.findUnique({
      where: { userId: user.id }
    });

    if (!currentUserPoints) {
      currentUserPoints = await prisma.userPoints.create({
        data: { userId: user.id, points: 0, tier: 'BRONZE' }
      });
    }

    // Calculate new points
    let newPoints = currentUserPoints.points;

    if (transactionType === 'EARNED' || transactionType === 'BONUS') {
      newPoints += pointsNum;
    } else if (transactionType === 'REDEEMED') {
      if (newPoints < pointsNum) {
        return NextResponse.json(
          { error: 'Yetersiz puan' },
          { status: 400 }
        );
      }
      newPoints -= pointsNum;
    }

    // Determine new tier based on points
    let newTier = currentUserPoints.tier;
    if (newPoints >= 10000) newTier = 'PLATINUM';
    else if (newPoints >= 5000) newTier = 'GOLD';
    else if (newPoints >= 1000) newTier = 'SILVER';
    else newTier = 'BRONZE';

    // Update user points and create transaction in one transaction
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.userPoints.update({
        where: { userId: user.id },
        data: {
          points: newPoints,
          tier: newTier
        }
      });

      await tx.pointTransaction.create({
        data: {
          userId: user.id,
          points: pointsNum,
          transactionType,
          description: description || (transactionType === 'EARNED' ? 'Sipariş Kazancı' : 'Puan Kullanımı'),
          referenceId
        }
      });

      return updated;
    });

    return NextResponse.json({
      message: 'Puan işlemi başarılı',
      points: result.points,
      tier: result.tier,
      transactionPoints: pointsNum,
      transactionType
    });

  } catch (error) {
    console.error('Points transaction error:', error);
    return NextResponse.json(
      { error: 'Puan işlemi sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}