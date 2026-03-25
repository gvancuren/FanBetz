import { prisma } from "@/lib/prisma";
import { fetchTodaysGames } from "@/lib/odds";
import { getAICorePick } from "@/lib/ai-models";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const expected = `Bearer ${process.env.CRON_SECRET}`;

    if (authHeader !== expected) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const botUser = await prisma.user.findUnique({
      where: { email: "aicore@fanbetz.com" },
    });

    if (!botUser) {
      return Response.json({ error: "Bot user not found" }, { status: 404 });
    }

    const games = await fetchTodaysGames();
    const pick = getAICorePick(games);

    if (!pick) {
      return Response.json({ message: "No eligible pick today" });
    }

    const existingPick = await prisma.pick.findFirst({
      where: {
        userId: botUser.id,
        eventId: pick.eventId,
        prediction: `${pick.selection} Moneyline`,
      },
    });

    if (existingPick) {
      return Response.json({
        message: "Pick already posted today",
        pickId: existingPick.id,
      });
    }

    const createdPost = await prisma.post.create({
      data: {
        userId: botUser.id,
        title: pick.title,
        content: pick.content,
        price: 0,
        category: "NBA",
      },
    });

    const createdPick = await prisma.pick.create({
      data: {
        userId: botUser.id,
        sport: "NBA",
        teams: pick.teams,
        market: "Moneyline",
        prediction: `${pick.selection} Moneyline`,
        eventStartAt: pick.eventStartAt,
        league: "NBA",
        eventId: pick.eventId,
        selection: pick.selection,
        marketType: "MONEYLINE",
        odds: pick.odds,
      },
    });

    return Response.json({
      message: "AI pick posted successfully",
      postId: createdPost.id,
      pickId: createdPick.id,
    });
  } catch (error: any) {
    console.error("CRON POST ERROR:", error);

    return Response.json(
      { error: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}