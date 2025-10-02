// src/components/HowToModal.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

export default function HowToModal() {
  const [open, setOpen] = useState(false);

  const forceOpen = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('howto') === '1';
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const key = 'fanbetz-howto-shown';
    const already = window.localStorage.getItem(key);
    if (!already || forceOpen) {
      setOpen(true);
      if (!forceOpen) window.localStorage.setItem(key, '1');
    }
  }, [forceOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        aria-label="Close"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="relative w-full max-w-xl rounded-2xl border border-yellow-400/50 bg-zinc-900 shadow-2xl">
        <div className="rounded-t-2xl bg-gradient-to-r from-yellow-500/20 via-amber-400/10 to-yellow-500/20 p-4 border-b border-yellow-500/40">
          <h2 className="text-2xl font-extrabold text-yellow-300 drop-shadow-sm">
            How FanBetz Works
          </h2>
          <p className="text-xs text-yellow-200/80 tracking-wider uppercase">
            Buy &amp; sell professional gambling insight
          </p>
        </div>

        <div className="p-5 space-y-4 text-sm leading-6 text-gray-200">
          {/* TL;DR */}
          <p className="text-gray-300">
            FanBetz is a marketplace for <span className="font-semibold text-yellow-300">sports-betting insight</span>.
            Buyers unlock posts or subscribe to creators. Creators sell their analysis and picks — payouts are handled by Stripe.
          </p>

          {/* 5 Rules */}
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              <span className="font-semibold text-yellow-300">Sign up</span> to browse creators and unlock posts. To sell, enable your creator profile and{' '}
              <span className="font-semibold">complete Stripe Connect onboarding</span> (required for payouts &amp; tax/KYC).
            </li>
            <li>
              <span className="font-semibold text-yellow-300">Buy or Subscribe:</span> pay per post to unlock instantly, or subscribe (weekly/monthly) to unlock all of a creator’s posts while active.
            </li>
            <li>
              <span className="font-semibold text-yellow-300">Compliance:</span> FanBetz is <em>not</em> a sportsbook. Content is educational/informational —{' '}
              <span className="font-semibold">no guarantees of profit</span>. 18+ only (or local legal age). Follow your local laws and bet responsibly.
            </li>
            <li>
              <span className="font-semibold text-yellow-300">Creator Standards:</span> share only original insight, avoid “guaranteed lock” claims, disclose promos/affiliations, and keep records. Violations may lead to removal.
            </li>
            <li>
              <span className="font-semibold text-yellow-300">Payments & Refunds:</span> all payments run through Stripe. Digital insight is generally{' '}
              <span className="font-semibold">non-refundable</span>; fraud/chargebacks are handled per Stripe & platform policies.
            </li>
          </ol>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/signup"
              className="inline-flex items-center rounded-xl bg-yellow-400 px-4 py-2 text-black font-bold hover:bg-yellow-300 transition"
            >
              Get Started
            </Link>
            <Link
              href="/creators"
              className="inline-flex items-center rounded-xl border border-yellow-500/70 px-4 py-2 hover:bg-yellow-500/10 transition"
            >
              Browse Creators
            </Link>
            <Link
              href="/creator/onboarding"
              className="inline-flex items-center rounded-xl border border-yellow-500/70 px-4 py-2 hover:bg-yellow-500/10 transition"
            >
              Connect Stripe (Creators)
            </Link>
          </div>

          {/* Policy links */}
          <div className="pt-2 text-xs text-gray-400">
            <span className="mr-2">See:</span>
            <Link href="/terms" className="underline hover:text-gray-200 mr-2">Terms</Link>
            <Link href="/privacy" className="underline hover:text-gray-200 mr-2">Privacy</Link>
            <Link href="/compliance" className="underline hover:text-gray-200 mr-2">Creator Compliance</Link>
            <Link href="/responsible-gambling" className="underline hover:text-gray-200">Responsible Gambling</Link>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 rounded-b-2xl border-t border-yellow-500/40 bg-black/40 p-4">
          <p className="text-[11px] text-gray-400">
            Tip: Reopen anytime with <span className="font-mono text-gray-300">?howto=1</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setOpen(false)}
              className="rounded-xl border border-zinc-600 px-4 py-2 text-sm hover:bg-zinc-800 transition"
            >
              Close
            </button>
            <Link
              href="/signup"
              className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300 transition"
              onClick={() => setOpen(false)}
            >
              Start Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
