import type { OddsGame } from "./odds";

export function getAICorePick(games: OddsGame[]) {
  if (!games.length) return null;

  const game = games[0];

  if (typeof game.homePrice !== "number" || typeof game.awayPrice !== "number") {
    return null;
  }

  let selection = "";
  let odds = 0;

  if (game.homePrice > game.awayPrice) {
    selection = game.homeTeam;
    odds = game.homePrice;
  } else {
    selection = game.awayTeam;
    odds = game.awayPrice;
  }

  return {
    title: `AI Pick: ${selection}`,
    content: `Automated FanBetz pick.\n\nPick: ${selection}\nOdds: ${odds}`,
    selection,
    odds,
    eventId: game.eventId,
    eventStartAt: new Date(game.commenceTime),
    teams: `${game.awayTeam} @ ${game.homeTeam}`,
  };
}