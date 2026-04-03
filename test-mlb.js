async function testSearch() {
  const query = "Miguel Cabrera";
  const url = `https://statsapi.mlb.com/api/v1/people/search?names=${encodeURIComponent(query)}&sportIds=1`;
  const res = await fetch(url);
  const data = await res.json();
  
  if(data.people && data.people.length > 0) {
    const p = data.people[0];
    const statsUrl = `https://statsapi.mlb.com/api/v1/people/${p.id}?hydrate=stats(group=[hitting,pitching],type=season,season=2026)`;
    const statsRes = await fetch(statsUrl);
    const statsData = await statsRes.json();
    console.log(JSON.stringify(statsData.people[0].stats, null, 2));
  } else {
    console.log("No people found");
  }
}
testSearch();
