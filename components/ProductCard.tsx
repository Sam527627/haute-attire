import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/currency';

type P = {
  slug: string;
  name: string;
  priceInr: number;
  mrpInr?: number | null;
  images: string[];
  isNew?: boolean;
};

export default function ProductCard({ p }: { p: P }) {
  return (
    <Link href={`/products/${p.slug}`} className="group block">
      <div className="relative aspect-[3/4] bg-beige overflow-hidden">
        <Image
          src={p.images[0]}
          alt={p.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-opacity duration-500 group-hover:opacity-0"
        />
        {p.images[1] && (
          <Image
            src={p.images[1]}
            alt=""
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}
        {p.isNew && <span className="absolute top-3 left-3 bg-ivory/90 micro px-3 py-1">New</span>}
      </div>
      <div className="pt-4">
        <p className="text-sm">{p.name}</p>
        <p className="text-sm mt-1">
          <span className="font-medium">{formatPrice(p.priceInr)}</span>
          {p.mrpInr && <span className="text-stone line-through ml-2">{formatPrice(p.mrpInr)}</span>}
        </p>
        <span className="block h-px w-0 bg-gold transition-all duration-500 group-hover:w-full mt-3" />
      </div>
    </Link>
  );
}
