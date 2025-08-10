// app/components/PitcherStatsTable.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';

// --- DEFINICIÓN DE TIPOS ESPECÍFICOS PARA PITCHERS ---
interface PlayerProp {
    person: { id: number; fullName: string; };
    position: { abbreviation: string; };
}
// Estadísticas clave de un pitcher
interface PitcherStats {
    era: string; // Efectividad
    wins: number;
    losses: number;
    strikeOuts: number;
}
interface PlayerDetails {
    stats?: PitcherStats;
    birthCountry?: string;
}
interface Props {
    tableTitle: string;
    players: PlayerProp[];
}

const getPlayerImageUrl = (playerId: number) => 
    `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic_headshot.png/w_150,q_auto:best/v1/people/${playerId}/headshot/67/current`;

export default function PitcherStatsTable({ tableTitle, players }: Props) {
    const [playerDetailsMap, setPlayerDetailsMap] = useState<Map<number, PlayerDetails>>(new Map());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (players.length === 0) {
            setIsLoading(false);
            return;
        }

        const fetchPitcherStats = async () => {
            setIsLoading(true);
            const newDetailsMap = new Map<number, PlayerDetails>();
            const currentSeason = new Date().getFullYear();

            const statsPromises = players.map(async (player) => {
                // CAMBIO CLAVE: Usamos 'group=[pitching]' para obtener las estadísticas de pitcheo
                const url = `https://statsapi.mlb.com/api/v1/people/${player.person.id}?hydrate=stats(group=[pitching],type=[season],season=${currentSeason})`;
                try {
                    const response = await fetch(url);
                    if (!response.ok) throw new Error(`Respuesta de red no fue ok`);
                    const data = await response.json();
                    
                    const personData = data?.people?.[0];
                    if (!personData) return;

                    const birthCountry = personData.birthCountry || 'N/A';
                    // Buscamos el grupo de estadísticas de 'pitching'
                    const pitchingStats = personData.stats?.find(
                        (statGroup: any) => statGroup.group.displayName === 'pitching'
                    );
                    const seasonStats = pitchingStats?.splits?.[0]?.stat;

                    const details: PlayerDetails = {
                        birthCountry: birthCountry,
                    };

                    // Guardamos las estadísticas de pitcheo si existen
                    if (seasonStats) {
                        details.stats = {
                            era: seasonStats.era || '0.00',
                            wins: seasonStats.wins || 0,
                            losses: seasonStats.losses || 0,
                            strikeOuts: seasonStats.strikeOuts || 0,
                        };
                    }
                    
                    newDetailsMap.set(player.person.id, details);
                } catch (err) {
                    console.error(`Error al procesar datos para el pitcher ${player.person.id}:`, err);
                }
            });

            await Promise.all(statsPromises);
            setPlayerDetailsMap(newDetailsMap);
            setIsLoading(false);
        };

        fetchPitcherStats();
    }, [players]);

    // ORDENAMIENTO: Por ERA (menor a mayor). Un ERA más bajo es mejor.
    const sortedPlayers = useMemo(() => {
        return [...players].sort((a, b) => {
            const detailsA = playerDetailsMap.get(a.person.id);
            const detailsB = playerDetailsMap.get(b.person.id);

            // Asignamos un ERA muy alto a los que no tienen para que vayan al final
            const eraA = parseFloat(detailsA?.stats?.era || '99.99');
            const eraB = parseFloat(detailsB?.stats?.era || '99.99');

            // Para ordenar de menor a mayor, restamos A - B.
            return eraA - eraB;
        });
    }, [players, playerDetailsMap]);

    return (
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 md-p-6">
            <h3 className="text-2xl font-bold mb-4">{tableTitle}</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-white">
                    <thead className="text-xs uppercase bg-white/20">
                        <tr>
                            <th scope="col" className="px-2 py-3"></th>
                            <th scope="col" className="px-4 py-3">Pitcher</th>
                            <th scope="col" className="px-4 py-3 text-center">País</th>
                            <th scope="col" className="px-6 py-3 text-center">ERA</th>
                            <th scope="col" className="px-6 py-3 text-center">W</th>
                            <th scope="col" className="px-6 py-3 text-center">L</th>
                            <th scope="col" className="px-6 py-3 text-center">SO</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedPlayers.map((player) => {
                            const details = playerDetailsMap.get(player.person.id);
                            return (
                                <tr key={player.person.id} className="border-b border-white/20 hover:bg-white/10">
                                    <td className="px-2 py-2">
                                        <div className="w-12 h-12 relative">
                                            <Image src={getPlayerImageUrl(player.person.id)} alt={`Foto de ${player.person.fullName}`} fill className="rounded-full object-cover" sizes="(max-width: 768px) 5vw, 3vw" />
                                        </div>
                                    </td>
                                    <th scope="row" className="px-4 py-4 font-medium whitespace-nowrap">{player.person.fullName}</th>
                                    <td className="px-4 py-4 text-center">{isLoading ? '...' : details?.birthCountry ?? '--'}</td>
                                    <td className="px-6 py-4 text-center font-mono">{isLoading ? '...' : details?.stats?.era ?? '-.--'}</td>
                                    <td className="px-6 py-4 text-center font-mono">{isLoading ? '...' : details?.stats?.wins ?? '--'}</td>
                                    <td className="px-6 py-4 text-center font-mono">{isLoading ? '...' : details?.stats?.losses ?? '--'}</td>
                                    <td className="px-6 py-4 text-center font-mono">{isLoading ? '...' : details?.stats?.strikeOuts ?? '--'}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}