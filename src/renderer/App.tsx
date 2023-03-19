// import icon from '../../assets/icon.svg';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Teams from './pages/Teams';
import Leaderboard from './pages/Leaderboard';
import Tournament from './pages/Tournament';
import Match from './pages/Match';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="teams" element={<Teams />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="tournament" element={<Tournament />} />
          <Route path="match" element={<Match />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
