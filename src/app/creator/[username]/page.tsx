// src/app/creator/[username]/page.tsx

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import CreatePostForm from '@/components/CreatePostForm';
import UnlockPostButton from '@/components/UnlockPostButton';
import RefreshOnUnlock from '@/components/RefreshOnUnlock';
import SubscribeButtons from '@/components/SubscribeButtons';
import CreatorSubscriptionForm from '@/components/CreatorSubscriptionForm';
import CommentForm from '@/components/CommentForm';
import CommentList from '@/components/CommentList';
import LikeButton from '@/components/LikeButton';
import FollowButton from '@/components/FollowButton';
import Link from 'next/link';
import StripeConnectButton from '@/components/StripeConnectButton';
import OwnerProfilePicture from '@/components/OwnerProfilePicture';
import { updateBio } from '@/app/actions/updateBio';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

async function isStripeFullyConnected(stripeAccountId: string): Promise<boolean> {
  if (!stripeAccountId || !process.env.STRIPE_SECRET_KEY) return false;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-06-30.basil',
  });

  try {
    const account = await stripe.accounts.retrieve(stripeAccountId);
    return account.charges_enabled && account.details_submitted;
  } catch (err) {
    console.error('Stripe check failed:', err);
    return false;
  }
}

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username).trim();

  const session = await getServerSession(authOptions);
  const viewerId = session?.user?.id ? Number(session.user.id) : null;

  const user = await prisma.user.findFirst({
    where: {
      name: { equals: decodedUsername, mode: 'insensitive' },
      isCreator: true,
    },
    include: {
      posts: {
        orderBy: { createdAt: 'desc' },
        include: {
          unlocks: true,
          likes: true,
          comments: { include: { user: true } },
        },
      },
      subscribers: {
        where: { subscriberId: viewerId ?? 0 },
      },
      followersList: {
        include: { follower: true },
      },
    },
  });

  if (!user) {
    return <div className="text-white p-6">❌ Creator not found</div>;
  }

  const isOwner = viewerId === user.id;
  const isFollowing = user.followersList.some((f) => f.followerId === viewerId);
  const now = new Date();
  const activeSubscription = user.subscribers.find((sub) => new Date(sub.expiresAt) > now);
  const isSubscribed = !!activeSubscription;
  const stripeReady = user.stripeAccountId
    ? await isStripeFullyConnected(user.stripeAccountId)
    : false;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 text-white space-y-10">
      <RefreshOnUnlock />

      {/* Profile Header */}
      <div className="bg-zinc-900 p-10 rounded-2xl shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start sm:gap-8">
          {isOwner ? (
            <OwnerProfilePicture
              userId={user.id}
              initialImage={user.profileImage || '/default-avatar.png'}
            />
          ) : (
            <img
              src={user.profileImage || '/default-avatar.png'}
              alt="Profile"
              width={120}
              height={120}
              className="rounded-full border-4 border-yellow-400 object-cover"
            />
          )}

          <div className="mt-4 sm:mt-0 text-center sm:text-left w-full">
            <h1 className="text-3xl font-bold">{user.name}</h1>

            {isOwner ? (
              <form action={updateBio} className="mt-2">
                <textarea
                  name="bio"
                  defaultValue={user.bio || ''}
                  rows={3}
                  placeholder="Enter your bio..."
                  className="w-full bg-zinc-800 text-white p-2 rounded border border-zinc-700"
                />
                <button
                  type="submit"
                  className="mt-2 bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 font-bold transition"
                >
                  Save Bio
                </button>
              </form>
            ) : (
              <p className="text-gray-400 mt-1 whitespace-pre-wrap">{user.bio || 'No bio set.'}</p>
            )}

            <p className="text-sm text-gray-400 mt-2">
              {user.followersList.length} followers •{' '}
              <Link
                href={`/creator/${user.name}/followers`}
                className="underline hover:text-yellow-400"
              >
                View Followers
              </Link>
            </p>
            {!isOwner && viewerId && (
              <div className="mt-3">
                <FollowButton creatorId={user.id} isFollowingInitial={isFollowing} />
              </div>
            )}
            {isSubscribed && (
              <p className="text-green-400 text-sm mt-2 font-medium">
                ✅ Subscribed – all posts unlocked
              </p>
            )}
          </div>
        </div>

        {isOwner && (
          <div className="mt-6 space-y-6">
            {!stripeReady ? (
              <div className="text-center">
                <StripeConnectButton />
                <p className="text-red-400 mt-2 text-sm">
                  Your Stripe account is not fully connected. Click above to finish setup.
                </p>
              </div>
            ) : (
              <CreatorSubscriptionForm
                currentWeeklyPrice={user.weeklyPrice ?? 0}
                currentMonthlyPrice={user.monthlyPrice ?? 0}
              />
            )}
          </div>
        )}

        {!isOwner && !isSubscribed && (
          <div className="flex justify-center mt-6">
            <SubscribeButtons
              creatorId={user.id}
              weeklyPrice={user.weeklyPrice ?? 500}
              monthlyPrice={user.monthlyPrice ?? 1500}
            />
          </div>
        )}
      </div>

      {isOwner && (
        <div className="bg-zinc-900 p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 border-b border-zinc-700 pb-2">
            💰 Create a Post
          </h2>
          <CreatePostForm />
        </div>
      )}

      <div className="bg-zinc-900 p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 border-b border-zinc-700 pb-2">Posts</h2>
        <div className="space-y-6">
          {user.posts?.length === 0 ? (
            <p className="text-gray-400 italic">No posts yet.</p>
          ) : (
            user.posts.map((post) => {
              const isUnlocked =
                isSubscribed || post.unlocks.some((unlock) => unlock.userId === viewerId);
              return (
                <div
                  key={post.id}
                  className="bg-zinc-800 rounded-2xl p-5 border border-zinc-700 hover:shadow-xl transition space-y-4"
                >
                  <h3 className="text-xl font-bold">{post.title}</h3>
                  <p className="text-yellow-400 font-medium">
                    {post.price && post.price > 0
                      ? `$${(post.price / 100).toFixed(2)} to unlock`
                      : 'Free'}
                  </p>

                  {isUnlocked ? (
                    <>
                      <p className="text-gray-300 whitespace-pre-wrap">{post.content}</p>
                      {post.imageUrl && (
                        <img
                          src={post.imageUrl}
                          alt="Post Image"
                          className="w-full rounded-lg object-cover max-h-[400px]"
                        />
                      )}
                      <div className="mt-2">
                        <LikeButton
                          postId={post.id}
                          userId={viewerId!}
                          hasLiked={post.likes.some((l) => l.userId === viewerId)}
                          likeCount={post.likes.length}
                        />
                      </div>
                      <CommentList comments={post.comments} />
                      <CommentForm postId={post.id} />
                    </>
                  ) : (
                    <div className="relative rounded-lg overflow-hidden">
                      <div className="bg-black bg-opacity-70 p-4 rounded-lg">
                        <p className="text-gray-400 italic mb-3">🔒 This post is locked. Unlock to see the content.</p>
                        <UnlockPostButton
                          postId={post.id.toString()}
                          creatorId={user.id.toString()}
                          amount={post.price ?? 0}
                        />
                      </div>
                    </div>
                  )}
                  <p className="text-sm text-gray-500">
                    Posted: {new Date(post.createdAt).toLocaleString()}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
