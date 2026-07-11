import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/currency';

export default async function OrderConfirmation({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const order = await prisma.order.findUnique({ where: { number }, include: { items: true } });
  if (!order) notFound();
  const ship = order.shippingSnapshot as { name: string; line1: string; city: string; state: string; pincode: string; country: string };
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <p className="micro text-gold">Order confirmed</p>
      <h1 className="font-display text-5xl font-light mt-3 italic">Thank you, {ship.name.split(' ')[0]}</h1>
      <p className="text-stone mt-4 text-sm">
        Order <span className="text-ink font-medium">{order.number}</span> · {order.method === 'COD' ? 'Cash on delivery' : 'Paid online'} · A confirmation is on its way to {order.email}.
      </p>
      <div className="border border-beige bg-cream p-6 mt-10 text-left text-sm">
        {order.items.map((i) => (
          <div key={i.id} className="flex justify-between py-2 border-b border-beige last:border-0">
            <span>{i.name}{i.size && ` · ${i.size}`} × {i.qty}</span>
            <span>{formatPrice(i.priceInr * i.qty)}</span>
          </div>
        ))}
        <div className="flex justify-between pt-4 font-medium"><span>Total</span><span>{formatPrice(order.totalInr)}</span></div>
        <p className="micro text-stone mt-4">Shipping to: {ship.line1}, {ship.city}, {ship.state} {ship.pincode}, {ship.country}</p>
      </div>
      <a href="/shop" className="btn-outline mt-10 inline-flex">Continue shopping</a>
    </div>
  );
}
