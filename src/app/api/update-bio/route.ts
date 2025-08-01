import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = Number(session?.user?.id);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bio } = await req.json();

    if (typeof bio !== 'string' || bio.trim() === '') {
      return NextResponse.json({ error: 'Invalid bio' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { bio: bio.trim() },
    });

    return NextResponse.json({ success: true, bio: updated.bio });
  } catch (error) {
    console.error('Update Bio Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
