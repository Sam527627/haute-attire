'use client';
import { useSyncExternalStore } from 'react';

export type CartItem = {
  productId: string;
  variantId?: string;
  slug: string;
  name: string;
  size?: string;
  image: string;
  priceInr: number; // paise
  qty: number;
};

const KEY = 'ha_cart_v1';
let listeners: (() => void)[] = [];
let cache: CartItem[] | null = null;

function read(): CartItem[] {
  if (typeof window === 'undefined') return [];
  if (cache) return cache;
  try {
    cache = JSON.parse(window.localStorage.getItem(KEY) || '[]');
  } catch {
    cache = [];
  }
  return cache!;
}

function write(items: CartItem[]) {
  cache = items;
  window.localStorage.setItem(KEY, JSON.stringify(items));
  listeners.forEach((l) => l());
}

export const cartStore = {
  get: read,
  subscribe(l: () => void) {
    listeners.push(l);
    return () => {
      listeners = listeners.filter((x) => x !== l);
    };
  },
  add(item: CartItem) {
    const items = [...read()];
    const i = items.findIndex((x) => x.productId === item.productId && x.variantId === item.variantId);
    if (i >= 0) items[i] = { ...items[i], qty: items[i].qty + item.qty };
    else items.push(item);
    write(items);
  },
  setQty(productId: string, variantId: string | undefined, qty: number) {
    let items = [...read()];
    if (qty <= 0) items = items.filter((x) => !(x.productId === productId && x.variantId === variantId));
    else items = items.map((x) => (x.productId === productId && x.variantId === variantId ? { ...x, qty } : x));
    write(items);
  },
  clear() {
    write([]);
  },
};

const emptyCart: CartItem[] = [];
export function useCart(): CartItem[] {
  return useSyncExternalStore(cartStore.subscribe, cartStore.get, () => emptyCart);
}
