'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function updateBio(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error('Unauthorized');

  const bio = formData.get('bio') as string;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { bio },
  });
}
