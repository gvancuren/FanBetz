import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Image from 'next/image';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SoccerPage() {
  const session = await getServerSession(authOptions);
  const rawUserId = session?.user?.id;
  const currentUserId = rawUserId ? parseInt(rawUserId.toString()) : undefined;

  const soccerPosts = await prisma.post.findMany({
    where: {
      category: 'Soccer', // ✅ Correct casing for Prisma enum
    },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        include: {
          subscriptions: currentUserId
            ? {
                where: {
                  subscriberId: currentUserId,
                  expiresAt: { gte: new Date() },
                },
              }
            : undefined,
        },
      },
      unlocks: currentUserId
        ? {
            where: { userId: currentUserId },
          }
        : undefined,
    },
  });

  return (
    <div className="min-h-screen py-16 px-6 text-white">
      <h1 className="text-4xl font-bold text-yellow-400 mb-4">Soccer Picks</h1>
      <p className="text-gray-300 text-lg mb-8">
        View all the latest Soccer picks, insights, and strategies shared by FanBetz creators.
      </p>

      {soccerPosts.length === 0 ? (
        <p className="text-gray-500">No Soccer picks yet. Check back soon!</p>
      ) : (
        <div className="grid gap-6">
          {soccerPosts.map((post) => {
            const isUnlocked =
              (post.unlocks?.length ?? 0) > 0 ||
              (post.user?.subscriptions?.length ?? 0) > 0;

            return (
              <div key={post.id} className="bg-zinc-800 p-6 rounded-xl shadow">
                <Link href={`/creator/${post.user.name}`}>
                  <h2 className="text-2xl font-semibold text-yellow-300 hover:underline">
                    {post.title}
                  </h2>
                </Link>
                <p className="text-gray-400 mb-2 text-sm">by {post.user.name}</p>

                {isUnlocked ? (
                  <>
                    <p className="text-gray-200">{post.content}</p>
                    {post.imageUrl && (
                      <div className="mt-4">
                        <Image
                          src={post.imageUrl}
                          alt="Post image"
                          width={600}
                          height={400}
                          className="rounded-xl"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <p className="italic text-gray-500">🔒 Locked — unlock to view this pick</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
