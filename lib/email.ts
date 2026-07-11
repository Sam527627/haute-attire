import { Resend } from 'resend';

export async function sendOrderConfirmation(to: string, orderNumber: string, totalDisplay: string) {
  if (!process.env.RESEND_API_KEY) return; // email silently skipped until configured
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'Haute Attire by NK <onboarding@resend.dev>',
    to,
    subject: `Your order ${orderNumber} is confirmed — Haute Attire by NK`,
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:32px;color:#161311">
        <p style="letter-spacing:4px;font-size:11px;color:#B08A3E;text-transform:uppercase">Haute Attire by NK</p>
        <h1 style="font-weight:400">Thank you for your order</h1>
        <p>Order <strong>${orderNumber}</strong> has been confirmed. Total: <strong>${totalDisplay}</strong>.</p>
        <p>We will email you tracking details as soon as your piece leaves the atelier.</p>
      </div>`,
  });
}
