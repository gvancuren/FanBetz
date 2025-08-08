'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StripeOnboardPage() {
  const router = useRouter();

  useEffect(() => {
    async function startOnboarding() {
      try {
        // Call your existing Stripe Connect API route
        const res = await fetch('/api/stripe/connect', { method: 'POST' });
        const data = await res.json();

        if (data.url) {
          // Redirect to Stripe onboarding
          window.location.href = data.url;
        } else {
          alert(data.error || 'Failed to start Stripe onboarding.');
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('Stripe onboarding error:', err);
        router.push('/dashboard');
      }
    }

    startOnboarding();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-2xl font-bold mb-4">Connecting to Stripe...</h1>
      <p className="text-gray-400">Please wait while we redirect you to Stripe onboarding.</p>
    </div>
  );
}
