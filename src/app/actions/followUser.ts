'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers'; // ✅ Required for App Router context

export async function followUser(creatorId: number) {
  const session = await getServerSession(authOptions, { cookies: cookies() }); // ✅ Corrected usage
  const userId = session?.user?.id;

  if (!userId) throw new Error('Not authenticated');
  if (Number(userId) === creatorId) throw new Error('Cannot follow yourself');

  const existingFollow = await prisma.follow.findFirst({
    where: {
      followerId: Number(userId),
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
        followerId: Number(userId),
        followingId: creatorId,
      },
    });
  }

  revalidatePath(`/creator/${String(creatorId)}`);
}
