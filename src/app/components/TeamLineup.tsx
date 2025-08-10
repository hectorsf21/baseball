// app/components/TeamLineup.tsx
'use client';

import { useState, useMemo } from 'react'; // useMemo es útil aquí
import Image from 'next/image';
import PlayerStatsTable from './PlayerStatsTable'; 
import FullRosterModal from './FullRosterModal';
import PitcherStatsTable from './PitcherStatsTable';
import FullPitcherModal from './FullPitcherModal'; // Importamos el NUEVO modal

interface RosterPlayer {
  person: { id: number; fullName: string };
  position: { abbreviation: string };
}

interface Props {
  teamName: string;
  roster: RosterPlayer[];
}

const positions = {
  P: { name: 'Pitcher', styles: 'top-[68%] left-1/2 -translate-x-1/2' },
  C: { name: 'Catcher', styles: 'top-[83%] left-1/2 -translate-x-1/2' },
  '1B': { name: 'Primera Base', styles: 'top-[60%] left-[65%]' },
  '2B': { name: 'Segunda Base', styles: 'top-[48%] left-[58%]' },
  '3B': { name: 'Tercera Base', styles: 'top-[60%] left-[35%] -translate-x-full' },
  SS: { name: 'Shortstop', styles: 'top-[48%] left-[42%] -translate-x-full' },
  LF: { name: 'Left Fielder', styles: 'top-[30%] left-[20%]' },
  CF: { name: 'Center Fielder', styles: 'top-[20%] left-1/2 -translate-x-1/2' },
  RF: { name: 'Right Fielder', styles: 'top-[30%] left-[80%] -translate-x-full' },
};

export default function TeamLineup({ teamName, roster }: Props) {
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  // NUEVO ESTADO para el modal de pitchers
  const [isPitcherModalOpen, setIsPitcherModalOpen] = useState(false);

  const handlePositionClick = (pos: string) => {
    setSelectedPosition(pos === selectedPosition ? null : pos);
  };

  const filteredPlayers = selectedPosition
    ? roster.filter((p) => p.position.abbreviation === selectedPosition)
    : [];

  // NUEVA LÓGICA: Pre-filtramos la lista de pitchers una sola vez
  const pitchers = useMemo(
      () => roster.filter(p => p.position.abbreviation === 'P'), 
      [roster]
  );

  return (
    <div className="w-full min-h-screen relative">
      <Image src="/fondo.png" alt="Estadio de Béisbol" layout="fill" objectFit="cover" className="-z-10 brightness-50" />

      {/* Contenedor para los botones */}
      <div className="absolute top-4 right-4 z-20 flex flex-col space-y-2">
        <button
          onClick={() => setIsRosterModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          Ver Equipo Completo
        </button>
        {/* NUEVO BOTÓN con su onClick */}
        <button
          onClick={() => setIsPitcherModalOpen(true)}
          className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition"
        >
          Ver todos los Pitchers
        </button>
      </div>

      <div className="relative z-10 container mx-auto p-4 text-white">
        <h1 className="text-4xl md:text-6xl font-bold text-center mb-2 drop-shadow-lg">{teamName}</h1>
        <h2 className="text-2xl md:text-3xl text-center mb-8 drop-shadow-lg">Alineación en el Campo</h2>

        <div className="max-w-4xl mx-auto aspect-video relative mb-8">
          {/* ... (código de los círculos de posición sin cambios) ... */}
           {Object.entries(positions).map(([abbr, { styles }]) => (
            <div
              key={abbr}
              className={`absolute transform transition-all duration-300 ${styles}`}
              onClick={() => handlePositionClick(abbr)}
            >
              <div
                className={`flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-white/80 backdrop-blur-sm rounded-full cursor-pointer shadow-lg hover:bg-white hover:scale-110 ${
                  selectedPosition === abbr ? 'ring-4 ring-blue-400' : ''
                }`}
              >
                <span className="font-bold text-black text-lg md:text-xl">{abbr}</span>
              </div>
            </div>
          ))}
        </div>

        {selectedPosition && (
          <div className="mt-8 animate-fade-in">
            {/* Si la posición seleccionada es 'P', mostramos la tabla de pitchers, si no, la de bateadores */}
            {selectedPosition === 'P' ? (
                 <PitcherStatsTable
                    tableTitle={`Jugadores de ${positions[selectedPosition as keyof typeof positions].name}`}
                    players={filteredPlayers}
                />
            ) : (
                <PlayerStatsTable
                    tableTitle={`Jugadores de ${positions[selectedPosition as keyof typeof positions].name}`}
                    players={filteredPlayers}
                />
            )}
          </div>
        )}
      </div>

      {/* Renderizamos ambos modales (solo uno será visible a la vez) */}
      <FullRosterModal
        isOpen={isRosterModalOpen}
        onClose={() => setIsRosterModalOpen(false)}
        roster={roster}
        teamName={teamName}
      />
      {/* NUEVO MODAL RENDERIZADO, le pasamos la lista filtrada de pitchers */}
      <FullPitcherModal
        isOpen={isPitcherModalOpen}
        onClose={() => setIsPitcherModalOpen(false)}
        pitchers={pitchers}
        teamName={teamName}
      />
    </div>
  );
}