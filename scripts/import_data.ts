import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('--- DATA IMPORT STARTED ---');

    // 1. Get the main business
    const business = await prisma.business.findUnique({
        where: { slug: 'probrew-main' }
    });

    if (!business) {
        console.error('Business not found. Please seed the database first.');
        return;
    }

    const businessId = business.id;

    // 2. Define Standard Ingredients
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
        { name: 'Çikolata Sos', unit: 'ml', stock: 1000, costPerUnit: 0.15 },
        { name: 'Karamel Sos', unit: 'ml', stock: 1000, costPerUnit: 0.15 },
        { name: 'Beyaz Çikolata Sos', unit: 'ml', stock: 1000, costPerUnit: 0.15 },
        { name: 'Salep Tozu', unit: 'gram', stock: 2000, costPerUnit: 0.2 },
        { name: 'Sıcak Çikolata Tozu', unit: 'gram', stock: 2000, costPerUnit: 0.18 },
        { name: 'Frappe Tozu', unit: 'gram', stock: 2000, costPerUnit: 0.15 },
        { name: 'Matcha Tozu', unit: 'gram', stock: 500, costPerUnit: 1.5 },
        { name: 'Dondurma (Vişne/Karamel/Vanilya)', unit: 'adet', stock: 50, costPerUnit: 15 },
        { name: 'Bubble Tea İncisi', unit: 'gram', stock: 2000, costPerUnit: 0.25 },
        { name: 'Çilek Püresi', unit: 'ml', stock: 1000, costPerUnit: 0.12 },
        { name: 'Mango Püresi', unit: 'ml', stock: 1000, costPerUnit: 0.12 },
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

    // 3. Parse CSV and Create Products
    console.log('Parsing CSV and creating products...');
    const csvPath = path.join(process.cwd(), 'public/urun_fiyat_listesi.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');

    // Skip header
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(';');
        if (parts.length < 5) continue;

        const category = parts[0].replace(/"/g, '').trim();
        const productName = parts[1].replace(/"/g, '').trim();
        const priceSmall = parseFloat(parts[2]?.replace(',', '.') || '0');
        const priceMedium = parseFloat(parts[3]?.replace(',', '.') || '0');
        const priceLarge = parseFloat(parts[4]?.replace(',', '.') || '0');

        // Prepare multi-size object if applicable
        const hasSizes = priceMedium > 0 || priceLarge > 0;
        const pricesJson: any = {};
        if (hasSizes) {
            if (priceSmall > 0) pricesJson['Small'] = priceSmall;
            if (priceMedium > 0) pricesJson['Medium'] = priceMedium;
            if (priceLarge > 0) pricesJson['Large'] = priceLarge;
        }

        const product = await prisma.product.upsert({
            where: {
                id: `prod-${productName.toLowerCase().replace(/ /g, '-')}`
            },
            update: {
                category,
                price: priceSmall || priceMedium || priceLarge,
                prices: pricesJson,
                isActive: true
            },
            create: {
                id: `prod-${productName.toLowerCase().replace(/ /g, '-')}`,
                businessId,
                name: productName,
                category,
                price: priceSmall || priceMedium || priceLarge,
                prices: pricesJson,
                isActive: true,
                stock: 999
            }
        });

        // 4. Create Basic Recipes for common categories
        await createRecipeForProduct(product, pricesJson);
    }

    async function createRecipeForProduct(product: any, prices: any) {
        const sizes = Object.keys(prices).length > 0 ? Object.keys(prices) : [null];

        for (const size of sizes) {
            const recipeId = `recipe-${product.id}-${size || 'default'}`;

            // Safer upsert/create for recipes with potential null sizes
            let recipe = await prisma.recipe.findFirst({
                where: { productId: product.id, size: size }
            });

            if (!recipe) {
                recipe = await prisma.recipe.create({
                    data: {
                        productId: product.id,
                        size: size
                    }
                });
                console.log(`[RECIPE] Created new recipe for ${product.name} (${size || 'Standard'})`);
            }

            if (!recipe) continue;

            // Clear items
            await prisma.recipeItem.deleteMany({ where: { recipeId: recipe.id } });

            // Logic to add ingredients based on product name/category
            const name = product.name.toLowerCase();
            const cat = product.category.toLowerCase();

            // COFFEE BASE
            if (cat.includes('kahve') || cat.includes('espresso') || cat.includes('coffee')) {
                const espressoId = ingredientsMap['Espresso Çekirdeği'];
                const milkId = ingredientsMap['Normal Süt'];

                let espressoQty = 18; // Single shot gram
                let milkQty = 0;

                if (size === 'Medium') espressoQty = 36;
                if (size === 'Large') espressoQty = 36;

                if (name.includes('latte') || name.includes('cappuccino') || name.includes('flat white')) {
                    milkQty = size === 'Small' || !size ? 200 : (size === 'Medium' ? 300 : 400);
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

                // Add syrups for flavored drinks
                if (name.includes('caramel')) {
                    const syrupId = ingredientsMap['Karamel Şurubu'];
                    if (syrupId) await prisma.recipeItem.create({
                        data: { recipeId: recipe.id, ingredientId: syrupId, quantity: 20 }
                    });
                }
                if (name.includes('vanilla')) {
                    const syrupId = ingredientsMap['Vanilya Şurubu'];
                    if (syrupId) await prisma.recipeItem.create({
                        data: { recipeId: recipe.id, ingredientId: syrupId, quantity: 20 }
                    });
                }
                if (name.includes('mocha')) {
                    const syrupId = ingredientsMap['Beyaz Çikolata Şurubu'] || ingredientsMap['Çikolata Sos'];
                    if (syrupId) await prisma.recipeItem.create({
                        data: { recipeId: recipe.id, ingredientId: syrupId, quantity: 30 }
                    });
                }
            }

            // TEA BASE
            if (cat.includes('çay')) {
                // Simple assumption: 1 piece or 5g leaves
            }

            // DESSERTS
            if (cat.includes('tatli')) {
                // Usually 1 unit
            }
        }
    }

    console.log('--- DATA IMPORT COMPLETED ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
