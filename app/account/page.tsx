import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/currency';
import LogoutButton from '@/components/LogoutButton';

export const metadata = { title: 'My Account' };

export default async function Account() {
  const session = await getSession();
  if (!session) redirect('/login');

  const [orders, wishlist] = await Promise.all([
    prisma.order.findMany({ where: { userId: session.id }, include: { items: true }, orderBy: { createdAt: 'desc' } }),
    prisma.wishlistItem.findMany({ where: { userId: session.id }, include: { product: true }, orderBy: { createdAt: 'desc' } }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <div className="flex items-end justify-between">
        <div>
          <p className="micro text-gold">My account</p>
          <h1 className="font-display text-4xl font-light mt-2">Hello, {session.name.split(' ')[0]}</h1>
        </div>
        <LogoutButton />
      </div>

      <h2 className="micro text-gold mt-14">Order history</h2>
      {orders.length === 0 && <p className="text-sm text-stone mt-3">No orders yet — your first piece is waiting in <Link href="/shop" className="text-gold">the shop</Link>.</p>}
      <div className="mt-4 space-y-3">
        {orders.map((o) => (
          <Link key={o.id} href={`/order/${o.number}`} className="flex justify-between items-center border border-beige bg-cream p-5 hover:border-gold transition-colors">
            <div>
              <p className="text-sm font-medium">{o.number}</p>
              <p className="micro text-stone mt-1">{o.items.length} item{o.items.length > 1 ? 's' : ''} · {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
            <div className="text-right">
              <p className="text-sm">{formatPrice(o.totalInr)}</p>
              <p className="micro text-gold mt-1">{o.status.replace('_', ' ')}</p>
            </div>
          </Link>
        ))}
      </div>

      <h2 className="micro text-gold mt-14">Wishlist</h2>
      {wishlist.length === 0 && <p className="text-sm text-stone mt-3">Tap ♡ on any piece to save it here.</p>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
        {wishlist.map((w) => (
          <Link key={w.id} href={`/products/${w.product.slug}`} className="group">
            <div className="relative aspect-[3/4] bg-beige overflow-hidden">
              <Image src={w.product.images[0]} alt={w.product.name} fill sizes="25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <p className="text-sm mt-2">{w.product.name}</p>
            <p className="text-sm text-stone">{formatPrice(w.product.priceInr)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
