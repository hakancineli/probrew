import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET specific business details
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const role = request.headers.get('x-user-role');
        if (role !== 'SUPERADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const business = await prisma.business.findUnique({
            where: { id: params.id },
            include: {
                _count: {
                    select: {
                        baristas: true,
                        products: true,
                        orders: true,
                        tables: true,
                        expenses: true
                    }
                },
                systemSettings: true
            }
        });

        if (!business) {
            return NextResponse.json({ error: 'Business not found' }, { status: 404 });
        }

        return NextResponse.json(business);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch business' }, { status: 500 });
    }
}

// PATCH - Update business details (status, trial end etc)
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const role = request.headers.get('x-user-role');
        if (role !== 'SUPERADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { subscriptionStatus, trialEndsAt, subscriptionEnd, name, slug } = body;

        const updated = await prisma.business.update({
            where: { id: params.id },
            data: {
                subscriptionStatus: subscriptionStatus !== undefined ? subscriptionStatus : undefined,
                trialEndsAt: trialEndsAt ? new Date(trialEndsAt) : undefined,
                subscriptionEnd: subscriptionEnd ? new Date(subscriptionEnd) : undefined,
                name: name || undefined,
                slug: slug || undefined,
            }
        });

        // Add Audit Log
        if (subscriptionStatus || trialEndsAt) {
            await prisma.auditLog.create({
                data: {
                    businessId: params.id,
                    action: `SUPERADMIN_UPDATE_${subscriptionStatus ? 'STATUS' : 'TRIAL'}`,
                    entity: 'Business',
                    entityId: params.id,
                    userEmail: request.headers.get('x-user-email') || 'SuperAdmin',
                    newData: { subscriptionStatus, trialEndsAt }
                }
            });
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Superadmin business update error:', error);
        return NextResponse.json({ error: 'Failed to update business' }, { status: 500 });
    }
}

// DELETE - Remove business and all its data
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const role = request.headers.get('x-user-role');
        const userEmail = request.headers.get('x-user-email') || 'SuperAdmin';
        
        if (role !== 'SUPERADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Add Audit Log BEFORE deletion because of cascade
        await prisma.auditLog.create({
            data: {
                businessId: params.id,
                action: 'SUPERADMIN_DELETE_BUSINESS',
                entity: 'Business',
                entityId: params.id,
                userEmail,
                newData: { info: 'Full tenant deletion' }
            }
        });

        // Deletion will cascade due to prisma schema (onDelete: Cascade)
        await prisma.business.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Superadmin business deletion error:', error);
        return NextResponse.json({ error: 'Failed to delete business' }, { status: 500 });
    }
}
