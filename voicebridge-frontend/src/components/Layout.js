import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/',            label: 'Dashboard',    icon: 'dashboard',         end: true },
  { to: '/children',    label: 'Children',     icon: 'child_care'             },
  { to: '/boards',      label: 'Boards',       icon: 'dashboard'              },
  { to: '/community',   label: 'Community',    icon: 'groups'                 },
  { to: '/icons',       label: 'Library',      icon: 'auto_awesome_mosaic'    },
  { to: '/assets/new',  label: 'Voice Bridge', icon: 'graphic_eq'             },
  { to: '/maintenance', label: 'Maintenance',  icon: 'medical_services'       },
  { to: '/analytics',   label: 'Analytics',    icon: 'insights'               },
  { to: '/security',    label: 'Security',     icon: 'security'               },
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
      <nav className="flex-1 px-sm space-y-2 overflow-y-auto custom-scrollbar">
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
        <NavLink to="/profile" onClick={() => setDrawerOpen(false)} className="block p-4 rounded-xl glass-card mb-2 hover:shadow-lg transition-all">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
              {(displayName[0] || 'C').toUpperCase()}
            </div>
            <div>
              <p className="font-title-md text-on-surface">{displayName}</p>
              <p className="text-xs text-on-surface-variant">View profile</p>
            </div>
          </div>
        </NavLink>
        <button onClick={logout} className="w-full p-3 rounded-xl glass-card flex items-center justify-center gap-2 text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-all cursor-pointer">
          <span className="material-symbols-outlined text-sm">logout</span>
          <span className="text-sm font-semibold">Log out</span>
        </button>
      </div>
    </>
  );

  const isSanctuary = location.pathname === '/' || location.pathname === '/security';
  const isCommunity = location.pathname.startsWith('/community');
  const isLibrary = location.pathname.startsWith('/icons');
  const isAnalytics = location.pathname.startsWith('/analytics');
  const isProfile = location.pathname.startsWith('/profile');
  const isMaintenance = location.pathname.startsWith('/maintenance');
  
  let bgImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuD_4PWmZ-0nCsZ6edf5iXGGOwdnfekV-dyb4r5NPCKZqMDNuJpN0d7Au1LDy2AYlpBduY_2y6JHCIXUeXgHi_schp9M59u2falVJpaMr1vrpAI9xFullCRKufMRByHD7b4Fd8VRszK0MaxBuofUzdcg-1a7s102PGD_Yg-N02KBivFs0p9SY3CJIwBS4U770khGppnKF6kdqbdkT6PzkdbFLs8U-mP3KKteIVtRCwNak_Or6abPsXXO_JLUYUg0JHzfrH2Ga831Y7A";
  
  if (isSanctuary) {
    bgImage = "https://lh3.googleusercontent.com/aida/ADBb0ugfNHTD0P3lU6cLC_v5RIBUs0V9CevFqvq4Bwho4-IoDHnS9V8QC3gpzZjMdRYnRHgG_ryzO3_3N3p5s3oohWOZU6WgZnQHq7EELPOGIt04C-yUSdCfjdlNoOVAlRS2iWUMAYCXWp6zPOA92SmeIEz12Xpu6hmTKE8Sx1jPBZZzdcgAv264MsbFZJMnOhUBC8DOdZqMAbp44fsslLkNMzTIp3f4apz21lHh5zWrwUB6OiwRxjCCqEFrZw";
  } else if (isCommunity) {
    bgImage = "/backgrounds/boards-bg.jpg";
  } else if (isLibrary) {
    bgImage = "/backgrounds/library-bg.jpg";
  } else if (isAnalytics) {
    bgImage = "/backgrounds/analytics-bg.jpg";
  } else if (isProfile) {
    bgImage = "/backgrounds/profile-bg.jpg";
  } else if (isMaintenance) {
    bgImage = "/backgrounds/maintenance-bg.jpg";
  }

    const [notificationsOpen, setNotificationsOpen] = useState(false);

    // Mock notifications list
    const notifications = [
      { id: 1, title: 'Sync Successful', desc: 'Tablet successfully synced 6 items.', time: '2 mins ago', icon: 'sync' },
      { id: 2, title: 'New Milestone', desc: 'Child used "Water" icon 5 times today!', time: '1 hour ago', icon: 'emoji_events' },
      { id: 3, title: 'App Update', desc: 'VoiceBridge updated to v1.0.2', time: '1 day ago', icon: 'system_update' },
    ];

    return (
      <div className="font-body-lg text-on-surface min-h-screen relative overflow-hidden">
        <img alt="Atmospheric background" className="sanctuary-bg absolute inset-0 w-full h-full object-cover z-[-2]" src={bgImage} />
        <div className="fixed inset-0 bg-white/30 dark:bg-black/40 backdrop-blur-sm z-[-1]"></div>
        
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
        <main className="lg:ml-[280px] p-gutter lg:p-lg min-h-screen flex flex-col relative">
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
            <div className="flex items-center gap-4 relative">
              <button onClick={toggleTheme} className="p-3 rounded-full glass-card hover:shadow-lg transition-all group">
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">dark_mode</span>
              </button>
              
              {/* Notifications Wrapper */}
              <div className="relative">
                <button 
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-3 rounded-full glass-card hover:shadow-lg transition-all group relative cursor-pointer"
                >
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">notifications</span>
                  <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                </button>
                
                {/* Notifications Dropdown Panel */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-3 w-80 rounded-2xl glass-card backdrop-blur-3xl shadow-2xl border border-white/40 overflow-hidden z-50 animate-[slidein_0.2s_ease]">
                    <div className="p-4 border-b border-white/20 bg-white/30 flex justify-between items-center">
                      <h3 className="font-title-md font-bold text-on-surface">Notifications</h3>
                      <button onClick={() => setNotificationsOpen(false)} className="material-symbols-outlined text-sm text-on-surface-variant hover:text-error">close</button>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                      {notifications.map((notif) => (
                        <div key={notif.id} className="p-4 border-b border-white/10 hover:bg-white/20 transition-all cursor-pointer flex gap-3 items-start">
                          <div className="p-2 rounded-full bg-primary/10 text-primary">
                            <span className="material-symbols-outlined text-sm">{notif.icon}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-on-surface">{notif.title}</p>
                            <p className="text-xs text-on-surface-variant mt-1">{notif.desc}</p>
                            <p className="text-[10px] text-primary mt-2 font-bold uppercase tracking-wider">{notif.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

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
    </div>
  );
}
