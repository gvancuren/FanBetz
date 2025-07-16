'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

export async function likePost(postId: number, userId: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.id !== userId) {
    console.error('Unauthorized like attempt');
    return; // prevent redirect
  }

  try {
    const existing = await prisma.postLike.findFirst({
      where: {
        postId,
        userId,
      },
    });

    if (!existing) {
      await prisma.postLike.create({
        data: { postId, userId },
      });

      // Optional: revalidate cache if you're showing post like count on static pages
      revalidatePath(`/creator`);
    }
  } catch (err) {
    console.error('Failed to like post:', err);
  }

  return; // ✅ prevent default redirect behavior
}
