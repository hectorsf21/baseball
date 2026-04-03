async function testHydration() {
  const date = "2026-04-03";
  const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${date}&hydrate=team(stats(group=[hitting],type=[season],season=2026))`;
  const res = await fetch(url);
  const data = await res.json();
  
  if (data.dates && data.dates[0].games) {
    const g = data.dates[0].games[0];
    const awayStats = g.teams.away.team.stats;
    console.log("Away Team:", g.teams.away.team.name);
    if (awayStats && awayStats[0].splits) {
       console.log("AVG:", awayStats[0].splits[0].stat.avg);
    } else {
       console.log("No stats found in hydration");
    }
  }
}
testHydration();
