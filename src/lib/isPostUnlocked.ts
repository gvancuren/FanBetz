
import { prisma } from "@/lib/prisma";

export async function isPostUnlocked(userId: number, postId: number) {
  const unlocked = await prisma.postUnlock.findFirst({
    where: {
      userId,
      postId,
    },
  });

  if (unlocked) return true;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { user: true },
  });

  if (!post) return false;

  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      subscriberId: userId,
      creatorId: post.userId,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  return !!activeSubscription;
}
