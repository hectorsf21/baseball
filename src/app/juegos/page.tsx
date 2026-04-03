'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Game {
  gamePk: number;
  gameDate: string;
  status: string;
  venue: string;
  teams: {
    away: TeamData;
    home: TeamData;
  };
}

interface TeamData {
  id: number;
  name: string;
  score?: number;
  wins: number;
  losses: number;
  pct: string;
  avg: string;
  probablePitcher: {
    id: number;
    name: string;
    whip: string;
    era: string;
    gamesPlayed: number;
  } | null;
}

export default function JuegosPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/games')
      .then(res => res.json())
      .then(data => {
        setGames(data.games || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getTeamLogo = (teamId: number) => `https://www.mlbstatic.com/team-logos/${teamId}.svg`;
  const getPitcherImg = (id: number) => `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${id}/headshot/67/current`;

  const formatVenezuelaTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      // Venezuela es UTC-4 fijo (no cambia por ahorro de luz)
      return date.toLocaleTimeString('es-VE', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true,
        timeZone: 'America/Caracas'
      });
    } catch (e) {
      return '';
    }
  };

  return (
    <main className="container mx-auto p-4 md:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">Juegos de Hoy</h1>
          <p className="text-gray-500 mt-2">Calendario oficial, abridores probables y récords de equipo.</p>
        </div>
        <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex px-4">
          &larr; Volver al Menú
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : games.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 text-lg">No hay juegos programados para hoy.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {games.map(game => (
            <div key={game.gamePk} className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gray-50/50 px-6 py-3 border-b border-gray-100 flex justify-between items-center text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-400 uppercase tracking-widest">{game.status}</span>
                  <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                    {formatVenezuelaTime(game.gameDate)} VET
                  </span>
                </div>
                <span className="text-gray-500 font-medium">{game.venue}</span>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  {/* Away Team */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img src={getTeamLogo(game.teams.away.id)} alt="" className="w-12 h-12" />
                      <div>
                        <h3 className="font-bold text-gray-900">{game.teams.away.name}</h3>
                        <p className="text-xs text-gray-500 font-semibold">{game.teams.away.wins}-{game.teams.away.losses} ({game.teams.away.pct}) <span className="text-blue-600 ml-1">AVG: {game.teams.away.avg}</span></p>
                      </div>
                    </div>
                    {game.teams.away.score !== undefined && <span className="text-2xl font-black text-gray-900">{game.teams.away.score}</span>}
                  </div>

                  {/* Home Team */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img src={getTeamLogo(game.teams.home.id)} alt="" className="w-12 h-12" />
                      <div>
                        <h3 className="font-bold text-gray-900">{game.teams.home.name}</h3>
                        <p className="text-xs text-gray-500 font-semibold">{game.teams.home.wins}-{game.teams.home.losses} ({game.teams.home.pct}) <span className="text-blue-600 ml-1">AVG: {game.teams.home.avg}</span></p>
                      </div>
                    </div>
                    {game.teams.home.score !== undefined && <span className="text-2xl font-black text-gray-900">{game.teams.home.score}</span>}
                  </div>
                </div>
              </div>

              {/* Pitchers Section */}
              <div className="bg-blue-50/30 p-6 border-t border-gray-100">
                <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-4">Duelo de Abridores</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="relative w-10 h-10 flex-shrink-0">
                      {game.teams.away.probablePitcher ? (
                        <Image src={getPitcherImg(game.teams.away.probablePitcher.id)} alt="" fill className="rounded-full bg-white object-cover border border-blue-100" />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gray-200 border border-gray-300" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">VISITANTE</p>
                      <p className="text-xs font-bold text-gray-800 truncate">{game.teams.away.probablePitcher?.name || 'Por anunciar'}</p>
                      {game.teams.away.probablePitcher && (
                        <div className="flex flex-wrap gap-2 mt-1">
                          <p className="text-[10px] font-bold text-blue-500 bg-blue-50 px-1 rounded whitespace-nowrap">WHIP: {game.teams.away.probablePitcher.whip}</p>
                          <p className="text-[10px] font-bold text-red-500 bg-red-50 px-1 rounded whitespace-nowrap">ERA: {game.teams.away.probablePitcher.era}</p>
                          <p className="text-[10px] font-bold text-gray-500 bg-gray-50 px-1 rounded whitespace-nowrap">J: {game.teams.away.probablePitcher.gamesPlayed}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="relative w-10 h-10 flex-shrink-0">
                      {game.teams.home.probablePitcher ? (
                        <Image src={getPitcherImg(game.teams.home.probablePitcher.id)} alt="" fill className="rounded-full bg-white object-cover border border-blue-100" />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gray-200 border border-gray-300" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">LOCAL</p>
                      <p className="text-xs font-bold text-gray-800 truncate">{game.teams.home.probablePitcher?.name || 'Por anunciar'}</p>
                      {game.teams.home.probablePitcher && (
                        <div className="flex flex-wrap gap-2 mt-1">
                          <p className="text-[10px] font-bold text-blue-500 bg-blue-50 px-1 rounded whitespace-nowrap">WHIP: {game.teams.home.probablePitcher.whip}</p>
                          <p className="text-[10px] font-bold text-red-500 bg-red-50 px-1 rounded whitespace-nowrap">ERA: {game.teams.home.probablePitcher.era}</p>
                          <p className="text-[10px] font-bold text-gray-500 bg-gray-50 px-1 rounded whitespace-nowrap">J: {game.teams.home.probablePitcher.gamesPlayed}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
