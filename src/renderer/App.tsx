import { useEffect, useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
// import icon from '../../assets/icon.svg';
import { ProSidebarProvider } from 'react-pro-sidebar';
import './App.css';

type TeamData = {
  name: string;
  points: number;
  wins: number;
  losses: number;
  games_played: number;
};

type GameData = {
  id: number;
  home_team: string;
  home_score: number;
  away_team: string;
  away_score: number;
  winner: string;
  loser: string;
};

type GameRowProp = {
  game: GameData;
};

type TeamLeadRowProp = {
  team: TeamData;
  rank: number;
};

type TeamLeadQuery = {
  teams: TeamData[];
};

type GameQuery = {
  games: GameData[];
};

function TeamHeader() {
  return (
    <tr>
      <th>Name</th>
      <th>Points</th>
      <th>Wins</th>
      <th>Losses</th>
      <th>Games Played</th>
    </tr>
  );
}

function LeaderboardHeader() {
  return (
    <tr>
      <th>Rank</th>
      <th>Name</th>
      <th>Points</th>
      <th>Wins</th>
      <th>Losses</th>
      <th>Games Played</th>
    </tr>
  );
}

function GameStatHeader() {
  return (
    <tr>
      <th>ID</th>
      <th>Home</th>
      <th>Home Score</th>
      <th>Away</th>
      <th>Away Score</th>
      <th>Winner</th>
      <th>Loser</th>
    </tr>
  );
}

function TeamLeadRow({ team, rank }: TeamLeadRowProp) {
  let rankrow = null;
  if (rank !== 0) {
    rankrow = <td>{rank}</td>;
  }

  return (
    <tr>
      {rankrow}
      <td>{team.name}</td>
      <td>{team.points}</td>
      <td>{team.wins}</td>
      <td>{team.losses}</td>
      <td>{team.games_played}</td>
    </tr>
  );
}

function GameStatRow({ game }: GameRowProp) {
  return (
    <tr>
      <td>{game.id}</td>
      <td>{game.home_team}</td>
      <td>{game.home_score}</td>
      <td>{game.away_team}</td>
      <td>{game.away_score}</td>
      <td>{game.winner}</td>
      <td>{game.loser}</td>
    </tr>
  );
}
function TeamTable({ teams }: TeamLeadQuery) {
  const rows: any = [];

  teams.forEach((team: any) => {
    rows.push(<TeamLeadRow team={team} rank={0} key={team.name} />);
  });

  return (
    <table>
      <thead>
        <TeamHeader />
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

function LeaderboardTable({ teams }: TeamLeadQuery) {
  const rows: any = [];
  let rank = 1;

  teams.forEach((team: any) => {
    rows.push(<TeamLeadRow team={team} rank={rank} key={team.name} />);
    rank += 1;
  });

  return (
    <table className="last">
      <thead>
        <LeaderboardHeader />
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

function GameStatTable({ games }: GameQuery) {
  const rows: any = [];

  games.forEach((game: any) => {
    rows.push(<GameStatRow game={game} key={game.id} />);
  });

  return (
    <table>
      <thead>
        <GameStatHeader />
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

function Tables() {
  const [teamData, setTeamLeadData] = useState<TeamData[]>([]);
  const [gameData, setGameStatData] = useState<GameData[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<TeamData[]>([]);

  useEffect(() => {
    return window.database.onUpdate(
      (teams: [], matches: [], leaderboard: []) => {
        setTeamLeadData(teams);
        setGameStatData(matches);
        setLeaderboardData(leaderboard);
      }
    );
  }, []);

  return (
    <div className="tables">
      <TeamTable teams={teamData} />
      <GameStatTable games={gameData} />
      <LeaderboardTable teams={leaderboardData} />
      <button
        type="button"
        className="load"
        onClick={() => window.database.loadData()}
      >
        Load data
      </button>
      <button
        type="button"
        className="reset"
        onClick={() => window.database.resetDB()}
      >
        Reset db
      </button>
      <button
        type="button"
        className="update"
        onClick={() => window.database.dBContent()}
      >
        Update display
      </button>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ProSidebarProvider>
        <Routes>
          <Route path="/" element={<Tables />} />
        </Routes>
      </ProSidebarProvider>
    </Router>
  );
}
