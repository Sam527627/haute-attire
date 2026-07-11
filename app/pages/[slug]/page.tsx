import { notFound } from 'next/navigation';

const PAGES: Record<string, { title: string; body: string[] }> = {
  shipping: {
    title: 'Shipping & Delivery',
    body: [
      'India: complimentary tracked shipping on all orders. Metro cities are typically delivered in 2–4 working days; the rest of India in 4–7 working days. Cash on delivery is available across serviceable pincodes.',
      'International: we ship worldwide with a flat fee of ₹1,500, delivered in 7–14 working days depending on customs. Duties and taxes at destination are the recipient\u2019s responsibility.',
      'Every order ships in signature ivory tissue with a gold seal. You will receive a tracking link by email the moment your parcel leaves the atelier.',
    ],
  },
  returns: {
    title: 'Returns & Exchanges',
    body: [
      'We accept returns and exchanges within 7 days of delivery. Pieces must be unworn, unwashed, and with all tags attached.',
      'To start a return, reply to your order confirmation email or WhatsApp us with your order number. We arrange a doorstep pickup for Indian addresses.',
      'Refunds are issued to the original payment method within 5–7 working days of the piece reaching us. COD orders are refunded via UPI or bank transfer.',
      'Made-to-order and heavily embellished bridal pieces are exchange-only, noted on the product page.',
    ],
  },
  'size-guide': {
    title: 'Size Guide',
    body: [
      'Our pieces are cut for real bodies. If you are between sizes, size up for kurtas and anarkalis, and take your usual size for fitted western silhouettes.',
      'XS: bust 32" / waist 26" / hip 35". S: 34/28/37. M: 36/30/39. L: 38/32/41. XL: 40/34/43.',
      'Unsure? WhatsApp us your measurements and we will recommend a size within a few hours.',
    ],
  },
  contact: {
    title: 'Contact Us',
    body: [
      'WhatsApp: tap the green button on any page — we reply within business hours, 10am–7pm IST, Monday to Saturday.',
      'Email: care@hauteattirebynk.com for orders, wholesale, and press.',
      'Instagram: @hauteattirebynk — DMs open.',
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(PAGES).map((slug) => ({ slug }));
}

export default async function StaticPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = PAGES[slug];
  if (!page) notFound();
  return (
    <div className="mx-auto max-w-2xl px-4 py-20">
      <p className="micro text-gold">Haute Attire by NK</p>
      <h1 className="font-display text-5xl font-light mt-3">{page.title}</h1>
      <div className="mt-8 space-y-5 text-sm leading-relaxed text-stone">
        {page.body.map((p) => <p key={p.slice(0, 20)}>{p}</p>)}
      </div>
    </div>
  );
}
