'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function followUser(creatorId: number) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) throw new Error('Not authenticated');
  if (userId === creatorId) throw new Error('Cannot follow yourself');

  const existingFollow = await prisma.follow.findFirst({
    where: {
      followerId: Number(userId),
      followingId: creatorId,
    },
  });

  if (existingFollow) {
    // Unfollow
    await prisma.follow.delete({
      where: {
        id: existingFollow.id,
      },
    });
  } else {
    // Follow
    await prisma.follow.create({
      data: {
        followerId: Number(userId),
        followingId: creatorId,
      },
    });
  }

  revalidatePath(`/creator/${creatorId}`);
}
