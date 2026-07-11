'use client';
import { useState } from 'react';

export default function StockEditor({ variantId, size, stock }: { variantId: string; size: string; stock: number }) {
  const [value, setValue] = useState(stock);
  const [saving, setSaving] = useState(false);
  async function save(next: number) {
    setValue(next);
    setSaving(true);
    await fetch('/api/admin/products', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variantId, stock: next }),
    });
    setSaving(false);
  }
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="micro text-stone">{size}</span>
      <input
        type="number" min={0} value={value} disabled={saving}
        onChange={(e) => save(Math.max(0, parseInt(e.target.value || '0', 10)))}
        className="!w-20 !py-1 !px-2"
        aria-label={`Stock for size ${size}`}
      />
    </label>
  );
}
