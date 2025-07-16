// ❌ REMOVE 'use client'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DashboardClient from '@/components/DashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ? Number(session.user.id) : null;

  if (!userId) {
    return <div className="text-white p-6">❌ You must be signed in to view this page.</div>;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      posts: {
        orderBy: { createdAt: 'desc' },
        include: {
          comments: true,
          likes: true,
          unlocks: true,
        },
      },
      subscribers: {
        include: {
          subscriber: true,
        },
        where: {
          expiresAt: { gte: new Date() },
        },
        orderBy: {
          expiresAt: 'asc',
        },
      },
    },
  });

  if (!user || !user.isCreator) {
    return <div className="text-white p-6">❌ Only creators can access the dashboard.</div>;
  }

  return <DashboardClient user={user} />;
}
