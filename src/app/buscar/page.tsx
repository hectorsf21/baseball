'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PlayerPerformanceChart from '@/app/components/PlayerPerformanceChart';

interface SearchPlayer {
  id: number;
  name: string;
  age: number | string;
  nationality: string;
  position: string;
  teamId?: number;
  isPitcher: boolean;
  // Bateador Stats
  ab?: number;
  gamesPlayed?: number;
  hits?: number;
  hr?: number;
  avg?: string;
  obp?: string;
  // Pitcher Stats
  era?: string;
  whip?: string;
  // Shared Stats
  strikeouts?: number;
  walks?: number;
}

export default function BuscarJugadoresPage() {
  const [query, setQuery] = useState('');
  const [players, setPlayers] = useState<SearchPlayer[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<{ id: number, name: string, group: 'hitting' | 'pitching' } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setPlayers(null);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/search?name=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      
      if (data.error) {
        setErrorMsg('Hubo un error al buscar el jugador.');
      } else if (data.players?.length === 0) {
        setErrorMsg('No se encontraron jugadores con ese nombre.');
      } else {
        setPlayers(data.players);
      }
    } catch (err) {
      setErrorMsg('Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  const getPlayerImageUrl = (playerId: number) => {
    return `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${playerId}/headshot/67/current`;
  };

  const getCountryFlagCode = (countryName: string) => {
    const map: Record<string, string> = {
      'USA': 'us', 'Venezuela': 've', 'Dominican Republic': 'do', 'Cuba': 'cu',
      'Puerto Rico': 'pr', 'Mexico': 'mx', 'Japan': 'jp', 'Canada': 'ca',
      'South Korea': 'kr', 'Panama': 'pa', 'Colombia': 'co', 'Curacao': 'cw',
      'Aruba': 'aw', 'Nicaragua': 'ni', 'Bahamas': 'bs', 'Australia': 'au'
    };
    return map[countryName] || 'un';
  };

  const batters = players?.filter(p => !p.isPitcher) || [];
  const pitchers = players?.filter(p => p.isPitcher) || [];

  return (
    <main className="container mx-auto p-4 md:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">Buscador Oficial</h1>
          <p className="text-gray-500 mt-2">Encuentra a cualquier jugador por nombre y revisa sus números.</p>
        </div>
        <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex px-4">
          &larr; Volver al Menú
        </Link>
      </div>

      {/* Barra de Búsqueda */}
      <form onSubmit={handleSearch} className="mb-10 max-w-3xl">
        <label htmlFor="search" className="mb-2 text-sm font-medium text-gray-900 sr-only">Busca un Jugador</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="search"
            id="search"
            className="block w-full p-4 pl-12 text-sm text-gray-900 border border-gray-300 rounded-2xl bg-gray-50 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
            placeholder="Ejemplo: Aaron Judge, Shohei Ohtani..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading} className="text-white absolute right-2.5 bottom-2.5 bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-xl text-sm px-5 py-2 transition-colors disabled:bg-blue-300">
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </form>

      {/* Mensajes de Error */}
      {errorMsg && (
        <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200">
          <span className="font-medium">Atención:</span> {errorMsg}
        </div>
      )}

      {/* Resultados de Búsqueda */}
      {players && players.length > 0 && (
        <div className="animate-fade-in-up space-y-12">
          
          {/* Resultados de Bateadores */}
          {batters.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
               <div className="bg-gray-50/80 border-b border-gray-100 px-6 py-4">
                  <h2 className="text-lg font-bold text-gray-800">Resultados: Bateadores</h2>
               </div>
               <div className="p-0 overflow-x-auto">
                 <table className="min-w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 select-none">
                      <tr>
                        <th className="px-6 py-4 font-semibold"></th>
                        <th className="px-6 py-4 font-semibold">Jugador</th>
                        <th className="px-6 py-4 font-semibold text-center">Eqp.</th>
                        <th className="px-6 py-4 font-semibold text-center">Pos.</th>
                        <th className="px-6 py-4 font-semibold">Edad</th>
                        <th className="px-6 py-4 font-semibold text-center">Nac.</th>
                        <th className="px-6 py-4 font-semibold text-right">AB</th>
                        <th className="px-6 py-4 font-semibold text-right">J</th>
                        <th className="px-6 py-4 font-semibold text-right">H</th>
                        <th className="px-6 py-4 font-semibold text-right">HR</th>
                        <th className="px-6 py-4 font-semibold text-right text-blue-600 bg-blue-50/30">AVG</th>
                        <th className="px-6 py-4 font-semibold text-right">OBP</th>
                        <th className="px-6 py-4 font-semibold text-right">K</th>
                        <th className="px-6 py-4 font-semibold text-right">BB</th>
                        <th className="px-6 py-4 font-semibold text-right">Análisis</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {batters.map((b) => (
                        <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-2">
                            <div className="w-10 h-10 relative">
                                <Image src={getPlayerImageUrl(b.id)} alt={`Foto de ${b.name}`} fill className="rounded-full object-cover" sizes="(max-width: 768px) 5vw, 3vw" />
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900">{b.name}</td>
                          <td className="px-6 py-4 text-center">
                            {b.teamId ? (
                              <img src={`https://www.mlbstatic.com/team-logos/${b.teamId}.svg`} alt="Equipo" className="w-8 h-8 mx-auto" />
                            ) : (
                               <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center font-bold text-gray-700">{b.position}</td>
                          <td className="px-6 py-4 text-gray-500">{b.age}</td>
                          <td className="px-6 py-4 text-center tooltip" title={b.nationality}>
                            {getCountryFlagCode(b.nationality) === 'un' ? (
                              <span className="text-xl">🌐</span>
                            ) : (
                              <img src={`https://flagcdn.com/w20/${getCountryFlagCode(b.nationality)}.png`} crossOrigin="anonymous" alt={b.nationality} title={b.nationality} className="mx-auto block" />
                            )}
                          </td>
                          <td className="px-6 py-4 text-right text-gray-500">{b.ab}</td>
                          <td className="px-6 py-4 text-right text-gray-500">{b.gamesPlayed}</td>
                          <td className="px-6 py-4 text-right text-gray-500">{b.hits}</td>
                          <td className="px-6 py-4 text-right font-medium">{b.hr}</td>
                          <td className="px-6 py-4 text-right font-semibold text-blue-900 bg-blue-50/10">{b.avg}</td>
                          <td className="px-6 py-4 text-right text-gray-500">{b.obp}</td>
                          <td className="px-6 py-4 text-right text-gray-500">{b.strikeouts}</td>
                          <td className="px-6 py-4 text-right text-gray-500">{b.walks}</td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => setSelectedPlayer({ id: b.id, name: b.name, group: 'hitting' })}
                              className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-full transition-colors flex items-center gap-1 ml-auto font-bold text-xs"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                              Gráfica
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
            </div>
          )}

          {/* Resultados de Pitchers */}
          {pitchers.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
               <div className="bg-gray-50/80 border-b border-gray-100 px-6 py-4">
                  <h2 className="text-lg font-bold text-gray-800">Resultados: Lanzadores (Pitchers)</h2>
               </div>
               <div className="p-0 overflow-x-auto">
                 <table className="min-w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 select-none">
                      <tr>
                        <th className="px-6 py-4 font-semibold"></th>
                        <th className="px-6 py-4 font-semibold">Jugador</th>
                        <th className="px-6 py-4 font-semibold text-center">Eqp.</th>
                        <th className="px-6 py-4 font-semibold text-center">Pos.</th>
                        <th className="px-6 py-4 font-semibold">Edad</th>
                        <th className="px-6 py-4 font-semibold text-center">Nac.</th>
                        <th className="px-6 py-4 font-semibold text-right">J</th>
                        <th className="px-6 py-4 font-semibold text-right text-blue-600 bg-blue-50/30">ERA</th>
                        <th className="px-6 py-4 font-semibold text-right">WHIP</th>
                        <th className="px-6 py-4 font-semibold text-right">K</th>
                        <th className="px-6 py-4 font-semibold text-right">BB</th>
                        <th className="px-6 py-4 font-semibold text-right">Análisis</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {pitchers.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-2">
                            <div className="w-10 h-10 relative">
                                <Image src={getPlayerImageUrl(p.id)} alt={`Foto de ${p.name}`} fill className="rounded-full object-cover" sizes="(max-width: 768px) 5vw, 3vw" />
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                          <td className="px-6 py-4 text-center">
                            {p.teamId ? (
                              <img src={`https://www.mlbstatic.com/team-logos/${p.teamId}.svg`} alt="Equipo" className="w-8 h-8 mx-auto" />
                            ) : (
                               <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center font-bold text-gray-700">{p.position}</td>
                          <td className="px-6 py-4 text-gray-500">{p.age}</td>
                          <td className="px-6 py-4 text-center tooltip" title={p.nationality}>
                            {getCountryFlagCode(p.nationality) === 'un' ? (
                              <span className="text-xl">🌐</span>
                            ) : (
                              <img src={`https://flagcdn.com/w20/${getCountryFlagCode(p.nationality)}.png`} crossOrigin="anonymous" alt={p.nationality} title={p.nationality} className="mx-auto block" />
                            )}
                          </td>
                          <td className="px-6 py-4 text-right text-gray-500">{p.gamesPlayed}</td>
                          <td className="px-6 py-4 text-right font-semibold text-blue-900 bg-blue-50/10">{p.era}</td>
                          <td className="px-6 py-4 text-right text-gray-500">{p.whip}</td>
                          <td className="px-6 py-4 text-right text-gray-500">{p.strikeouts}</td>
                          <td className="px-6 py-4 text-right text-gray-500">{p.walks}</td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => setSelectedPlayer({ id: p.id, name: p.name, group: 'pitching' })}
                              className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-full transition-colors flex items-center gap-1 ml-auto font-bold text-xs"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                              Gráfica
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
            </div>
          )}

        </div>
      )}

      {/* Modal de Gráfica */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-xl font-black text-gray-900">{selectedPlayer.name}</h2>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Análisis de Desempeño 2026</p>
              </div>
              <button 
                onClick={() => setSelectedPlayer(null)}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-8">
              <PlayerPerformanceChart 
                playerId={selectedPlayer.id} 
                playerName={selectedPlayer.name} 
                group={selectedPlayer.group} 
              />
            </div>
            <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setSelectedPlayer(null)}
                className="px-6 py-2 bg-gray-900 text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-colors"
              >
                Cerrar Análisis
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
