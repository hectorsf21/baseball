import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    const year = 2026;
    // the official MLB stats API allows hitting & pitching stats grouped.
    const res = await fetch(`https://statsapi.mlb.com/api/v1/teams/${teamId}/roster?hydrate=person(stats(group=[hitting,pitching],type=season,season=${year}))`);
    const data = await res.json();
    
    if (!data.roster) {
      return NextResponse.json({ error: 'Roster not found' }, { status: 404 });
    }

    const pitchers: any[] = [];
    const batters: any[] = [];

    data.roster.forEach((item: any) => {
      const person = item.person;
      const isPitcher = item.position.abbreviation === 'P';
      
      const statsObj = person.stats?.find((s: any) => s.type.displayName === 'season' && 
                                                    (s.group.displayName === 'pitching' || s.group.displayName === 'hitting'));
      
      const stats = statsObj?.splits?.[0]?.stat || {};
      
      const commonPlayer = {
        id: person.id,
        name: person.fullName,
        age: person.currentAge || '-',
        nationality: person.birthCountry || '-',
        position: item.position.abbreviation,
      };

      if (isPitcher) {
        pitchers.push({
          ...commonPlayer,
          era: stats.era || '-',
          strikeouts: stats.strikeOuts || '-',
          walks: stats.baseOnBalls || '-',
          whip: stats.whip || '-',
          gamesPlayed: stats.gamesPlayed || '-',
        });
      } else {
        batters.push({
          ...commonPlayer,
          ab: stats.atBats || '-',
          gamesPlayed: stats.gamesPlayed || '-',
          hits: stats.hits || '-',
          hr: stats.homeRuns || '-',
          avg: stats.avg || '-',
          strikeouts: stats.strikeOuts || '-',
          walks: stats.baseOnBalls || '-',
          obp: stats.obp || '-',
        });
      }
    });

    return NextResponse.json({ pitchers, batters });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch team stats' }, { status: 500 });
  }
}
