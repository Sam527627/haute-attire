import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/currency';
import OrderStatusSelect from '@/components/admin/OrderStatusSelect';

export const dynamic = 'force-dynamic';

export default async function AdminOrders() {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' }, include: { items: true }, take: 100 });
  return (
    <div>
      <h1 className="font-display text-4xl font-light">Orders</h1>
      <div className="mt-8 border border-beige bg-cream divide-y divide-beige">
        {orders.map((o) => (
          <div key={o.id} className="p-4 grid md:grid-cols-4 gap-3 items-center text-sm">
            <div>
              <p className="font-medium">{o.number}</p>
              <p className="micro text-stone">{new Date(o.createdAt).toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p>{o.email}</p>
              <p className="micro text-stone">{o.items.map((i) => `${i.name}${i.size ? ` (${i.size})` : ''}×${i.qty}`).join(', ')}</p>
            </div>
            <p>{formatPrice(o.totalInr)} · {o.method}</p>
            <OrderStatusSelect id={o.id} status={o.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
