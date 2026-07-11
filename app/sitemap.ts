import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  let products: { slug: string; updatedAt: Date }[] = [];
  let categories: { slug: string }[] = [];
  try {
    products = await prisma.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } });
    categories = await prisma.category.findMany({ select: { slug: true } });
  } catch {
    // Database unavailable at build time — ship the static routes and let ISR fill in later.
  }
  return [
    { url: base, priority: 1 },
    { url: `${base}/shop`, priority: 0.9 },
    ...categories.map((c) => ({ url: `${base}/category/${c.slug}`, priority: 0.8 })),
    ...products.map((p) => ({ url: `${base}/products/${p.slug}`, lastModified: p.updatedAt, priority: 0.7 })),
  ];
}
