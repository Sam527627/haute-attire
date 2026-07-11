'use client';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useCart, cartStore } from '@/lib/cart';
import { formatPrice } from '@/lib/currency';

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const items = useCart();
  const subtotal = items.reduce((s, i) => s + i.priceInr * i.qty, 0);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-ink/40 z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-cream z-50 flex flex-col"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            aria-label="Shopping bag"
          >
            <div className="flex items-center justify-between p-6 border-b border-beige">
              <p className="micro">Your bag ({items.length})</p>
              <button onClick={onClose} className="micro hover:text-gold">Close</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 && (
                <div className="text-center pt-16">
                  <p className="font-display text-2xl">Your bag is empty</p>
                  <Link href="/shop" onClick={onClose} className="btn-outline mt-6">Start shopping</Link>
                </div>
              )}
              {items.map((i) => (
                <div key={`${i.productId}-${i.variantId}`} className="flex gap-4">
                  <div className="relative w-20 h-28 bg-beige shrink-0">
                    <Image src={i.image} alt={i.name} fill className="object-cover" sizes="80px" />
                  </div>
                  <div className="flex-1">
                    <Link href={`/products/${i.slug}`} onClick={onClose} className="text-sm font-medium hover:text-gold">{i.name}</Link>
                    {i.size && <p className="micro text-stone mt-1">Size {i.size}</p>}
                    <p className="text-sm mt-1">{formatPrice(i.priceInr)}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button className="border border-beige w-7 h-7 text-sm" onClick={() => cartStore.setQty(i.productId, i.variantId, i.qty - 1)} aria-label="Decrease quantity">−</button>
                      <span className="text-sm w-4 text-center">{i.qty}</span>
                      <button className="border border-beige w-7 h-7 text-sm" onClick={() => cartStore.setQty(i.productId, i.variantId, i.qty + 1)} aria-label="Increase quantity">+</button>
                      <button className="micro text-stone hover:text-ink ml-auto" onClick={() => cartStore.setQty(i.productId, i.variantId, 0)}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {items.length > 0 && (
              <div className="p-6 border-t border-beige space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="micro">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <Link href="/checkout" onClick={onClose} className="btn-ink w-full">Checkout</Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
