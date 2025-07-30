import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  console.log('🔁 /api/follow hit');

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    console.warn('❌ Unauthorized: No session or email');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const creatorId = Number(body.creatorId);

  if (!creatorId || isNaN(creatorId)) {
    console.warn('❌ Missing or invalid creatorId');
    return NextResponse.json({ error: 'Missing or invalid creatorId' }, { status: 400 });
  }

  const follower = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!follower) {
    console.warn('❌ User not found by email');
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const existingFollow = await prisma.follow.findFirst({
    where: {
      followerId: follower.id,
      followingId: creatorId,
    },
  });

  if (existingFollow) {
    await prisma.follow.delete({
      where: { id: existingFollow.id },
    });
    console.log('👤 Unfollowed user', creatorId);
    return NextResponse.json({ status: 'unfollowed' });
  } else {
    await prisma.follow.create({
      data: {
        followerId: follower.id,
        followingId: creatorId,
      },
    });
    console.log('✅ Followed user', creatorId);
    return NextResponse.json({ status: 'followed' });
  }
}
