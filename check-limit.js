async function checkLimit() {
  const url = `https://statsapi.mlb.com/api/v1/stats?stats=season&group=hitting&season=2026&sportId=1&limit=100`;
  const res = await fetch(url);
  const data = await res.json();
  const teamIds = data.stats?.[0]?.splits?.map(s => s.team.id) || [];
  console.log("Team IDs count with limit 100:", teamIds.length);
  console.log("Is Dodgers (119) in list?", teamIds.includes(119));
}
checkLimit();
