import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  if (!q || q.trim().length === 0) {
    return NextResponse.json({ results: [] });
  }

  const keyword = q.trim();

  const creators = await prisma.user.findMany({
    where: {
      isCreator: true,
      name: { contains: keyword, mode: 'insensitive' },
    },
    take: 5,
    select: {
      id: true,
      name: true,
      profileImage: true,
      _count: {
        select: {
          followersList: true, // ✅ use _count.followersList
        },
      },
    },
  });

  const posts = await prisma.post.findMany({
    where: {
      OR: [
        { title: { contains: keyword, mode: 'insensitive' } },
        { content: { contains: keyword, mode: 'insensitive' } },
      ],
    },
    take: 5,
    select: {
      id: true,
      title: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  // Flatten the data into a single array
  const results = [
    ...creators.map((creator) => ({
      type: 'creator',
      id: creator.id,
      name: creator.name,
      profileImage: creator.profileImage,
      followerCount: creator._count.followersList,
    })),
    ...posts.map((post) => ({
      type: 'post',
      id: post.id,
      name: post.user.name,
      title: post.title,
    })),
  ];

  return NextResponse.json({ results });
}
