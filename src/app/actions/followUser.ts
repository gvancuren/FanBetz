'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function followUser(creatorId: number) {
  const session = await getServerSession(authOptions);

  // session.user.id is a string, but your DB expects an integer
  const user = session?.user as { id: string; name?: string; email?: string };

  if (!user?.id) throw new Error('Not authenticated');

  const userId = parseInt(user.id, 10);
  if (isNaN(userId)) throw new Error('Invalid user ID');

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
