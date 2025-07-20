import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { plan, price } = body;

  if (!['weekly', 'monthly'].includes(plan)) {
    return NextResponse.json({ error: 'Invalid subscription plan' }, { status: 400 });
  }

  try {
    const creator = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!creator || !creator.isCreator) {
      return NextResponse.json({ error: 'Only creators can set subscription plans' }, { status: 403 });
    }

    // ✅ Calculate expiration based on plan type
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (plan === 'monthly' ? 30 : 7));

    await prisma.subscription.upsert({
      where: {
        subscriberId_creatorId: {
          subscriberId: creator.id,
          creatorId: creator.id,
        },
      },
      update: {
        plan,
        price,
        expiresAt, // ✅ Required in update block
      },
      create: {
        plan,
        price,
        expiresAt, // ✅ Required in create block
        subscriberId: creator.id,
        creatorId: creator.id,
      },
    });

    return NextResponse.json({ message: 'Subscription plan saved' });
  } catch (error) {
    console.error('Subscription setup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
