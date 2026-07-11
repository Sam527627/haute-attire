import type { Metadata } from 'next';
import { Cormorant_Garamond, Jost } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { getSession } from '@/lib/auth';

const display = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], variable: '--font-display' });
const body = Jost({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-body' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: 'Haute Attire by NK — Modern Indian Luxury', template: '%s | Haute Attire by NK' },
  description: 'Indian and western womenswear, hand-finished for Gen Z and young professionals. Kurta sets, lehengas, co-ords, dresses. Ships worldwide from India.',
  openGraph: { siteName: 'Haute Attire by NK', type: 'website' },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <Header user={session ? { name: session.name, role: session.role } : null} />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
