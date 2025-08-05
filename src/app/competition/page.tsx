// ✅ File: /src/app/competition/page.tsx

import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function CompetitionPage() {
  const topFollowers = await prisma.user.findMany({
    where: { isCreator: true },
    orderBy: { followersList: { _count: 'desc' } },
    take: 10,
    include: { followersList: true },
  });

  const topVolume = await prisma.user.findMany({
    where: { isCreator: true },
    orderBy: { payoutTotal: 'desc' }, // ✅ Use valid field from Prisma schema
    take: 10,
    select: {
      id: true,
      name: true,
      payoutTotal: true, // ✅ Must be selected to display
    },
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-white">
      <h1 className="text-4xl font-bold mb-4 text-yellow-400">🏆 FanBetz Creator Competition</h1>
      <p className="text-lg mb-6">
        We're giving away <strong>$1,000</strong> to the top FanBetz creators! Two winners will each receive <strong>$500</strong>:
      </p>
      <ul className="list-disc ml-6 mb-6 text-lg">
        <li><strong>Most Followers</strong> by March 31, 2026</li>
        <li><strong>Most Money Moved</strong> (gross revenue)</li>
      </ul>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-3 text-yellow-300">👥 Top 10 by Followers</h2>
          <ol className="space-y-1">
            {topFollowers.map((user, index) => (
              <li key={user.id}>
                {index + 1}. <Link href={`/creator/${user.name}`} className="underline">{user.name}</Link> — {user.followersList.length} followers
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-3 text-yellow-300">💰 Top 10 by Money Moved</h2>
          <ol className="space-y-1">
            {topVolume.map((user, index) => (
              <li key={user.id}>
                {index + 1}. <Link href={`/creator/${user.name}`} className="underline">{user.name}</Link> — ${user.payoutTotal?.toFixed(2) ?? '0.00'}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <p className="mt-10 text-center text-lg">
        Want to compete? <Link href="/dashboard" className="text-yellow-400 underline">Start your profile today</Link>
      </p>

      <p className="mt-6 text-sm text-gray-400 text-center">Competition ends March 31, 2026. Winners announced April 1st.</p>
    </div>
  );
}
