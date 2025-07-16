import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  console.log('🔁 Follow API hit');

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { creatorId } = await req.json();
  if (!creatorId) {
    return NextResponse.json({ error: 'Missing creatorId' }, { status: 400 });
  }

  const follower = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!follower) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const existing = await prisma.follower.findFirst({
    where: {
      followerId: follower.id,
      followingId: Number(creatorId),
    },
  });

  if (existing) {
    await prisma.follower.delete({ where: { id: existing.id } });
    return NextResponse.json({ status: 'unfollowed' });
  } else {
    await prisma.follower.create({
      data: {
        followerId: follower.id,
        followingId: Number(creatorId),
      },
    });
    return NextResponse.json({ status: 'followed' });
  }
}
