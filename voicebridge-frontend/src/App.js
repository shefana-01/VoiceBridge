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
import IconsPage from './pages/Icons';
import Boards from './pages/Boards';
import BoardEditor from './pages/BoardEditor';
import Community from './pages/Community';
import Security from './pages/Security';
import Analytics from './pages/Analytics';

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

/** Lightweight placeholder for routes that aren't built yet. */
function PageStub({ title }) {
  return (
    <div className="vb-card text-center py-16 border-2 border-dashed border-outline-variant">
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-on-surface-variant">
        This page is on the roadmap for an upcoming track.
      </p>
    </div>
  );
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
          <Route path="/icons"           element={<IconsPage />} />
          <Route path="/boards"          element={<Boards />} />
          <Route path="/boards/new"      element={<BoardEditor />} />
          <Route path="/boards/:id/edit" element={<BoardEditor />} />
          <Route path="/community"       element={<Community />} />
          <Route path="/community/:id"   element={<PageStub title="Template Preview" />} />
          <Route path="/sync"            element={<PageStub title="Sync Settings" />} />
          <Route path="/security"        element={<Security />} />
          <Route path="/analytics"       element={<Analytics />} />
          <Route path="/settings"        element={<PageStub title="Settings" />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  );
}
