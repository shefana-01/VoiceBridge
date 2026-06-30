/**
 * App.js — Track 2 update.
 * Adds /community route. /sync and /settings remain stubs until Track 4.
 */
import { Routes, Route, Navigate } from 'react-router-dom';

import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Toaster from './components/Toaster';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Children from './pages/Children';
import LibraryGateway from './pages/LibraryGateway';
import IconsPage from './pages/Icons';
import Boards from './pages/Boards';
import BoardEditor from './pages/BoardEditor';
import Community from './pages/Community';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Maintenance from './pages/Maintenance';
import VoiceBridge from './pages/VoiceBridge';
import About from './pages/About';
import Journal from './pages/Journal';

import FolderDPs from './pages/FolderDPs';

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-on-surface-variant">
        Loading…
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<RequireAuth><Layout /></RequireAuth>}>
          <Route path="/"                element={<Dashboard />} />
          <Route path="/children"        element={<Children />} />
          <Route path="/library"         element={<LibraryGateway />} />
          <Route path="/icons"           element={<IconsPage />} />
          <Route path="/folder-dps"      element={<FolderDPs />} />
          <Route path="/boards"          element={<Boards />} />
          <Route path="/boards/new"      element={<BoardEditor />} />
          <Route path="/boards/:id/edit" element={<BoardEditor />} />
          <Route path="/community"       element={<Community />} />
          <Route path="/profile"         element={<Profile />} />
          <Route path="/maintenance"     element={<Maintenance />} />
          <Route path="/journal"         element={<Journal />} />
          <Route path="/about"           element={<About />} />
          <Route path="/voicebridge-simulator" element={<VoiceBridge />} />
          <Route path="/settings"        element={<Settings />} />
          <Route path="/analytics"       element={<Analytics />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  );
}
