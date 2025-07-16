import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { AuthOptions } from 'next-auth';
import { getCsrfToken } from 'next-auth/react';
import { cookies } from 'next/headers';

// ✅ Updated to use signIn programmatically
export async function POST(request: Request) {
  try {
    const { email: rawEmail, name: rawName, password, isCreator } = await request.json();
    const email = rawEmail.trim().toLowerCase();
    const name = rawName.trim();

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json({ message: 'Email already registered.' }, { status: 400 });
    }

    // Check if username already exists (case-insensitive)
    const existingUsername = await prisma.user.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    if (existingUsername) {
      return NextResponse.json({ message: 'Username already taken.' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        isCreator: isCreator ?? true,
      },
    });

    // ✅ Auto-login using programmatic redirect to credentials provider
    const formBody = new URLSearchParams({
      email,
      password,
      callbackUrl: `/creator/${encodeURIComponent(name)}`, // Redirect to profile
    });

    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/api/auth/callback/credentials?${formBody.toString()}`
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ message: 'Signup failed.' }, { status: 500 });
  }
}
