'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/lib/cart';
import CartDrawer from './CartDrawer';

const MENU = [
  {
    label: 'Indian Wear',
    href: '/category/indian-wear',
    children: [
      ['Kurta Sets', '/category/kurta-sets'],
      ['Suits', '/category/suits'],
      ['Co-ord Sets', '/category/co-ord-sets'],
      ['Anarkali', '/category/anarkali'],
      ['Lehengas', '/category/lehengas'],
      ['Shararas', '/category/shararas'],
      ['Dupattas', '/category/dupattas'],
    ],
  },
  {
    label: 'Western Wear',
    href: '/category/western-wear',
    children: [
      ['Dresses', '/category/dresses'],
      ['Co-ords', '/category/co-ords'],
      ['Shirts', '/category/shirts'],
      ['Tops', '/category/tops'],
      ['Trousers', '/category/trousers'],
      ['Jumpsuits', '/category/jumpsuits'],
    ],
  },
  { label: 'Wedding', href: '/collections/wedding', children: [] },
  { label: 'Festive', href: '/collections/festive', children: [] },
  { label: 'Luxury', href: '/collections/luxury', children: [] },
  { label: 'New In', href: '/shop?new=1', children: [] },
];

export default function Header({ user }: { user: { name: string; role: string } | null }) {
  const [open, setOpen] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const cart = useCart();
  const count = cart.reduce((n, i) => n + i.qty, 0);

  return (
    <>
      <div className="bg-ink text-ivory text-center micro py-2">
        Complimentary shipping across India · Worldwide delivery
      </div>
      <header className="sticky top-0 z-40 bg-ivory/90 backdrop-blur border-b border-beige" onMouseLeave={() => setOpen(null)}>
        <div className="mx-auto max-w-7xl px-4 flex items-center justify-between h-20">
          <button className="lg:hidden micro" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Open menu">Menu</button>
          <Link href="/" className="font-display text-2xl md:text-3xl tracking-wide">
            Haute Attire <span className="italic text-gold">by NK</span>
          </Link>
          <nav className="hidden lg:flex gap-8" aria-label="Main">
            {MENU.map((m) => (
              <div key={m.label} className="relative" onMouseEnter={() => setOpen(m.children.length ? m.label : null)}>
                <Link href={m.href} className="micro hover:text-gold transition-colors py-8">{m.label}</Link>
              </div>
            ))}
          </nav>
          <div className="flex items-center gap-6">
            <Link href="/search" className="micro hover:text-gold hidden sm:block">Search</Link>
            <Link href={user ? '/account' : '/login'} className="micro hover:text-gold hidden sm:block">
              {user ? user.name.split(' ')[0] : 'Sign in'}
            </Link>
            {user?.role !== 'CUSTOMER' && user && <Link href="/admin" className="micro text-gold">Admin</Link>}
            <button onClick={() => setCartOpen(true)} className="micro hover:text-gold" aria-label="Open cart">
              Bag ({count})
            </button>
          </div>
        </div>
        {open && (
          <div className="absolute left-0 right-0 bg-cream border-b border-beige shadow-sm">
            <div className="mx-auto max-w-7xl px-4 py-8 grid grid-cols-4 gap-4">
              {MENU.find((m) => m.label === open)?.children.map(([label, href]) => (
                <Link key={href} href={href} className="text-sm text-stone hover:text-ink py-1">{label}</Link>
              ))}
            </div>
          </div>
        )}
        {mobileOpen && (
          <nav className="lg:hidden border-t border-beige bg-cream px-4 py-4 space-y-2" aria-label="Mobile">
            {MENU.map((m) => (
              <Link key={m.label} href={m.href} className="block micro py-2" onClick={() => setMobileOpen(false)}>{m.label}</Link>
            ))}
            <Link href={user ? '/account' : '/login'} className="block micro py-2">{user ? 'Account' : 'Sign in'}</Link>
          </nav>
        )}
      </header>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
