// src/app/search/page.tsx
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  searchParams: { q?: string };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = typeof searchParams.q === 'string' ? searchParams.q.trim() : '';

  if (!query || query.length === 0) {
    return notFound();
  }

  const [creators, posts] = await Promise.all([
    prisma.user.findMany({
      where: {
        isCreator: true,
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      take: 10,
      select: {
        id: true,
        name: true,
        profileImage: true,
        followers: true,
      },
    }),
    prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
  ]);

  return (
    <div className="min-h-screen py-16 px-6 text-white">
      <h1 className="text-4xl font-bold text-yellow-400 mb-4">Search Results</h1>

      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold text-white mb-2">Creators</h2>
          {creators.length === 0 ? (
            <p className="text-gray-400">No creators found.</p>
          ) : (
            <ul className="space-y-2">
              {creators.map((creator) => (
                <li key={creator.id}>
                  <Link
                    href={`/creator/${creator.name}`}
                    className="flex items-center gap-3 text-yellow-300 hover:underline"
                  >
                    <img
                      src={creator.profileImage || '/default-profile.png'}
                      alt={creator.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span>{creator.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-2">Posts</h2>
          {posts.length === 0 ? (
            <p className="text-gray-400">No posts found.</p>
          ) : (
            <ul className="space-y-4">
              {posts.map((post) => (
                <li key={post.id}>
                  <Link href={`/creator/${post.user.name}`}>
                    <div className="bg-zinc-800 p-4 rounded-xl hover:bg-zinc-700 transition">
                      <h3 className="text-xl text-yellow-400 font-semibold">{post.title}</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        by {post.user.name} — {new Date(post.createdAt).toLocaleString()}
                      </p>
                      <p className="text-gray-300 mt-2 line-clamp-3">{post.content}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
