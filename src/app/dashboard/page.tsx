import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DashboardClient from '@/components/DashboardClient';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ? Number(session.user.id) : null;
  const username = session?.user?.name;

  if (!userId || !username) {
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

  return (
    <div className="text-white px-6 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">📊 My Dashboard</h1>
        <Link
          href={`/creator/${encodeURIComponent(username)}#create-post`}
          className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 font-bold transition"
        >
          + New Post
        </Link>
      </div>
      <DashboardClient user={user} />
    </div>
  );
}
