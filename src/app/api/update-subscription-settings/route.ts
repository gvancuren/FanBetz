// src/app/api/update-subscription-settings/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createStripePricesForCreator } from '@/app/actions/createStripePricesForCreator';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const body = await req.json();
  const { weeklyPrice, monthlyPrice } = body;

  if (typeof weeklyPrice !== 'number' || typeof monthlyPrice !== 'number') {
    return NextResponse.json({ error: 'Invalid prices' }, { status: 400 });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        weeklyPrice,
        monthlyPrice,
      },
    });

    // ✅ Ensure this function uses CommonJS require for Stripe inside it
    await createStripePricesForCreator(updatedUser);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('❌ Failed to update subscription prices:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
