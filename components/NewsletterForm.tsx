'use client';
import { useState } from 'react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');

  async function submit() {
    if (!email.includes('@')) return setState('error');
    setState('saving');
    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setState(res.ok ? 'done' : 'error');
  }

  if (state === 'done') return <p className="text-sm text-champagne">You are on the list. Welcome.</p>;
  return (
    <div className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        aria-label="Email for newsletter"
        className="!bg-ink !border-ivory/20 !text-ivory placeholder:text-ivory/40"
      />
      <button onClick={submit} disabled={state === 'saving'} className="micro border border-champagne text-champagne px-4 hover:bg-champagne hover:text-ink transition-colors">
        Join
      </button>
      {state === 'error' && <span className="sr-only">Enter a valid email</span>}
    </div>
  );
}
