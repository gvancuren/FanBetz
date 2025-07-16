import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';

export default async function FollowersPage({ params }: { params: { username: string } }) {
  const { username } = params;
  const decodedUsername = decodeURIComponent(username);

  const session = await getServerSession(authOptions);
  const viewerId = session?.user?.id ? Number(session.user.id) : null;

  const user = await prisma.user.findFirst({
    where: {
      name: {
        equals: decodedUsername,
        mode: 'insensitive',
      },
      isCreator: true,
    },
    include: {
      followersList: {
        include: {
          follower: true,
        },
      },
    },
  });

  if (!user) {
    return <div className="text-white p-6">❌ Creator not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-white space-y-8">
      <h1 className="text-3xl font-bold">👥 Followers of {user.name}</h1>

      {user.followersList.length === 0 ? (
        <p className="text-gray-400 italic">This creator has no followers yet.</p>
      ) : (
        <ul className="space-y-4">
          {user.followersList.map((f) => (
            <li key={f.followerId} className="bg-zinc-800 p-4 rounded-xl border border-zinc-700">
              <Link
                href={`/creator/${f.follower.name}`}
                className="text-yellow-400 font-medium hover:underline"
              >
                {f.follower.name}
              </Link>
              <p className="text-gray-400 text-sm">{f.follower.email}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
