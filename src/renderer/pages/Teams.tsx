import Main from '../components/Main';
import icon from '../../../assets/icons/512x512.png';

const data = {
  teams: [
    {
      name: 'Team 1',
      points: 0,
      wins: 0,
      losses: 0,
      games_played: 0,
    },
  ],
};

export default function Teams(/* { teams }: any */) {
  const rows: any = [];

  data.teams.forEach((team: any) => {
    rows.push(
      <div
        key={team.name}
        className="team-row bg-white border border-slate-400 text-slate-800 flex flex-row items-center justify-between p-1 px-3 rounded-md"
      >
        <div className="group/left flex flex-row gap-4 items-center">
          <img src={icon} alt={`logo of ${team.name}`} width="40px" />
          {team.name}
        </div>
        <div className="group/right flex-row items-center gap-4">remove</div>
      </div>
    );
  });

  return (
    <Main title="Teams" searchbar={null}>
      {rows}
    </Main>
  );
}
