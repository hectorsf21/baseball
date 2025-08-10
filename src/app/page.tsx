// app/page.tsx
import MLBStatsAPI from 'mlb-stats-api';
import StandingsTable from './components/StandingsTable';

// --- INTERFACES (Sin cambios) ---
interface TeamRecord {
  team: { id: number; name: string };
  wins: number;
  losses: number;
  gamesPlayed: number;
  winningPercentage: string;
}

interface DivisionStandings {
  league: { name: string };
  division: { name: string };
  teamRecords: TeamRecord[];
}

export default async function HomePage() {
  const mlbStats = new MLBStatsAPI();

  // --- CORRECCIÓN FINAL APLICADA AQUÍ ---
  // Obtenemos el año actual como un NÚMERO, sin convertirlo a string.
  const currentSeason = new Date().getFullYear();

  const americanLeaguePromise = mlbStats.getStandings({
    params: {
      leagueId: 103,
      season: currentSeason, // Ahora 'currentSeason' es un número
    }
  });

  const nationalLeaguePromise = mlbStats.getStandings({
    params: {
      leagueId: 104,
      season: currentSeason, // Ahora 'currentSeason' es un número
    }
  });

  const [americanLeagueResponse, nationalLeagueResponse] = await Promise.all([
    americanLeaguePromise,
    nationalLeaguePromise,
  ]);
  
  const americanLeagueDivisions: DivisionStandings[] = americanLeagueResponse.data.records;
  const nationalLeagueDivisions: DivisionStandings[] = nationalLeagueResponse.data.records;

  const americanLeagueRecords: TeamRecord[] = americanLeagueDivisions.flatMap(
    (division: DivisionStandings) => division.teamRecords
  );
  const nationalLeagueRecords: TeamRecord[] = nationalLeagueDivisions.flatMap(
    (division: DivisionStandings) => division.teamRecords
  );

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">Estadísticas MLB</h1>
      </div>
      <div className="space-y-12">
        {americanLeagueRecords.length > 0 && (
          <StandingsTable
            leagueName="Liga Americana"
            records={americanLeagueRecords}
          />
        )}
        {nationalLeagueRecords.length > 0 && (
          <StandingsTable
            leagueName="Liga Nacional"
            records={nationalLeagueRecords}
          />
        )}
      </div>
    </main>
  );
}