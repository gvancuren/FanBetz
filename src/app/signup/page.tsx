'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) {
      setMessage('❗ You must agree to the terms before continuing.');
      return;
    }

    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        name,
        password,
        isCreator: true, // ✅ Required for creator setup
      }),
    });

    const data = await res.json();
    if (res.ok && data?.user?.name) {
      window.location.href = `/creator/${data.user.name}`;
    } else {
      setMessage(data.message || 'Signup failed.');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-12 text-white">
      <h1 className="text-3xl font-bold mb-6">Create Your FanBetz Account</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 bg-zinc-800 p-6 rounded-xl shadow-lg w-full max-w-md"
      >
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full p-2 rounded bg-white text-black"
        />

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 rounded bg-white text-black"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-2 rounded bg-white text-black"
        />

        {/* ✅ Full Compliance + Legal Waiver */}
        <div className="bg-zinc-900 p-4 rounded-md border border-zinc-700 text-sm text-gray-300 space-y-2">
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-1"
              required
            />
            <span>
              By creating an account, I confirm that I am at least 18 years old and agree to the{' '}
              <Link href="/terms" className="underline text-yellow-400 hover:text-yellow-300">
                Terms of Service
              </Link>,{' '}
              <Link href="/privacy" className="underline text-yellow-400 hover:text-yellow-300">
                Privacy Policy
              </Link>, and{' '}
              <Link href="/compliance" className="underline text-yellow-400 hover:text-yellow-300">
                Creator Compliance Agreement
              </Link>.
              I understand FanBetz.com is a paid content platform for entertainment purposes only.
              No bets, earnings, or results are guaranteed. FanBetz is not liable for financial losses,
              and all purchases are final and non-refundable.
            </span>
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-yellow-400 text-black py-2 rounded font-bold hover:bg-yellow-300"
        >
          Create Account
        </button>

        {message && <p className="mt-4 text-red-400">{message}</p>}
      </form>
    </div>
  );
}
