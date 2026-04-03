async function testTeam() {
  const query = "Edwin Diaz";
  const searchUrl = `https://statsapi.mlb.com/api/v1/people/search?names=${encodeURIComponent(query)}&sportIds=1`;
  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();
  const playerIds = searchData.people.slice(0, 2).map(p => p.id).join(',');
  const statsUrl = `https://statsapi.mlb.com/api/v1/people?personIds=${playerIds}&hydrate=stats(group=[hitting,pitching],type=season,season=2026)`;
  const statsRes = await fetch(statsUrl);
  const statsData = await statsRes.json();

  console.log("Person 1 currentTeam:", statsData.people[0].currentTeam);
  
  if (statsData.people[0].stats) {
    const splits = statsData.people[0].stats[0].splits;
    if (splits && splits.length > 0) {
      console.log("Stats team:", splits[0].team);
    }
  }
}
testTeam();
