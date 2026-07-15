import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession, audit } from '@/lib/auth';

// Stock / visibility updates
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  const body = await req.json().catch(() => null);

  const stockUpdate = z.object({ variantId: z.string(), stock: z.number().int().min(0) }).safeParse(body);
  if (stockUpdate.success) {
    await prisma.variant.update({ where: { id: stockUpdate.data.variantId }, data: { stock: stockUpdate.data.stock } });
    await audit(session?.email || 'admin', 'STOCK_UPDATE', 'Variant', stockUpdate.data.variantId, { stock: stockUpdate.data.stock });
    return NextResponse.json({ ok: true });
  }

  const toggle = z.object({ productId: z.string(), isActive: z.boolean() }).safeParse(body);
  if (toggle.success) {
    await prisma.product.update({ where: { id: toggle.data.productId }, data: { isActive: toggle.data.isActive } });
    await audit(session?.email || 'admin', 'PRODUCT_TOGGLE', 'Product', toggle.data.productId, { isActive: toggle.data.isActive });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Bad request' }, { status: 400 });
}

// Create product
const createSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  sku: z.string().min(2),
  description: z.string().min(10),
  priceInr: z.number().int().positive(), // paise
  mrpInr: z.number().int().positive().optional(),
  images: z.array(z.string().min(1)).min(1),
  categorySlug: z.string(),
  fabric: z.string().optional(),
  tags: z.array(z.string()).default([]),
  sizes: z.array(z.object({ size: z.string(), stock: z.number().int().min(0) })).min(1),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const cat = await prisma.category.findUnique({ where: { slug: parsed.data.categorySlug } });
  if (!cat) return NextResponse.json({ error: 'Unknown category' }, { status: 400 });
  const { sizes, categorySlug, ...rest } = parsed.data;
  const product = await prisma.product.create({
    data: {
      ...rest,
      categoryId: cat.id,
      seoTitle: `${rest.name} | Haute Attire by NK`,
      seoDesc: rest.description.slice(0, 155),
      variants: { create: sizes.map((s) => ({ size: s.size, stock: s.stock, sku: `${rest.sku}-${s.size}` })) },
    },
  });
  await audit(session?.email || 'admin', 'PRODUCT_CREATE', 'Product', product.id);
  return NextResponse.json({ ok: true, id: product.id });
}
