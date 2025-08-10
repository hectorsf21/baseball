// app/components/FullRosterModal.tsx
'use client';

// Asegúrate de importar PlayerStatsTable con la ruta correcta
import PlayerStatsTable from './PlayerStatsTable';

// --- DEFINICIONES DE TIPO ---
interface RosterPlayer {
  person: { id: number; fullName: string };
  position: { abbreviation: string };
}

// SOLUCIÓN: Asegúrate de que esta interfaz 'Props' incluya todo lo que le pasas.
interface Props {
  isOpen: boolean;
  onClose: () => void;
  roster: RosterPlayer[];
  teamName: string;
}

export default function FullRosterModal({ isOpen, onClose, roster, teamName }: Props) {
  // Si el modal no está abierto, no renderizamos nada.
  if (!isOpen) {
    return null;
  }

  return (
    // Contenedor del modal (overlay)
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4"
      onClick={onClose} // Cierra el modal si se hace clic en el fondo
    >
      {/* Contenido del modal */}
      <div
        className="bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()} // Evita que el clic en el contenido cierre el modal
      >
        {/* Encabezado del Modal */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Plantilla Completa - {teamName}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            &times;
          </button>
        </div>

        {/* Cuerpo del Modal con scroll */}
        <div className="p-4 overflow-y-auto">
          <PlayerStatsTable
            tableTitle="Todos los Jugadores"
            players={roster}
          />
        </div>
      </div>
    </div>
  );
}