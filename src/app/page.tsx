// app/page.tsx
import MLBStatsAPI from 'mlb-stats-api';
import StandingsTable from './components/StandingsTable';
import Link from 'next/link';

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
    <main className="container mx-auto p-4 md:p-8 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">Plataforma MLB</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">Bienvenido al sistema de inteligencia y análisis de béisbol. Selecciona el módulo al que deseas ingresar.</p>
      </div>

      {/* Navegación Principal Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-12">
        <Link href="/estadisticas" className="group relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 transform origin-left transition-transform duration-300"></div>
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Estadísticas</h2>
          <p className="text-gray-500 text-sm">Métricas avanzadas por equipo.</p>
        </Link>
        
        <Link href="/anotaciones" className="group relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-green-500 transform origin-left transition-transform duration-300"></div>
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Anotaciones</h2>
          <p className="text-gray-500 text-sm">Seguimiento de jugadores.</p>
        </Link>

        {/* Módulo de Juegos del Día (Nuevo) */}
        <Link href="/juegos" className="group relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-amber-500 transform origin-left transition-transform duration-300"></div>
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Juegos</h2>
          <p className="text-gray-500 text-sm">Encuentros y abridores probables.</p>
        </Link>

        <Link href="/buscar" className="group relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 transform origin-left transition-transform duration-300"></div>
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Buscador</h2>
          <p className="text-gray-500 text-sm">Estadísticas en vivo de jugadores.</p>
        </Link>

        {/* Módulo de Comparar */}
        <Link href="/comparar" className="group relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500 transform origin-left transition-transform duration-300"></div>
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Comparar</h2>
          <p className="text-gray-500 text-sm">Frente a frente de estadísticas.</p>
        </Link>
      </div>


      <div className="border-t border-gray-200 pt-10">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">Clasificación de la Temporada</h2>
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
      </div>
    </main>
  );
}