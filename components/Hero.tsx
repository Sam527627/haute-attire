'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';

const SLIDES = [
  {
    img: '/images/hero-festive.svg',
    eyebrow: 'The Festive Edit 2026',
    title: 'Dressed in light',
    sub: 'Chikankari, organza, and champagne gold — hand-finished for the season of celebrations.',
    href: '/collections/festive',
  },
  {
    img: '/images/hero-wedding.svg',
    eyebrow: 'Wedding Collection',
    title: 'For the season of yes',
    sub: 'Lehengas and anarkalis that move the way you do.',
    href: '/collections/wedding',
  },
  {
    img: '/images/hero-festive.svg',
    eyebrow: 'New Arrivals',
    title: 'Everyday, elevated',
    sub: 'Linen, silk, and ivory co-ords for the week you actually live.',
    href: '/shop?new=1',
  },
];

export default function Hero() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);
  const s = SLIDES[i];
  return (
    <section className="relative h-[82vh] min-h-[520px] overflow-hidden bg-ink" aria-label="Featured collections">
      <span className="atelier-line left-1/2 z-20 hidden md:block" />
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          <Image src={s.img} alt="" fill priority className="object-cover opacity-80" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
        </motion.div>
      </AnimatePresence>
      <div className="relative z-10 h-full flex flex-col items-center justify-end pb-24 text-center text-ivory px-4">
        <motion.p key={`e${i}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="micro text-champagne">
          {s.eyebrow}
        </motion.p>
        <motion.h1 key={`t${i}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="font-display text-5xl md:text-7xl font-light mt-4 italic">
          {s.title}
        </motion.h1>
        <motion.p key={`s${i}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="max-w-md text-sm text-ivory/80 mt-4">
          {s.sub}
        </motion.p>
        <motion.div key={`c${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}>
          <Link href={s.href} className="btn-outline !border-ivory !text-ivory hover:!border-champagne hover:!text-champagne mt-8">
            Explore the collection
          </Link>
        </motion.div>
        <div className="flex gap-2 mt-10" role="tablist" aria-label="Hero slides">
          {SLIDES.map((_, x) => (
            <button key={x} onClick={() => setI(x)} aria-label={`Slide ${x + 1}`} className={`h-px w-10 transition-colors ${x === i ? 'bg-champagne' : 'bg-ivory/30'}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
