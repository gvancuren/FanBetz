import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { sendEmail } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email?.toLowerCase().trim();

    if (!email) {
      console.warn('⚠️ No email provided in request body');
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    console.log(`📩 Password reset requested for: ${email}`);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.log(`ℹ️ No user found with email: ${email} — responding with success to prevent enumeration`);
      return NextResponse.json({ success: true });
    }

    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // ✅ Store the token in the PasswordResetToken model
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: expires,
      },
    });

    console.log(`✅ Token generated and stored for user ${user.id}`);

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

    const sendResult = await sendEmail({
      to: email,
      subject: 'Reset your FanBetz password',
      html: `
        <p>Hey ${user.name || 'FanBetz user'},</p>
        <p>You requested a password reset. Click the link below to reset it:</p>
        <a href="${resetUrl}" style="color:blue">${resetUrl}</a>
        <p>If you didn’t request this, you can safely ignore it.</p>
      `,
    });

    console.log('📧 Email send result:', sendResult);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('❌ Forgot Password Error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
