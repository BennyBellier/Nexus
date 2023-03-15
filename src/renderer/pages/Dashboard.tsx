import { useEffect, useState } from 'react';
import 'tailwindcss/tailwind.css';
import Main from 'renderer/components/Main';

import {
  PersonRounded,
  AddRounded,
  EmojiEventsRounded,
  GamepadRounded,
} from '@mui/icons-material';
import Podium from '../components/Podium';
import {
  TeamLeadQuery,
  GameRowProp,
  TeamData,
  GameData,
  GameQuery,
  DashboardDescription,
} from '../Utils/Types';

function DashboardElement({ children, className, title }: any) {
  return (
    <div className={`p-4 rounded-2xl bg-white ${className}`}>
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}
function Leaderboard({ teams }: TeamLeadQuery) {
  let content: any;

  if (teams.length === 0) {
    content = <span>Impossible de définir le classement</span>;
  } else {
    const first: TeamData = teams[0];
    const second: TeamData = teams[1];
    const third: TeamData = teams[2];
    content = (
      <Podium first={first.name} second={second.name} third={third.name} />
    );
  }

  return (
    <DashboardElement className="row-start-2 col-span-2" title="Classement">
      {content}
    </DashboardElement>
  );
}

function PlayedMatchItem({ game }: GameRowProp) {
  return (
    <div className="played-match-item">
      <div className="team">
        {game.home_team}
        {game.away_team}
      </div>
      <div className="score">
        {game.home_score}
        {game.away_score}
      </div>
    </div>
  );
}

function PlayedMatch({ games }: GameQuery) {
  games.reverse();
  const rows: any = [];

  if (games.length === 0) {
    rows.push(<span>Aucuns matchs joué</span>);
  } else {
    for (let index = 0; index < games.length || index < 3; index += 1) {
      const game: GameData = games[index];
      rows.push(<PlayedMatchItem game={game} key={game.id} />);
    }
  }

  return (
    <DashboardElement className="row-start-3" title="Matchs récents">
      {rows}
    </DashboardElement>
  );
}

function Description() {
  const [description, setDescription] = useState<DashboardDescription>();
  let content: any;

  useEffect(() => {
    return window.nexus.descriptionUpdated(
      (descriptionData: DashboardDescription) => {
        setDescription(descriptionData);
      }
    );
  }, []);

  if (description === undefined || description.name.length === 0) {
    content = (
      <div className="h-full flex justify-center items-center">
        <button
          type="button"
          className="4h-fit px-4 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 hover:scale-[99%] duration-200 hover:border-cyan-200 ease-in-out flex items-center gap-2"
        >
          <AddRounded /> Créer un Tournois
        </button>
      </div>
    );
  } else {
    content = (
      <div className="content">
        <div className="tournament">
          <span className="name">{description?.name}</span>
          <span className="description">{description?.description}</span>
          <span className="type">
            <EmojiEventsRounded /> {description?.type}
          </span>
          <span className="number-of-team">
            <PersonRounded /> {description?.numberOfTeam} équipes
          </span>
          <span className="current-match-number">
            <GamepadRounded /> {description?.currentMatchNumber} sur{' '}
            {description?.numberOfMatch}
          </span>
        </div>
        <div className="match">
          <span className="number-of-round">
            {' '}
            {description?.settings.numberOfRound}{' '}
          </span>
          <span className="round-length">
            {' '}
            {description?.settings.roundLength}{' '}
          </span>
          <span className="auto-update-point">
            {' '}
            {description?.settings.autoUpdatePoint ? 'Oui' : 'Non'}{' '}
          </span>
        </div>
      </div>
    );
  }

  return (
    <DashboardElement
      className="row-start-3 p-4 rounded-2xl"
      title="Description"
    >
      {content}
    </DashboardElement>
  );
}

export default function Dashboard() {
  const [gameData, setGameStatData] = useState<GameData[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<TeamData[]>([]);
  let content: any;

  useEffect(() => {
    return window.database.dbUpdated(
      (teams: [], matches: [], leaderboard: []) => {
        setGameStatData(matches);
        setLeaderboardData(leaderboard);
      }
    );
  }, []);

  // setGameStatData([
  //   {
  //     id: 1,
  //     home_team: 'Team 1',
  //     away_team: 'Team 2',
  //     home_score: 1,
  //     away_score: 2,
  //     winner: 'Team 2',
  //     loser: 'Team 1',
  //   },
  // ]);

  if (gameData.length === 0 && leaderboardData.length === 0) {
    content = (
      <Main className="h-full flex justify-center items-center">
        <button
          type="button"
          className="4h-fit px-4 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 hover:scale-[99%] duration-200 hover:border-cyan-200 ease-in-out flex items-center gap-2"
        >
          <AddRounded /> Créer un Tournois
        </button>
      </Main>
    );
  } else {
    content = (
      <Main className="grid grid-cols-3 grid-rows-[auto_1fr_1fr] gap-4">
        <Leaderboard teams={leaderboardData} />
        <PlayedMatch games={gameData} />
        <Description />
      </Main>
    );
  }

  return content;
}
