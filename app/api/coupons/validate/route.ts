import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const parsed = z.object({ code: z.string(), subtotalInr: z.number().int().positive() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  const c = await prisma.coupon.findUnique({ where: { code: parsed.data.code.toUpperCase() } });
  if (!c || !c.isActive) return NextResponse.json({ error: 'This code is not valid.' }, { status: 404 });
  if (c.expiresAt && c.expiresAt < new Date()) return NextResponse.json({ error: 'This code has expired.' }, { status: 410 });
  if (c.maxUses && c.usedCount >= c.maxUses) return NextResponse.json({ error: 'This code has been fully redeemed.' }, { status: 410 });
  if (parsed.data.subtotalInr < c.minOrderInr) {
    return NextResponse.json({ error: `Minimum order ₹${(c.minOrderInr / 100).toLocaleString('en-IN')} for this code.` }, { status: 400 });
  }
  const discount = c.percentOff
    ? Math.floor((parsed.data.subtotalInr * c.percentOff) / 100)
    : Math.min(c.amountOffInr || 0, parsed.data.subtotalInr);
  return NextResponse.json({ ok: true, code: c.code, discountInr: discount });
}
