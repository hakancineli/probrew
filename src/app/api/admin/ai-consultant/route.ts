import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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

export async function GET(request: NextRequest) {
    try {
        const user = getUser(request);
        if (!user?.businessId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month') || (new Date().getMonth() + 1).toString();
        const year = searchParams.get('year') || new Date().getFullYear().toString();

        const startDate = new Date(Number(year), Number(month) - 1, 1);
        const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);
        const monthName = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('tr-TR', { month: 'long' });

        // 1. Fetch Core Data - Scoped to Business
        const [orders, expenses, ingredients] = await Promise.all([
            prisma.order.findMany({
                where: {
                    businessId: user.businessId,
                    createdAt: { gte: startDate, lte: endDate },
                    paymentStatus: 'COMPLETED',
                    status: { not: 'CANCELLED' }
                },
                include: {
                    orderItems: {
                        include: {
                            product: {
                                include: {
                                    recipes: {
                                        include: {
                                            items: {
                                                include: {
                                                    ingredient: true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }),
            prisma.expense.findMany({
                where: {
                    businessId: user.businessId,
                    date: { gte: startDate, lte: endDate }
                }
            }),
            prisma.ingredient.findMany({
                where: { businessId: user.businessId }
            })
        ]);

        // Current Stock Value (Asset)
        const totalStockValue = ingredients.reduce((sum, i) => sum + ((Number(i.stock) || 0) * (Number(i.costPerUnit) || 0)), 0);

        const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.finalAmount) || 0), 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
        const adjustedProfit = (totalRevenue - totalExpenses) + totalStockValue;

        if (orders.length === 0 && expenses.length === 0) {
            return NextResponse.json({
                summary: "Bu dönem için henüz veri bulunmuyor. Analiz için sipariş alınması veya gider girilmesi gerekiyor.",
                insights: {
                    finance: "Veri girişi bekliyor.",
                    menu: "Satış verisi yok.",
                    stock: "Stok hareketi yok.",
                    loyalty: "Müşteri verisi yok."
                },
                mood: "neutral",
                advancedStats: null
            });
        }

        // 3. Menu Engineering
        const productAnalysis: Record<string, any> = {};
        orders.forEach(o => {
            (o.orderItems || []).forEach((item: any) => {
                const pId = item.productId;
                if (!pId) return;

                if (!productAnalysis[pId]) {
                    productAnalysis[pId] = {
                        name: item.productName || 'Bilinmeyen Ürün',
                        sold: 0,
                        revenue: 0,
                        theoreticalCost: 0
                    };
                }

                const qty = Number(item.quantity) || 0;
                productAnalysis[pId].sold += qty;
                productAnalysis[pId].revenue += (Number(item.totalPrice) || 0);

                const recipe = item.product?.recipes?.find((r: any) => r.size === item.size);
                if (recipe && recipe.items) {
                    const cost = recipe.items.reduce((cAcc: number, rItem: any) => {
                        const unitCost = Number(rItem.ingredient?.costPerUnit) || 0;
                        return cAcc + ((Number(rItem.quantity) || 0) * unitCost);
                    }, 0);
                    productAnalysis[pId].theoreticalCost += cost * qty;
                }
            });
        });

        const menuEngineering = Object.values(productAnalysis).map((p: any) => ({
            ...p,
            profit: p.revenue - p.theoreticalCost,
            margin: p.revenue > 0 ? ((p.revenue - p.theoreticalCost) / p.revenue) * 100 : 0
        }));

        // 4. Inventory Usage
        const ingredientUsage: Record<string, number> = {};
        orders.forEach(o => {
            (o.orderItems || []).forEach((item: any) => {
                const recipe = item.product?.recipes?.find((r: any) => r.size === item.size);
                if (recipe && recipe.items) {
                    recipe.items.forEach((rItem: any) => {
                        const name = rItem.ingredient?.name;
                        if (name) {
                            ingredientUsage[name] = (ingredientUsage[name] || 0) + ((Number(rItem.quantity) || 0) * (Number(item.quantity) || 0));
                        }
                    });
                }
            });
        });

        // 5. Churn Detection - Scoped to Business
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

        let churnCount = 0;
        try {
            churnCount = await prisma.user.count({
                where: {
                    businessId: user.businessId,
                    orders: {
                        some: { businessId: user.businessId, createdAt: { lt: fourteenDaysAgo } },
                        none: { businessId: user.businessId, createdAt: { gte: fourteenDaysAgo } }
                    }
                }
            });
        } catch (e) {
            console.warn('AI Consultant: Could not fetch churn count', e);
        }

        // 6. Shift & Rush Hour Analysis
        const hoursDistribution = new Array(24).fill(0);
        const daysDistribution = new Array(7).fill(0);
        const dayNames = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

        orders.forEach(o => {
            const d = new Date(o.createdAt.getTime() + (3 * 60 * 60 * 1000));
            hoursDistribution[d.getUTCHours()]++;
            daysDistribution[d.getUTCDay()]++;
        });

        const busiestHourIndex = hoursDistribution.indexOf(Math.max(...hoursDistribution));
        const busiestDayIndex = daysDistribution.indexOf(Math.max(...daysDistribution));

        const shiftInsights = {
            busiestHour: `${busiestHourIndex}:00 - ${busiestHourIndex + 1}:00`,
            busiestDay: dayNames[busiestDayIndex],
            avgOrdersPerDay: Math.round(orders.length / 30),
        };

        // 7. AI Request with Google Gemini
        let aiAnalysis = {
            summary: "Analiz şu an yapılamıyor.",
            insights: { finance: "-", menu: "-", stock: "-", loyalty: "-", staff: "-" },
            mood: "neutral" as 'positive' | 'neutral' | 'warning'
        };

        try {
            const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_ProBrew;

            if (!apiKey) {
                throw new Error('API_KEY_MISSING');
            }

            const prompt = `Sen ProBrew'nin profesyonel iş ve strateji danışmanısın. Aşağıdaki aylık verileri analiz et ve işletme sahibine kısa, net ve vurucu tavsiyeler ver.

VERİLER:
- Dönem: ${monthName} ${year}
- Toplam Ciro: ${totalRevenue.toLocaleString('tr-TR')} TL
- Net Kar (Nakit): ${(totalRevenue - totalExpenses).toLocaleString('tr-TR')} TL
- Stok Değeri (Varlık): ${totalStockValue.toLocaleString('tr-TR')} TL
- Stok Ayarlı Reel Kar: ${adjustedProfit.toLocaleString('tr-TR')} TL
- En Çok Kar Getiren Ürün: ${menuEngineering.sort((a, b) => b.profit - a.profit)[0]?.name || '-'}
- En Çok Satan Ürün: ${menuEngineering.sort((a, b) => b.sold - a.sold)[0]?.name || '-'}
- En Yoğun Gün: ${shiftInsights.busiestDay}
- En Yoğun Saatler: ${shiftInsights.busiestHour}
- Riskli (Kayıp) Müşteri Sayısı: ${churnCount}

Lütfen yanıtını SADECE aşağıdaki JSON formatında ver, başka hiçbir metin ekleme:
{
    "summary": "Genel durum özeti.",
    "insights": {
        "finance": "Finansal tavsiye.",
        "menu": "Menü tavsiyesi.",
        "stock": "Stok tavsiyesi.",
        "loyalty": "Müşteri tavsiyesi.",
        "staff": "Vardiya tavsiyesi (${shiftInsights.busiestHour} saatine odaklan)."
    },
    "mood": "positive" (veya "neutral" veya "warning")
}`;

            const aiRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 800,
                            responseMimeType: "application/json"
                        }
                    }),
                }
            );

            if (aiRes.ok) {
                const aiJson = await aiRes.json();
                let generatedText = aiJson?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
                generatedText = generatedText.replace(/```json/g, '').replace(/```/g, '').trim();

                const parsed = JSON.parse(generatedText);
                if (parsed.summary && parsed.insights) {
                    aiAnalysis = {
                        ...parsed,
                        mood: parsed.mood || (adjustedProfit > 0 ? "positive" : "warning")
                    };
                } else {
                    throw new Error('JSON_STRUCTURE_INVALID');
                }
            } else {
                throw new Error('API_RESPONSE_NOT_OK');
            }

        } catch (aiError: any) {
            console.error('AI Consultant Logic Error:', aiError.message);
            const profitMargin = totalRevenue > 0 ? adjustedProfit / totalRevenue : 0;
            const topProduct = menuEngineering.sort((a, b) => b.sold - a.sold)[0]?.name || "Ürünleriniz";
            const isLoss = adjustedProfit < 0;

            aiAnalysis = {
                summary: `${monthName} dönemi ₺${totalRevenue.toLocaleString('tr-TR')} ciro ile ${isLoss ? 'zorlu' : 'başarılı'} geçti. ${topProduct} satışların lokomotifi oldu.`,
                insights: {
                    finance: isLoss
                        ? "Giderler cironun üzerinde görünüyor, acil maliyet analizi yapılması önerilir."
                        : "Kar marjı %${(profitMargin * 100).toFixed(0)} seviyesinde, operasyonel verimliliği koruyun.",
                    menu: `${topProduct} yanına çapraz satış ürünleri ekleyerek sepet ortalamasını yükseltin.`,
                    stock: "Yüksek hacimli ürünlerin stoklarını hafta başından planlayarak tedarik riskini azaltın.",
                    loyalty: churnCount > 0
                        ? `${churnCount} müşteriniz bir süredir gelmiyor, onlara özel bir kampanya gönderin.`
                        : "Müşteri sadakati iyi durumda, yeni ürün tanıtımları ile bağı güçlendirin.",
                    staff: `${shiftInsights.busiestDay} günü ${shiftInsights.busiestHour} arası en yoğun zamanınız, personeli bu dilime yoğunlaştırın.`
                },
                mood: isLoss ? "warning" : profitMargin > 0.15 ? "positive" : "neutral"
            };
        }

        return NextResponse.json({
            ...aiAnalysis,
            advancedStats: {
                menuEngineering: menuEngineering.sort((a, b) => b.sold - a.sold),
                ingredientUsage,
                churnCount,
                financials: {
                    revenue: totalRevenue,
                    expenses: totalExpenses,
                    profit: totalRevenue - totalExpenses,
                    stockValue: totalStockValue,
                    adjustedProfit: adjustedProfit
                },
                shiftInsights: { ...shiftInsights, hoursDistribution, daysDistribution }
            }
        }, {
            headers: {
                'Cache-Control': 'no-store, max-age=0, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });

    } catch (error: any) {
        console.error('AI Consultant CRITICAL Error:', error);
        return NextResponse.json({
            summary: "Sistem verileri şu an işlenemiyor.",
            insights: { finance: "Veri hatası.", menu: "Veri hatası.", stock: "Veri hatası.", loyalty: "Veri hatası." },
            mood: "warning",
            advancedStats: null
        }, { status: 200 });
    }
}
