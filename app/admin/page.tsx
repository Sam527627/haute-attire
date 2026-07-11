import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/currency';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const since30 = new Date(Date.now() - 30 * 86400_000);
  const [revenue, orderCount, customerCount, lowStock, recentOrders, pendingReviews] = await Promise.all([
    prisma.order.aggregate({ _sum: { totalInr: true }, where: { status: { in: ['PAID', 'PACKED', 'SHIPPED', 'DELIVERED'] }, createdAt: { gte: since30 } } }),
    prisma.order.count({ where: { createdAt: { gte: since30 } } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.variant.findMany({ where: { stock: { lte: 4 } }, include: { product: { select: { name: true } } }, take: 8, orderBy: { stock: 'asc' } }),
    prisma.order.findMany({ take: 8, orderBy: { createdAt: 'desc' }, include: { items: true } }),
    prisma.review.count({ where: { approved: false } }),
  ]);

  const stats = [
    ['Revenue (30d)', formatPrice(revenue._sum.totalInr || 0)],
    ['Orders (30d)', String(orderCount)],
    ['Customers', String(customerCount)],
    ['Reviews to approve', String(pendingReviews)],
  ];

  return (
    <div>
      <h1 className="font-display text-4xl font-light">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {stats.map(([t, v]) => (
          <div key={t} className="border border-beige bg-cream p-5">
            <p className="micro text-stone">{t}</p>
            <p className="font-display text-3xl mt-2">{v}</p>
          </div>
        ))}
      </div>

      <h2 className="micro text-gold mt-12">Low stock alerts</h2>
      <div className="mt-3 border border-beige bg-cream divide-y divide-beige">
        {lowStock.length === 0 && <p className="p-4 text-sm text-stone">All variants healthy.</p>}
        {lowStock.map((v) => (
          <div key={v.id} className="flex justify-between p-4 text-sm">
            <span>{v.product.name} · {v.size}</span>
            <span className={v.stock === 0 ? 'text-red-700' : 'text-gold'}>{v.stock === 0 ? 'Out of stock' : `${v.stock} left`}</span>
          </div>
        ))}
      </div>

      <h2 className="micro text-gold mt-12">Recent orders</h2>
      <div className="mt-3 border border-beige bg-cream divide-y divide-beige">
        {recentOrders.map((o) => (
          <div key={o.id} className="flex justify-between p-4 text-sm">
            <span>{o.number} · {o.email}</span>
            <span>{formatPrice(o.totalInr)} · <span className="text-gold">{o.status}</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}
