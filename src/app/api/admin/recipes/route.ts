import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';
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

// GET - Get recipes for a product or all recipes for this business
export async function GET(request: NextRequest) {
    try {
        const user = getUser(request);
        if (!user?.businessId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');

        const where: any = {
            product: { businessId: user.businessId }
        };

        if (productId) {
            where.productId = productId;
        }

        const recipes = await prisma.recipe.findMany({
            where,
            include: {
                product: true,
                items: {
                    include: {
                        ingredient: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(recipes);
    } catch (error) {
        console.error('Recipes fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch recipes' },
            { status: 500 }
        );
    }
}

// POST - Create or update recipe
export async function POST(request: NextRequest) {
    try {
        const user = getUser(request);
        if (!user?.businessId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { productId, size, items } = body;

        if (!productId || !items || items.length === 0) {
            return NextResponse.json(
                { error: 'Product ID and items are required' },
                { status: 400 }
            );
        }

        // Verify product belongs to user's business
        const product = await prisma.product.findFirst({
            where: { id: productId.toString(), businessId: user.businessId }
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Check if recipe already exists
        const existingRecipe = await prisma.recipe.findFirst({
            where: {
                productId: product.id,
                size: size || null
            }
        });

        let recipe;
        if (existingRecipe) {
            // Update existing recipe within transaction
            recipe = await prisma.$transaction(async (tx) => {
                await tx.recipeItem.deleteMany({
                    where: { recipeId: existingRecipe.id }
                });

                return await tx.recipe.update({
                    where: { id: existingRecipe.id },
                    data: {
                        items: {
                            create: items.map((item: any) => ({
                                ingredientId: item.ingredientId,
                                quantity: parseFloat(item.quantity.toString())
                            }))
                        }
                    },
                    include: {
                        items: {
                            include: { ingredient: true }
                        },
                        product: true
                    }
                });
            });

            await createAuditLog({
                action: 'RECIPE_UPDATED',
                entity: 'Recipe',
                entityId: existingRecipe.id,
                businessId: user.businessId,
                userId: user.userId,
                userEmail: user.email,
                newData: {
                    productName: product.name,
                    size: size || 'STANDART',
                    itemCount: items.length
                }
            });
        } else {
            // Create new recipe
            recipe = await prisma.recipe.create({
                data: {
                    productId: product.id,
                    size: size || null,
                    items: {
                        create: items.map((item: any) => ({
                            ingredientId: item.ingredientId,
                            quantity: parseFloat(item.quantity.toString())
                        }))
                    }
                },
                include: {
                    items: {
                        include: { ingredient: true }
                    },
                    product: true
                }
            });

            await createAuditLog({
                action: 'RECIPE_CREATED',
                entity: 'Recipe',
                entityId: recipe.id,
                businessId: user.businessId,
                userId: user.userId,
                userEmail: user.email,
                newData: {
                    productName: product.name,
                    size: size || 'STANDART',
                    itemCount: items.length
                }
            });
        }

        return NextResponse.json(recipe, { status: 201 });
    } catch (error: any) {
        console.error('Recipe creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create recipe', details: error.message },
            { status: 500 }
        );
    }
}

// PUT - Update recipe
export async function PUT(request: NextRequest) {
    try {
        const user = getUser(request);
        if (!user?.businessId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, items } = body;

        if (!id) {
            return NextResponse.json({ error: 'Recipe ID is required' }, { status: 400 });
        }

        // Verify recipe belongs to user's business via product
        const existingRecipe = await prisma.recipe.findFirst({
            where: { id, product: { businessId: user.businessId } },
            include: { product: true }
        });

        if (!existingRecipe) {
            return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
        }

        const recipe = await prisma.$transaction(async (tx) => {
            await tx.recipeItem.deleteMany({
                where: { recipeId: id }
            });

            return await tx.recipe.update({
                where: { id },
                data: {
                    items: {
                        create: items.map((item: any) => ({
                            ingredientId: item.ingredientId,
                            quantity: parseFloat(item.quantity.toString())
                        }))
                    }
                },
                include: {
                    items: {
                        include: { ingredient: true }
                    },
                    product: true
                }
            });
        });

        await createAuditLog({
            action: 'RECIPE_PUT_UPDATED',
            entity: 'Recipe',
            entityId: recipe.id,
            businessId: user.businessId,
            userId: user.userId,
            userEmail: user.email,
            newData: {
                productName: recipe.product.name,
                size: recipe.size || 'STANDART',
                itemCount: items.length
            }
        });

        return NextResponse.json(recipe);
    } catch (error) {
        console.error('Recipe update error:', error);
        return NextResponse.json({ error: 'Failed to update recipe' }, { status: 500 });
    }
}

// DELETE - Delete recipe
export async function DELETE(request: NextRequest) {
    try {
        const user = getUser(request);
        if (!user?.businessId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Recipe ID is required' }, { status: 400 });
        }

        const productRecipe = await prisma.recipe.findFirst({
            where: { id, product: { businessId: user.businessId } },
            include: { product: true }
        });

        if (!productRecipe) {
            return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
        }

        await prisma.recipe.delete({ where: { id } });

        await createAuditLog({
            action: 'RECIPE_DELETED',
            entity: 'Recipe',
            entityId: id,
            businessId: user.businessId,
            userId: user.userId,
            userEmail: user.email,
            newData: {
                productName: productRecipe.product.name,
                size: productRecipe.size || 'STANDART'
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Recipe deletion error:', error);
        return NextResponse.json({ error: 'Failed to delete recipe' }, { status: 500 });
    }
}
