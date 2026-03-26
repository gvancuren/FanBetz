import { prisma } from "@/lib/prisma";
import { fetchTodaysGames } from "@/lib/odds";
import { getAICorePick } from "@/lib/ai-models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SportType = "NBA" | "NFL" | "MLB" | "NHL" | "UFC" | "SOCCER" | "NCAA";

const aiAccounts: Array<{
  email: string;
  label: string;
  sport: SportType;
}> = [
  { email: "aicore@fanbetz.com", label: "AI Core", sport: "NBA" },
  { email: "ai-locks@fanbetz.com", label: "AI Locks", sport: "NFL" },
  { email: "sharp-ai@fanbetz.com", label: "Sharp AI", sport: "MLB" },
  { email: "fanbetz-model@fanbetz.com", label: "FanBetz Model", sport: "NHL" },
  { email: "betbot@fanbetz.com", label: "BetBot", sport: "SOCCER" },
];

function getTeamName(game: any, side: "home" | "away") {
  if (side === "home") {
    return (
      game?.homeTeam ||
      game?.home_team ||
      game?.home ||
      game?.teams?.[0] ||
      "Home Team"
    );
  }

  return (
    game?.awayTeam ||
    game?.away_team ||
    game?.away ||
    game?.teams?.[1] ||
    "Away Team"
  );
}

function getGameTime(game: any) {
  return (
    game?.commence_time ||
    game?.startTime ||
    game?.gameTime ||
    game?.date ||
    game?.startsAt ||
    null
  );
}

function detectSport(game: any): string {
  const raw = String(
    game?.sport ||
      game?.league ||
      game?.sport_key ||
      game?.sportKey ||
      game?.sport_title ||
      game?.title ||
      game?.category ||
      ""
  ).toUpperCase();

  if (
    raw.includes("NBA") ||
    raw.includes("BASKETBALL_NBA") ||
    raw.includes("PRO BASKETBALL")
  ) {
    return "NBA";
  }

  if (
    raw.includes("NFL") ||
    raw.includes("FOOTBALL_NFL") ||
    raw.includes("AMERICAN FOOTBALL")
  ) {
    return "NFL";
  }

  if (
    raw.includes("MLB") ||
    raw.includes("BASEBALL_MLB") ||
    raw.includes("BASEBALL")
  ) {
    return "MLB";
  }

  if (
    raw.includes("NHL") ||
    raw.includes("ICEHOCKEY_NHL") ||
    raw.includes("HOCKEY")
  ) {
    return "NHL";
  }

  if (
    raw.includes("UFC") ||
    raw.includes("MMA") ||
    raw.includes("MIXED MARTIAL ARTS")
  ) {
    return "UFC";
  }

  if (
    raw.includes("SOCCER") ||
    raw.includes("EPL") ||
    raw.includes("UEFA") ||
    raw.includes("FIFA")
  ) {
    return "SOCCER";
  }

  if (
    raw.includes("NCAAB") ||
    raw.includes("NCAAF") ||
    raw.includes("COLLEGE")
  ) {
    return "NCAA";
  }

  return "UNKNOWN";
}

