'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function likePost(postId: number, userId: number) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    console.error('❌ No session, cannot like post');
    return;
  }

  if (Number(session.user.id) !== userId) {
    console.error(`❌ Session user (${session.user.id}) doesn't match userId param (${userId})`);
    return;
  }

  try {
    await prisma.postLike.create({
      data: {
        postId,
        userId,
      },
    });
    console.log(`✅ Post ${postId} liked by user ${userId}`);
  } catch (err: any) {
    if (err.code === 'P2002') {
      console.warn('⚠️ Post already liked by this user (duplicate like)');
    } else {
      console.error('❌ Error creating post like:', err);
    }
  }
}
