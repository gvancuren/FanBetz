'use client';

import { useState } from 'react';

export default function DashboardClient({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe-onboarding', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        console.error('Stripe onboarding failed:', data);
        alert(`Stripe error: ${data.error || 'Unknown error'}`);
        return;
      }

      if (data.url) {
        console.log('🔁 Redirecting to Stripe onboarding:', data.url);
        window.location.href = data.url;
      } else {
        alert('No onboarding URL received.');
        console.error('Missing Stripe onboarding URL:', data);
      }
    } catch (err) {
      console.error('Stripe connect error:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 text-white space-y-12">
      <h1 className="text-3xl font-bold mb-6">📊 My Dashboard</h1>

      {/* Stripe Connect Banner */}
      {!user.stripeAccountId && (
        <div className="bg-yellow-500 text-black p-4 rounded-lg space-y-2 shadow-md">
          <p className="font-semibold">
            ⚠️ You haven’t connected your Stripe account yet. You won’t be able to earn payouts until you do.
          </p>
          <button
            onClick={handleConnect}
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            {loading ? 'Redirecting...' : 'Connect with Stripe'}
          </button>
        </div>
      )}

      {/* STATS */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatBox label="Total Posts" value={user.posts.length} />
        <StatBox
          label="Total Likes"
          value={user.posts.reduce((acc: number, post: any) => acc + post.likes.length, 0)}
        />
        <StatBox
          label="Total Unlocks"
          value={user.posts.reduce((acc: number, post: any) => acc + post.unlocks.length, 0)}
        />
        <StatBox
          label="Total Comments"
          value={user.posts.reduce((acc: number, post: any) => acc + post.comments.length, 0)}
        />
      </section>

      {/* RECENT POSTS */}
      <section className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">📝 Recent Posts</h2>
      </section>

      <div className="space-y-6">
        {user.posts.map((post: any) => (
          <div
            key={post.id}
            className="bg-zinc-800 p-5 rounded-xl border border-zinc-700 space-y-3"
          >
            <h2 className="text-xl font-bold">{post.title}</h2>
            <p className="text-sm text-gray-400">
              ❤️ {post.likes.length} • 🔓 {post.unlocks.length} • 💬 {post.comments.length}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-zinc-800 p-4 rounded-xl text-center border border-zinc-700">
      <h2 className="text-yellow-400 text-xl font-bold">{value}</h2>
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  );
}
