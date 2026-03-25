export type OddsGame = {
  eventId: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: string;
  homePrice?: number;
  awayPrice?: number;
};

export async function fetchTodaysGames() {
  const apiKey = process.env.ODDS_API_KEY;

  if (!apiKey) {
    throw new Error("Missing ODDS_API_KEY");
  }

  const url =
    `https://api.the-odds-api.com/v4/sports/basketball_nba/odds` +
    `?apiKey=${apiKey}` +
    `&regions=us` +
    `&markets=h2h` +
    `&oddsFormat=american`;

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Odds API request failed with status ${res.status}`);
  }

  const data = await res.json();

  const games: OddsGame[] = data.map((game: any) => {
    const market = game.bookmakers?.[0]?.markets?.[0];

    return {
      eventId: game.id,
      homeTeam: game.home_team,
      awayTeam: game.away_team,
      commenceTime: game.commence_time,
      homePrice: market?.outcomes?.find((o: any) => o.name === game.home_team)?.price,
      awayPrice: market?.outcomes?.find((o: any) => o.name === game.away_team)?.price,
    };
  });

  return games;
}