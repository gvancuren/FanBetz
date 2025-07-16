import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { postId } = await req.json();

  if (!postId) {
    return NextResponse.json({ error: 'Missing post ID' }, { status: 400 });
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { user: true },
  });

  if (!post || post.user.email !== session.user.email) {
    return NextResponse.json({ error: 'Not allowed to delete this post' }, { status: 403 });
  }

  await prisma.post.delete({
    where: { id: postId },
  });

  return NextResponse.json({ message: '✅ Post deleted successfully' });
}
