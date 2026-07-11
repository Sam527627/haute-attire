import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-32 text-center">
      <p className="micro text-gold">404</p>
      <h1 className="font-display text-5xl font-light mt-3 italic">This page has moved on</h1>
      <p className="text-sm text-stone mt-4">The piece you were looking for isn&apos;t here — but the collection is.</p>
      <Link href="/shop" className="btn-outline mt-8 inline-flex">Browse the shop</Link>
    </div>
  );
}
