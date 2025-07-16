import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function MySubscriptionsPage() {
  const session = await getServerSession(authOptions);
  const viewerId = session?.user?.id ? Number(session.user.id) : null;

  if (!viewerId) {
    return (
      <div className="text-white p-6">
        ❌ You must be signed in to view your subscriptions.
      </div>
    );
  }

  const subscriptions = await prisma.subscription.findMany({
    where: {
      subscriberId: viewerId,
      expiresAt: { gte: new Date() },
    },
    include: {
      creator: true,
    },
    orderBy: {
      expiresAt: 'asc',
    },
  });

  return (
    <div className="max-w-4xl mx-auto p-6 text-white space-y-8">
      <h1 className="text-3xl font-bold mb-4">📜 My Subscriptions</h1>

      {subscriptions.length === 0 ? (
        <p className="text-gray-400 italic">You don’t have any active subscriptions.</p>
      ) : (
        <ul className="space-y-6">
          {subscriptions.map((sub) => (
            <li
              key={sub.id}
              className="bg-zinc-900 p-6 rounded-xl border border-zinc-700 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <img
                  src={sub.creator.profileImage || '/default-avatar.png'}
                  alt={sub.creator.name}
                  className="w-14 h-14 rounded-full border border-zinc-600 object-cover"
                />
                <div>
                  <Link
                    href={`/creator/${sub.creator.name}`}
                    className="text-lg font-semibold hover:text-yellow-400"
                  >
                    {sub.creator.name}
                  </Link>
                  <p className="text-sm text-gray-400">
                    Plan: {sub.plan} • Expires{' '}
                    {new Date(sub.expiresAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Link
                href={`/creator/${sub.creator.name}`}
                className="text-sm px-4 py-2 bg-yellow-400 text-black rounded-full hover:bg-yellow-300 transition"
              >
                View
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
