// src/app/creator/[username]/followers/page.tsx

import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function FollowersPage({ params }: { params: { username: string } }) {
  const decodedUsername = decodeURIComponent(params.username).trim();

  const user = await prisma.user.findFirst({
    where: {
      name: { equals: decodedUsername, mode: 'insensitive' },
    },
    include: {
      followersList: {
        include: {
          follower: true,
        },
      },
    },
  });

  if (!user) return notFound();

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 text-white">
      <h1 className="text-3xl font-bold mb-6">Followers of {user.name}</h1>

      {user.followersList.length === 0 ? (
        <p className="text-gray-400">No followers yet.</p>
      ) : (
        <ul className="space-y-4">
          {user.followersList.map(({ follower }) => (
            <li key={follower.id} className="flex items-center space-x-4 border-b border-zinc-700 pb-4">
              <img
                src={follower.profileImage || '/default-avatar.png'}
                alt={follower.username}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold">{follower.username || follower.name}</p>
                <a
                  href={`/creator/${follower.name}`}
                  className="text-yellow-400 text-sm underline"
                >
                  View Profile
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
