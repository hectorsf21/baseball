'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface SearchPlayer {
  id: number;
  name: string;
  age: number | string;
  nationality: string;
  position: string;
  teamId?: number;
  isPitcher: boolean;
  ab?: number;
  gamesPlayed?: number;
  hits?: number;
  hr?: number;
  avg?: string;
  obp?: string;
  era?: string;
  whip?: string;
  strikeouts?: number;
  walks?: number;
}

const getPlayerImageUrl = (playerId: number) => `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/w_213,q_auto:best/v1/people/${playerId}/headshot/67/current`;

const getCountryFlagCode = (countryName: string) => {
  const map: Record<string, string> = {
    'USA': 'us', 'Venezuela': 've', 'Dominican Republic': 'do', 'Cuba': 'cu',
    'Puerto Rico': 'pr', 'Mexico': 'mx', 'Japan': 'jp', 'Canada': 'ca',
    'South Korea': 'kr', 'Panama': 'pa', 'Colombia': 'co', 'Curacao': 'cw',
    'Aruba': 'aw', 'Nicaragua': 'ni', 'Bahamas': 'bs', 'Australia': 'au'
  };
  return map[countryName] || 'un';
};

const PlayerSearchCard = ({
  playerNum, 
  player, 
  setPlayer,
  onClear
}: {
  playerNum: 1 | 2;
  player: SearchPlayer | null;
  setPlayer: (p: SearchPlayer) => void;
  onClear: () => void;
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchPlayer[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true); setResults([]); setErrorMsg('');
    try {
      const res = await fetch(`/api/search?name=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (data.error) setErrorMsg('Error interno al buscar.');
      else if (data.players?.length === 0) setErrorMsg('No encontrado.');
      else setResults(data.players || []);
    } catch {
      setErrorMsg('Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  if (player) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col items-center animate-fade-in-up">
        <button onClick={onClear} className="self-end text-xs text-red-500 hover:text-red-700 font-medium mb-2">Quitar X</button>
        <div className="relative w-24 h-24 mb-4">
          <Image src={getPlayerImageUrl(player.id)} alt={player.name} fill className="rounded-full object-cover border-4 border-gray-100 shadow-sm" />
          {player.teamId && (
            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow">
               <img src={`https://www.mlbstatic.com/team-logos/${player.teamId}.svg`} className="w-6 h-6" alt="team"/>
            </div>
          )}
        </div>
        <h3 className="text-xl font-bold text-gray-900 text-center">{player.name}</h3>
        <p className="text-sm text-gray-500 mb-2">{player.position} • {player.age} años</p>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 tooltip" title={player.nationality}>
           {getCountryFlagCode(player.nationality) === 'un' ? '🌐' : <img src={`https://flagcdn.com/w20/${getCountryFlagCode(player.nationality)}.png`} className="w-5" alt="flag"/>}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-300 p-6 flex flex-col justify-center items-center h-full min-h-[300px]">
      <h3 className="text-lg font-bold text-gray-700 mb-4">Jugador {playerNum}</h3>
      <form onSubmit={handleSearch} className="w-full max-w-sm mb-4">
        <div className="relative">
          <input 
            type="search" 
            className="w-full p-3 pl-4 pr-12 text-sm border-gray-300 rounded-xl outline-none ring-blue-500 focus:ring-2 border" 
            placeholder="Buscar por nombre..." 
            value={query} 
            onChange={e => setQuery(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading} className="absolute right-2 top-2  text-gray-400 hover:text-blue-500 p-1">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
        </div>
      </form>
      
      {errorMsg && <p className="text-red-500 text-sm mb-2">{errorMsg}</p>}
      
      {results.length > 0 && (
         <div className="w-full max-w-sm max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-inner divide-y divide-gray-100">
            {results.map(r => (
               <button key={r.id} onClick={() => setPlayer(r)} className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center gap-3">
                 <Image src={getPlayerImageUrl(r.id)} width={32} height={32} className="rounded-full bg-gray-100" alt="img" />
                 <div>
                   <p className="font-semibold text-gray-900 text-sm">{r.name}</p>
                   <p className="text-xs text-gray-500">{r.position} {r.isPitcher ? '(Lanzador)' : '(Bateador)'}</p>
                 </div>
               </button>
            ))}
         </div>
      )}
    </div>
  );
};

export default function ComparadorPage() {
  const [player1, setPlayer1] = useState<SearchPlayer | null>(null);
  const [player2, setPlayer2] = useState<SearchPlayer | null>(null);

  const isComparable = player1 && player2 && (player1.isPitcher === player2.isPitcher);
  const mismatchType = player1 && player2 && (player1.isPitcher !== player2.isPitcher);

  const highlightBetter = (val1: number, val2: number, invertObj: boolean = false) => {
     if (val1 === val2) return ['text-gray-900', 'text-gray-900'];
     
     // Si invertObj es true, MENOR es MEJOR (ej. ERA, WHIP). Si es false, MAYOR es MEJOR.
     const isOneBetter = invertObj ? (val1 < val2) : (val1 > val2);
     
     return isOneBetter 
       ? ['text-green-600 font-bold bg-green-50 rounded px-2', 'text-gray-500 font-medium']
       : ['text-gray-500 font-medium', 'text-green-600 font-bold bg-green-50 rounded px-2'];
  };

  const parseNum = (str: string | number | undefined) => {
    if (str === undefined || str === null || str === '-') return 0;
    return Number(str);
  };

  return (
    <main className="container mx-auto p-4 md:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">Comparativa Head-to-Head</h1>
          <p className="text-gray-500 mt-2">Mide el rendimiento entre dos jugadores.</p>
        </div>
        <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex px-4">
          &larr; Volver al Menú
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <PlayerSearchCard playerNum={1} player={player1} setPlayer={setPlayer1} onClear={() => setPlayer1(null)} />
        <PlayerSearchCard playerNum={2} player={player2} setPlayer={setPlayer2} onClear={() => setPlayer2(null)} />
      </div>

      {mismatchType && (
         <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-center font-medium animate-fade-in-up">
           No se pueden comparar directamente un Bateador y un Lanzador (Pitcher).
         </div>
      )}

      {isComparable && player1 && player2 && (
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-md animate-fade-in-up">
           <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Rendimiento 2026</h2>
           
           <div className="grid grid-cols-3 gap-y-6 text-center">
             <div className="text-lg font-semibold text-gray-400">JUGADOR 1</div>
             <div className="text-lg font-bold text-gray-300">ESTADÍSTICA</div>
             <div className="text-lg font-semibold text-gray-400">JUGADOR 2</div>

             <div className="col-span-3 border-t border-gray-100"></div>

             {/* STATS COMUNES */}
             {(() => {
                const [p1J, p2J] = highlightBetter(parseNum(player1.gamesPlayed), parseNum(player2.gamesPlayed));
                return <>
                  <div className={`text-xl ${p1J}`}>{player1.gamesPlayed || 0}</div>
                  <div className="text-sm font-bold text-gray-700 self-center">JUEGOS (J)</div>
                  <div className={`text-xl ${p2J}`}>{player2.gamesPlayed || 0}</div>
                </>;
             })()}

             {player1.isPitcher ? (
               // PITCHER STATS
               <>
                 {(() => {
                    const [p1ERA, p2ERA] = highlightBetter(parseNum(player1.era), parseNum(player2.era), true); // ERA menor es mejor
                    return <>
                      <div className={`text-xl ${p1ERA}`}>{player1.era || '-'}</div>
                      <div className="text-sm font-bold text-blue-700 self-center tracking-wider">ERA</div>
                      <div className={`text-xl ${p2ERA}`}>{player2.era || '-'}</div>
                    </>;
                 })()}
                 {(() => {
                    const [p1WHIP, p2WHIP] = highlightBetter(parseNum(player1.whip), parseNum(player2.whip), true); // WHIP menor es mejor
                    return <>
                      <div className={`text-xl ${p1WHIP}`}>{player1.whip || '-'}</div>
                      <div className="text-sm font-bold text-gray-700 self-center tracking-wider">WHIP</div>
                      <div className={`text-xl ${p2WHIP}`}>{player2.whip || '-'}</div>
                    </>;
                 })()}
                 {(() => {
                    const [p1K, p2K] = highlightBetter(parseNum(player1.strikeouts), parseNum(player2.strikeouts));
                    return <>
                      <div className={`text-xl ${p1K}`}>{player1.strikeouts || 0}</div>
                      <div className="text-sm font-bold text-gray-700 self-center tracking-wider">PONCHES (K)</div>
                      <div className={`text-xl ${p2K}`}>{player2.strikeouts || 0}</div>
                    </>;
                 })()}
                 {(() => {
                    const [p1BB, p2BB] = highlightBetter(parseNum(player1.walks), parseNum(player2.walks), true); // BB menor es mejor para pitcher
                    return <>
                      <div className={`text-xl ${p1BB}`}>{player1.walks || 0}</div>
                      <div className="text-sm font-bold text-gray-700 self-center tracking-wider">BASE POR BOLAS</div>
                      <div className={`text-xl ${p2BB}`}>{player2.walks || 0}</div>
                    </>;
                 })()}
               </>
             ) : (
               // BATTER STATS
               <>
                 {(() => {
                    const [p1AVG, p2AVG] = highlightBetter(parseNum(player1.avg), parseNum(player2.avg));
                    return <>
                      <div className={`text-xl ${p1AVG}`}>{player1.avg || '.000'}</div>
                      <div className="text-sm font-bold text-blue-700 self-center tracking-wider">PROMEDIO (AVG)</div>
                      <div className={`text-xl ${p2AVG}`}>{player2.avg || '.000'}</div>
                    </>;
                 })()}
                 {(() => {
                    const [p1H, p2H] = highlightBetter(parseNum(player1.hits), parseNum(player2.hits));
                    return <>
                      <div className={`text-xl ${p1H}`}>{player1.hits || 0}</div>
                      <div className="text-sm font-bold text-gray-700 self-center tracking-wider">HITS</div>
                      <div className={`text-xl ${p2H}`}>{player2.hits || 0}</div>
                    </>;
                 })()}
                 {(() => {
                    const [p1HR, p2HR] = highlightBetter(parseNum(player1.hr), parseNum(player2.hr));
                    return <>
                      <div className={`text-xl ${p1HR}`}>{player1.hr || 0}</div>
                      <div className="text-sm font-bold text-gray-700 self-center tracking-wider">JONRONES (HR)</div>
                      <div className={`text-xl ${p2HR}`}>{player2.hr || 0}</div>
                    </>;
                 })()}
                 {(() => {
                    const [p1OBP, p2OBP] = highlightBetter(parseNum(player1.obp), parseNum(player2.obp));
                    return <>
                      <div className={`text-xl ${p1OBP}`}>{player1.obp || '.000'}</div>
                      <div className="text-sm font-bold text-gray-700 self-center tracking-wider">OBP</div>
                      <div className={`text-xl ${p2OBP}`}>{player2.obp || '.000'}</div>
                    </>;
                 })()}
               </>
             )}
           </div>
        </div>
      )}
    </main>
  );
}
