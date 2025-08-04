'use client';

import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSent(false);

    const res = await fetch('/api/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      setSent(true);
    } else {
      const data = await res.json();
      setError(data.error || 'Something went wrong.');
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-black text-white">
      <form onSubmit={handleSubmit} className="bg-zinc-900 p-6 rounded-xl space-y-4 w-full max-w-sm border border-yellow-400">
        <h1 className="text-2xl font-bold text-yellow-400">Forgot Password</h1>

        <input
          type="email"
          placeholder="Enter your email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded text-black"
        />

        <button type="submit" className="w-full bg-yellow-400 text-black py-2 rounded font-bold">
          Send Reset Link
        </button>

        {sent && <p className="text-green-400 text-sm">✅ Reset link sent if account exists.</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </form>
    </div>
  );
}
