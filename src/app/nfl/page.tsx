// src/app/nfl/page.tsx
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function NFLPage() {
  const nflPosts = await prisma.post.findMany({
    where: {
      category: 'NFL', // ✅ Fixed: no `equals`, no `mode`
    },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="min-h-screen py-16 px-6 text-white">
      <h1 className="text-4xl font-bold text-yellow-400 mb-4">NFL Picks</h1>
      <p className="text-gray-300 text-lg mb-8">
        View all the latest NFL picks, insights, and strategies shared by FanBetz creators.
      </p>

      {nflPosts.length === 0 ? (
        <p className="text-gray-500">No NFL picks yet. Check back soon!</p>
      ) : (
        <div className="grid gap-6">
          {nflPosts.map((post) => (
            <div key={post.id} className="bg-zinc-800 p-6 rounded-xl shadow">
              <Link href={`/creator/${post.user.name}`}>
                <h2 className="text-2xl font-semibold text-yellow-300 hover:underline">
                  {post.title}
                </h2>
              </Link>
              <p className="text-gray-400 mb-2 text-sm">
                by {post.user.name}
              </p>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
