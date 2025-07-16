'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SubscribeSuccessPage() {
  const router = useRouter();
  const params = useSearchParams();
  const creatorId = params.get('creatorId');
  const [error, setError] = useState('');

  useEffect(() => {
    const redirectToCreatorProfile = async () => {
      if (!creatorId) return;

      try {
        const res = await fetch(`/api/get-username-from-id?id=${creatorId}`);
        const data = await res.json();

        if (data?.username) {
          setTimeout(() => {
            router.push(`/creator/${data.username}`);
          }, 3000);
        } else {
          setError('Creator profile not found.');
        }
      } catch (err) {
        console.error('Redirect error:', err);
        setError('Something went wrong.');
      }
    };

    redirectToCreatorProfile();
  }, [creatorId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <div className="bg-zinc-900 p-8 rounded-2xl shadow-lg text-center space-y-4">
        <h1 className="text-3xl font-bold text-yellow-400">🎉 Subscription Successful!</h1>
        <p>You’ll be redirected to your subscription shortly.</p>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
}
