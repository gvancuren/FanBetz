import { prisma } from "@/lib/prisma";
import { fetchTodaysGames } from "@/lib/odds";
import { getAICorePick } from "@/lib/ai-models";

const aiAccounts = [
  { email: "aicore@fanbetz.com", label: "AI Core", sport: "NBA" },
  { email: "ai-locks@fanbetz.com", label: "AI Locks", sport: "NBA" },
  { email: "sharp-ai@fanbetz.com", label: "Sharp AI", sport: "NBA" },
  { email: "fanbetz-model@fanbetz.com", label: "FanBetz Model", sport: "NBA" },
  { email: "betbot@fanbetz.com", label: "BetBot", sport: "NBA" },
];

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const expected = `Bearer ${process.env.CRON_SECRET}`;

    if (authHeader !== expected) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const games = await fetchTodaysGames();

    if (!games || games.length === 0) {
      return Response.json({ message: "No games found today" });
    }

    const results: Array<{
      email: string;
      status: string;
      postId?: number;
      pickId?: number;
      reason?: string;
    }> = [];

    for (let index = 0; index < aiAccounts.length; index++) {
      const account = aiAccounts[index];

      try {
        const botUser = await prisma.user.findUnique({
          where: { email: account.email },
        });

        if (!botUser) {
          results.push({
            email: account.email,
            status: "skipped",
            reason: "Bot user not found",
          });
          continue;
        }

        // Rotate games so each bot is more likely to get a different pick
        const rotatedGames = [...games.slice(index), ...games.slice(0, index)];
        const pick = getAICorePick(rotatedGames);

        if (!pick) {
          results.push({
            email: account.email,
            status: "skipped",
            reason: "No eligible pick",
          });
          continue;
        }

        const existingPick = await prisma.pick.findFirst({
          where: {
            userId: botUser.id,
            eventId: pick.eventId,
            prediction: `${pick.selection} Moneyline`,
          },
        });

        if (existingPick) {
          results.push({
            email: account.email,
            status: "already_posted",
            pickId: existingPick.id,
          });
          continue;
        }

        const createdPost = await prisma.post.create({
          data: {
            userId: botUser.id,
            title: pick.title,
            content: pick.content,
            price: 0,
          },
        });

        const createdPick = await prisma.pick.create({
          data: {
            userId: botUser.id,
            sport: account.sport,
            teams: pick.teams,
            market: "Moneyline",
            prediction: `${pick.selection} Moneyline`,
            eventStartAt: pick.eventStartAt,
            league: account.sport,
            eventId: pick.eventId,
            selection: pick.selection,
            marketType: "MONEYLINE",
            odds: pick.odds,
          },
        });

        results.push({
          email: account.email,
          status: "posted",
          postId: createdPost.id,
          pickId: createdPick.id,
        });
      } catch (botError: any) {
        console.error(`BOT POST ERROR [${account.email}]:`, botError);

        results.push({
          email: account.email,
          status: "error",
          reason: botError?.message || "Unknown bot error",
        });
      }
    }

    return Response.json({
      message: "AI posting run complete",
      results,
    });
  } catch (error: any) {
    console.error("CRON POST ERROR:", error);

    return Response.json(
      { error: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}