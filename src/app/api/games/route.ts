import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Usamos la fecha actual para obtener los juegos de hoy
    // En producción usaríamos new Date().toISOString().split('T')[0]
    // Para pruebas con datos reales de la temporada 2026 solicitada por el usuario:
    const date = "2026-04-03"; 
    
    const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&hydrate=team,probablePitcher,leagueRecord&date=${date}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.dates || data.dates.length === 0) {
      return NextResponse.json({ games: [] });
    }

    const gamesData = data.dates[0].games.map((g: any) => ({
      gamePk: g.gamePk,
      gameDate: g.gameDate,
      status: g.status.abstractGameState,
      venue: g.venue.name,
      away: {
        id: g.teams.away.team.id,
        name: g.teams.away.team.name,
        score: g.teams.away.score,
        wins: g.teams.away.leagueRecord.wins,
        losses: g.teams.away.leagueRecord.losses,
        pct: g.teams.away.leagueRecord.pct,
        pitcherId: g.teams.away.probablePitcher?.id,
        pitcherName: g.teams.away.probablePitcher?.fullName
      },
      home: {
        id: g.teams.home.team.id,
        name: g.teams.home.team.name,
        score: g.teams.home.score,
        wins: g.teams.home.leagueRecord.wins,
        losses: g.teams.home.leagueRecord.losses,
        pct: g.teams.home.leagueRecord.pct,
        pitcherId: g.teams.home.probablePitcher?.id,
        pitcherName: g.teams.home.probablePitcher?.fullName
      }
    }));

    // Recolectar IDs de pitchers únicos para obtener sus stats (WHIP)
    const pitcherIds = Array.from(new Set(
      gamesData.flatMap((g: any) => [g.away.pitcherId, g.home.pitcherId]).filter((id: number | undefined) => !!id)
    ));

    let pitcherStats: Record<number, { whip: string; era: string; gamesPlayed: number }> = {};
    let teamHittingStats: Record<number, string> = {};

    // 1. Obtener estadísticas de pitcheo para los abridores
    if (pitcherIds.length > 0) {
      const statsUrl = `https://statsapi.mlb.com/api/v1/people?personIds=${pitcherIds.join(',')}&hydrate=stats(group=[pitching],type=season,season=2026)`;
      const statsRes = await fetch(statsUrl);
      const statsData = await statsRes.json();
      
      statsData.people?.forEach((person: any) => {
        const seasonStat = person.stats?.find((s: any) => s.group.displayName === 'pitching')?.splits?.find((split: any) => split.season === "2026");
        if (seasonStat) {
          pitcherStats[person.id] = {
            whip: seasonStat.stat.whip || "-",
            era: seasonStat.stat.era || "-",
            gamesPlayed: seasonStat.stat.gamesPlayed || 0
          };
        }
      });
    }

    // 2. Obtener estadísticas de bateo por equipo (colectivo)
    try {
      const teamStatsUrl = `https://statsapi.mlb.com/api/v1/teams/stats?season=2026&group=hitting&stats=season&sportIds=1`;
      const teamStatsRes = await fetch(teamStatsUrl);
      const teamStatsData = await teamStatsRes.json();
      
      teamStatsData.stats?.[0]?.splits?.forEach((split: any) => {
        if (split.team?.id) {
          teamHittingStats[split.team.id] = split.stat.avg || ".000";
        }
      });
    } catch (teamError) {
      console.error('Error fetching team hitting stats:', teamError);
    }

    const formattedGames = gamesData.map((g: any) => ({
      gamePk: g.gamePk,
      gameDate: g.gameDate,
      status: g.status,
      venue: g.venue,
      teams: {
        away: {
          ...g.away,
          avg: teamHittingStats[g.away.id] || ".000",
          probablePitcher: g.away.pitcherId ? {
            id: g.away.pitcherId,
            name: g.away.pitcherName,
            whip: pitcherStats[g.away.pitcherId]?.whip || "-",
            era: pitcherStats[g.away.pitcherId]?.era || "-",
            gamesPlayed: pitcherStats[g.away.pitcherId]?.gamesPlayed || 0
          } : null
        },
        home: {
          ...g.home,
          avg: teamHittingStats[g.home.id] || ".000",
          probablePitcher: g.home.pitcherId ? {
            id: g.home.pitcherId,
            name: g.home.pitcherName,
            whip: pitcherStats[g.home.pitcherId]?.whip || "-",
            era: pitcherStats[g.home.pitcherId]?.era || "-",
            gamesPlayed: pitcherStats[g.home.pitcherId]?.gamesPlayed || 0
          } : null
        }
      }
    }));

    return NextResponse.json({ games: formattedGames });
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}
