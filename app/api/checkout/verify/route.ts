import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { sendOrderConfirmation } from '@/lib/email';
import { formatPrice } from '@/lib/currency';

const schema = z.object({
  orderNumber: z.string(),
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  const { orderNumber, razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;

  const order = await prisma.order.findUnique({ where: { number: orderNumber }, include: { items: true } });
  if (!order || order.razorpayOrderId !== razorpayOrderId) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  if (order.status === 'PAID') return NextResponse.json({ ok: true }); // idempotent

  if (!verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
    return NextResponse.json({ error: 'Payment could not be verified. If money was deducted it will auto-refund; contact us with your order number.' }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.order.update({ where: { id: order.id }, data: { status: 'PAID', razorpayPaymentId } }),
    ...order.items
      .filter((i) => i.variantId)
      .map((i) => prisma.variant.update({ where: { id: i.variantId! }, data: { stock: { decrement: i.qty } } })),
  ]);

  await sendOrderConfirmation(order.email, order.number, formatPrice(order.totalInr));
  return NextResponse.json({ ok: true });
}
