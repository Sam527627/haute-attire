import ProductCard from '@/components/ProductCard';
import { prisma } from '@/lib/prisma';

export const metadata = { title: 'Search' };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const products = q
    ? await prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { tags: { has: q.toLowerCase() } },
          ],
        },
      })
    : [];
  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      <form action="/search" className="max-w-xl">
        <label htmlFor="q" className="micro text-gold">Search the boutique</label>
        <input id="q" name="q" defaultValue={q} placeholder="Try “chikankari”, “lehenga”, “linen”…" className="mt-3 !text-lg !py-4" autoFocus />
      </form>
      {q && <p className="micro text-stone mt-8">{products.length} result{products.length === 1 ? '' : 's'} for “{q}”</p>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
        {products.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </div>
  );
}
