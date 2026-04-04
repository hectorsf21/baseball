import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const group = searchParams.get('group') || 'hitting'; // hitting o pitching

  try {
    const url = `https://statsapi.mlb.com/api/v1/people/${id}/stats?stats=gameLog&group=${group}&season=2026`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.stats || !data.stats[0].splits) {
      return NextResponse.json({ logs: [] });
    }

    // Formatear los logs para la gráfica (orden cronológico)
    const logs = data.stats[0].splits.map((s: any) => ({
      date: s.date,
      opponent: s.opponent.name,
      // Bateo
      hits: s.stat.hits || 0,
      rbi: s.stat.rbi || 0,
      runs: s.stat.runs || 0,
      bb: s.stat.baseOnBalls || 0,
      so: s.stat.strikeOuts || 0,
      // Pitcheo
      er: s.stat.earnedRuns || 0,
      ip: s.stat.inningsPitched || "0.0",
      p_so: s.stat.strikeOuts || 0, // duplicado con so pero para claridad
      p_bb: s.stat.baseOnBalls || 0,
    })).reverse(); // MLB suele devolver del más reciente al más antiguo

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error fetching player logs:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
