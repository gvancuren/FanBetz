import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, content, imageUrl, price, category } = await req.json();

  // ✅ Validate category
  const validCategories = ['NFL', 'NBA', 'MLB', 'NHL', 'UFC', 'Soccer', 'Golf', 'NCAA'];
  if (category && !validCategories.includes(category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  }

  try {
    // 🔹 Get the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, stripeAccountId: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 🔹 Block if no Stripe account
    if (!user.stripeAccountId) {
      return NextResponse.json(
        { error: 'You must connect Stripe before posting.' },
        { status: 403 }
      );
    }

    // 🔹 Double-check Stripe onboarding status
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-06-30.basil',
    });

    const account = await stripe.accounts.retrieve(user.stripeAccountId);
    if (!account.charges_enabled || !account.details_submitted) {
      return NextResponse.json(
        { error: 'Stripe onboarding not complete. Please finish setup before posting.' },
        { status: 403 }
      );
    }

    // ✅ Create post
    const post = await prisma.post.create({
      data: {
        title,
        content,
        imageUrl,
        price: price ? parseFloat(price) : null,
        category,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
