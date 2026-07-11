'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart, cartStore } from '@/lib/cart';
import { formatPrice } from '@/lib/currency';

declare global {
  interface Window { Razorpay?: new (opts: object) => { open: () => void } }
}

export default function CheckoutClient({ defaultEmail }: { defaultEmail: string }) {
  const items = useCart();
  const router = useRouter();
  const [email, setEmail] = useState(defaultEmail);
  const [ship, setShip] = useState({ name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', country: 'India' });
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState<{ code: string; discountInr: number } | null>(null);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [method, setMethod] = useState<'RAZORPAY' | 'COD'>('RAZORPAY');
  const [giftWrap, setGiftWrap] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const subtotal = items.reduce((s, i) => s + i.priceInr * i.qty, 0);
  const shippingFee = ship.country === 'India' ? 0 : 150000;
  const wrapFee = giftWrap ? 19900 : 0;
  const total = subtotal - (coupon?.discountInr || 0) + shippingFee + wrapFee;

  async function applyCoupon() {
    setCouponMsg(null);
    const res = await fetch('/api/coupons/validate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: couponInput, subtotalInr: subtotal }),
    });
    const data = await res.json();
    if (!res.ok) return setCouponMsg(data.error);
    setCoupon({ code: data.code, discountInr: data.discountInr });
    setCouponMsg(`${data.code} applied — you save ${formatPrice(data.discountInr)}`);
  }

  async function loadRazorpayScript(): Promise<boolean> {
    if (window.Razorpay) return true;
    return new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });
  }

  async function placeOrder() {
    setError(null);
    setBusy(true);
    const res = await fetch('/api/checkout', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, qty: i.qty })),
        email, shipping: ship, couponCode: coupon?.code, method, giftWrap,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setBusy(false); return setError(data.error || 'Could not place the order.'); }

    if (data.cod) {
      cartStore.clear();
      return router.push(`/order/${data.orderNumber}`);
    }

    const loaded = await loadRazorpayScript();
    if (!loaded || !window.Razorpay) { setBusy(false); return setError('Payment window failed to load. Check your connection and try again.'); }

    const rzp = new window.Razorpay({
      key: data.razorpay.keyId,
      amount: data.razorpay.amount,
      currency: 'INR',
      name: 'Haute Attire by NK',
      description: `Order ${data.orderNumber}`,
      order_id: data.razorpay.orderId,
      prefill: { name: data.razorpay.name, email: data.razorpay.email },
      theme: { color: '#161311' },
      handler: async (resp: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        const v = await fetch('/api/checkout/verify', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderNumber: data.orderNumber,
            razorpayOrderId: resp.razorpay_order_id,
            razorpayPaymentId: resp.razorpay_payment_id,
            razorpaySignature: resp.razorpay_signature,
          }),
        });
        if (v.ok) { cartStore.clear(); router.push(`/order/${data.orderNumber}`); }
        else setError('Payment verification failed. Contact us with your order number before retrying.');
      },
    });
    rzp.open();
    setBusy(false);
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl font-light">Your bag is empty</h1>
        <a href="/shop" className="btn-outline mt-8 inline-flex">Continue shopping</a>
      </div>
    );
  }

  const set = (k: keyof typeof ship) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setShip({ ...ship, [k]: e.target.value });

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 grid lg:grid-cols-5 gap-12">
      <div className="lg:col-span-3">
        <h1 className="font-display text-4xl font-light">Checkout</h1>

        <p className="micro text-gold mt-10">Contact</p>
        <input className="mt-3" type="email" placeholder="Email for order updates" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" />

        <p className="micro text-gold mt-8">Shipping address</p>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <input placeholder="Full name" value={ship.name} onChange={set('name')} aria-label="Full name" />
          <input placeholder="Phone" value={ship.phone} onChange={set('phone')} aria-label="Phone" />
          <input className="col-span-2" placeholder="Address line 1" value={ship.line1} onChange={set('line1')} aria-label="Address line 1" />
          <input className="col-span-2" placeholder="Address line 2 (optional)" value={ship.line2} onChange={set('line2')} aria-label="Address line 2" />
          <input placeholder="City" value={ship.city} onChange={set('city')} aria-label="City" />
          <input placeholder="State" value={ship.state} onChange={set('state')} aria-label="State" />
          <input placeholder="Pincode" value={ship.pincode} onChange={set('pincode')} inputMode="numeric" aria-label="Pincode" />
          <select value={ship.country} onChange={set('country')} aria-label="Country">
            {['India', 'United Arab Emirates', 'United States', 'United Kingdom', 'Australia', 'Canada', 'Singapore'].map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        <p className="micro text-gold mt-8">Payment</p>
        <div className="space-y-2 mt-3">
          <label className="flex items-center gap-3 border border-beige p-4 cursor-pointer has-[:checked]:border-gold">
            <input type="radio" name="pay" className="!w-auto" checked={method === 'RAZORPAY'} onChange={() => setMethod('RAZORPAY')} />
            <span className="text-sm">UPI · Cards · Net banking · Wallets · EMI <span className="micro text-stone">(Razorpay)</span></span>
          </label>
          <label className="flex items-center gap-3 border border-beige p-4 cursor-pointer has-[:checked]:border-gold">
            <input type="radio" name="pay" className="!w-auto" checked={method === 'COD'} onChange={() => setMethod('COD')} />
            <span className="text-sm">Cash on delivery <span className="micro text-stone">(India only)</span></span>
          </label>
          <label className="flex items-center gap-3 p-2 cursor-pointer">
            <input type="checkbox" className="!w-auto" checked={giftWrap} onChange={(e) => setGiftWrap(e.target.checked)} />
            <span className="text-sm">Gift wrap this order <span className="micro text-stone">(+₹199, ivory tissue & gold ribbon)</span></span>
          </label>
        </div>

        {error && <p className="text-sm text-red-700 mt-6">{error}</p>}
        <button onClick={placeOrder} disabled={busy} className="btn-ink w-full mt-8">
          {busy ? 'Placing order…' : method === 'COD' ? `Place order · ${formatPrice(total)}` : `Pay ${formatPrice(total)}`}
        </button>
      </div>

      {/* Summary */}
      <aside className="lg:col-span-2 bg-cream border border-beige p-6 h-fit">
        <p className="micro">Order summary</p>
        <div className="space-y-4 mt-4">
          {items.map((i) => (
            <div key={`${i.productId}-${i.variantId}`} className="flex gap-3 items-center">
              <div className="relative w-14 h-20 bg-beige shrink-0">
                <Image src={i.image} alt="" fill sizes="56px" className="object-cover" />
              </div>
              <div className="flex-1 text-sm">
                <p>{i.name}</p>
                <p className="micro text-stone">{i.size && `Size ${i.size} · `}Qty {i.qty}</p>
              </div>
              <p className="text-sm">{formatPrice(i.priceInr * i.qty)}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-6">
          <input placeholder="Discount code" value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} aria-label="Discount code" />
          <button onClick={applyCoupon} className="btn-outline !px-4 !py-2">Apply</button>
        </div>
        {couponMsg && <p className="micro text-stone mt-2">{couponMsg}</p>}
        <div className="mt-6 space-y-2 text-sm border-t border-beige pt-4">
          <div className="flex justify-between"><span className="text-stone">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
          {coupon && <div className="flex justify-between text-gold"><span>Discount ({coupon.code})</span><span>−{formatPrice(coupon.discountInr)}</span></div>}
          <div className="flex justify-between"><span className="text-stone">Shipping</span><span>{shippingFee === 0 ? 'Free' : formatPrice(shippingFee)}</span></div>
          {giftWrap && <div className="flex justify-between"><span className="text-stone">Gift wrap</span><span>{formatPrice(wrapFee)}</span></div>}
          <div className="flex justify-between font-medium text-base pt-2 border-t border-beige"><span>Total</span><span>{formatPrice(total)}</span></div>
        </div>
      </aside>
    </div>
  );
}
