async function testGames() {
  // Use today's date or 2026-04-03
  const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&hydrate=team,probablePitcher&date=2026-04-03`;
  const res = await fetch(url);
  const data = await res.json();
  
  if (data.dates && data.dates.length > 0) {
    const games = data.dates[0].games;
    console.log(`Found ${games.length} games`);
    const g = games[0];
    console.log("Away Team:", g.teams.away.team.name, "Record:", g.teams.away.leagueRecord);
    console.log("Home Team:", g.teams.home.team.name, "Record:", g.teams.home.leagueRecord);
    console.log("Away Pitcher:", g.teams.away.probablePitcher?.fullName);
    console.log("Home Pitcher:", g.teams.home.probablePitcher?.fullName);
  } else {
    console.log("No games found today");
  }
}
testGames();
