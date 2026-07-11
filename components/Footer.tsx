import Link from 'next/link';
import NewsletterForm from './NewsletterForm';

export default function Footer() {
  return (
    <footer className="bg-ink text-ivory mt-24">
      <div className="mx-auto max-w-7xl px-4 py-16 grid gap-12 md:grid-cols-4">
        <div>
          <p className="font-display text-2xl">Haute Attire <span className="italic text-champagne">by NK</span></p>
          <p className="text-sm text-ivory/60 mt-4 leading-relaxed">
            Modern Indian luxury, made for the way you actually live. Designed in Delhi, shipped worldwide.
          </p>
        </div>
        <div>
          <p className="micro text-champagne mb-4">Shop</p>
          <ul className="space-y-2 text-sm text-ivory/70">
            <li><Link href="/category/indian-wear" className="hover:text-ivory">Indian Wear</Link></li>
            <li><Link href="/category/western-wear" className="hover:text-ivory">Western Wear</Link></li>
            <li><Link href="/collections/wedding" className="hover:text-ivory">Wedding</Link></li>
            <li><Link href="/collections/festive" className="hover:text-ivory">Festive</Link></li>
            <li><Link href="/shop?new=1" className="hover:text-ivory">New Arrivals</Link></li>
          </ul>
        </div>
        <div>
          <p className="micro text-champagne mb-4">Help</p>
          <ul className="space-y-2 text-sm text-ivory/70">
            <li><Link href="/pages/shipping" className="hover:text-ivory">Shipping & Delivery</Link></li>
            <li><Link href="/pages/returns" className="hover:text-ivory">Returns & Exchanges</Link></li>
            <li><Link href="/pages/size-guide" className="hover:text-ivory">Size Guide</Link></li>
            <li><Link href="/pages/contact" className="hover:text-ivory">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <p className="micro text-champagne mb-4">Stay in the loop</p>
          <NewsletterForm />
          <p className="micro text-ivory/50 mt-6">
            <a href="https://www.instagram.com/hauteattirebynk/" target="_blank" rel="noreferrer" className="hover:text-champagne">Instagram @hauteattirebynk</a>
          </p>
        </div>
      </div>
      <div className="border-t border-ivory/10 py-6 text-center micro text-ivory/40">
        © {new Date().getFullYear()} Haute Attire by NK · Secure payments · Razorpay · UPI · Cards · COD
      </div>
    </footer>
  );
}
