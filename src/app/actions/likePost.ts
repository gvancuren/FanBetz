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
    return; // prevent redirect or error
  }

  const existingLike = await prisma.like.findFirst({
    where: {
      userId: typedUser.id,
      postId,
    },
  });

  if (existingLike) {
    await prisma.like.delete({
      where: { id: existingLike.id },
    });
  } else {
    await prisma.like.create({
      data: {
        userId: typedUser.id,
        postId,
      },
    });
  }

  revalidatePath('/');
}
