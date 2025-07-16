'use client';

import { useRouter } from 'next/navigation';

export default function SubscribeCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <div className="bg-zinc-900 p-8 rounded-2xl shadow-lg text-center space-y-4">
        <h1 className="text-3xl font-bold text-red-400">❌ Subscription Canceled</h1>
        <p>No worries. You can subscribe anytime later if you change your mind.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 bg-yellow-400 text-black font-bold py-2 px-4 rounded hover:bg-yellow-300 transition"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
