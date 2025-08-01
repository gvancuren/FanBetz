'use client';

import Link from 'next/link';
import SearchBar from './SearchBar';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();

  const username = session?.user?.name;

  return (
    <header className="bg-black border-b border-yellow-400 px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-0 z-50 shadow-md">
      {/* Logo with home redirect */}
      <div className="flex items-center justify-between w-full sm:w-auto">
        <button
          onClick={() => router.push('/')}
          className="text-yellow-400 font-extrabold text-2xl tracking-wide hover:opacity-80 transition"
        >
          FanBetz
        </button>
      </div>

      {/* Search Bar */}
      <div className="w-full sm:max-w-sm sm:flex-1 flex justify-center px-4">
        <SearchBar />
      </div>

      {/* Navigation */}
      <nav className="flex flex-wrap gap-4 justify-center sm:justify-end text-lg font-bold items-center text-white">
        <Link href="/" className="hover:text-yellow-400 transition">Home</Link>
        <Link href="/dashboard" className="hover:text-yellow-400 transition">Dashboard</Link>

        {!session?.user ? (
          <>
            <Link href="/signin" className="hover:text-yellow-400 transition">Login</Link>
            <Link
              href="/signup"
              className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 font-bold transition"
            >
              Sign Up
            </Link>
          </>
        ) : (
          <>
            {username && (
              <Link
                href={`/creator/${encodeURIComponent(username)}`}
                className="hover:text-yellow-400 transition"
              >
                Profile
              </Link>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Sign Out
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
