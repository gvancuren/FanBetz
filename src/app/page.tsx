// app/page.tsx
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import LikeButton from '@/components/LikeButton';
import CommentList from '@/components/CommentList';
import CommentForm from '@/components/CommentForm';

export const dynamic = 'force-dynamic'; // live updates on each request

function formatStartLabel(d: Date | null, status?: string) {
  if (status === 'LIVE') return 'LIVE';
  if (!d) return '—';
  const mm = d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  return mm;
}

export default async function Home() {
  // ---- New: upcoming picks (chronological + auto-hide) ----
  const now = new Date();
  const graceMs = 2 * 60 * 1000; // 2-minute buffer so cards don't vanish at the exact second
  const cutoff = new Date(now.getTime() + graceMs);

  const upcomingPicks = await prisma.pick.findMany({
    where: {
      status: { in: ['PENDING', 'LIVE'] },
      completedAt: null,
      eventStartAt: { gte: cutoff },
    },
    orderBy: [
      // LIVE floats first, then earlier start times
      { status: 'desc' }, // assumes 'LIVE' > 'PENDING' lexicographically; flip if your enum differs
      { eventStartAt: 'asc' },
    ],
    take: 24,
    include: { user: true, likes: true, comments: true, unlocks: true },
  });

  // ---- Existing: featured creators -> top 10 by follower count ----
  const featuredCreators = await prisma.user.findMany({
    where: { isCreator: true },
    include: { followersList: true },
  });

  const topCreators = featuredCreators
    .sort((a, b) => b.followersList.length - a.followersList.length)
    .slice(0, 10);

  // ✅ Most recent (newest first, any status)
  const recentPicks = await prisma.pick.findMany({
    orderBy: [{ createdAt: 'desc' }],
    take: 20,
    include: {
      user: true,
      likes: true,
      comments: { include: { user: true } },
      unlocks: true,
    },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 space-y-10">
      {/* TOP CREATORS */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Top Creators</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-3">
          {topCreators.map((c) => (
            <Link
              key={c.id}
              href={`/creator/${c.username ?? c.id}`}
              className="rounded-2xl border p-4 hover:shadow-sm transition"
            >
              <div className="flex items-center gap-3">
                {/* fallback circle if no profileImage */}
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold">
                  {(c.username ?? 'C')[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-medium truncate">
                    {c.username ?? 'Creator'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {c.followersList.length} followers
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* UPCOMING PICKS */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Upcoming Picks</h2>
          <span className="text-xs text-gray-500">Auto-hides once the event starts</span>
        </div>

        {upcomingPicks.length === 0 ? (
          <div className="text-sm text-gray-500">No upcoming picks right now.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingPicks.map((p) => (
              <article
                key={p.id}
                className="rounded-2xl border p-4 hover:shadow-sm transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <Link
                    href={`/creator/${p.user?.username ?? p.userId}`}
                    className="font-medium hover:underline"
                  >
                    {p.user?.username ?? 'Creator'}
                  </Link>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      p.status === 'LIVE'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {formatStartLabel(p.eventStartAt, p.status)}
                  </span>
                </div>

                <div className="text-sm text-gray-800 mb-3">
                  {/* Safely render core pick info if present; adjust field names as needed */}
                  <div className="font-semibold">{p.title ?? 'Pick'}</div>
                  {p.market && <div className="text-gray-600">{p.market}</div>}
                  {p.selection && <div className="text-gray-600">{p.selection}</div>}
                  {typeof p.price === 'number' && (
                    <div className="mt-1 text-gray-700">
                      Price: ${(p.price / 100).toFixed(2)}
                    </div>
                  )}
                </div>

                {/* Actions / social */}
                <div className="flex items-center justify-between">
                  <LikeButton pickId={p.id} initialCount={p.likes?.length ?? 0} />
                  <Link
                    href={`/pick/${p.id}`}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* MOST RECENT FEED */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Most Recent</h2>

        {recentPicks.length === 0 ? (
          <div className="text-sm text-gray-500">Nothing here yet.</div>
        ) : (
          <div className="space-y-4">
            {recentPicks.map((p) => (
              <article
                key={p.id}
                className="rounded-2xl border p-4 hover:shadow-sm transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/creator/${p.user?.username ?? p.userId}`}
                      className="font-medium hover:underline"
                    >
                      {p.user?.username ?? 'Creator'}
                    </Link>
                    <span className="text-xs text-gray-500">
                      {new Date(p.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-xs rounded-full bg-gray-100 text-gray-700 px-2 py-0.5">
                    {p.status ?? 'POSTED'}
                  </span>
                </div>

                <div className="mt-2">
                  <Link
                    href={`/pick/${p.id}`}
                    className="text-base font-semibold hover:underline"
                  >
                    {p.title ?? 'Pick'}
                  </Link>
                  <div className="text-sm text-gray-700 mt-1">
                    {p.market && <span className="mr-2">{p.market}</span>}
                    {p.selection && <span className="mr-2">• {p.selection}</span>}
                    {typeof p.price === 'number' && (
                      <span className="mr-2">• ${(p.price / 100).toFixed(2)}</span>
                    )}
                    {p.eventStartAt && (
                      <span>• {formatStartLabel(p.eventStartAt)}</span>
                    )}
                  </div>
                </div>

                {/* Social row */}
                <div className="mt-3 flex items-center justify-between">
                  <LikeButton pickId={p.id} initialCount={p.likes?.length ?? 0} />
                  <Link
                    href={`/pick/${p.id}`}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    Open
                  </Link>
                </div>

                {/* Comments (collapsed by default in your UI; here we just render list/form placeholders) */}
                <div className="mt-4">
                  <CommentList comments={p.comments ?? []} />
                  <CommentForm pickId={p.id} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
