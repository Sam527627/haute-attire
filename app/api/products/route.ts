import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tag = searchParams.get('tag');
  const category = searchParams.get('category');
  const query = searchParams.get('q')?.trim();
  const minPrice = Number.parseInt(searchParams.get('minPrice') || '', 10);
  const maxPrice = Number.parseInt(searchParams.get('maxPrice') || '', 10);
  const requestedLimit = Number.parseInt(searchParams.get('limit') || '24', 10);
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 50) : 24;
  const requestedPage = Number.parseInt(searchParams.get('page') || '1', 10);
  const page = Number.isFinite(requestedPage) ? Math.max(requestedPage, 1) : 1;
  const sort = searchParams.get('sort');

  const where = {
    isActive: true,
    ...(tag ? { tags: { has: tag } } : {}),
    ...(category ? { category: { slug: category } } : {}),
    ...(query ? { OR: [{ name: { contains: query, mode: 'insensitive' as const } }, { description: { contains: query, mode: 'insensitive' as const } }, { tags: { has: query.toLowerCase() } }] } : {}),
    ...((Number.isFinite(minPrice) || Number.isFinite(maxPrice)) ? { priceInr: { ...(Number.isFinite(minPrice) ? { gte: minPrice * 100 } : {}), ...(Number.isFinite(maxPrice) ? { lte: maxPrice * 100 } : {}) } } : {}),
  };

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
    where,
    take: limit,
    skip: (page - 1) * limit,
    orderBy: sort === 'price-asc' ? { priceInr: 'asc' } : sort === 'price-desc' ? { priceInr: 'desc' } : { createdAt: 'desc' },
    select: {
      id: true,
      slug: true,
      name: true,
      sku: true,
      description: true,
      priceInr: true,
      mrpInr: true,
      images: true,
      tags: true,
      isFeatured: true,
      isNew: true,
      category: { select: { name: true, slug: true } },
    },
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json(
    { products, count: products.length, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
  );
}
