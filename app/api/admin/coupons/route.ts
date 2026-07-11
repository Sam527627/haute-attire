import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession, audit } from '@/lib/auth';

const schema = z.object({
  code: z.string().min(3).max(20).regex(/^[A-Z0-9]+$/),
  percentOff: z.number().int().min(1).max(90).optional(),
  amountOffInr: z.number().int().positive().optional(),
  minOrderInr: z.number().int().min(0).default(0),
  maxUses: z.number().int().positive().optional(),
}).refine((d) => d.percentOff || d.amountOffInr, { message: 'Set either a percent or an amount' });

export async function POST(req: NextRequest) {
  const session = await getSession();
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Set a code and either a % or ₹ discount.' }, { status: 400 });
  try {
    const c = await prisma.coupon.create({ data: parsed.data });
    await audit(session?.email || 'admin', 'COUPON_CREATE', 'Coupon', c.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'That code already exists.' }, { status: 409 });
  }
}
