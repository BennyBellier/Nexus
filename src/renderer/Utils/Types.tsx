export type TeamData = {
  name: string;
  points: number;
  wins: number;
  losses: number;
  games_played: number;
};

export type GameData = {
  id: number;
  home_team: string;
  home_score: number;
  away_team: string;
  away_score: number;
  winner: string;
  loser: string;
};

export type GameRowProp = {
  game: GameData;
};

export type TeamLeadRowProp = {
  team: TeamData;
  rank: number;
};

export type TeamLeadQuery = {
  teams: TeamData[];
};

export type GameQuery = {
  games: GameData[];
};

export type PodiumData = {
  first: string;
  second: string;
  third: string;
};

export type SettingsDescription = {
  numberOfRound: number;
  roundLength: number;
  autoUpdatePoint: boolean;
};

export type DashboardDescription = {
  name: string;
  description: string;
  type: string;
  numberOfTeam: number;
  currentMatchNumber: number;
  numberOfMatch: number;
  settings: SettingsDescription;
};
