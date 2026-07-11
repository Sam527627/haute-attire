'use client';
import { useState } from 'react';

export default function ProductToggle({ id, isActive }: { id: string; isActive: boolean }) {
  const [active, setActive] = useState(isActive);
  async function toggle() {
    const next = !active;
    setActive(next);
    await fetch('/api/admin/products', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: id, isActive: next }),
    });
  }
  return (
    <button onClick={toggle} className={`micro px-3 py-1 border ${active ? 'border-gold text-gold' : 'border-beige text-stone'}`}>
      {active ? 'Live' : 'Hidden'}
    </button>
  );
}
