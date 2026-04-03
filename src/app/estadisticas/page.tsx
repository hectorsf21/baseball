'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

type Player = {
  id: number;
  name: string;
  age: number | string;
  nationality: string;
  position: string;
};

type Pitcher = Player & {
  era: string | number;
  strikeouts: number | string;
  walks: number | string;
  whip: string | number;
  gamesPlayed: number | string;
};

type Batter = Player & {
  ab: number | string;
  gamesPlayed: number | string;
  hits: number | string;
  hr: number | string;
  avg: string | number;
  strikeouts: number | string;
  walks: number | string;
  obp: string | number;
};

type Team = {
  id: number;
  name: string;
  abbreviation: string;
};

const getCountryFlagCode = (country: string) => {
  const flags: Record<string, string> = {
    'USA': 'us',
    'Dominican Republic': 'do',
    'Venezuela': 've',
    'Cuba': 'cu',
    'Puerto Rico': 'pr',
    'Mexico': 'mx',
    'Japan': 'jp',
    'Canada': 'ca',
    'Colombia': 'co',
    'South Korea': 'kr',
    'Panama': 'pa',
    'Aruba': 'aw',
    'Curacao': 'cw',
    'Nicaragua': 'ni',
    'Australia': 'au',
    'Taiwan': 'tw',
    'Bahamas': 'bs',
    'Brazil': 'br',
    'Germany': 'de',
    'United Kingdom': 'gb',
    'Italy': 'it',
    'Netherlands': 'nl',
  };
  return flags[country] || 'un';
};

const getPlayerImageUrl = (playerId: number) => 
    `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic_headshot.png/w_150,q_auto:best/v1/people/${playerId}/headshot/67/current`;

export default function EstadisticasPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [pitchers, setPitchers] = useState<Pitcher[]>([]);
  const [batters, setBatters] = useState<Batter[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'bateadores' | 'pitchers'>('bateadores');

  useEffect(() => {
    fetch('/api/teams')
      .then(res => res.json())
      .then(data => {
        if (data.teams) {
          setTeams(data.teams);
          // Auto select first team just if wanted, but placeholder is fine
        }
      });
  }, []);

  useEffect(() => {
    if (!selectedTeam) {
      setPitchers([]);
      setBatters([]);
      return;
    }
    
    setLoading(true);
    fetch(`/api/stats?teamId=${selectedTeam}`)
      .then(res => res.json())
      .then(data => {
        setPitchers(data.pitchers || []);
        setBatters(data.batters || []);
      })
      .finally(() => setLoading(false));
  }, [selectedTeam]);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        
        {/* Header and Select */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-3xl font-light tracking-tight mb-2">Estudio Estadístico</h1>
            <p className="text-gray-500 text-sm">Visualiza las estadísticas más importantes por equipo.</p>
          </div>
          
          <div className="w-full md:w-80">
            <label htmlFor="team-select" className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
              Seleccionar Equipo
            </label>
            <div className="relative">
              <select
                id="team-select"
                className="block w-full appearance-none bg-white border border-gray-300 hover:border-gray-400 px-4 py-3 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
              >
                <option value="">Elige un equipo...</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Content area: Tabs & Table */}
        {selectedTeam ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            
            {/* Tabs */}
            <div className="flex border-b border-gray-100 bg-gray-50/50">
              <button
                className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'bateadores' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setActiveTab('bateadores')}
              >
                Bateadores
              </button>
              <button
                className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'pitchers' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setActiveTab('pitchers')}
              >
                Pitchers
              </button>
            </div>

            {/* Loading / Table */}
            <div className="p-0 overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)]">
              {loading ? (
                <div className="flex justify-center items-center h-64 text-gray-400">
                  <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm font-medium">Cargando estadísticas...</span>
                </div>
              ) : (
                <table className="min-w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 select-none sticky top-0 z-10 shadow-sm">
                    {activeTab === 'bateadores' ? (
                      <tr>
                        <th className="px-6 py-4 font-semibold"></th>
                        <th className="px-6 py-4 font-semibold">Jugador</th>
                        <th className="px-6 py-4 font-semibold">Edad</th>
                        <th className="px-6 py-4 font-semibold text-center">Nacionalidad</th>
                        <th className="px-6 py-4 font-semibold text-right">AB</th>
                        <th className="px-6 py-4 font-semibold text-right">J</th>
                        <th className="px-6 py-4 font-semibold text-right">H</th>
                        <th className="px-6 py-4 font-semibold text-right">HR</th>
                        <th className="px-6 py-4 font-semibold text-right text-blue-600 bg-blue-50/30">AVG</th>
                        <th className="px-6 py-4 font-semibold text-right">OBP</th>
                        <th className="px-6 py-4 font-semibold text-right">K</th>
                        <th className="px-6 py-4 font-semibold text-right">BB</th>
                      </tr>
                    ) : (
                      <tr>
                        <th className="px-6 py-4 font-semibold"></th>
                        <th className="px-6 py-4 font-semibold">Jugador</th>
                        <th className="px-6 py-4 font-semibold text-center">Nacionalidad</th>
                        <th className="px-6 py-4 font-semibold text-right">J</th>
                        <th className="px-6 py-4 font-semibold text-right text-blue-600 bg-blue-50/30">ERA</th>
                        <th className="px-6 py-4 font-semibold text-right">WHIP</th>
                        <th className="px-6 py-4 font-semibold text-right">K</th>
                        <th className="px-6 py-4 font-semibold text-right">BB</th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {activeTab === 'bateadores' ? (
                      batters.length > 0 ? (
                        batters.map((b) => (
                          <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-2">
                              <div className="w-10 h-10 relative">
                                  <Image src={getPlayerImageUrl(b.id)} alt={`Foto de ${b.name}`} fill className="rounded-full object-cover" sizes="(max-width: 768px) 5vw, 3vw" />
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">{b.name}</td>
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
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={12} className="px-6 py-8 text-center text-gray-400">No hay datos disponibles para este equipo</td></tr>
                      )
                    ) : (
                      pitchers.length > 0 ? (
                        pitchers.map((p) => (
                          <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-2">
                              <div className="w-10 h-10 relative">
                                  <Image src={getPlayerImageUrl(p.id)} alt={`Foto de ${p.name}`} fill className="rounded-full object-cover" sizes="(max-width: 768px) 5vw, 3vw" />
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                            <td className="px-6 py-4 text-center tooltip" title={p.nationality}>
                              {getCountryFlagCode(p.nationality) === 'un' ? (
                                <span className="text-xl">🌐</span>
                              ) : (
                                <img src={`https://flagcdn.com/w20/${getCountryFlagCode(p.nationality)}.png`} crossOrigin="anonymous" alt={p.nationality} title={p.nationality} className="mx-auto block" />
                              )}
                            </td>
                            <td className="px-6 py-4 text-right text-gray-500">{p.gamesPlayed}</td>
                            <td className="px-6 py-4 text-right font-semibold text-blue-900 bg-blue-50/10">{p.era}</td>
                            <td className="px-6 py-4 text-right font-medium">{p.whip}</td>
                            <td className="px-6 py-4 text-right text-gray-500">{p.strikeouts}</td>
                            <td className="px-6 py-4 text-right text-gray-500">{p.walks}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-400">No hay datos disponibles para este equipo</td></tr>
                      )
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 text-gray-400">
            <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-lg font-medium text-gray-500">Selecciona un equipo</p>
            <p className="text-sm">Escoge un equipo del selector para ver sus estadísticas completas.</p>
          </div>
        )}
      </div>
    </main>
  );
}
