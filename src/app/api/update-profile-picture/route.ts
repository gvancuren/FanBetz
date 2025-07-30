import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;

    console.log('Session:', session.user.email);
    console.log('FormData keys:', [...formData.keys()]);
    console.log('File:', file?.name, file?.size);

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // 🚨 Vercel does not allow writing to disk, so we'll skip that part here
    const imageUrl = `/uploads/test.png`; // Replace with real hosted image URL later

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { profileImage: imageUrl },
    });

    return NextResponse.json({ imageUrl: user.profileImage }, { status: 200 });
  } catch (error) {
    console.error('Profile image upload failed:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
