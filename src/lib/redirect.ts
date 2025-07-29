'use server';

import auth from './auth'; // ✅ Correct default import
import { redirect } from 'next/navigation';
import { prisma } from './prisma';

export async function redirectToProfile() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/signin');
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (user?.name) {
    redirect(`/creator/${encodeURIComponent(user.name)}`);
    return;
  }

  redirect('/dashboard');
}
