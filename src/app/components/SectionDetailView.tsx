// components/SectionDetailView.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Player, PlayerNoteFromDB, SectionFromDB, EnrichedSearchResult, HitterStats, PitcherStats } from '@/types/index';
import NotesModal from '@/app/components/NotesModal';

// Helper para la URL de la imagen, lo movemos aquí para que sea autocontenido
const getPlayerImageUrl = (playerId: number) => 
    `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic_headshot.png/w_150,q_auto:best/v1/people/${playerId}/headshot/67/current`;

// Definimos las props que este componente necesita recibir
interface SectionDetailViewProps {
  currentSection: SectionFromDB;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  isLoading: boolean;
  enrichedResults: EnrichedSearchResult[];
  handleAddPlayer: (player: Player) => void;
  handleRemovePlayer: (playerNoteId: number) => void;
  handleOpenNotesModal: (playerNote: PlayerNoteFromDB) => void;
  // Props para el Modal
  editingPlayer: PlayerNoteFromDB | null;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  handleSaveNotes: (newNotes: string) => void;
}

export default function SectionDetailView({
  currentSection,
  searchQuery,
  setSearchQuery,
  isLoading,
  enrichedResults,
  handleAddPlayer,
  handleRemovePlayer,
  handleOpenNotesModal,
  editingPlayer,
  isModalOpen,
  setIsModalOpen,
  handleSaveNotes,
}: SectionDetailViewProps) {

  const currentYear = new Date().getFullYear();

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">{currentSection.name}</h1>
        <Link href="/anotaciones" className="text-blue-600 hover:underline">&larr; Volver a Secciones</Link>
      </div>

      {/* Buscador de Jugadores */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 relative">
        <h2 className="text-2xl font-semibold mb-4">Añadir Jugador</h2>
        <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Busca un jugador por nombre..."
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {isLoading && <p className="mt-2 text-gray-500">Buscando...</p>}
        
        {enrichedResults.length > 0 && (
          <ul className="absolute z-10 w-[calc(100%-3rem)] bg-white border border-gray-300 rounded-md mt-1 max-h-[30rem] overflow-y-auto shadow-lg">
            {enrichedResults.map((result) => (
              <li key={result.playerData.id} className="p-3 hover:bg-gray-100 flex justify-between items-center border-b last:border-b-0">
                <div className="flex items-center gap-4">
                  <Image
                    src={result.headshotUrl}
                    alt={`Foto de ${result.playerData.fullName}`}
                    width={50}
                    height={50}
                    className="rounded-full object-cover bg-gray-200"
                  />
                  <div className='flex-grow'>
                    <p className="font-semibold">{result.playerData.fullName}</p>
                    <div className="text-xs text-gray-500 flex gap-3 mt-1 font-mono">
                      {result.stats && result.playerType === 'Hitter' && (<><span>AVG: {(result.stats as HitterStats).avg}</span><span>HR: {(result.stats as HitterStats).hr}</span><span>OPS: {(result.stats as HitterStats).ops}</span></>)}
                      {result.stats && result.playerType === 'Pitcher' && (<><span>ERA: {(result.stats as PitcherStats).era}</span><span>W-L: {(result.stats as PitcherStats).wins}-{(result.stats as PitcherStats).losses}</span><span>SO: {(result.stats as PitcherStats).so}</span></>)}
                      {!result.stats && (<span>Sin stats en la temporada actual.</span>)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleAddPlayer(result.playerData)}
                  className="bg-green-500 text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-green-600 transition-colors flex-shrink-0"
                >Añadir</button>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Tabla de Jugadores Agregados */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Jugadores en esta sección</h2>
        <div className="overflow-x-auto">
          {currentSection.players.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-100 text-sm">
                  <th className="p-3 w-16">Foto</th>
                  <th className="p-3">Nombre</th>
                  <th className="p-3">País</th>
                  <th className="p-3">Pos.</th>
                  <th className="p-3">Equipo</th>
                  <th className="p-3">{`Estadísticas (${currentYear})`}</th>
                  <th className="p-3">Notas</th>
                  <th className="p-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentSection.players.map((pNote) => {
                  const player = pNote.playerData;
                  const yearByYearSplits = player.stats?.[0]?.splits;
                  const lastSeasonSplit = yearByYearSplits && yearByYearSplits.length > 0 ? yearByYearSplits[yearByYearSplits.length - 1] : null;
                  const stats = lastSeasonSplit?.stat;
                  const season = lastSeasonSplit?.season;
                  const playerType = player.primaryPosition.type;
                  return (
                    <tr key={pNote.id} className="border-b">
                      <td className="p-2"><Image src={getPlayerImageUrl(player.id)} alt={`Foto de ${player.fullName}`} width={40} height={40} className="rounded-full object-cover"/></td>
                      <td className="p-3 font-medium">{player.fullName}</td>
                      <td className="p-3">{player.birthCountry || '--'}</td>
                      <td className="p-3">{player.primaryPosition.abbreviation}</td>
                      <td className="p-3">{player.currentTeam?.name || 'N/A'}</td>
                      <td className="p-3 font-mono text-xs">
                        {season && <div className="text-gray-500 text-[10px] mb-1">({season})</div>}
                        {stats && playerType !== 'Pitcher' && (<div className="flex flex-col"><span>AVG: {stats.avg}</span><span>HR: {stats.homeRuns}</span><span>OPS: {stats.ops}</span></div>)}
                        {stats && playerType === 'Pitcher' && (<div className="flex flex-col"><span>ERA: {stats.era}</span><span>W-L: {stats.wins}-{stats.losses}</span><span>SO: {stats.strikeOuts}</span></div>)}
                        {!stats && (<span className="text-gray-400">N/A</span>)}
                      </td>
                      <td className="p-3"><button onClick={() => handleOpenNotesModal(pNote)} className="text-blue-600 hover:underline">Ver/Editar ({pNote.notes.length > 0 ? 'Con notas' : 'Vacías'})</button></td>
                      <td className="p-3 text-center"><button onClick={() => handleRemovePlayer(pNote.id)} className="text-red-500 hover:text-red-700 font-semibold text-sm">Quitar</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 py-4">Aún no has agregado jugadores a esta sección.</p>
          )}
        </div>
      </div>

      {/* Modal de Notas */}
      {editingPlayer && (
        <NotesModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            notes={editingPlayer.notes}
            onSave={handleSaveNotes}
            playerName={editingPlayer.playerData.fullName}
        />
      )}
    </main>
  );
}