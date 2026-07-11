import Link from 'next/link';

export const metadata = { title: 'Admin' };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 grid md:grid-cols-[200px_1fr] gap-10">
      <aside>
        <p className="micro text-gold">Atelier admin</p>
        <nav className="mt-4 space-y-2 text-sm">
          <Link href="/admin" className="block hover:text-gold">Dashboard</Link>
          <Link href="/admin/orders" className="block hover:text-gold">Orders</Link>
          <Link href="/admin/products" className="block hover:text-gold">Products & stock</Link>
          <Link href="/admin/coupons" className="block hover:text-gold">Coupons</Link>
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
