import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import LikeButton from '@/components/LikeButton';
import CommentList from '@/components/CommentList';
import CommentForm from '@/components/CommentForm';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const featuredCreators = await prisma.user.findMany({
    where: { isCreator: true },
    include: { followersList: true },
  });

  const topCreators = featuredCreators
    .sort((a, b) => b.followersList.length - a.followersList.length)
    .slice(0, 10);

  const trendingPosts = await prisma.post.findMany({
    orderBy: [
      { likes: { _count: 'desc' } },
      { createdAt: 'desc' },
    ],
    take: 10,
    include: {
      user: true,
      likes: true,
      comments: { include: { user: true } },
      unlocks: true,
    },
  });

  const sports = ['NFL', 'NBA', 'MLB', 'NHL', 'UFC', 'Soccer', 'Golf', 'NCAA'];

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white px-4 py-8 space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto">
        <h1 className="text-5xl font-extrabold tracking-tight text-yellow-400 drop-shadow-lg animate-fade-in">
          FanBetz.com
        </h1>
        <p className="text-xl text-gray-300">Bet Smarter. Win Bigger.</p>
        <p className="text-md text-gray-400">
          Buy expert picks from top-ranked sports bettors.
        </p>
        <Link href="/signup">
          <button className="mt-4 px-8 py-3 bg-yellow-400 text-black text-md font-bold rounded-xl hover:bg-yellow-300 shadow-xl transition-transform transform hover:scale-105">
            Get Started
          </button>
        </Link>
      </section>

      {/* Sports Categories Scrollable */}
      <section className="w-full overflow-x-auto py-4 scrollbar-hide">
        <div className="flex gap-4 px-6 sm:px-0 max-w-screen-lg mx-auto justify-start sm:justify-center">
          {sports.map((sport) => (
            <Link
              key={sport}
              href={`/${sport.toLowerCase()}`}
              className="flex-shrink-0 bg-zinc-800 text-white border border-yellow-400 px-5 py-2 rounded-full hover:bg-yellow-400 hover:text-black transition shadow-md text-sm font-semibold"
            >
              {sport}
            </Link>
          ))}
        </div>
      </section>

      {/* Top Creators */}
      <section className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Top Creators</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 px-2">
          {topCreators.map((creator, i) => (
            <Link
              href={`/creator/${creator.name}`}
              key={creator.id}
              className="bg-zinc-900 p-3 rounded-xl border border-yellow-500 text-center hover:shadow-yellow-400/30 transition duration-300 transform hover:scale-105"
            >
              <div className="relative w-20 h-20 mx-auto mb-2">
                <img
                  src={creator.profileImage || '/default-avatar.png'}
                  alt={creator.name}
                  className="w-full h-full object-cover border-2 border-yellow-400 bg-zinc-800 rounded-full"
                />
              </div>
              <h3 className="text-md font-bold text-yellow-400 truncate">{creator.name}</h3>
              <p className="text-xs text-gray-400">{creator.followersList.length} followers</p>
              <span className="mt-1 inline-block text-[10px] text-black bg-yellow-400 px-2 py-0.5 rounded-full font-semibold shadow">
                #{i + 1}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Picks */}
      <section className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Trending Picks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {trendingPosts.map((post, i) => {
            const isUnlocked = post.price === 0;
            return (
              <div
                key={post.id}
                className="bg-zinc-900 p-4 rounded-xl border border-zinc-700 hover:shadow-xl transition space-y-3"
              >
                <h3 className="text-lg font-bold text-white line-clamp-2">#{i + 1} — {post.title}</h3>
                <p className="text-xs text-yellow-500">
                  by{' '}
                  <Link href={`/creator/${post.user.name}`} className="underline hover:text-yellow-300">
                    {post.user.name}
                  </Link>{' '}
                  — {post.price ? `$${(post.price / 100).toFixed(2)}` : 'Free'}
                </p>

                {isUnlocked ? (
                  <>
                    <p className="text-gray-300 text-xs whitespace-pre-wrap line-clamp-3">{post.content}</p>
                    <LikeButton
                      postId={post.id}
                      userId={post.user.id}
                      hasLiked={false}
                      likeCount={post.likes.length}
                    />
                    <CommentList comments={post.comments} />
                    <CommentForm postId={post.id} />
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center rounded-lg">
                        <p className="text-gray-400 italic text-sm">Locked — Unlock to view</p>
                      </div>
                      <div className="h-20 bg-zinc-800 rounded-lg" />
                    </div>
                    <LikeButton
                      postId={post.id}
                      userId={post.user.id}
                      hasLiked={false}
                      likeCount={post.likes.length}
                    />
                    <Link
                      href={`/creator/${post.user.name}`}
                      className="mt-1 inline-block text-yellow-400 font-medium hover:underline text-sm"
                    >
                      Go to Profile to Unlock
                    </Link>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
