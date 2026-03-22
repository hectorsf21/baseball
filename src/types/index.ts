// types/index.ts

// --- TIPOS DE DATOS DE LA API DE MLB ---

export interface StatData {
  avg?: string;
  homeRuns?: number;
  ops?: string;
  era?: string;
  wins?: number;
  losses?: number;
  strikeOuts?: number;
}

export interface StatSplit {
  season?: string;
  stat: StatData;
  team?: { id: number; name: string; };
  league?: { id: number; name: string; };
}

export interface StatGroup {
  splits: StatSplit[];
}

export interface Player {
  id: number;
  fullName: string;
  primaryPosition: {
    code: string;
    name: string;
    type: string;
    abbreviation: string;
  };
  currentTeam?: {
    id: number;
    name: string;
  };
  stats?: StatGroup[];
  birthCountry?: string;
}

// --- TIPOS DE DATOS DE NUESTRA APLICACIÓN ---

export interface PlayerNote {
  playerData: Player;
  notes: string;
}

// Describe una nota de jugador tal como viene de nuestra base de datos/API
export interface PlayerNoteFromDB extends PlayerNote {
    id: number;
}

// Describe una sección tal como viene de nuestra base de datos/API
export interface SectionFromDB {
    id: number;
    name: string;
    players: PlayerNoteFromDB[];
}

// --- TIPOS PARA EL ESTADO DEL COMPONENTE DE BÚSQUEDA ---

export interface HitterStats {
    avg: string;
    hr: number;
    ops: string;
}

export interface PitcherStats {
    era: string;
    wins: number;
    losses: number;
    so: number;
}

// Describe un resultado de búsqueda enriquecido en la UI
export interface EnrichedSearchResult {
    playerData: Player;
    headshotUrl: string;
    playerType: 'Hitter' | 'Pitcher';
    stats: HitterStats | PitcherStats | null;
}