async function checkTeamsStatsReliable() {
  const url = `https://statsapi.mlb.com/api/v1/teams/stats?season=2026&group=hitting&stats=season&sportIds=1`;
  const res = await fetch(url);
  const data = await res.json();
  const teams = data.stats?.[0]?.splits?.length || 0;
  console.log("Teams found with v1/teams/stats:", teams);
  const isDodgers = data.stats?.[0]?.splits?.some(s => s.team.id === 119);
  console.log("Is Dodgers in list?", isDodgers);
}
checkTeamsStatsReliable();
