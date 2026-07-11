'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CouponForm() {
  const router = useRouter();
  const [form, setForm] = useState({ code: '', percentOff: '', amountOff: '', minOrder: '' });
  const [msg, setMsg] = useState<string | null>(null);

  async function create() {
    setMsg(null);
    const res = await fetch('/api/admin/coupons', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: form.code,
        percentOff: form.percentOff ? Number(form.percentOff) : undefined,
        amountOffInr: form.amountOff ? Number(form.amountOff) * 100 : undefined,
        minOrderInr: form.minOrder ? Number(form.minOrder) * 100 : 0,
      }),
    });
    if (res.ok) { setForm({ code: '', percentOff: '', amountOff: '', minOrder: '' }); router.refresh(); }
    else setMsg((await res.json()).error || 'Could not create the coupon');
  }

  return (
    <div className="mt-6 border border-beige bg-cream p-4">
      <p className="micro text-gold">New coupon</p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
        <input placeholder="CODE" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} aria-label="Coupon code" />
        <input placeholder="% off" inputMode="numeric" value={form.percentOff} onChange={(e) => setForm({ ...form, percentOff: e.target.value, amountOff: '' })} aria-label="Percent off" />
        <input placeholder="₹ off" inputMode="numeric" value={form.amountOff} onChange={(e) => setForm({ ...form, amountOff: e.target.value, percentOff: '' })} aria-label="Amount off" />
        <input placeholder="Min order ₹" inputMode="numeric" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} aria-label="Minimum order" />
        <button onClick={create} className="btn-ink !py-2">Create</button>
      </div>
      {msg && <p className="text-sm text-red-700 mt-2">{msg}</p>}
    </div>
  );
}
