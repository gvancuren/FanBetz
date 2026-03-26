import { prisma } from "@/lib/prisma";
import { fetchTodaysGames } from "@/lib/odds";
import { getAICorePick } from "@/lib/ai-models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    if (!process.env.CRON_SECRET) {
      return Response.json(
        { error: "CRON_SECRET is missing from environment variables" },
        { status: 500 }
      );
    }

    if (authHeader !== expected) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const games = await fetchTodaysGames();

    if (!games || games.length === 0) {
      return Response.json({ message: "No games found today" });
    }

    const results: Array<{
      email: string;
      label: string;
      status: string;
      details?: string;
    }> = [];

    for (const account of aiAccounts) {
      try {
        const user = await prisma.user.upsert({
          where: { email: account.email },
          update: {
            name: account.label,
            isCreator: true,
            bio: `${account.label} posts automated ${account.sport} picks on FanBetz.`,
            isBot: true,
            isOfficialModel: true,
            botType: account.label,
          },
          create: {
            email: account.email,
            name: account.label,
            isCreator: true,
            bio: `${account.label} posts automated ${account.sport} picks on FanBetz.`,
            isBot: true,
            isOfficialModel: true,
            botType: account.label,
          },
        });

        const game =
          games.find((g: any) => {
            const sport =
              g?.sport ||
              g?.league ||
              g?.sport_key ||
              g?.homeTeam ||
              g?.awayTeam;

            return account.sport
              ? String(sport ?? "").toUpperCase().includes(account.sport)
              : true;
          }) || games[0];

        if (!game) {
          results.push({
            email: account.email,
            label: account.label,
            status: "skipped",
            details: "No matching game found",
          });
          continue;
        }

        const aiPick = await getAICorePick(game);

        const title = aiPick?.title || `${account.label} ${account.sport} Pick`;

        const content =
          aiPick?.content ||
          aiPick?.pick ||
          aiPick?.analysis ||
          `Automated ${account.sport} pick generated for today's slate.`;

        await prisma.post.create({
          data: {
            title,
            content,
            price: 0,
            userId: user.id,
            category: account.sport,
          },
        });

        results.push({
          email: account.email,
          label: account.label,
          status: "success",
        });
      } catch (error) {
        console.error(`Failed for ${account.email}:`, error);

        results.push({
          email: account.email,
          label: account.label,
          status: "failed",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return Response.json({
      success: true,
      totalGames: games.length,
      results,
    });
  } catch (error) {
    console.error("post-ai-picks route failed:", error);

    return Response.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}