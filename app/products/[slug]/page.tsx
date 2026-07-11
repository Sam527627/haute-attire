import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProductDetail from '@/components/ProductDetail';
import ProductCard from '@/components/ProductCard';
import type { Metadata } from 'next';

export const revalidate = 120;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await prisma.product.findUnique({ where: { slug } });
  if (!p) return {};
  return {
    title: p.seoTitle || p.name,
    description: p.seoDesc || p.description.slice(0, 155),
    openGraph: { images: p.images.slice(0, 1) },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      variants: { orderBy: { size: 'asc' } },
      category: true,
      reviews: { where: { approved: true }, include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 10 },
    },
  });
  if (!product || !product.isActive) notFound();

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id }, isActive: true },
    take: 4,
  });

  const avgRating = product.reviews.length
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.sku,
    brand: { '@type': 'Brand', name: 'Haute Attire by NK' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: (product.priceInr / 100).toFixed(0),
      availability: product.variants.some((v) => v.stock > 0)
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
    ...(avgRating ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: avgRating.toFixed(1), reviewCount: product.reviews.length } } : {}),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductDetail
        product={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          sku: product.sku,
          description: product.description,
          fabric: product.fabric,
          washCare: product.washCare,
          priceInr: product.priceInr,
          mrpInr: product.mrpInr,
          images: product.images,
          categoryName: product.category.name,
          variants: product.variants.map((v) => ({ id: v.id, size: v.size, stock: v.stock })),
        }}
      />

      {/* Reviews */}
      <section className="mt-20 max-w-3xl">
        <h2 className="font-display text-3xl font-light">Reviews {avgRating && <span className="text-gold text-xl">★ {avgRating.toFixed(1)}</span>}</h2>
        {product.reviews.length === 0 && <p className="text-sm text-stone mt-4">No reviews yet. Ordered this piece? Sign in to be the first to review it.</p>}
        <div className="space-y-6 mt-6">
          {product.reviews.map((r) => (
            <div key={r.id} className="border-b border-beige pb-6">
              <p className="text-gold text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</p>
              <p className="font-medium text-sm mt-1">{r.title}</p>
              <p className="text-sm text-stone mt-1">{r.body}</p>
              <p className="micro text-stone mt-2">{r.user.name}{r.verified && ' · Verified buyer'}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-20">
          <p className="micro text-gold">Complete the look</p>
          <h2 className="font-display text-3xl font-light mt-2">You may also love</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            {related.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
