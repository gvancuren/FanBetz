import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Missing token or password' }, { status: 400 });
    }

    // 1. Find token
    const tokenRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    // 2. Hash new password
    const hashed = await hash(password, 10);

    // 3. Update user's password
    await prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { password: hashed },
    });

    // 4. Delete the used token
    await prisma.passwordResetToken.delete({
      where: { token },
    });

    return NextResponse.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('❌ Reset password error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
