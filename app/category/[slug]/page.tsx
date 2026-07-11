import { notFound } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { prisma } from '@/lib/prisma';

export const revalidate = 120;

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = await prisma.category.findUnique({ where: { slug }, include: { children: true } });
  if (!cat) notFound();
  const catIds = [cat.id, ...cat.children.map((c) => c.id)];
  const products = await prisma.product.findMany({
    where: { isActive: true, categoryId: { in: catIds } },
    orderBy: { createdAt: 'desc' },
  });
  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      <p className="micro text-gold">Category</p>
      <h1 className="font-display text-5xl font-light mt-3">{cat.name}</h1>
      {cat.children.length > 0 && (
        <div className="flex flex-wrap gap-4 mt-6">
          {cat.children.map((c) => (
            <a key={c.id} href={`/category/${c.slug}`} className="micro border border-beige px-4 py-2 hover:border-gold hover:text-gold">{c.name}</a>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
        {products.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
      {products.length === 0 && <p className="text-stone mt-10 text-sm">Nothing here yet — new pieces are on the way. Explore <a href="/shop" className="text-gold">the full edit</a> meanwhile.</p>}
    </div>
  );
}
