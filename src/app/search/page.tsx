import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface SearchPageProps {
  searchParams: { q?: string | string[] };
}

export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const raw = searchParams.q;
  const query = typeof raw === 'string' ? raw.trim() : '';

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
        _count: {
          select: {
            followersList: true,
          },
        },
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
      select: {
        id: true,
        title: true,
        content: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 text-white space-y-12">
      <h1 className="text-3xl font-bold border-b border-zinc-700 pb-2">
        Search Results for <span className="text-yellow-400">&ldquo;{query}&rdquo;</span>
      </h1>

      {/* Creators */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">👤 Creators</h2>
        {creators.length === 0 ? (
          <p className="text-gray-400 italic">No creators found.</p>
        ) : (
          <ul className="grid sm:grid-cols-2 gap-4">
            {creators.map((creator) => (
              <li
                key={creator.id}
                className="bg-zinc-800 p-4 rounded-xl border border-zinc-700 flex items-center gap-4"
              >
                <img
                  src={creator.profileImage || '/default-avatar.png'}
                  alt={`${creator.name} avatar`}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <Link
                    href={`/creator/${creator.name}`}
                    className="text-yellow-400 text-lg font-semibold hover:underline"
                  >
                    {creator.name}
                  </Link>
                  <p className="text-sm text-gray-400">
                    Followers: {creator._count.followersList}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Posts */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">📄 Posts</h2>
        {posts.length === 0 ? (
          <p className="text-gray-400 italic">No posts found.</p>
        ) : (
          <ul className="space-y-4">
            {posts.map((post) => (
              <li
                key={post.id}
                className="bg-zinc-800 p-4 rounded-xl border border-zinc-700"
              >
                <Link
                  href={`/creator/${post.user.name}#post-${post.id}`}
                  className="text-yellow-300 font-medium hover:underline"
                >
                  {post.title}
                </Link>
                <p className="text-sm text-gray-400 mt-1">
                  Creator: <span className="text-white">{post.user.name}</span>
                </p>
                <p className="text-gray-300 text-sm mt-2">
                  {post.content.length > 120
                    ? `${post.content.slice(0, 120)}...`
                    : post.content}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
