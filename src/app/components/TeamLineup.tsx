// app/components/TeamLineup.tsx
'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import PlayerStatsTable from './PlayerStatsTable'; 
import FullRosterModal from './FullRosterModal';
import PitcherStatsTable from './PitcherStatsTable';
import FullPitcherModal from './FullPitcherModal';

interface RosterPlayer {
  person: { id: number; fullName: string };
  position: { abbreviation: string };
}

interface Props {
  teamName: string;
  roster: RosterPlayer[];
}

// SIN CAMBIOS EN LAS POSICIONES
const positions = {
  P: { name: 'Pitcher', styles: 'top-[80%] left-[45%] md:top-[68%] md:left-1/2 md:-translate-x-1/2' },
  C: { name: 'Catcher', styles: 'top-[110%] left-[45%] md:top-[83%] md:left-1/2 md:-translate-x-1/2' },
  '1B': { name: 'Primera Base', styles: 'top-[75%] left-[80%] md:top-[60%] md:left-[65%]' },
  '2B': { name: 'Segunda Base', styles: 'top-[60%] left-[60%] md:top-[48%] md:left-[58%]' },
  '3B': { name: 'Tercera Base', styles: 'top-[75%] left-[10%] md:top-[60%] md:left-[35%] md:-translate-x-full' },
  SS: { name: 'Shortstop', styles: 'top-[60%] left-[27%] md:top-[48%] md:left-[42%] md:-translate-x-full' },
  LF: { name: 'Left Fielder', styles: 'top-[45%] left-[10%] md:top-[30%] md:left-[20%]' },
  CF: { name: 'Center Fielder', styles: 'top-[40%] left-[44%] md:top-[20%] md:left-1/2 md:-translate-x-1/2' },
  RF: { name: 'Right Fielder', styles: 'top-[45%] left-[80%] md:top-[30%] md:left-[80%] md:-translate-x-full' },
};

export default function TeamLineup({ teamName, roster }: Props) {
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [isPitcherModalOpen, setIsPitcherModalOpen] = useState(false);

  const handlePositionClick = (pos: string) => {
    setSelectedPosition(pos === selectedPosition ? null : pos);
  };

  const filteredPlayers = selectedPosition
    ? roster.filter((p) => p.position.abbreviation === selectedPosition)
    : [];

  const pitchers = useMemo(
      () => roster.filter(p => p.position.abbreviation === 'P'), 
      [roster]
  );

  return (
    <div className="w-full min-h-screen relative">
      <Image src="/fondo.png" alt="Estadio de Béisbol" layout="fill" objectFit="cover" className="-z-10 brightness-50" />

      {/* El contenedor principal ahora maneja los botones */}
      <div className="relative z-10 container mx-auto p-4 text-white">
        
        <h1 className="text-4xl md:text-6xl font-bold text-center mb-2 drop-shadow-lg">{teamName}</h1>
        <h2 className="text-2xl md:text-3xl text-center mb-4 md:mb-8 drop-shadow-lg">Alineación en el Campo</h2>

        {/* --- INICIO DEL CAMBIO --- */}
        {/*
          Este contenedor ahora maneja los botones.
          - Móvil (por defecto): Es un flex container centrado, con espacio entre botones y margen inferior.
          - Desktop (md:): Vuelve a ser `absolute` en la esquina superior derecha y con diseño de columna.
        */}
        <div className="z-20 flex flex-row flex-wrap justify-center gap-4 mb-8 md:absolute md:top-4 md:right-4 md:flex-col md:space-y-2 md:gap-0 md:mb-0">
          <button
            onClick={() => setIsRosterModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
          >
            Ver Equipo Completo
          </button>
          <button
            onClick={() => setIsPitcherModalOpen(true)}
            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition"
          >
            Ver todos los Pitchers
          </button>
        </div>
        {/* --- FIN DEL CAMBIO --- */}

        <div className="max-w-4xl mx-auto aspect-video relative mb-8">
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

      <FullRosterModal
        isOpen={isRosterModalOpen}
        onClose={() => setIsRosterModalOpen(false)}
        roster={roster}
        teamName={teamName}
      />
      <FullPitcherModal
        isOpen={isPitcherModalOpen}
        onClose={() => setIsPitcherModalOpen(false)}
        pitchers={pitchers}
        teamName={teamName}
      />
    </div>
  );
}