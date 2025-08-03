import { prisma } from "@/lib/prisma";

export async function isPostUnlocked(userId: number, postId: number) {
  console.log(`🔍 Checking unlock for user ${userId} and post ${postId}`);

  const unlocked = await prisma.postUnlock.findFirst({
    where: {
      userId,
      postId,
    },
  });

  if (unlocked) {
    console.log(`✅ Post is directly unlocked`);
    return true;
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { user: true },
  });

  if (!post) {
    console.log(`❌ Post not found`);
    return false;
  }

  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      subscriberId: userId,
      creatorId: post.userId,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (activeSubscription) {
    console.log(`✅ Post unlocked via subscription`);
  } else {
    console.log(`🔒 Post is still locked`);
  }

  return !!activeSubscription;
}
