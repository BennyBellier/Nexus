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

export type AthleteData = {
  firstname: string;
  lastname: string;
  age: number;
  team: string;
};

export type Athlete = {
  firstname: string;
  lastname: string;
  age: number;
};

export type AthletePerTeamDic = {
  [key: string]: Athlete[];
};

export const HOME = 1;
export const AWAY = 2;

export enum GameState {
  WAITING,
  PLAYING,
  ENDED,
}

export enum MatchStatus {
  NOT_READY,
  READY,
  STARTED,
  SUDDEN_DEATH,
  ENDED,
}

export interface MatchInitData {
  homeTeam: string;
  awayTeam: string;
}

export interface Score {
  score: number;
  faults: number;
  timeout: number;
}

export interface RoundResult {
  escaped: boolean;
  winner?: typeof HOME | typeof AWAY;
}

export interface MatchScoreUpdate {
  matchStatus: MatchStatus;
  gameState: GameState;
  home: Score;
  away: Score;
  currentRound: number;
  result: RoundResult;
  teamRunner: typeof HOME | typeof AWAY;
}

export interface MatchScore {
  HOME: Score;
  AWAY: Score;
}
