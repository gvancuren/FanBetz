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
    .slice(0, 4);

  const trendingPosts = await prisma.post.findMany({
    orderBy: [
      { likes: { _count: 'desc' } },
      { createdAt: 'desc' },
    ],
    take: 6,
    include: {
      user: true,
      likes: true,
      comments: { include: { user: true } },
      unlocks: true,
    },
  });

  const sports = ['NFL', 'NBA', 'MLB', 'NHL', 'UFC', 'Soccer', 'Golf', 'NCAA'];

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white px-6 py-12 space-y-24">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto">
        <h1 className="text-6xl font-extrabold tracking-tight text-yellow-400 drop-shadow-lg animate-fade-in">
          FanBetz.com
        </h1>
        <p className="text-2xl text-gray-300">Bet Smarter. Win Bigger.</p>
        <p className="text-lg text-gray-400">
          Buy expert picks from top-ranked sports bettors.
        </p>
        <Link href="/signup">
          <button className="mt-6 px-10 py-4 bg-yellow-400 text-black text-lg font-bold rounded-xl hover:bg-yellow-300 shadow-xl transition-transform transform hover:scale-105">
            Get Started
          </button>
        </Link>
      </section>

      {/* Sports Categories Scroll */}
      <section className="py-4">
        <div className="flex overflow-x-auto gap-4 px-2 sm:px-6 scrollbar-hide scroll-smooth snap-x snap-mandatory">
          {sports.map((sport) => (
            <Link
              key={sport}
              href={`/${sport.toLowerCase()}`}
              className="flex-shrink-0 bg-zinc-800 text-white border border-yellow-400 px-5 py-2 rounded-full hover:bg-yellow-400 hover:text-black transition shadow-md text-sm font-semibold snap-start"
            >
              {sport}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Creators */}
      <section className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Top Creators</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-14 justify-center items-start px-4">
          {topCreators.map((creator, i) => (
            <Link
              href={`/creator/${creator.name}`}
              key={creator.id}
              className="group bg-zinc-900 p-6 rounded-2xl border border-yellow-500 shadow-xl text-center hover:shadow-yellow-400/30 transition duration-300 transform hover:scale-105 w-full max-w-xs mx-auto"
            >
              <div className="relative w-40 h-40 mx-auto mb-5">
                <img
                  src={creator.profileImage || '/default-avatar.png'}
                  alt={creator.name}
                  className="w-full h-full object-cover border-4 border-yellow-400 shadow-md bg-zinc-800 rounded-lg"
                />
              </div>
              <h3 className="text-xl font-bold text-yellow-400">{creator.name}</h3>
              <p className="text-sm text-gray-400">{creator.followersList.length} followers</p>
              <span className="mt-2 inline-block text-xs text-black bg-yellow-400 px-3 py-1 rounded-full font-semibold shadow">
                #{i + 1} Ranked
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Posts */}
      <section className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Trending Picks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {trendingPosts.map((post) => {
            const isUnlocked = post.price === 0;
            return (
              <div
                key={post.id}
                className="bg-zinc-900 p-6 rounded-2xl border border-zinc-700 hover:shadow-xl transition space-y-4"
              >
                <h3 className="text-xl font-bold text-white line-clamp-2">{post.title}</h3>
                <p className="text-sm text-yellow-500">
                  by{' '}
                  <Link href={`/creator/${post.user.name}`} className="underline hover:text-yellow-300">
                    {post.user.name}
                  </Link>{' '}
                  — {post.price ? `$${(post.price / 100).toFixed(2)}` : 'Free'}
                </p>

                {isUnlocked ? (
                  <>
                    <p className="text-gray-300 whitespace-pre-wrap text-sm line-clamp-4">{post.content}</p>
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
                      <div className="h-24 bg-zinc-800 rounded-lg" />
                    </div>
                    <LikeButton
                      postId={post.id}
                      userId={post.user.id}
                      hasLiked={false}
                      likeCount={post.likes.length}
                    />
                    <Link
                      href={`/creator/${post.user.name}`}
                      className="mt-2 inline-block text-yellow-400 font-medium hover:underline"
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
