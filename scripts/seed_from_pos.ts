import { PrismaClient } from '@prisma/client';
import { allMenuItems } from '../src/data/menuItems';

const prisma = new PrismaClient();

async function main() {
    console.log('--- SEEDING FROM POS MENU ITEMS ---');

    const business = await prisma.business.findUnique({
        where: { slug: 'probrew-main' }
    });

    if (!business) {
        console.error('Business not found. Run standard seed first.');
        return;
    }

    const businessId = business.id;

    // 1. Define Standard Ingredients
    console.log('Defining standard ingredients...');
    const ingredientsData = [
        { name: 'Espresso Çekirdeği', unit: 'gram', stock: 10000, costPerUnit: 0.8 },
        { name: 'Filtre Kahve Çekirdeği', unit: 'gram', stock: 5000, costPerUnit: 0.6 },
        { name: 'Türk Kahvesi Çekirdeği', unit: 'gram', stock: 3000, costPerUnit: 0.5 },
        { name: 'Normal Süt', unit: 'ml', stock: 20000, costPerUnit: 0.03 },
        { name: 'Laktozsuz Süt', unit: 'ml', stock: 5000, costPerUnit: 0.04 },
        { name: 'Badem Sütü', unit: 'ml', stock: 2000, costPerUnit: 0.08 },
        { name: 'Yulaf Sütü', unit: 'ml', stock: 2000, costPerUnit: 0.08 },
        { name: 'Karamel Şurubu', unit: 'ml', stock: 1000, costPerUnit: 0.1 },
        { name: 'Vanilya Şurubu', unit: 'ml', stock: 1000, costPerUnit: 0.1 },
        { name: 'Fındık Şurubu', unit: 'ml', stock: 1000, costPerUnit: 0.1 },
        { name: 'Beyaz Çikolata Şurubu', unit: 'ml', stock: 1000, costPerUnit: 0.12 },
        { name: 'Toffeenut Şurubu', unit: 'ml', stock: 1000, costPerUnit: 0.12 },
        { name: 'Çikolata Şurubu', unit: 'ml', stock: 1000, costPerUnit: 0.12 },
        { name: 'Çikolata Sos', unit: 'ml', stock: 1000, costPerUnit: 0.15 },
        { name: 'Karamel Sos', unit: 'ml', stock: 1000, costPerUnit: 0.15 },
        { name: 'Beyaz Çikolata Sos', unit: 'ml', stock: 1000, costPerUnit: 0.15 },
        { name: 'Salep Tozu', unit: 'gram', stock: 2000, costPerUnit: 0.2 },
        { name: 'Sıcak Çikolata Tozu', unit: 'gram', stock: 2000, costPerUnit: 0.18 },
        { name: 'Frappe Tozu', unit: 'gram', stock: 2000, costPerUnit: 0.15 },
        { name: 'Matcha Tozu', unit: 'gram', stock: 500, costPerUnit: 1.5 },
        { name: 'Çay Yaprağı', unit: 'gram', stock: 2000, costPerUnit: 0.2 },
        { name: 'Bitki Çayı Süvarisi', unit: 'adet', stock: 500, costPerUnit: 5 },
        { name: 'Chai Şurubu', unit: 'ml', stock: 1000, costPerUnit: 0.15 },
        { name: 'Çilek Püresi', unit: 'ml', stock: 1000, costPerUnit: 0.12 },
        { name: 'Mango Püresi', unit: 'ml', stock: 1000, costPerUnit: 0.12 },
        { name: 'Tatlı / Kruvasan', unit: 'adet', stock: 200, costPerUnit: 30 },
        { name: 'Meşrubat (Kutu/Şişe)', unit: 'adet', stock: 500, costPerUnit: 15 },
    ];

    const ingredientsMap: Record<string, string> = {};
    for (const ing of ingredientsData) {
        const record = await prisma.ingredient.upsert({
            where: {
                id: `ing-${ing.name.toLowerCase().replace(/ /g, '-')}`
            },
            update: {
                stock: ing.stock,
                costPerUnit: ing.costPerUnit
            },
            create: {
                id: `ing-${ing.name.toLowerCase().replace(/ /g, '-')}`,
                businessId,
                name: ing.name,
                unit: ing.unit,
                stock: ing.stock,
                costPerUnit: ing.costPerUnit
            }
        });
        ingredientsMap[ing.name] = record.id;
    }

    // 2. Iterate POS Menu Items and Create Products/Recipes
    console.log('Migrating POS menu items to database...');

    for (const item of allMenuItems) {
        const productName = item.name;

        let price = item.price || 0;
        let pricesJson: any = {};

        if (item.sizes && item.sizes.length > 0) {
            item.sizes.forEach(s => {
                let sizeKey = s.size;
                if (sizeKey === 'S') sizeKey = 'Small';
                if (sizeKey === 'M') sizeKey = 'Medium';
                if (sizeKey === 'L') sizeKey = 'Large';
                pricesJson[sizeKey] = s.price;
            });
            // If main price is undefined, use small
            if (!price) price = item.sizes[0].price;
        } else if (price > 0) {
            pricesJson['Standard'] = price;
        }

        const product = await prisma.product.upsert({
            where: {
                id: item.id.toString()
            },
            update: {
                name: productName,
                category: item.category,
                price: price,
                prices: pricesJson,
                description: item.description,
                imageUrl: item.image,
                isActive: true
            },
            create: {
                id: item.id.toString(),
                businessId,
                name: productName,
                category: item.category,
                price: price,
                prices: pricesJson,
                description: item.description,
                imageUrl: item.image,
                isActive: true,
                stock: 999
            }
        });

        // Generate recipes
        const sizes = Object.keys(pricesJson).length > 0 ? Object.keys(pricesJson) : [null];

        for (const size of sizes) {
            const recipeSize = size === 'Standard' ? null : size;
            let recipe = await prisma.recipe.findFirst({
                where: { productId: product.id, size: recipeSize }
            });

            if (!recipe) {
                recipe = await prisma.recipe.create({
                    data: {
                        productId: product.id,
                        size: recipeSize
                    }
                });
            }

            // Clear items to rebuild
            await prisma.recipeItem.deleteMany({ where: { recipeId: recipe.id } });

            // Logic to add ingredients based on product name/category
            const nameLower = productName.toLowerCase();
            const catLower = item.category.toLowerCase();

            // COFFEE BASE
            if (catLower.includes('kahve') || catLower.includes('espresso') || nameLower.includes('coffee') || nameLower.includes('mocha') || nameLower.includes('latte') || nameLower.includes('americano') || nameLower.includes('macchiato') || nameLower.includes('cappuccino') || nameLower.includes('flat white')) {
                let espressoId = ingredientsMap['Espresso Çekirdeği'];
                if (nameLower.includes('filtre')) espressoId = ingredientsMap['Filtre Kahve Çekirdeği'];
                if (nameLower.includes('türk')) espressoId = ingredientsMap['Türk Kahvesi Çekirdeği'];

                const milkId = ingredientsMap['Normal Süt'];

                let espressoQty = nameLower.includes('double') ? 36 : 18; // Single shot gram
                let milkQty = 0;

                if (recipeSize === 'Medium') espressoQty = 36;
                if (recipeSize === 'Large') espressoQty = 36;

                if (nameLower.includes('latte') || nameLower.includes('cappuccino') || nameLower.includes('flat white') || nameLower.includes('macchiato') || nameLower.includes('mocha')) {
                    milkQty = (recipeSize === 'Small' || !recipeSize) ? 200 : (recipeSize === 'Medium' ? 300 : 400);
                }

                if (espressoId) {
                    await prisma.recipeItem.create({
                        data: { recipeId: recipe.id, ingredientId: espressoId, quantity: espressoQty }
                    });
                }
                if (milkId && milkQty > 0) {
                    await prisma.recipeItem.create({
                        data: { recipeId: recipe.id, ingredientId: milkId, quantity: milkQty }
                    });
                }

                // Add syrups
                if (nameLower.includes('caramel')) {
                    const syrupId = ingredientsMap['Karamel Şurubu'];
                    if (syrupId) await prisma.recipeItem.create({ data: { recipeId: recipe.id, ingredientId: syrupId, quantity: 20 } });
                }
                if (nameLower.includes('vanilla')) {
                    const syrupId = ingredientsMap['Vanilya Şurubu'];
                    if (syrupId) await prisma.recipeItem.create({ data: { recipeId: recipe.id, ingredientId: syrupId, quantity: 20 } });
                }
                if (nameLower.includes('white mocha')) {
                    const syrupId = ingredientsMap['Beyaz Çikolata Şurubu'];
                    if (syrupId) await prisma.recipeItem.create({ data: { recipeId: recipe.id, ingredientId: syrupId, quantity: 30 } });
                } else if (nameLower.includes('mocha') || nameLower.includes('chocolate')) {
                    const syrupId = ingredientsMap['Çikolata Sos'];
                    if (syrupId) await prisma.recipeItem.create({ data: { recipeId: recipe.id, ingredientId: syrupId, quantity: 30 } });
                }
            }
            // TEA BASE
            else if (catLower.includes('çaylar') || nameLower.includes('çay') || nameLower.includes('tea')) {
                if (nameLower.includes('chai')) {
                    await prisma.recipeItem.create({ data: { recipeId: recipe.id, ingredientId: ingredientsMap['Chai Şurubu'], quantity: 30 } });
                    await prisma.recipeItem.create({ data: { recipeId: recipe.id, ingredientId: ingredientsMap['Normal Süt'], quantity: 200 } });
                } else if (nameLower.includes('matcha')) {
                    await prisma.recipeItem.create({ data: { recipeId: recipe.id, ingredientId: ingredientsMap['Matcha Tozu'], quantity: 10 } });
                    await prisma.recipeItem.create({ data: { recipeId: recipe.id, ingredientId: ingredientsMap['Normal Süt'], quantity: 200 } });
                } else if (catLower.includes('bitki') || nameLower.includes('papatya') || nameLower.includes('kış') || nameLower.includes('kiraz')) {
                    await prisma.recipeItem.create({ data: { recipeId: recipe.id, ingredientId: ingredientsMap['Bitki Çayı Süvarisi'], quantity: 1 } });
                } else {
                    await prisma.recipeItem.create({ data: { recipeId: recipe.id, ingredientId: ingredientsMap['Çay Yaprağı'], quantity: 5 } });
                }
            }
            // SOĞUK İÇECEKLER (Cool Lime vs)
            else if (catLower.includes('soğuk içecekler')) {
                if (nameLower.includes('çilek') || nameLower.includes('strawberry')) {
                    await prisma.recipeItem.create({ data: { recipeId: recipe.id, ingredientId: ingredientsMap['Çilek Püresi'], quantity: 40 } });
                }
                if (nameLower.includes('mango')) {
                    await prisma.recipeItem.create({ data: { recipeId: recipe.id, ingredientId: ingredientsMap['Mango Püresi'], quantity: 40 } });
                }
            }
            // TATLILAR
            else if (catLower.includes('tatlılar')) {
                await prisma.recipeItem.create({ data: { recipeId: recipe.id, ingredientId: ingredientsMap['Tatlı / Kruvasan'], quantity: 1 } });
            }
            // MEŞRUBATLAR
            else if (catLower.includes('meşrubat') || nameLower.includes('su ') || nameLower.includes('soda') || nameLower.includes('cola')) {
                await prisma.recipeItem.create({ data: { recipeId: recipe.id, ingredientId: ingredientsMap['Meşrubat (Kutu/Şişe)'], quantity: 1 } });
            }
        }
    }

    console.log('--- DB SEED COMPLETED ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
