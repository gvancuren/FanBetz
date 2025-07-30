import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import cloudinary from '@/lib/cloudinary';

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

    // ✅ Convert file to base64 and upload to Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: 'fanbetz/profile_pics',
    });

    const imageUrl = uploadResult.secure_url;

    // ✅ Save image URL in database
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { profileImage: imageUrl },
    });

    return NextResponse.json({ imageUrl }, { status: 200 });
  } catch (error) {
    console.error('Profile image upload failed:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
