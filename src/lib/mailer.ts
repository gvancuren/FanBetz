import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const res = await resend.emails.send({
      from: 'FanBetz <no-reply@fanbetz.com>', // ✅ must be a verified domain
      to,
      subject,
      html,
    });

    if (res.error) {
      console.error('❌ Email send error:', res.error);
      throw new Error('Email failed');
    }

    return res;
  } catch (err) {
    console.error('❌ sendEmail error:', err);
    throw err;
  }
}
