import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/currency';
import StockEditor from '@/components/admin/StockEditor';
import ProductToggle from '@/components/admin/ProductToggle';

export const dynamic = 'force-dynamic';

export default async function AdminProducts() {
  const products = await prisma.product.findMany({ include: { variants: true, category: true }, orderBy: { createdAt: 'desc' } });
  return (
    <div>
      <h1 className="font-display text-4xl font-light">Products & stock</h1>
      <p className="text-sm text-stone mt-2">Update stock per size, or unpublish a piece. New products can be added via the seed script or the API (<code className="text-xs bg-beige px-1">POST /api/admin/products</code>).</p>
      <div className="mt-8 space-y-4">
        {products.map((p) => (
          <div key={p.id} className="border border-beige bg-cream p-4 flex gap-4">
            <div className="relative w-16 h-24 bg-beige shrink-0">
              <Image src={p.images[0]} alt={p.name} fill sizes="64px" className="object-cover" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="micro text-stone">{p.sku} · {p.category.name} · {formatPrice(p.priceInr)}</p>
                </div>
                <ProductToggle id={p.id} isActive={p.isActive} />
              </div>
              <div className="flex gap-3 mt-3 flex-wrap">
                {p.variants.map((v) => <StockEditor key={v.id} variantId={v.id} size={v.size} stock={v.stock} />)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
