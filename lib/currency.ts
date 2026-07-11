// INR is the source of truth (stored in paise). Other currencies are display conversions.
// Rates should be refreshed via a cron or an FX API in production; these are sane fallbacks.
export const CURRENCIES = {
  INR: { symbol: '₹', rate: 1, locale: 'en-IN' },
  USD: { symbol: '$', rate: 0.0115, locale: 'en-US' },
  AED: { symbol: 'د.إ', rate: 0.0424, locale: 'ar-AE' },
  GBP: { symbol: '£', rate: 0.0091, locale: 'en-GB' },
  EUR: { symbol: '€', rate: 0.0107, locale: 'en-IE' },
  AUD: { symbol: 'A$', rate: 0.0176, locale: 'en-AU' },
  CAD: { symbol: 'C$', rate: 0.0158, locale: 'en-CA' },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

export function formatPrice(paise: number, code: CurrencyCode = 'INR') {
  const c = CURRENCIES[code];
  const value = (paise / 100) * c.rate;
  if (code === 'INR') {
    return `₹${Math.round(value).toLocaleString('en-IN')}`;
  }
  return `${c.symbol}${value.toFixed(2)}`;
}
