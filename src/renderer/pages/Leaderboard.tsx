import React from 'react';
import 'tailwindcss/tailwind.css';
import 'tailwind-scrollbar';
import { MdNoPhotography } from 'react-icons/md';
import Main from '../components/Main';

const leadData = [
  {
    name: 'Team1',
    points: 15,
    wins: 5,
    losses: 0,
    games_played: 5,
  },
  {
    name: 'Team2',
    points: 10,
    wins: 3,
    losses: 2,
    games_played: 5,
  },
  {
    name: 'Team3',
    points: 5,
    wins: 1,
    losses: 4,
    games_played: 5,
  },
  {
    name: 'Team4',
    points: 0,
    wins: 0,
    losses: 5,
    games_played: 5,
  },
  {
    name: 'Team4',
    points: 0,
    wins: 0,
    losses: 5,
    games_played: 5,
  },
  {
    name: 'Team4',
    points: 0,
    wins: 0,
    losses: 5,
    games_played: 5,
  },
  {
    name: 'Team4',
    points: 0,
    wins: 0,
    losses: 5,
    games_played: 5,
  },
  {
    name: 'Team4',
    points: 0,
    wins: 0,
    losses: 5,
    games_played: 5,
  },
  {
    name: 'Team4',
    points: 0,
    wins: 0,
    losses: 5,
    games_played: 5,
  },
  {
    name: 'Team4',
    points: 0,
    wins: 0,
    losses: 5,
    games_played: 5,
  },
  {
    name: 'Team4',
    points: 0,
    wins: 0,
    losses: 5,
    games_played: 5,
  },
  {
    name: 'Team4',
    points: 0,
    wins: 0,
    losses: 5,
    games_played: 5,
  },
  {
    name: 'Team4',
    points: 0,
    wins: 0,
    losses: 5,
    games_played: 5,
  },
  {
    name: 'Team4',
    points: 0,
    wins: 0,
    losses: 5,
    games_played: 5,
  },
  {
    name: 'Team4',
    points: 0,
    wins: 0,
    losses: 5,
    games_played: 5,
  },
  {
    name: 'Team4',
    points: 0,
    wins: 0,
    losses: 5,
    games_played: 5,
  },
];

function getImage(name: string): any {
  console.log('search for image of ', name);
  return null;
}

