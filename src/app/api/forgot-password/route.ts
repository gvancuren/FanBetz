import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { sendEmail } from '@/lib/mailer'; // ✅ You’ll create this next

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email?.toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ success: true }); // Always return success to prevent user enumeration
    }

    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expires,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

    await sendEmail({
      to: email,
      subject: 'Reset your FanBetz password',
      html: `
        <p>Hey ${user.name || 'FanBetz user'},</p>
        <p>You requested a password reset. Click the link below to reset it:</p>
        <a href="${resetUrl}" style="color:blue">${resetUrl}</a>
        <p>If you didn’t request this, you can safely ignore it.</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('❌ Forgot Password Error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
