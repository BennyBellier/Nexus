import { useState } from 'react';
import { DeleteForeverRounded } from '@mui/icons-material';
import { HiChevronDown, HiPlusSmall } from 'react-icons/hi2';
import { MdNoPhotography } from 'react-icons/md';
import Main from '../components/Main';
import icon from '../../../assets/icons/512x512.png';

const teamData = ['Team1', 'Team2', 'Team3'];

const AthletesData = [
  {
    firstname: 'Athlete',
    lastname: 'AthleteName',
    age: 20,
    team: 'Team1',
  },
  {
    firstname: 'Athlete 2',
    lastname: 'AthleteSecond',
    age: 21,
    team: 'Team1',
  },
  {
    firstname: 'Athlete 2',
    lastname: 'AthleteName',
    age: 22,
    team: 'Team2',
  },
  {
    firstname: 'Athlete 22',
    lastname: 'AthleteSecond',
    age: 23,
    team: 'Team2',
  },
];

function TeamHeader({ name, deleteHandler, collapseHandler, collapsed }: any) {
  return (
    <div
      key={name}
      className="flex flex-row items-center justify-between h-[40px] w-full"
    >
      <div className="group/left flex flex-row gap-4 items-center">
        <img src={icon} alt={`logo of ${name}`} width="40px" />
        {name}
      </div>
      <div className="flex flex-row items-center gap-2 h-full">
        <button
          type="button"
          onClick={deleteHandler}
          className="text-red-400 h-10"
        >
          <DeleteForeverRounded />
        </button>
        <button
          type="button"
          onClick={collapseHandler}
          className={` ${
            collapsed ? '' : 'rotate-180'
          } duration-150 ease-out transform h-10 `}
        >
          <HiChevronDown className="w-[20px] h-[20px]" />
        </button>
      </div>
    </div>
  );
}

function AthleteEntry({ athlete }: any) {
  return (
    <div className="flex flex-row items-center justify-between">
      <div className="flex flex-rows gap-4 items-center justify-center">
        <MdNoPhotography className="w-6 h-6" />
        <span className="w-32">{athlete.firstname}</span>
        <span className="w-32">{athlete.lastname}</span>
        <span className="w-32">{athlete.age}</span>
      </div>
      <div className="flex gap-2">
        <button type="button">
          <DeleteForeverRounded />
        </button>
      </div>
    </div>
  );
}

function AthleteList({ athletes }: any) {
  const rows: any = [];

  athletes.forEach((athlete: any) => {
    if (athlete !== undefined)
      rows.push(<AthleteEntry athlete={athlete} key={athlete.firstname} />);
  });

  return <div className="flex flex-col gap-2">{rows}</div>;
}

function TeamItem({ name, athletes }: any) {
  const [collapsed, setCollapsed] = useState(true);
  const itemSize = 113 + 28 * athletes.length;

  const deleteHandler = () => {
    console.log('delete', name);
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div
      className="bg-white border border-slate-400 text-slate-800 p-1 px-3 rounded-md flex flex-col overflow-hidden gap-2"
      style={
        collapsed
          ? { height: '50px', transition: 'height 0.5s ease' }
          : { height: `${itemSize}px`, transition: 'height 0.5s ease' }
      }
    >
      <TeamHeader
        name={name}
        deleteHandler={deleteHandler}
        collapseHandler={toggleCollapsed}
        collapsed={collapsed}
      />
      <hr className="border-slate-300" />
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-rows gap-4 items-center justify-center text-slate-400">
            <span className="w-6 h-6" />
            <span className="w-32">Prénom</span>
            <span className="w-32">Nom</span>
            <span className="w-32">Âge</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="p-1 px-2 border text-slate-800 border-slate-600 flex flex-row gap-2 justify-center items-center rounded-lg duration-300"
            >
              Ajouter un athlète <HiPlusSmall />
            </button>
          </div>
        </div>
      </div>
      <AthleteList athletes={athletes} />
    </div>
  );
}

export default function Teams(/* { teams, athletes }: any */) {
  const rows: any = [];
  const dict: any = {};

  AthletesData.forEach((athlete: any) => {
    if (dict[athlete.team] === undefined) {
      dict[athlete.team] = [];
    }
    dict[athlete.team].push(athlete);
  });

  teamData.forEach((team: any) => {
    if (dict[team] === undefined) {
      dict[team] = [];
    }
  });

  Object.keys(dict).forEach((team: any) => {
    rows.push(<TeamItem name={team} athletes={dict[team]} key={team} />);
  });

  return (
    <Main
      title="Teams"
      searchbar={null}
      className="flex flex-col gap-3 overflow-y-scroll"
    >
      {rows}
    </Main>
  );
}
