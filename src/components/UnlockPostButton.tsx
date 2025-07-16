'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface UnlockPostButtonProps {
  postId: string;
  creatorId: number;
  amount: number; // in cents
}

export default function UnlockPostButton({
  postId,
  creatorId,
  amount,
}: UnlockPostButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const priceInDollars = amount / 100;

  const unlockPost = async () => {
    setLoading(true);

    try {
      // ✅ Fetch current session
      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();

      if (!session?.user?.id) {
        alert('Please sign in to unlock posts.');
        setLoading(false);
        return;
      }

      const userId = session.user.id;

      if (amount === 0) {
        // 🔓 Free post
        const res = await fetch('/api/unlock-post', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ postId }),
        });

        if (res.ok) {
          router.refresh(); // ✅ Immediately update page
        } else {
          alert('Failed to unlock post.');
        }
      } else {
        // 💳 Paid post
        const res = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'post',
            postId,
            amount,
            creatorId,
            userId, // ✅ REQUIRED for webhook
          }),
        });

        const data = await res.json();

        if (data?.url) {
          window.location.href = data.url;
        } else {
          console.error('Stripe checkout failed:', data);
          alert('Checkout failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Unlock error:', err);
      alert('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={unlockPost}
      disabled={loading}
      className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-lg transition w-full"
    >
      {loading
        ? 'Processing...'
        : amount === 0
        ? 'Unlock Post'
        : `Unlock for $${priceInDollars.toFixed(2)}`}
    </button>
  );
}
