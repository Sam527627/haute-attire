import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { getRazorpay, razorpayEnabled } from '@/lib/razorpay';
import { rateLimit } from '@/lib/rate-limit';

const schema = z.object({
  items: z.array(z.object({ productId: z.string(), variantId: z.string().optional(), qty: z.number().int().min(1).max(10) })).min(1),
  email: z.string().email(),
  shipping: z.object({
    name: z.string().min(2),
    phone: z.string().min(8),
    line1: z.string().min(3),
    line2: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().regex(/^[1-9][0-9]{5}$/),
    country: z.string().default('India'),
  }),
  couponCode: z.string().optional(),
  method: z.enum(['RAZORPAY', 'COD']),
  giftWrap: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'local';
  if (!rateLimit(`checkout:${ip}`, 10, 60_000)) return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Check your shipping details.' }, { status: 400 });
  const { items, email, shipping, couponCode, method, giftWrap } = parsed.data;
  const session = await getSession();

  // Server-side price + stock validation (never trust the client cart)
  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds }, isActive: true }, include: { variants: true } });

  let subtotal = 0;
  const orderItems: { productId: string; variantId?: string; name: string; size?: string; qty: number; priceInr: number }[] = [];
  for (const item of items) {
    const p = products.find((x) => x.id === item.productId);
    if (!p) return NextResponse.json({ error: 'A piece in your bag is no longer available.' }, { status: 409 });
    const v = item.variantId ? p.variants.find((x) => x.id === item.variantId) : undefined;
    if (item.variantId && !v) return NextResponse.json({ error: 'Selected size unavailable.' }, { status: 409 });
    if (v && v.stock < item.qty) return NextResponse.json({ error: `${p.name} (${v.size}) has only ${v.stock} left.` }, { status: 409 });
    subtotal += p.priceInr * item.qty;
    orderItems.push({ productId: p.id, variantId: v?.id, name: p.name, size: v?.size, qty: item.qty, priceInr: p.priceInr });
  }

  // Coupon
  let discount = 0;
  let couponId: string | undefined;
  if (couponCode) {
    const c = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
    if (c && c.isActive && (!c.expiresAt || c.expiresAt > new Date()) && subtotal >= c.minOrderInr && (!c.maxUses || c.usedCount < c.maxUses)) {
      discount = c.percentOff ? Math.floor((subtotal * c.percentOff) / 100) : Math.min(c.amountOffInr || 0, subtotal);
      couponId = c.id;
    }
  }

  const shippingFee = shipping.country === 'India' ? 0 : 150000; // free in India, flat ₹1500 international
  const wrapFee = giftWrap ? 19900 : 0;
  const total = subtotal - discount + shippingFee + wrapFee;

  const number = `HA${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`;

  const order = await prisma.order.create({
    data: {
      number,
      userId: session?.id,
      email,
      shippingSnapshot: shipping,
      subtotalInr: subtotal,
      discountInr: discount,
      shippingInr: shippingFee + wrapFee,
      totalInr: total,
      couponId,
      method,
      giftWrap: !!giftWrap,
      status: method === 'COD' ? 'PAID' : 'PENDING', // COD confirmed immediately
      items: { create: orderItems },
    },
  });

  if (couponId) await prisma.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } });

  if (method === 'COD') {
    // Reserve stock immediately for COD
    for (const oi of orderItems) {
      if (oi.variantId) await prisma.variant.update({ where: { id: oi.variantId }, data: { stock: { decrement: oi.qty } } });
    }
    return NextResponse.json({ ok: true, orderNumber: order.number, cod: true });
  }

  if (!razorpayEnabled()) {
    return NextResponse.json(
      { error: 'Online payment is not configured yet. Add Razorpay keys in the environment, or choose Cash on Delivery.' },
      { status: 503 }
    );
  }

  const rzp = getRazorpay();
  const rzpOrder = await rzp.orders.create({ amount: total, currency: 'INR', receipt: order.number });
  await prisma.order.update({ where: { id: order.id }, data: { razorpayOrderId: rzpOrder.id } });

  return NextResponse.json({
    ok: true,
    orderNumber: order.number,
    razorpay: { orderId: rzpOrder.id, amount: total, keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, name: shipping.name, email },
  });
}
