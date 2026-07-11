import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession, audit } from '@/lib/auth';

export async function PATCH(req: NextRequest) {
  const session = await getSession(); // middleware already gates role
  const parsed = z.object({
    id: z.string(),
    status: z.enum(['PENDING', 'PAID', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED', 'REFUNDED']),
    trackingId: z.string().optional(),
    courier: z.string().optional(),
  }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  const order = await prisma.order.update({ where: { id: parsed.data.id }, data: parsed.data });
  await audit(session?.email || 'admin', 'ORDER_STATUS_UPDATE', 'Order', order.id, { status: parsed.data.status });
  return NextResponse.json({ ok: true });
}
