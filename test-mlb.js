async function test() {
  const res = await fetch('https://statsapi.mlb.com/api/v1/teams/111/roster?hydrate=person(stats(type=season))');
  const data = await res.json();
  // Get a pitcher
  const pitcher = data.roster.find((item: any) => item.position.abbreviation === 'P');
  const batter = data.roster.find((item: any) => item.position.abbreviation !== 'P');
  
  console.log("Pitcher stats:");
  console.log(JSON.stringify(pitcher.person.stats, null, 2));
  console.log("Batter stats:");
  console.log(JSON.stringify(batter.person.stats, null, 2));
}

test();
