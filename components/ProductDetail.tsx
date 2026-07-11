'use client';
import { useState } from 'react';
import Image from 'next/image';
import { cartStore } from '@/lib/cart';
import { formatPrice } from '@/lib/currency';

type Props = {
  product: {
    id: string; slug: string; name: string; sku: string; description: string;
    fabric: string | null; washCare: string | null;
    priceInr: number; mrpInr: number | null; images: string[];
    categoryName: string;
    variants: { id: string; size: string; stock: number }[];
  };
};

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function ProductDetail({ product }: Props) {
  const [img, setImg] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pinMsg, setPinMsg] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const variants = [...product.variants].sort((a, b) => SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size));
  const selected = variants.find((v) => v.size === size);

  function addToCart() {
    if (!selected) return;
    cartStore.add({
      productId: product.id,
      variantId: selected.id,
      slug: product.slug,
      name: product.name,
      size: selected.size,
      image: product.images[0],
      priceInr: product.priceInr,
      qty: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  function checkPincode() {
    // Serviceability heuristic: all Indian 6-digit pincodes are serviceable via Shiprocket;
    // metro prefixes get faster estimates. Replace with Shiprocket serviceability API when keys are set.
    if (!/^[1-9][0-9]{5}$/.test(pincode)) return setPinMsg('Enter a valid 6-digit pincode');
    const metro = ['11', '40', '56', '60', '70', '50'].some((p) => pincode.startsWith(p));
    setPinMsg(metro ? 'Deliverable in 2–4 days · Free shipping · COD available' : 'Deliverable in 4–7 days · Free shipping · COD available');
  }

  return (
    <div className="grid lg:grid-cols-2 gap-12">
      {/* Gallery */}
      <div>
        <div className="relative aspect-[3/4] bg-beige overflow-hidden group">
          <Image src={product.images[img]} alt={product.name} fill priority sizes="(max-width:1024px) 100vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.6] group-hover:cursor-zoom-in" />
        </div>
        {product.images.length > 1 && (
          <div className="flex gap-3 mt-3">
            {product.images.map((src, i) => (
              <button key={src} onClick={() => setImg(i)} className={`relative w-20 aspect-[3/4] bg-beige ${i === img ? 'ring-1 ring-gold' : ''}`} aria-label={`Image ${i + 1}`}>
                <Image src={src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <p className="micro text-gold">{product.categoryName}</p>
        <h1 className="font-display text-4xl font-light mt-2">{product.name}</h1>
        <p className="mt-4 text-xl">
          {formatPrice(product.priceInr)}
          {product.mrpInr && (
            <>
              <span className="text-stone line-through text-base ml-3">{formatPrice(product.mrpInr)}</span>
              <span className="micro text-gold ml-3">{Math.round((1 - product.priceInr / product.mrpInr) * 100)}% off</span>
            </>
          )}
        </p>
        <p className="micro text-stone mt-1">Inclusive of all taxes · SKU {product.sku}</p>

        {/* Sizes */}
        <div className="mt-8">
          <div className="flex justify-between items-center">
            <p className="micro">Select size</p>
            <button onClick={() => setShowGuide(!showGuide)} className="micro text-gold">Size guide</button>
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            {variants.map((v) => (
              <button
                key={v.id}
                disabled={v.stock === 0}
                onClick={() => setSize(v.size)}
                className={`w-14 h-12 border text-sm transition-colors ${
                  size === v.size ? 'border-ink bg-ink text-ivory' : v.stock === 0 ? 'border-beige text-beige line-through cursor-not-allowed' : 'border-beige hover:border-ink'
                }`}
              >
                {v.size}
              </button>
            ))}
          </div>
          {selected && selected.stock <= 4 && (
            <p className="micro text-gold mt-2">Only {selected.stock} left in {selected.size}</p>
          )}
        </div>

        {showGuide && (
          <div className="mt-4 border border-beige bg-cream p-4 text-sm overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="micro text-stone"><th className="py-1 pr-4">Size</th><th className="pr-4">Bust (in)</th><th className="pr-4">Waist (in)</th><th>Hip (in)</th></tr></thead>
              <tbody>
                {[['XS', 32, 26, 35], ['S', 34, 28, 37], ['M', 36, 30, 39], ['L', 38, 32, 41], ['XL', 40, 34, 43]].map((r) => (
                  <tr key={r[0]} className="border-t border-beige"><td className="py-1 pr-4">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* CTA */}
        <div className="flex gap-3 mt-8">
          <button onClick={addToCart} disabled={!selected} className="btn-ink flex-1 disabled:opacity-40 disabled:hover:bg-ink">
            {added ? 'Added to bag ✓' : selected ? 'Add to bag' : 'Select a size'}
          </button>
          <WishlistButton productId={product.id} />
        </div>

        {/* Pincode */}
        <div className="mt-8">
          <p className="micro">Check delivery</p>
          <div className="flex gap-2 mt-2 max-w-xs">
            <input value={pincode} onChange={(e) => setPincode(e.target.value)} inputMode="numeric" maxLength={6} placeholder="Pincode" aria-label="Delivery pincode" />
            <button onClick={checkPincode} className="btn-outline !py-2 !px-4">Check</button>
          </div>
          {pinMsg && <p className="micro text-stone mt-2">{pinMsg}</p>}
        </div>

        {/* Details */}
        <div className="mt-10 space-y-6 text-sm leading-relaxed text-stone">
          <div>
            <p className="micro text-ink mb-2">The piece</p>
            <p>{product.description}</p>
          </div>
          {product.fabric && (
            <div>
              <p className="micro text-ink mb-2">Fabric</p>
              <p>{product.fabric}</p>
            </div>
          )}
          {product.washCare && (
            <div>
              <p className="micro text-ink mb-2">Care</p>
              <p>{product.washCare}</p>
            </div>
          )}
          <div>
            <p className="micro text-ink mb-2">Returns</p>
            <p>7-day easy returns and exchanges. Pieces must be unworn with tags attached. Refunds to original payment method within 5–7 working days.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function WishlistButton({ productId }: { productId: string }) {
  const [state, setState] = useState<'idle' | 'saved' | 'login'>('idle');
  async function toggle() {
    const res = await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    });
    if (res.status === 401) setState('login');
    else if (res.ok) setState('saved');
  }
  if (state === 'login') return <a href="/login" className="btn-outline">Sign in to save</a>;
  return (
    <button onClick={toggle} className="btn-outline" aria-label="Add to wishlist">
      {state === 'saved' ? '♥ Saved' : '♡ Wishlist'}
    </button>
  );
}
