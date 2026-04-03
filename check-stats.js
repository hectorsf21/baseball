async function checkMissingTeams() {
  // 1. Get today's games and their team IDs
  const date = "2026-04-03";
  const scheduleUrl = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${date}`;
  const scheduleRes = await fetch(scheduleUrl);
  const scheduleData = await scheduleRes.json();
  
  const scheduleTeamIds = new Set();
  scheduleData.dates?.[0]?.games.forEach(g => {
    scheduleTeamIds.add(g.teams.away.team.id);
    scheduleTeamIds.add(g.teams.home.team.id);
  });

  // 2. Get team hitting stats
  const teamStatsUrl = `https://statsapi.mlb.com/api/v1/stats?stats=season&group=hitting&season=2026&sportId=1`;
  const teamStatsRes = await fetch(teamStatsUrl);
  const teamStatsData = await teamStatsRes.json();
  
  const statsTeamIds = new Set();
  teamStatsData.stats?.[0]?.splits?.forEach(s => {
    statsTeamIds.add(s.team.id);
  });

  console.log("Schedule Team IDs count:", scheduleTeamIds.size);
  console.log("Stats Team IDs count:", statsTeamIds.size);

  const missing = [...scheduleTeamIds].filter(id => !statsTeamIds.has(id));
  console.log("Team IDs in schedule but NOT in stats:", missing);
  
  if (missing.length > 0) {
    // Check one missing team's name
    const teamUrl = `https://statsapi.mlb.com/api/v1/teams/${missing[0]}`;
    const teamRes = await fetch(teamUrl);
    const teamData = await teamRes.json();
    console.log(`Example Missing Team (${missing[0]}):`, teamData.teams?.[0]?.name);
  }
}
checkMissingTeams();
