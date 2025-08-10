// app/components/FullPitcherModal.tsx
'use client';

import PitcherStatsTable from './PitcherStatsTable'; // Importamos la NUEVA tabla

interface RosterPlayer {
  person: { id: number; fullName: string };
  position: { abbreviation: string };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pitchers: RosterPlayer[]; // Recibirá una lista pre-filtrada de pitchers
  teamName: string;
}

export default function FullPitcherModal({ isOpen, onClose, pitchers, teamName }: Props) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Plantilla de Pitchers - {teamName}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>
        <div className="p-4 overflow-y-auto">
          {/* Llamamos a nuestro nuevo componente de tabla de pitchers */}
          <PitcherStatsTable
            tableTitle="Todos los Pitchers del Roster"
            players={pitchers}
          />
        </div>
      </div>
    </div>
  );
}