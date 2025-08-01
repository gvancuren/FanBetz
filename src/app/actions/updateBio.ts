'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function updateBio(bio: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error('Not authenticated');

  await prisma.user.update({
    where: { email: session.user.email },
    data: { bio },
  });
}
