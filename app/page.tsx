import Link from 'next/link';
import Image from 'next/image';
import Hero from '@/components/Hero';
import ProductCard from '@/components/ProductCard';
import StudioShowcase from '@/components/StudioShowcase';
import { prisma } from '@/lib/prisma';

export const revalidate = 300;

async function getInstagramFeed() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return null;
  try {
    const r = await fetch(
      `https://graph.instagram.com/me/media?fields=id,media_url,permalink,media_type,thumbnail_url&limit=6&access_token=${token}`,
      { next: { revalidate: 3600 } }
    );
    if (!r.ok) return null;
    const j = await r.json();
    return (j.data || []).filter((m: { media_type: string }) => m.media_type !== 'VIDEO').slice(0, 6);
  } catch {
    return null;
  }
}

export default async function Home() {
  const [featured, newest, trending, instagramProducts, collections, instagram] = await Promise.all([
    prisma.product.findMany({ where: { isFeatured: true, isActive: true }, take: 8, orderBy: { createdAt: 'desc' } }),
    prisma.product.findMany({ where: { isNew: true, isActive: true }, take: 4, orderBy: { createdAt: 'desc' } }),
    prisma.product.findMany({ where: { isActive: true, OR: [{ tags: { has: 'indowestern' } }, { isFeatured: true }] }, take: 8, orderBy: { createdAt: 'desc' } }),
    prisma.product.findMany({ where: { tags: { has: 'instagram' }, isActive: true }, take: 6, orderBy: { createdAt: 'desc' } }),
    prisma.collection.findMany({ take: 3 }),
    getInstagramFeed(),
  ]);

  return (
    <>
      <Hero />

      {/* Collections */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <p className="micro text-gold text-center">Curated for you</p>
        <h2 className="font-display text-4xl text-center mt-3 font-light">The Collections</h2>
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {collections.map((c, i) => (
            <Link key={c.id} href={`/collections/${c.slug}`} className="group relative aspect-[3/4] overflow-hidden bg-beige">
              <Image
                src={c.image || `/images/catalogue/look-${String((i % 9) + 1).padStart(2, '0')}.png`}
                alt={c.name}
                fill
                sizes="(max-width:768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
              <div className="absolute bottom-0 p-8 text-ivory">
                <p className="font-display text-3xl italic">{c.name}</p>
                {c.tagline && <p className="text-xs text-ivory/70 mt-2">{c.tagline}</p>}
                <span className="micro text-champagne mt-3 inline-block">Shop now →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* New arrivals */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="micro text-gold">Just landed</p>
            <h2 className="font-display text-4xl mt-3 font-light">New Arrivals</h2>
          </div>
          <Link href="/shop?new=1" className="micro hover:text-gold">View all →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
          {newest.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* Trending Indo-Western */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="flex items-end justify-between">
          <div>
            <p className="micro text-gold">Trending now</p>
            <h2 className="font-display text-4xl mt-3 font-light">Indo-Western Edit</h2>
          </div>
          <Link href="/shop" className="micro hover:text-gold">Shop all →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
          {trending.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="flex items-end justify-between">
          <div>
            <p className="micro text-gold">Editor&apos;s picks</p>
            <h2 className="font-display text-4xl mt-3 font-light">Best Sellers</h2>
          </div>
          <Link href="/shop" className="micro hover:text-gold">Shop all →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
          {featured.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      <StudioShowcase />

      {/* Instagram products */}
      <section className="mx-auto max-w-7xl px-4 py-20 bg-cream">
        <div className="flex items-end justify-between">
          <div>
            <p className="micro text-gold">Instagram edit</p>
            <h2 className="font-display text-4xl mt-3 font-light">Inspired by Haute Attire</h2>
          </div>
          <Link href="/shop?tag=instagram" className="micro hover:text-gold">Shop the feed →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
          {instagramProducts.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* Why shop */}
      <section className="border-y border-beige bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-14 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            ['Worldwide shipping', 'Tracked delivery to 40+ countries'],
            ['Premium quality', 'Hand-finished in small batches'],
            ['Easy returns', '7-day returns and exchanges'],
            ['Secure payments', 'UPI, cards, EMI, and COD'],
          ].map(([t, s]) => (
            <div key={t}>
              <p className="micro text-gold">{t}</p>
              <p className="text-xs text-stone mt-2">{s}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Instagram */}
      <section className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="micro text-gold">@hauteattirebynk</p>
        <h2 className="font-display text-4xl mt-3 font-light">As seen on Instagram</h2>
        {instagram ? (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-10">
            {instagram.map((m: { id: string; media_url: string; permalink: string }) => (
              <a key={m.id} href={m.permalink} target="_blank" rel="noreferrer" className="relative aspect-square block overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.media_url} alt="Instagram post" className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              </a>
            ))}
          </div>
        ) : (
          <div className="mt-10 border border-beige bg-cream p-10">
            <p className="text-sm text-stone">
              Connect your Instagram account to show your latest posts here automatically — add
              <code className="mx-1 text-xs bg-beige px-1">INSTAGRAM_ACCESS_TOKEN</code> in your environment.
            </p>
            <a href="https://www.instagram.com/hauteattirebynk/" target="_blank" rel="noreferrer" className="btn-outline mt-6 inline-flex">Visit our Instagram</a>
          </div>
        )}
      </section>
    </>
  );
}
