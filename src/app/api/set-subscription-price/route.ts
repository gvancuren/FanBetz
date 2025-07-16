import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { creatorId, duration, price } = body;

    if (!creatorId || !['weekly', 'monthly'].includes(duration) || price === undefined) {
      return NextResponse.json({ message: 'Invalid input' }, { status: 400 });
    }

    // Check if a record already exists and update it
    const existing = await prisma.subscriptionSetting.findFirst({
      where: {
        creatorId,
        duration
      }
    });

    const setting = existing
      ? await prisma.subscriptionSetting.update({
          where: { id: existing.id },
          data: { price }
        })
      : await prisma.subscriptionSetting.create({
          data: {
            creatorId,
            duration,
            price
          }
        });

    return NextResponse.json({ message: 'Subscription price saved!', setting });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error setting price' }, { status: 500 });
  }
}
