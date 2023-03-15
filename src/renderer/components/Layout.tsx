import { Outlet } from 'react-router-dom';
import 'tailwindcss/tailwind.css';
import NexusSidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-slate-400 text-sm overflow-y-hidden grid grid-rows-1 grid-cols-[auto_1fr]">
      <NexusSidebar />
      <Outlet />
    </div>
  );
}
