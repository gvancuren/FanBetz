import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {

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
      take: 10,
      include: {
        user: true,
      },
    }),
  ]);

  return (
    <div className="min-h-screen px-6 py-16 text-white">
      <h1 className="text-4xl font-bold text-yellow-400 mb-4">Search Results</h1>
      <p className="text-gray-300 text-lg mb-10">Showing results for: <strong>{query}</strong></p>

      <div className="space-y-12">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Creators</h2>
          {creators.length === 0 ? (
            <p className="text-gray-400 italic">No creators found.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {creators.map((creator) => (
                <Link
                  key={creator.id}
                  href={`/creator/${creator.name}`}
                  className="block bg-zinc-900 p-4 rounded-xl hover:shadow-xl border border-zinc-700"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={creator.profileImage || '/default-avatar.png'}
                      alt={creator.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-yellow-400"
                    />
                    <div>
                      <p className="text-xl font-bold">{creator.name}</p>
                      <p className="text-sm text-gray-400">{creator.followers.length} followers</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Posts</h2>
          {posts.length === 0 ? (
            <p className="text-gray-400 italic">No posts found.</p>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/creator/${post.user.name}`}
                  className="block bg-zinc-900 p-5 rounded-xl hover:shadow-xl border border-zinc-700"
                >
                  <h3 className="text-xl font-semibold">{post.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">By {post.user.name}</p>
                  <p className="text-gray-300 mt-2 line-clamp-3">{post.content}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
