'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError('Invalid credentials');
    } else {
      router.push('/dashboard'); // TODO: Replace with actual user profile redirect
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-900 p-8 rounded-xl max-w-md w-full shadow-xl"
      >
        <h1 className="text-3xl font-bold mb-6 text-center text-yellow-400">Sign In</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 rounded text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 rounded text-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="bg-yellow-400 text-black font-semibold px-4 py-2 rounded w-full hover:bg-yellow-300 transition"
        >
          Sign In
        </button>

        {error && <p className="text-red-500 mt-4 text-sm text-center">{error}</p>}
      </form>
    </div>
  );
}
