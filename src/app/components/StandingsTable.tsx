    // app/components/StandingsTable.tsx
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

// Tipos importados o definidos aquí también
interface TeamRecord {
  team: { id: number; name: string };
  wins: number;
  losses: number;
  gamesPlayed: number;
  winningPercentage: string;
}

interface Props {
  leagueName: string;
  records: TeamRecord[];
}

export default function StandingsTable({ leagueName, records }: Props) {
  const router = useRouter();

  const handleTeamClick = (teamId: number) => {
    router.push(`/equipo/${teamId}`);
  };

  // Ordenar por victorias
  const sortedRecords = [...records].sort((a, b) => b.wins - a.wins);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">{leagueName}</h2>
      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="w-full text-sm text-left text-gray-500 bg-white">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3">Logo</th>
              <th scope="col" className="px-6 py-3">Equipo</th>
              <th scope="col" className="px-6 py-3 text-center">Victorias</th>
              <th scope="col" className="px-6 py-3 text-center">Derrotas</th>
              <th scope="col" className="px-6 py-3 text-center">Jugados</th>
              <th scope="col" className="px-6 py-3 text-center">PCT</th>
            </tr>
          </thead>
          <tbody>
            {sortedRecords.map((record) => (
              <tr
                key={record.team.id}
                className="border-b hover:bg-gray-100 cursor-pointer"
                onClick={() => handleTeamClick(record.team.id)}
              >
                <td className="px-4 py-2">
                  <Image
                    src={`https://www.mlbstatic.com/team-logos/${record.team.id}.svg`}
                    alt={`Logo de ${record.team.name}`}
                    width={32}
                    height={32}
                  />
                </td>
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {record.team.name}
                </th>
                <td className="px-6 py-4 text-center">{record.wins}</td>
                <td className="px-6 py-4 text-center">{record.losses}</td>
                <td className="px-6 py-4 text-center">{record.gamesPlayed}</td>
                <td className="px-6 py-4 text-center">{record.winningPercentage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}