import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { FaStar } from 'react-icons/fa';
import MenuClient from './MenuClient';

export const dynamic = 'force-dynamic';

async function getMenuData(slug: string, tableId?: string) {
  const business = await prisma.business.findUnique({
    where: { slug },
    include: {
      systemSettings: true,
      products: {
        where: { isActive: true },
        orderBy: { category: 'asc' },
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
  });

  if (!business) return null;

  let table = null;
  if (tableId) {
    table = await prisma.table.findUnique({
        where: { id: tableId }
    });
  }

  return { business, table };
}

export default async function PublicMenuPage({ 
    params, 
    searchParams 
}: { 
    params: { slug: string },
    searchParams: { tableId?: string }
}) {
  const data = await getMenuData(params.slug, searchParams.tableId);

  if (!data?.business) notFound();
  
  const { business, table } = data;
  const activeTheme = business.systemSettings?.activeTheme || 'Nordic';
  const themePrimary = activeTheme === 'Turkish' ? '#dc2626' : business.primaryColor;

  // Group products by category
  const categories = business.products.reduce((acc: any, product) => {
    if (!acc[product.category]) acc[product.category] = [];
    acc[product.category].push(product);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-20" style={{ '--primary': themePrimary } as any}>
      {/* Business Header */}
      <div className="relative h-72 bg-slate-900 flex items-center justify-center overflow-hidden">
        {business.logoUrl ? (
          <div className="absolute inset-0">
             <Image 
              src={business.logoUrl} 
              alt={business.name} 
              fill 
              unoptimized
              className="object-cover opacity-30 blur-md scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/50" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 opacity-50" />
        )}
        
        <div className="relative z-10 text-center px-6">
          <div className="w-28 h-28 bg-white/10 backdrop-blur-xl rounded-[2.5rem] mx-auto mb-6 border border-white/20 shadow-2xl overflow-hidden flex items-center justify-center">
             {business.logoUrl ? (
                <img src={business.logoUrl} alt={business.name} className="w-full h-full object-cover" />
             ) : (
                <span className="text-5xl drop-shadow-lg">☕</span>
             )}
          </div>
          <h1 className="text-4xl font-black text-white mb-2 drop-shadow-2xl tracking-tighter">{business.name}</h1>
          <p className="text-white/60 font-bold uppercase tracking-[0.2em] text-[10px] mb-4">Dijital Menü Deneyimi</p>
          <div className="h-1 w-12 bg-white/20 mx-auto rounded-full" />
        </div>
      </div>

      {/* Categories Navigation */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 overflow-x-auto whitespace-nowrap px-4 py-4 flex gap-4 no-scrollbar">
        {Object.keys(categories).map((cat) => (
          <a 
            key={cat} 
            href={`#${cat}`}
            className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-bold active:scale-95 transition-transform"
          >
            {cat}
          </a>
        ))}
      </div>

      {/* Interactive Client Part */}
      <MenuClient 
        business={business} 
        categories={categories} 
        table={table}
      />

      {/* Footer Branding */}
      <div className="text-center py-12 text-slate-400">
        <p className="text-xs mb-2">Developed by</p>
        <div className="font-black text-xl tracking-tighter text-slate-300">PROBREW</div>
        <div className="text-[10px] mt-1">SaaS Infrastructure v2.1</div>
      </div>

      {/* Feedback FAB */}
      <a 
        href={`/feedback/${business.slug}`}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-all hover:scale-110 active:scale-90 z-[45]"
        style={{ backgroundColor: themePrimary }}
      >
        <FaStar size={24} />
      </a>
    </div>
  );
}
