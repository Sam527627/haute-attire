"use client";
import Image from 'next/image';
import { motion } from 'framer-motion';

const SHOWCASE_ITEMS = [
  {
    title: 'Real Photo Edit One',
    caption: 'Soft drape, polished movement, and elevated evening styling.',
    src: '/images/products/insta1.jpg',
  },
  {
    title: 'Real Photo Edit Two',
    caption: 'Layered richness with a contemporary Indo-Western edge.',
    src: '/images/products/insta2.jpg',
  },
];

export default function StudioShowcase() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24">
      <div className="mb-14 text-center">
        <p className="micro text-gold">Studio collection</p>
        <h2 className="font-display text-4xl mt-3 font-light">A 3D runway moment</h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-stone">
          Experience your wardrobe in motion with a tactile layered showcase of our latest apparel edit.
        </p>
      </div>

      <div className="perspective-1500 flex justify-center">
        <div className="grid gap-6 md:grid-cols-2">
          {SHOWCASE_ITEMS.map((item, index) => (
            <motion.div
              key={item.title}
              whileHover={{ rotateY: index === 0 ? 8 : index === 1 ? -8 : 6, rotateX: 4, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 120, damping: 14 }}
              className="showcase-card group relative overflow-hidden rounded-[2rem] border border-beige bg-ink/5 shadow-2xl shadow-ink/10"
            >
              <div className="relative h-[460px] overflow-hidden">
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-ivory">
                <p className="micro text-champagne">New arrival</p>
                <h3 className="mt-2 text-2xl font-display font-light">{item.title}</h3>
                <p className="mt-3 text-sm text-ivory/80">{item.caption}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-20 grid gap-4 md:grid-cols-2">
        {['/images/products/insta3.jpg', '/images/products/insta4.jpg'].map((src, idx) => (
          <div key={idx} className="relative overflow-hidden rounded-[1.75rem] bg-beige aspect-[4/5]">
            <Image src={src} alt={`Look ${idx + 1}`} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 hover:scale-105" />
          </div>
        ))}
      </div>
    </section>
  );
}
