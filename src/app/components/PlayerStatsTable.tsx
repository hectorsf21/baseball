// app/components/PlayerStatsTable.tsx
'use client';

import { useState, useEffect, useMemo } from 'react'; // Importamos useMemo para optimización
import Image from 'next/image';

// --- DEFINICIÓN DE TIPOS (sin cambios) ---
interface PlayerProp {
    person: { id: number; fullName: string; };
    position: { abbreviation: string; };
}
interface PlayerStats {
    avg: string;
    hr: number;
    rbi: number;
}
interface PlayerDetails {
    stats?: PlayerStats;
    birthCountry?: string;
}
interface Props {
    tableTitle: string;
    players: PlayerProp[];
}

const getPlayerImageUrl = (playerId: number) => 
    `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic_headshot.png/w_150,q_auto:best/v1/people/${playerId}/headshot/67/current`;

export default function PlayerStatsTable({ tableTitle, players }: Props) {
    const [playerDetailsMap, setPlayerDetailsMap] = useState<Map<number, PlayerDetails>>(new Map());
    const [isLoading, setIsLoading] = useState(true);

    // La lógica de useEffect para obtener datos no cambia.
    useEffect(() => {
        // ... (el código de fetch permanece exactamente igual)
        if (players.length === 0) {
            setIsLoading(false);
            return;
        }

        const fetchPlayerStats = async () => {
            setIsLoading(true);
            const newDetailsMap = new Map<number, PlayerDetails>();
            const currentSeason = new Date().getFullYear();

            const statsPromises = players.map(async (player) => {
                const url = `https://statsapi.mlb.com/api/v1/people/${player.person.id}?hydrate=stats(group=[hitting],type=[season],season=${currentSeason})`;
                try {
                    const response = await fetch(url);
                    if (!response.ok) throw new Error(`Respuesta de red no fue ok`);
                    const data = await response.json();
                    
                    const personData = data?.people?.[0];
                    if (!personData) return;

                    const birthCountry = personData.birthCountry || 'N/A';
                    const hittingStats = personData.stats?.find(
                        (statGroup: any) => statGroup.group.displayName === 'hitting'
                    );
                    const seasonStats = hittingStats?.splits?.[0]?.stat;

                    const details: PlayerDetails = {
                        birthCountry: birthCountry,
                    };

                    if (seasonStats) {
                        details.stats = {
                            avg: seasonStats.avg || '.000',
                            hr: seasonStats.homeRuns || 0,
                            rbi: seasonStats.rbi || 0,
                        };
                    }
                    
                    newDetailsMap.set(player.person.id, details);

                } catch (err) {
                    console.error(`Error al procesar datos para el jugador ${player.person.id}:`, err);
                }
            });

            await Promise.all(statsPromises);
            setPlayerDetailsMap(newDetailsMap);
            setIsLoading(false);
        };

        fetchPlayerStats();
    }, [players]);

    // --- SOLUCIÓN: LÓGICA DE ORDENAMIENTO ---
    // Usamos useMemo para que el ordenamiento solo se recalcule si 'players' o 'playerDetailsMap' cambian.
    const sortedPlayers = useMemo(() => {
        // Creamos una copia para no mutar la prop original.
        return [...players].sort((a, b) => {
            // Obtenemos los detalles de cada jugador desde nuestro mapa de estado.
            const detailsA = playerDetailsMap.get(a.person.id);
            const detailsB = playerDetailsMap.get(b.person.id);

            // Obtenemos el AVG de cada uno, convirtiéndolo a número.
            // Si un jugador no tiene AVG, le asignamos 0 para que vaya al final.
            const avgA = parseFloat(detailsA?.stats?.avg || '0');
            const avgB = parseFloat(detailsB?.stats?.avg || '0');

            // Para ordenar de mayor a menor, restamos B - A.
            // Si avgB es mayor, el resultado será positivo y 'b' se colocará antes que 'a'.
            return avgB - avgA;
        });
    }, [players, playerDetailsMap]); // Dependencias de useMemo


    return (
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 md-p-6">
            <h3 className="text-2xl font-bold mb-4">{tableTitle}</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-white">
                    <thead className="text-xs uppercase bg-white/20">
                        <tr>
                            <th scope="col" className="px-2 py-3"></th>
                            <th scope="col" className="px-4 py-3">Jugador</th>
                            <th scope="col" className="px-4 py-3 text-center">POS.</th>
                            <th scope="col" className="px-4 py-3 text-center">País</th>
                            <th scope="col" className="px-6 py-3 text-center">AVG</th>
                            <th scope="col" className="px-6 py-3 text-center">HR</th>
                            <th scope="col" className="px-6 py-3 text-center">RBI</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* SOLUCIÓN FINAL: Mapeamos sobre la nueva lista ordenada */}
                        {sortedPlayers.map((player) => {
                            const details = playerDetailsMap.get(player.person.id);
                            return (
                                <tr key={player.person.id} className="border-b border-white/20 hover:bg-white/10">
                                    <td className="px-2 py-2">
                                        <div className="w-12 h-12 relative">
                                            <Image
                                                src={getPlayerImageUrl(player.person.id)}
                                                alt={`Foto de ${player.person.fullName}`}
                                                fill
                                                className="rounded-full object-cover"
                                                sizes="(max-width: 768px) 5vw, 3vw"
                                            />
                                        </div>
                                    </td>
                                    <th scope="row" className="px-4 py-4 font-medium whitespace-nowrap">
                                        {player.person.fullName}
                                    </th>
                                    <td className="px-4 py-4 text-center font-semibold">
                                        {player.position.abbreviation}
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        {isLoading ? '...' : details?.birthCountry ?? '--'}
                                    </td>
                                    <td className="px-6 py-4 text-center font-mono">
                                        {isLoading ? '...' : details?.stats?.avg ?? '.---'}
                                    </td>
                                    <td className="px-6 py-4 text-center font-mono">
                                        {isLoading ? '...' : details?.stats?.hr ?? '--'}
                                    </td>
                                    <td className="px-6 py-4 text-center font-mono">
                                        {isLoading ? '...' : details?.stats?.rbi ?? '--'}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}