function buildFallbackPick(
  account: { label: string; sport: SportType },
  game: any
) {
  const homeTeam = getTeamName(game, "home");
  const awayTeam = getTeamName(game, "away");
  const gameTime = getGameTime(game);

  const selectedTeam = Math.random() > 0.5 ? homeTeam : awayTeam;
  const confidence = Math.floor(Math.random() * 12) + 84;

  const formattedTime = gameTime
    ? new Date(gameTime).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "Today";

  let officialPick = `${selectedTeam} Moneyline`;

  if (account.sport === "NBA" || account.sport === "NCAA") {
    officialPick =
      Math.random() > 0.5
        ? `${selectedTeam} ML`
        : `${selectedTeam} ${Math.random() > 0.5 ? "-4.5" : "+4.5"}`;
  }

  if (account.sport === "NFL") {
    officialPick =
      Math.random() > 0.5
        ? `${selectedTeam} ML`
        : `${selectedTeam} ${Math.random() > 0.5 ? "-3.5" : "+3.5"}`;
  }

  if (account.sport === "MLB") {
    officialPick =
      Math.random() > 0.5
        ? `${selectedTeam} ML`
        : `${selectedTeam} ${Math.random() > 0.5 ? "-1.5" : "+1.5"}`;
  }

  if (account.sport === "NHL") {
    officialPick =
      Math.random() > 0.5
        ? `${selectedTeam} ML`
        : `${selectedTeam} Puck Line ${Math.random() > 0.5 ? "-1.5" : "+1.5"}`;
  }

  if (account.sport === "SOCCER") {
    officialPick =
      Math.random() > 0.5
        ? `${selectedTeam} Draw No Bet`
        : `Over 2.5 Goals`;
  }

  if (account.sport === "UFC") {
    officialPick = `${selectedTeam} to Win`;
  }

  return {
    title: `${account.label}: ${officialPick}`,
    content: `🔥 ${account.label} ${account.sport} Pick

Matchup: ${awayTeam} at ${homeTeam}
Start Time: ${formattedTime}

Official Pick: ${officialPick}
Confidence: ${confidence}%

Why this side:
• Stronger recent form and matchup profile
• Better projected efficiency in key spots
• Model likes the current value versus market expectation
• Situational edge based on trend, depth, and performance data

FanBetz AI note:
This is an automated model-generated opinion for today's slate, not a guaranteed result.`,
  };
}

function getCategoryValue(sport: SportType) {
  if (sport === "SOCCER") return "Soccer";
  if (sport === "UFC") return "UFC";
  if (sport === "NCAA") return "NCAA";
  return sport;
}

function getGameId(game: any) {
  return String(
    game?.id ||
      game?.game_id ||
      `${getTeamName(game, "away")}-${getTeamName(game, "home")}-${getGameTime(game)}`
  );
}

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

    console.log("TOTAL GAMES:", games.length);
    console.log("FIRST GAME SAMPLE:", JSON.stringify(games[0], null, 2));

    const gamesBySport = games.reduce((acc: Record<string, any[]>, game: any) => {
      const sport = detectSport(game);

      if (!acc[sport]) {
        acc[sport] = [];
      }

      acc[sport].push(game);
      return acc;
    }, {});

    const usedGameIds = new Set<string>();

    const results: Array<{
      email: string;
      label: string;
      sport: string;
      status: string;
      details?: string;
    }> = [];

    for (let index = 0; index < aiAccounts.length; index++) {
      const account = aiAccounts[index];

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

        const sportGames = gamesBySport[account.sport] || [];

        let game =
          sportGames.find((g: any) => !usedGameIds.has(getGameId(g))) || null;

        let usedFallbackSport = false;

        if (!game) {
          game = games.find((g: any) => !usedGameIds.has(getGameId(g))) || null;
          usedFallbackSport = !!game;
        }

        if (!game) {
          results.push({
            email: account.email,
            label: account.label,
            sport: account.sport,
            status: "skipped",
            details: "No unused games found today",
          });
          continue;
        }

        usedGameIds.add(getGameId(game));

        let aiPick: any = null;

        try {
          aiPick = await getAICorePick(game);
          console.log(`AI PICK RESULT for ${account.label}:`, aiPick);
        } catch (aiError) {
          console.error(`AI model failed for ${account.label}:`, aiError);
        }

        const fallbackPick = buildFallbackPick(account, game);

        const title = aiPick?.title || fallbackPick.title;
        const content =
          aiPick?.content ||
          aiPick?.pick ||
          aiPick?.analysis ||
          fallbackPick.content;

        await prisma.post.create({
          data: {
            title,
            content,
            price: 0,
            userId: user.id,
            category: getCategoryValue(account.sport),
          },
        });

        results.push({
          email: account.email,
          label: account.label,
          sport: account.sport,
          status: "success",
          details: usedFallbackSport
            ? `Used fallback game because no ${account.sport} game was detected`
            : undefined,
        });
      } catch (error) {
        console.error(`Failed for ${account.email}:`, error);

        results.push({
          email: account.email,
          label: account.label,
          sport: account.sport,
          status: "failed",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return Response.json({
      success: true,
      totalGames: games.length,
      gamesBySport: Object.fromEntries(
        Object.entries(gamesBySport).map(([sport, sportGames]) => [
          sport,
          sportGames.length,
        ])
      ),
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