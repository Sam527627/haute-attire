import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Sign in to review' }, { status: 401 });
  const parsed = z.object({
    productId: z.string(),
    rating: z.number().int().min(1).max(5),
    title: z.string().max(120).optional(),
    body: z.string().min(5).max(2000),
  }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Check your review' }, { status: 400 });

  const purchased = await prisma.orderItem.findFirst({
    where: { productId: parsed.data.productId, order: { userId: session.id, status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] } } },
  });

  const review = await prisma.review.upsert({
    where: { productId_userId: { productId: parsed.data.productId, userId: session.id } },
    update: { rating: parsed.data.rating, title: parsed.data.title, body: parsed.data.body },
    create: {
      productId: parsed.data.productId,
      userId: session.id,
      rating: parsed.data.rating,
      title: parsed.data.title,
      body: parsed.data.body,
      verified: !!purchased,
    },
  });
  return NextResponse.json({ ok: true, pendingApproval: !review.approved });
}
