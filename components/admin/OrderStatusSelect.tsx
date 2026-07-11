'use client';
import { useState } from 'react';

const STATUSES = ['PENDING', 'PAID', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED', 'REFUNDED'];

export default function OrderStatusSelect({ id, status }: { id: string; status: string }) {
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);
  async function change(next: string) {
    setValue(next);
    setSaving(true);
    await fetch('/api/admin/orders', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: next }),
    });
    setSaving(false);
  }
  return (
    <select value={value} onChange={(e) => change(e.target.value)} disabled={saving} aria-label="Order status">
      {STATUSES.map((s) => <option key={s}>{s}</option>)}
    </select>
  );
}
