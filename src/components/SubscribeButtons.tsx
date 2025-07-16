'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Props {
  creatorId: number;
  weeklyPrice: number;
  monthlyPrice: number;
}

export default function SubscribeButtons({ creatorId, weeklyPrice, monthlyPrice }: Props) {
  const [loadingPlan, setLoadingPlan] = useState<'weekly' | 'monthly' | null>(null);
  const router = useRouter();

  const handleSubscribe = async (plan: 'weekly' | 'monthly') => {
    setLoadingPlan(plan);

    try {
      const res = await fetch('/api/user-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId, plan }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        alert(data.error || 'Subscription failed.');
        setLoadingPlan(null);
        return;
      }

      // ✅ Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please try again.');
      setLoadingPlan(null);
    }
  };

  return (
    <div className="flex gap-4">
      <button
        onClick={() => handleSubscribe('weekly')}
        disabled={loadingPlan === 'weekly'}
        className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-full font-semibold text-black disabled:opacity-50"
      >
        {loadingPlan === 'weekly' ? 'Redirecting...' : `Subscribe Weekly - $${(weeklyPrice / 100).toFixed(2)}`}
      </button>
      <button
        onClick={() => handleSubscribe('monthly')}
        disabled={loadingPlan === 'monthly'}
        className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-full font-semibold text-black disabled:opacity-50"
      >
        {loadingPlan === 'monthly' ? 'Redirecting...' : `Subscribe Monthly - $${(monthlyPrice / 100).toFixed(2)}`}
      </button>
    </div>
  );
}
