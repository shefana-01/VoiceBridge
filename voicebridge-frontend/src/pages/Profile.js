import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useAuth();
  
  const displayName = user?.first_name || user?.username || 'Caregiver';
  const joinDate = user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'May 2026';

  return (
    <div className="max-w-4xl mx-auto w-full pb-20">
      {/* Profile Header (Instagram/Facebook Style) */}
      <div className="vb-card p-8 mb-8 mt-12 relative flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
        {/* Profile Picture */}
        <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 rounded-full bg-gradient-to-tr from-primary to-secondary p-1 -mt-20 md:-mt-16 shadow-2xl">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-5xl font-bold text-primary border-4 border-white/50">
            {displayName[0].toUpperCase()}
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1">
          <h1 className="font-serif-display text-3xl md:text-4xl font-bold text-on-surface mb-2">
            {displayName}
          </h1>
          <p className="text-on-surface-variant font-medium text-lg mb-4">
            @{user?.username || 'caregiver_profile'}
          </p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm mb-6">
            <div className="flex flex-col">
              <span className="font-bold text-lg text-on-surface">ID</span>
              <span className="text-on-surface-variant">#{user?.id || '1024'}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-on-surface">Children</span>
              <span className="text-on-surface-variant">2 Profiles</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-on-surface">Joined</span>
              <span className="text-on-surface-variant">{joinDate}</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <button className="vb-btn-primary">Edit Profile</button>
            <button className="vb-btn-secondary">Settings</button>
            <button onClick={logout} className="vb-btn-danger flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">logout</span> Log Out
            </button>
          </div>
        </div>
      </div>

      {/* Activity / Posts Section */}
      <h2 className="font-serif-display text-2xl font-bold mb-4">Recent Activity</h2>
      <div className="grid gap-4">
        {[
          { text: "Updated \"Morning Routine\" board.", time: "2 hours ago" },
          { text: "Added 5 new custom icons to the library.", time: "Yesterday" },
          { text: "Logged a care journal entry.", time: "3 days ago" },
        ].map((act, i) => (
          <div key={i} className="vb-card p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
                <span className="material-symbols-outlined">history</span>
              </div>
              <p className="font-medium">{act.text}</p>
            </div>
            <span className="text-xs text-on-surface-variant font-medium bg-surface-container px-3 py-1 rounded-full">
              {act.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
