'use server';

import { auth } from './auth';
import { redirect } from 'next/navigation';
import { prisma } from './prisma';

export async function redirectToProfile() {
  const session = await auth();
  if (!session?.user?.email) {
    return redirect('/signin');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (user?.name) {
    return redirect(`/creator/${encodeURIComponent(user.name)}`);
  }

  return redirect('/dashboard');
}
