import { NavLink } from 'react-router-dom';
import { RxDashboard } from 'react-icons/rx';
import { BiBarChartSquare } from 'react-icons/bi';
import { AiOutlineTeam } from 'react-icons/ai';
import { RiOrganizationChart } from 'react-icons/ri';
import { MdOutlineGames } from 'react-icons/md';
import { IoSettingsOutline } from 'react-icons/io5';

function SidebarItem({ icon, text, to, keyName }: any) {
  return (
    <li className="list-none w-full flex items-center h-14 outline-none">
      <NavLink
        to={to}
        className="group text-lg flex items-center gap-3 w-full h-full p-2.5
        aria-[current=page]:font-semibold aria-[current=page]:rounded-lg aria-[current=page]:shadow-lg aria-[current=page]:bg-white"
        key={keyName}
      >
        <div className="w-8 h-8 bg-white flex items-center justify-center rounded-lg shadow-md group-aria-[current=page]:shadow-none group-aria-[current=page]:bg-cyan-300 group-hover:bg-cyan-200 duration-300 group-hover:scale-[95%] group-hover:text-white group-aria-[current=page]:text-white group-aria-[current=page]:group-hover:scale-100">
          {icon}
        </div>
        {text}
      </NavLink>
    </li>
  );
}

export default function NexusSidebar() {
  return (
    <aside
      id="Sidebar"
      className="w-60 flex flex-col h-screen bg-transparent border-r border-r-slante-800 overflow-hidden p-4 justify-between z-50"
    >
      <nav className="flex flex-col gap-2.5">
        <SidebarItem
          icon={<RxDashboard className="" />}
          text="Tableau de bord"
          to="/"
          keyName="dashboard"
        />
        <SidebarItem icon={<AiOutlineTeam />} text="Équipes" to="teams" />
        <SidebarItem
          icon={<BiBarChartSquare className="" />}
          text="Classement"
          to="leaderboard"
          keyName="leaderboard"
        />
        <SidebarItem
          icon={<RiOrganizationChart className="" />}
          text="Tournois"
          to="tournament"
          keyName="tournament"
        />
        <SidebarItem
          icon={<MdOutlineGames className="" />}
          text="Match"
          to="match"
          keyName="match"
        />
      </nav>
      <SidebarItem
        icon={<IoSettingsOutline className="" />}
        text="Paramètres"
        to="settings"
        keyName="settings"
      />
    </aside>
  );
}
