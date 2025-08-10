// app/equipo/[equipoId]/page.tsx
import MLBStatsAPI from 'mlb-stats-api';
import TeamLineup from '@/app/components/TeamLineup';

interface RosterPlayer {
  person: { id: number; fullName: string };
  position: { abbreviation: string };
}

interface Team {
  id: number;
  name: string;
}

async function getTeamData(teamId: string) {
  const mlbStats = new MLBStatsAPI();

  const [teamInfoResponse, rosterResponse] = await Promise.all([
    mlbStats.getTeam({ pathParams: { teamId } }),
    mlbStats.getTeamRoster({ pathParams: { teamId } }),
  ]);

  const team: Team = teamInfoResponse.data.teams[0];
  const roster: RosterPlayer[] = rosterResponse.data.roster;

  if (!team || !roster) {
    throw new Error('No se pudo encontrar la información del equipo o su roster.');
  }

  return { team, roster };
}

// ✅ Aquí usamos el nombre correcto `equipoId` y lo recibimos como Promise
export default async function TeamPage({
  params,
}: {
  params: Promise<{ equipoId: string }>;
}) {
  const { equipoId } = await params;
  const { team, roster } = await getTeamData(equipoId);

  return (
    <main>
      <TeamLineup teamName={team.name} roster={roster} />
    </main>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ equipoId: string }>;
}) {
  const { equipoId } = await params;
  const { team } = await getTeamData(equipoId);

  return {
    title: `${team.name} | Alineación`,
  };
}
