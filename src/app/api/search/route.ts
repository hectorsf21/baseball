import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json({ error: 'Name parameter is required' }, { status: 400 });
  }

  try {
    // 1. Buscar jugador por nombre
    const searchUrl = `https://statsapi.mlb.com/api/v1/people/search?names=${encodeURIComponent(name)}&sportIds=1`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchData.people || searchData.people.length === 0) {
      return NextResponse.json({ players: [] });
    }

    // 2. Extraer IDs de jugadores (hasta 10 para no agobiar el servidor de MLB)
    const topPlayers = searchData.people.slice(0, 10);
    const playerIds = topPlayers.map((p: any) => p.id).join(',');

    // 3. Obtener estadísticas hidratadas usando un solo llamado con personIds
    const statsUrl = `https://statsapi.mlb.com/api/v1/people?personIds=${playerIds}&hydrate=stats(group=[hitting,pitching],type=season,season=2026)`;
    const statsRes = await fetch(statsUrl);
    const statsData = await statsRes.json();

    if (!statsData.people) {
      return NextResponse.json({ players: [] });
    }

    const currentSeason = 2026;
    const formattedPlayers = statsData.people.map((person: any) => {
      const isPitcher = person.primaryPosition?.abbreviation === 'P';

      const commonPlayer = {
        id: person.id,
        name: person.fullName,
        age: person.currentAge || '-',
        nationality: person.birthCountry || '-',
        position: person.primaryPosition?.abbreviation || '-',
        teamId: null, // Lo asignaremos abajo al revisar las stats
        isPitcher
      };

      // Extraer estadísticas de 2026 si existen en la respuesta hidratada
      let statsToUse = null;
      let teamIdFromStats = null;
      if (person.stats) {
        // Person stats es un array, buscamos type='season' y group hitting o pitching dependiendo
        const statGroupToLookFor = isPitcher ? 'pitching' : 'hitting';
        const seasonStatsObj = person.stats.find(
          (s: any) =>
            s.type.displayName === 'season' &&
            s.group.displayName === statGroupToLookFor && 
            s.splits && s.splits.some((split:any) => split.season === currentSeason.toString())
        );

        if (seasonStatsObj && seasonStatsObj.splits.length > 0) {
          const matchingSplit = seasonStatsObj.splits.find((split:any) => split.season === currentSeason.toString());
          statsToUse = matchingSplit?.stat;
          teamIdFromStats = matchingSplit?.team?.id;
        }
      }

      commonPlayer.teamId = person.currentTeam?.id || teamIdFromStats || null;

      const st = statsToUse || {};

      if (isPitcher) {
        return {
          ...commonPlayer,
          era: st.era || '-',
          strikeouts: st.strikeOuts || 0,
          walks: st.baseOnBalls || 0,
          whip: st.whip || '-',
          gamesPlayed: st.gamesPlayed || 0,
        };
      } else {
        return {
          ...commonPlayer,
          ab: st.atBats || 0,
          gamesPlayed: st.gamesPlayed || 0,
          hits: st.hits || 0,
          hr: st.homeRuns || 0,
          avg: st.avg || '.000',
          strikeouts: st.strikeOuts || 0,
          walks: st.baseOnBalls || 0,
          obp: st.obp || '.000',
        };
      }
    });

    return NextResponse.json({ players: formattedPlayers });
  } catch (error) {
    console.error('Error fetching searched player stats:', error);
    return NextResponse.json({ error: 'Failed to fetch player stats' }, { status: 500 });
  }
}
