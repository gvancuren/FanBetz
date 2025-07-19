'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function followUser(creatorId: number) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id: number; name?: string; email?: string };

  const userId = user?.id;

  if (!userId) throw new Error('Not authenticated');
  if (userId === creatorId) throw new Error('Cannot follow yourself');

  const existingFollow = await prisma.follow.findFirst({
    where: {
      followerId: userId,
      followingId: creatorId,
    },
  });

  if (existingFollow) {
    await prisma.follow.delete({
      where: { id: existingFollow.id },
    });
  } else {
    await prisma.follow.create({
      data: {
        followerId: userId,
        followingId: creatorId,
      },
    });
  }

  revalidatePath(`/creator/${String(creatorId)}`);
}
