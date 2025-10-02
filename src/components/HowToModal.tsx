'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type Props = {
  storageKey?: string;   // localStorage key
  daysToHide?: number;   // remember dismissal for N days
};

export default function HowToModal({
  storageKey = 'fanbetz_seen_howto_v1',
  daysToHide = 30,
}: Props) {
  const [open, setOpen] = useState(false);
  const params = useSearchParams();

  useEffect(() => {
    const force = params.get('howto') === '1' || params.get('tour') === '1';
    if (force) {
      setOpen(true);
      return;
    }

    try {
      const raw = localStorage.getItem(storageKey);
      const now = Date.now();
      if (!raw) {
        setOpen(true);
      } else {
        const exp = parseInt(raw, 10);
        if (Number.isNaN(exp) || exp < now) setOpen(true);
      }
    } catch {
      // if localStorage is blocked, just show it
      setOpen(true);
    }
  }, [params, storageKey]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const rememberAndClose = () => {
    try {
      const exp = Date.now() + daysToHide * 24 * 60 * 60 * 1000;
      localStorage.setItem(storageKey, String(exp));
    } catch {}
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={rememberAndClose} />
      {/* modal */}
      <div className="relative w-full max-w-lg rounded-2xl border border-yellow-400/60 bg-zinc-900 shadow-2xl">
        <button
          onClick={rememberAndClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-md border border-yellow-400/60 px-2 py-1 text-xs text-yellow-300 hover:bg-yellow-400 hover:text-black"
        >
          Close ✕
        </button>

        <div className="p-6 space-y-4">
          <h3 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent">
            How FanBetz Works
          </h3>

          <ol className="list-decimal space-y-2 pl-5 text-sm text-gray-200">
            <li>
              <span className="font-semibold text-yellow-300">Browse creators</span> and follow your favorites.
            </li>
            <li>
              <span className="font-semibold text-yellow-300">Unlock picks</span> (free or paid) to view full details.
            </li>
            <li>
              <span className="font-semibold text-yellow-300">Engage & track</span> with likes, comments, and results.
            </li>
          </ol>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-xl border border-yellow-400 bg-yellow-400 px-4 py-2 text-sm font-bold text-black hover:brightness-110"
              onClick={rememberAndClose}
            >
              See Full Guide
            </Link>
            <button
              onClick={rememberAndClose}
              className="rounded-xl border border-yellow-400 px-4 py-2 text-sm font-semibold text-yellow-300 hover:bg-yellow-400 hover:text-black"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
