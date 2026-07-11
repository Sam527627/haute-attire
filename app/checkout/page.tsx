import CheckoutClient from '@/components/CheckoutClient';
import { getSession } from '@/lib/auth';

export const metadata = { title: 'Checkout' };

export default async function Checkout() {
  const session = await getSession();
  return <CheckoutClient defaultEmail={session?.email || ''} />;
}
