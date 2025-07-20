import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const userId = parseInt(formData.get('userId') as string);
    const sport = formData.get('sport') as string;
    const teams = formData.get('teams') as string;
    const market = formData.get('market') as string;
    const prediction = formData.get('pick') as string; // still reading from "pick" in the form

    // Validate form fields
    if (!userId || !sport || !teams || !market || !prediction) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Save pick to database
    const newPick = await prisma.pick.create({
      data: {
        userId,
        sport,
        teams,
        market,
        prediction, // ✅ correct Prisma field
      },
    });

    // Redirect back to the creator's dashboard
    return NextResponse.redirect(`/dashboard/${userId}`);
  } catch (error) {
    console.error('Error creating pick:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