function PodiumItem({ team, className, style, imageDiameter, position }: any) {
  const image = getImage(team.name);
  const img = image ? (
    <img
      src={image}
      alt={`logo of ${team.name}`}
      width={`${imageDiameter * 0.8}`}
    />
  ) : (
    <MdNoPhotography className="w-4/5 h-4/5 text-slate-800" />
  );

  let crown = null;
  if (position === '1') {
    crown = (
      <svg
        viewBox="0 0 80 49"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width={`${imageDiameter * 0.45}`}
      >
        <path
          d="M0 13.5089V48.1818H46.0335L0 13.5089Z"
          fill="url(#paint0_linear_504_194)"
        />
        <path
          d="M80 46.3806L39.3296 0L19.6648 24.3161L51.3966 48.1818H80V46.3806Z"
          fill="url(#paint1_linear_504_194)"
        />
        <path
          d="M80 41.4274V13.5089L66.5922 26.5675L80 41.4274Z"
          fill="url(#paint2_linear_504_194)"
        />
        <defs>
          <linearGradient
            id="paint0_linear_504_194"
            x1="7.59777"
            y1="21.6143"
            x2="92.7594"
            y2="62.9867"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.11767" stopColor="#F3B513" />
            <stop offset="1" stopColor="#DEB95A" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_504_194"
            x1="7.59777"
            y1="21.6143"
            x2="92.7594"
            y2="62.9867"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.11767" stopColor="#F3B513" />
            <stop offset="1" stopColor="#DEB95A" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_504_194"
            x1="7.59777"
            y1="21.6143"
            x2="92.7594"
            y2="62.9867"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.11767" stopColor="#F3B513" />
            <stop offset="1" stopColor="#DEB95A" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  return (
    <div
      className={`absolute flex flex-col gap-4 items-center text-slate-800 text-md ${className}`}
      style={style}
    >
      {position}
      {crown}
      <div
        className=" bg-white rounded-full flex justify-center items-center drop-shadow-xl"
        style={{ width: `${imageDiameter}px`, height: `${imageDiameter}px` }}
      >
        {img}
      </div>
      {team.name}
    </div>
  );
}

function Podium({ lead }: any) {
  let first: any = null;
  let second: any = null;
  let third: any = null;

  const firstCircleSize = Math.ceil(window.innerWidth / 7.68);
  const firstYPos = Math.ceil(window.innerHeight * 0.08);

  const secondCircleSize = Math.ceil(firstCircleSize * 0.9);
  const secondYPos = Math.ceil(firstYPos + firstCircleSize / 1.8);

  const thirdCircleSize = Math.ceil(firstCircleSize * 0.85);
  const thirdYPos = Math.ceil(firstYPos + firstCircleSize / 1.35);

  if (lead.length >= 1) {
    first = (
      <PodiumItem
        className="z-20"
        style={{
          top: `${firstYPos}px`,
          left: `calc((${window.innerWidth}px - 17rem) / 2 - ${firstCircleSize}px / 2)`,
        }}
        imageDiameter={firstCircleSize}
        team={lead[0]}
        position="1"
      />
    );
  }
  if (lead.length >= 2) {
    second = (
      <PodiumItem
        className="z-10"
        style={{
          top: `${secondYPos}px`,
          left: `calc(((${
            window.innerWidth
          }px - 17rem) / 2 - ${secondCircleSize}px / 2) - ${
            firstCircleSize / 1.35
          }px)`,
        }}
        imageDiameter={secondCircleSize}
        team={lead[1]}
        position="2"
      />
    );
  }
  if (lead.length >= 3) {
    third = (
      <PodiumItem
        style={{
          top: `${thirdYPos}px`,
          left: `calc(((${
            window.innerWidth
          }px - 17rem) / 2 - ${thirdCircleSize}px / 2) + ${
            firstCircleSize / 1.35
          }px)`,
        }}
        imageDiameter={thirdCircleSize}
        team={lead[2]}
        position="3"
      />
    );
  }

  return (
    <>
      {first}
      {second}
      {third}
    </>
  );
}

function TableEntry({ team, index }: any) {
  const img = getImage(team.name) ? (
    <img
      src={getImage(team.name)}
      alt={team.name}
      className="rounded-md h-full"
    />
  ) : (
    <MdNoPhotography className="text-slate-800 h-6 w-6" />
  );

  return (
    <div className="flex flex-row gap-5 items-center pl-3">
      <span className="w-12 text-center">{index}</span>
      <div className="flex flex-row justify-between items-center border border-slate-900 rounded-full h-10 py-1 w-full pl-3">
        <div className="flex flex-row gap-2 items-center">
          {img}
          {team.name}
        </div>
        <div className="flex flex-row gap-10">
          <span className="w-[5.5rem] text-center">{team.points}</span>
          <span className="w-[5.5rem] text-center">{team.wins}</span>
          <span className="w-[5.5rem] text-center">{team.losses}</span>
          <span className="w-[5.5rem] text-center">{team.games_played}</span>
        </div>
      </div>
    </div>
  );
}

function Table({ lead }: any) {
  return (
    <div className="flex flex-row gap-5 h-full w-full pl-1 overflow-y-scroll overflow-x-hidden scrollbar-thin scrollbar-rounded-large scrollbar-thumb-slate-400">
      <div
        id="Leaderboard"
        className="flex flex-col gap-6 w-full pr-2 after:bg-transparent after:h-1 after:content-['*'] after:text-transparent after:select-none"
      >
        <div className="flex flex-row justify-between items-center text-slate-500 font-medium pl-2">
          <div className="flex flex-row gap-8">
            <span>Position</span>
            <span>Équipe</span>
          </div>
          <div className="flex flex-row gap-10">
            <span className="w-[5.5rem] text-center">Points</span>
            <span className="w-[5.5rem] text-center">Victoires</span>
            <span className="w-[5.5rem] text-center">Défaites</span>
            <span className="w-[5.5rem] text-center">Matchs joués</span>
          </div>
        </div>

        {lead.map((team: any, index: number) => (
          <TableEntry key={team.name} team={team} index={index} />
        ))}
      </div>
    </div>
  );
}

export default function Leaderboard() {
  return (
    <Main
      title="Classement"
      printActivated
      infoContent="12 équipes"
      className="flex flex-col pb-0 relative"
    >
      <Podium lead={leadData.slice(0, 3)} />
      <div
        className="bg-transparent absolute bottom-0 h-[45%] overflow-y-hidden after:bg-gradient-to-t after:from-[#0f172a30] after:z-50 after:absolute -left-[1rem] after:w-full after:bottom-0 after:h-1/4 after:pointer-events-none"
        style={{ width: 'calc(100vw - 15rem)', left: '0rem' }}
      >
        <Table lead={leadData} />
      </div>
    </Main>
  );
}
