import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { duration, price } = body;

    if (!['weekly', 'monthly'].includes(duration) || price === undefined) {
      return NextResponse.json({ message: 'Invalid input' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(duration === 'weekly' && { weeklyPrice: price }),
        ...(duration === 'monthly' && { monthlyPrice: price }),
      },
    });

    return NextResponse.json({ message: 'Subscription price saved!', user: updatedUser });
  } catch (error) {
    console.error('Error setting subscription price:', error);
    return NextResponse.json({ message: 'Error setting price' }, { status: 500 });
  }
}
