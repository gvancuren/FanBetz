'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

interface CustomUser {
  id: number;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export async function likePost(postId: number, userId: number) {
  const session = await getServerSession(authOptions);
  const typedUser = session?.user as CustomUser | undefined;

  if (!typedUser?.id || typedUser.id !== userId) {
    console.error('Unauthorized like attempt');
    return;
  }

  const existingLike = await prisma.postLike.findFirst({
    where: {
      userId: typedUser.id,
      postId,
    },
  });

  if (existingLike) {
    await prisma.postLike.delete({
      where: { id: existingLike.id },
    });
  } else {
    await prisma.postLike.create({
      data: {
        userId: typedUser.id,
        postId,
      },
    });
  }

  revalidatePath(`/creator/${typedUser.id}`);
}
