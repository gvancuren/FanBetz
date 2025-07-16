'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await signIn('credentials', {
      redirect: true,
      callbackUrl: '/dashboard', // ✅ triggers NextAuth redirect logic
      email,
      password,
    });

    if (!res?.ok) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="w-full max-w-md bg-zinc-900 p-8 rounded-2xl shadow-2xl border border-yellow-500">
        <h1 className="text-3xl font-bold text-center text-yellow-400 mb-6">Sign In to FanBetz</h1>

        <form onSubmit={handleSignIn} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg text-black"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg text-black"
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 rounded-lg transition"
          >
            Sign In
          </button>
        </form>

        <div className="text-sm text-center text-gray-400 mt-4">
          Don’t have an account?{' '}
          <a href="/signup" className="text-yellow-400 hover:underline">
            Sign up here
          </a>
        </div>
      </div>
    </div>
  );
}
