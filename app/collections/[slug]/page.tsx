import { notFound } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { prisma } from '@/lib/prisma';

export const revalidate = 120;

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const coll = await prisma.collection.findUnique({
    where: { slug },
    include: { products: { where: { isActive: true }, orderBy: { createdAt: 'desc' } } },
  });
  if (!coll) notFound();
  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      <p className="micro text-gold">Collection</p>
      <h1 className="font-display text-5xl font-light mt-3 italic">{coll.name}</h1>
      {coll.tagline && <p className="text-stone mt-3 max-w-xl">{coll.tagline}</p>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
        {coll.products.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </div>
  );
}
