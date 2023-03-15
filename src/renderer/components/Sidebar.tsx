import { NavLink } from 'react-router-dom';
import {
  DashboardRounded,
  LeaderboardRounded,
  GroupRounded,
  GamesRounded,
  AccountTreeRounded,
  SettingsApplicationsRounded,
} from '@mui/icons-material';

function SidebarItem({ icon, text, to }: any) {
  return (
    <li className="list-none w-full flex items-center h-14">
      <NavLink
        to={to}
        className="group text-lg flex items-center gap-3 w-full h-full aria-[current=page]:font-semibold aria-[current=page]:rounded-lg aria-[current=page]:shadow-lg aria-[current=page]:bg-white p-2.5"
      >
        <div className="w-8 h-8 bg-white flex items-center justify-center rounded-lg shadow-md group-aria-[current=page]:shadow-none group-aria-[current=page]:bg-cyan-300 group-hover:bg-cyan-200 duration-300 group-hover:scale-[95%] group-aria-[current=page]:group-hover:scale-100">
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
      className="w-60 flex flex-col h-screen bg-transparent border-r border-r-slante-800 overflow-hidden p-4 justify-between"
    >
      <nav className="flex flex-col gap-2.5">
        <SidebarItem
          icon={<DashboardRounded />}
          text="Tableau de bord"
          to="/"
        />
        <SidebarItem icon={<GroupRounded />} text="Équipes" to="page-1" />
        <SidebarItem
          icon={<LeaderboardRounded />}
          text="Classement"
          to="page-2"
        />
        <SidebarItem
          icon={<AccountTreeRounded />}
          text="Tournois"
          to="page-3"
        />
        <SidebarItem icon={<GamesRounded />} text="Match" to="/page-4" />
      </nav>
      <SidebarItem
        icon={<SettingsApplicationsRounded />}
        text="Paramètres"
        to="/page-5"
      />
    </aside>
  );
}
