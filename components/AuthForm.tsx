'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/auth/${mode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mode === 'login' ? { email: form.email, password: form.password } : form),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setError(data.error || 'Something went wrong');
    router.push(data.role === 'ADMIN' || data.role === 'STAFF' ? '/admin' : '/account');
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <p className="micro text-gold text-center">Haute Attire by NK</p>
      <h1 className="font-display text-4xl font-light text-center mt-3">
        {mode === 'login' ? 'Welcome back' : 'Create your account'}
      </h1>
      <div className="space-y-4 mt-10">
        {mode === 'register' && (
          <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-label="Full name" />
        )}
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} aria-label="Email" />
        <input type="password" placeholder="Password (8+ characters)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} aria-label="Password" onKeyDown={(e) => e.key === 'Enter' && submit()} />
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button onClick={submit} disabled={busy} className="btn-ink w-full">
          {busy ? 'One moment…' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
      </div>
      <p className="text-sm text-stone text-center mt-6">
        {mode === 'login' ? (
          <>New here? <Link href="/register" className="text-gold">Create an account</Link></>
        ) : (
          <>Already with us? <Link href="/login" className="text-gold">Sign in</Link></>
        )}
      </p>
    </div>
  );
}
