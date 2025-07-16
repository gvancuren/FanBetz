'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UnlockPostButton({ postId }: { postId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const unlockPost = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/unlock-post', {
        method: 'POST',
        body: JSON.stringify({ postId }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        router.refresh(); // Refresh the page to show post unlocked
      } else {
        console.error('Unlock failed');
      }
    } catch (error) {
      console.error('Unlock error', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={unlockPost}
      disabled={loading}
      className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-lg"
    >
      {loading ? 'Unlocking...' : 'Unlock Post'}
    </button>
  );
}
