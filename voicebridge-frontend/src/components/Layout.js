import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/',          label: 'Dashboard',    icon: 'dashboard',         end: true },
  { to: '/children',  label: 'Children',     icon: 'child_care'             },
  { to: '/boards',    label: 'Boards',       icon: 'dashboard'              },
  { to: '/community', label: 'Community',    icon: 'groups'                 },
  { to: '/icons',     label: 'Library',      icon: 'auto_awesome_mosaic'    },
  { to: '/assets/new',label: 'Voice Bridge', icon: 'graphic_eq'             },
  { to: '/analytics', label: 'Analytics',    icon: 'insights'               },
  { to: '/security',  label: 'Security',     icon: 'security'               },
  { to: '/settings',  label: 'Settings',     icon: 'settings'               },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [now, setNow] = useState(new Date());
  const location = useLocation();

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const displayName = user?.first_name || user?.username || 'Caregiver';
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const day = now.getDate();
  const month = now.toLocaleDateString(undefined, { month: 'short' });
  const year = now.getFullYear();

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
  };

  const SidebarBody = () => (
    <>
      <div className="px-md mb-xl mt-4">
        <h1 className="font-headline-lg text-primary tracking-tight">VoiceBridge</h1>
        <p className="font-label-caps text-label-caps text-on-surface-variant/70 uppercase tracking-widest mt-1">Empathetic Sanctuary</p>
      </div>
      <nav className="flex-1 px-sm space-y-2">
        {NAV.map(({ to, label, icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={() => setDrawerOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-4 px-6 py-4 rounded-full font-bold transition-all ${
                isActive
                  ? 'text-primary bg-primary-container/40 scale-[0.98]'
                  : 'text-on-surface-variant/70 hover:text-primary hover:backdrop-blur-2xl hover:bg-white/40'}`}>
            <span className="material-symbols-outlined">{icon}</span>
            <span className="font-title-md">{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-md mt-auto mb-4">
        <div className="p-4 rounded-xl glass-card flex items-center justify-between gap-4 cursor-pointer" onClick={logout}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
              {(displayName[0] || 'C').toUpperCase()}
            </div>
            <div>
              <p className="font-title-md text-on-surface">{displayName}</p>
              <p className="text-xs text-on-surface-variant">Sign out</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant">logout</span>
        </div>
      </div>
    </>
  );

  const isSanctuary = location.pathname === '/' || location.pathname === '/security';
  const bgImage = isSanctuary
    ? "https://lh3.googleusercontent.com/aida/ADBb0ugfNHTD0P3lU6cLC_v5RIBUs0V9CevFqvq4Bwho4-IoDHnS9V8QC3gpzZjMdRYnRHgG_ryzO3_3N3p5s3oohWOZU6WgZnQHq7EELPOGIt04C-yUSdCfjdlNoOVAlRS2iWUMAYCXWp6zPOA92SmeIEz12Xpu6hmTKE8Sx1jPBZZzdcgAv264MsbFZJMnOhUBC8DOdZqMAbp44fsslLkNMzTIp3f4apz21lHh5zWrwUB6OiwRxjCCqEFrZw"
    : "https://lh3.googleusercontent.com/aida-public/AB6AXuD_4PWmZ-0nCsZ6edf5iXGGOwdnfekV-dyb4r5NPCKZqMDNuJpN0d7Au1LDy2AYlpBduY_2y6JHCIXUeXgHi_schp9M59u2falVJpaMr1vrpAI9xFullCRKufMRByHD7b4Fd8VRszK0MaxBuofUzdcg-1a7s102PGD_Yg-N02KBivFs0p9SY3CJIwBS4U770khGppnKF6kdqbdkT6PzkdbFLs8U-mP3KKteIVtRCwNak_Or6abPsXXO_JLUYUg0JHzfrH2Ga831Y7A";

  return (
    <div className="font-body-lg text-on-surface min-h-screen">
      <img alt="Atmospheric background" className="sanctuary-bg" src={bgImage} />
      
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 h-screen hidden lg:flex flex-col py-xl z-40 w-[280px] rounded-r-lg bg-white/20 border-r border-white/20 backdrop-blur-2xl shadow-2xl shadow-primary/5">
        <SidebarBody />
      </aside>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setDrawerOpen(false)}></div>
          <aside className="relative w-[280px] h-full bg-surface-bright flex flex-col shadow-2xl animate-[slidein_0.2s_ease]">
            <SidebarBody />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="lg:ml-[280px] p-gutter lg:p-lg min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-xl gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setDrawerOpen(true)} className="lg:hidden p-3 rounded-full glass-card hover:shadow-lg transition-all group">
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">menu</span>
            </button>
            <div>
              <h2 className="font-headline-lg text-on-surface text-3xl md:text-4xl">{greeting}, {displayName}.</h2>
              <p className="text-on-surface-variant font-body-lg">Your sanctuary is ready for today's journey.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-3 rounded-full glass-card hover:shadow-lg transition-all group">
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">dark_mode</span>
            </button>
            <button className="p-3 rounded-full glass-card hover:shadow-lg transition-all group relative">
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
            </button>
            <div className="h-10 w-[1px] bg-white/40"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="font-label-caps text-on-surface">{day} {month} {year}</p>
                <p className="text-xs text-on-surface-variant">Care Cycle: Day 14</p>
              </div>
            </div>
          </div>
        </header>

        <Outlet />
      </main>

      {/* FAB for quick actions */}
      <button className="fixed bottom-gutter right-gutter w-16 h-16 bg-gradient-to-tr from-secondary to-secondary-fixed-dim rounded-full flex items-center justify-center shadow-2xl text-white hover:scale-110 active:rotate-45 transition-all z-50">
        <span className="material-symbols-outlined text-3xl">mic</span>
      </button>
    </div>
  );
}
