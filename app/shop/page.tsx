import ProductCard from '@/components/ProductCard';
import { prisma } from '@/lib/prisma';

export const metadata = { title: 'Shop All' };
export const revalidate = 120;

export default async function Shop({ searchParams }: { searchParams: Promise<{ new?: string; sort?: string }> }) {
  const sp = await searchParams;
  const products = await prisma.product.findMany({
    where: { isActive: true, ...(sp.new ? { isNew: true } : {}) },
    orderBy: sp.sort === 'price-asc' ? { priceInr: 'asc' } : sp.sort === 'price-desc' ? { priceInr: 'desc' } : { createdAt: 'desc' },
  });
  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      <p className="micro text-gold">{sp.new ? 'Just landed' : 'The full edit'}</p>
      <h1 className="font-display text-5xl font-light mt-3">{sp.new ? 'New Arrivals' : 'Shop All'}</h1>
      <div className="flex gap-4 mt-8">
        {[['Newest', ''], ['Price: low to high', 'price-asc'], ['Price: high to low', 'price-desc']].map(([label, v]) => (
          <a key={v} href={`/shop?${sp.new ? 'new=1&' : ''}${v ? `sort=${v}` : ''}`} className={`micro pb-1 border-b ${(sp.sort || '') === v ? 'border-gold text-gold' : 'border-transparent text-stone hover:text-ink'}`}>{label}</a>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
        {products.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </div>
  );
}
