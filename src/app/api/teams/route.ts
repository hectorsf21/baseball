import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://statsapi.mlb.com/api/v1/teams?sportId=1');
    const data = await res.json();
    
    // Filtramos solo para asegurar (aunque sportId=1 ya es MLB)
    // Devolvemos id y name
    const teams = data.teams.map((t: any) => ({
      id: t.id,
      name: t.name,
      abbreviation: t.abbreviation
    })).sort((a: any, b: any) => a.name.localeCompare(b.name));

    return NextResponse.json({ teams });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}
