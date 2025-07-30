import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

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

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        isCreator: isCreator ?? true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('🔥 Signup failed:', error);
    return NextResponse.json(
      { message: 'Signup failed.', error: String(error) },
      { status: 500 }
    );
  }
}
