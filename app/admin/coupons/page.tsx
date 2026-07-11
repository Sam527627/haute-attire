import { prisma } from '@/lib/prisma';
import CouponForm from '@/components/admin/CouponForm';

export const dynamic = 'force-dynamic';

export default async function AdminCoupons() {
  const coupons = await prisma.coupon.findMany({ orderBy: { code: 'asc' } });
  return (
    <div>
      <h1 className="font-display text-4xl font-light">Coupons</h1>
      <CouponForm />
      <div className="mt-8 border border-beige bg-cream divide-y divide-beige">
        {coupons.map((c) => (
          <div key={c.id} className="flex justify-between p-4 text-sm">
            <span className="font-medium">{c.code}</span>
            <span className="text-stone">
              {c.percentOff ? `${c.percentOff}% off` : `₹${((c.amountOffInr || 0) / 100).toLocaleString('en-IN')} off`}
              {c.minOrderInr > 0 && ` · min ₹${(c.minOrderInr / 100).toLocaleString('en-IN')}`}
              {' · used '}{c.usedCount}{c.maxUses ? `/${c.maxUses}` : ''}
              {!c.isActive && ' · inactive'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
