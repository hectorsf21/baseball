// app/anotaciones/[sectionId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { Player, PlayerNoteFromDB, SectionFromDB, EnrichedSearchResult, HitterStats, PitcherStats } from '@/types/index';
import SectionDetailView from '@/app/components/SectionDetailView'; // Importamos el nuevo componente

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// La URL de la imagen se define ahora dentro del componente de vista,
// pero la dejamos aquí por si la necesitas en otro lugar.
const getPlayerImageUrl = (playerId: number) => 
    `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic_headshot.png/w_150,q_auto:best/v1/people/${playerId}/headshot/67/current`;

export default function SectionDetailPage() {
  const params = useParams();
  const sectionId = params.sectionId as string;

  const { data: currentSection, error, mutate } = useSWR<SectionFromDB>(
    sectionId ? `/api/sections/${sectionId}` : null,
    fetcher
  );

  // --- ESTADO Y LÓGICA ---
  const [searchQuery, setSearchQuery] = useState('');
  const [enrichedResults, setEnrichedResults] = useState<EnrichedSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<PlayerNoteFromDB | null>(null);

  // --- useEffect para la BÚSQUEDA ---
   useEffect(() => {
    const handler = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsLoading(true);
        setEnrichedResults([]);
        try {
          const searchURL = `https://statsapi.mlb.com/api/v1/people/search?names=${encodeURIComponent(searchQuery)}`;
          const searchResponse = await fetch(searchURL);
          if (!searchResponse.ok) throw new Error('Búsqueda inicial fallida');
          const searchData = await searchResponse.json();
          
          if (!searchData.people || searchData.people.length === 0) {
            setEnrichedResults([]);
            return;
          }

          const detailPromises = searchData.people.map((player: Player) => {
            // --- ESTA ES LA LÍNEA MÁS IMPORTANTE Y LA CORRECCIÓN FINAL ---
            // Pedimos TODO: el equipo (currentTeam) Y las estadísticas (stats yearByYear).
            return fetch(`https://statsapi.mlb.com/api/v1/people/${player.id}?hydrate=currentTeam,stats(group=[hitting,pitching],type=[yearByYear])`).then(res => res.json());
          });

          const detailResults = await Promise.all(detailPromises);
          
          const finalResults = detailResults.map(result => {
            const fullPlayerObject = result.people[0];
            const playerType: 'Hitter' | 'Pitcher' = fullPlayerObject.primaryPosition.type === 'Pitcher' ? 'Pitcher' : 'Hitter';
            
            const yearByYearSplits = fullPlayerObject.stats?.[0]?.splits;
            const lastSeasonSplit = yearByYearSplits && yearByYearSplits.length > 0 ? yearByYearSplits[yearByYearSplits.length - 1] : null;
            const statsGroup = lastSeasonSplit?.stat;
            let playerStats: HitterStats | PitcherStats | null = null;

            if (statsGroup) {
              if (playerType === 'Pitcher') {
                playerStats = { era: statsGroup.era || '0.00', wins: statsGroup.wins || 0, losses: statsGroup.losses || 0, so: statsGroup.strikeOuts || 0 };
              } else {
                playerStats = { avg: statsGroup.avg || '.000', hr: statsGroup.homeRuns || 0, ops: statsGroup.ops || '.000' };
              }
            }

            return {
              playerData: fullPlayerObject,
              headshotUrl: getPlayerImageUrl(fullPlayerObject.id),
              playerType: playerType,
              stats: playerStats
            };
          });

          setEnrichedResults(finalResults);

        } catch (error) {
          console.error("Error al enriquecer los datos de búsqueda:", error);
          setEnrichedResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setEnrichedResults([]);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);
  // --- MANEJADORES DE EVENTOS ---
  const handleAddPlayer = async (playerToAdd: Player) => {
    if (currentSection?.players.some(p => p.playerData.id === playerToAdd.id)) {
      alert('Este jugador ya está en la lista.');
      return;
    }
    try {
      await fetch(`/api/sections/${sectionId}/players`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ playerData: playerToAdd }) });
      mutate();
      setSearchQuery('');
      setEnrichedResults([]);
    } catch (error) {
      console.error('Error al añadir jugador:', error);
      alert('Hubo un problema al añadir el jugador. Por favor, inténtalo de nuevo.');
    }
  };

  const handleRemovePlayer = async (playerNoteId: number) => {
    if (confirm('¿Seguro que quieres quitar a este jugador de la lista?')) {
        await fetch(`/api/playernotes/${playerNoteId}`, { method: 'DELETE' });
        mutate();
    }
  };

  const handleOpenNotesModal = (playerNote: PlayerNoteFromDB) => {
    setEditingPlayer(playerNote);
    setIsModalOpen(true);
  };
  
  const handleSaveNotes = async (newNotes: string) => {
    if (!editingPlayer) return;
    await fetch(`/api/playernotes/${editingPlayer.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes: newNotes }) });
    mutate();
    setIsModalOpen(false);
    setEditingPlayer(null);
  };

  // --- RENDERIZADO ---
  if (error) return <div className="text-center p-8 text-red-600">Error al cargar la sección.</div>;
  if (!currentSection) return <div className="text-center p-8">Cargando...</div>;

  return (
    <SectionDetailView
      currentSection={currentSection}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      isLoading={isLoading}
      enrichedResults={enrichedResults}
      handleAddPlayer={handleAddPlayer}
      handleRemovePlayer={handleRemovePlayer}
      handleOpenNotesModal={handleOpenNotesModal}
      editingPlayer={editingPlayer}
      isModalOpen={isModalOpen}
      setIsModalOpen={setIsModalOpen}
      handleSaveNotes={handleSaveNotes}
    />
  );
}