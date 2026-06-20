import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { children as childApi, journal as journalApi, auth as authApi } from '../api/endpoints';
import { toast } from '../components/Toaster';

export default function Profile() {
  const { user, logout } = useAuth();
  const [childCount, setChildCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    organisation: user?.organisation || ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    childApi.list().then(({ data }) => {
      const list = data.results ?? data ?? [];
      setChildCount(list.length);
    }).catch(() => {});
    
    journalApi.list().then(({ data }) => {
      const list = data.results ?? data ?? [];
      setRecentActivity(list.slice(0, 3));
    }).catch(() => {});
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authApi.updateMe(editForm);
      toast.success("Profile updated!");
      setShowEdit(false);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const displayName = user?.first_name || user?.username || 'Caregiver';
  const joinDate = user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'May 2026';

  return (
    <div className="max-w-4xl mx-auto w-full pb-20">
      {/* Profile Header */}
      <div className="vb-card p-8 mb-8 mt-12 relative flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
        {/* Profile Picture */}
        <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 rounded-full bg-gradient-to-tr from-primary to-secondary p-1 -mt-20 md:-mt-16 shadow-2xl">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-5xl font-bold text-primary border-4 border-white/50">
            {displayName[0]?.toUpperCase() || 'C'}
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1">
          <h1 className="font-serif-display text-3xl md:text-4xl font-bold text-on-surface mb-2">
            {displayName} {user?.last_name}
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
              <span className="text-on-surface-variant">{childCount} Profile{childCount !== 1 && 's'}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-on-surface">Joined</span>
              <span className="text-on-surface-variant">{joinDate}</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <button onClick={() => setShowEdit(true)} className="vb-btn-primary">Edit Profile</button>
            <Link to="/settings" className="vb-btn-secondary">Settings</Link>
            <button onClick={logout} className="vb-btn-danger flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">logout</span> Log Out
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="vb-card max-w-md w-full p-6 animate-[slideUp_0.3s_ease-out]">
            <h2 className="font-serif-display text-2xl font-bold mb-6">Edit Profile</h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="vb-label">First Name</label>
                  <input className="vb-input" value={editForm.first_name} onChange={e => setEditForm({...editForm, first_name: e.target.value})} required />
                </div>
                <div>
                  <label className="vb-label">Last Name</label>
                  <input className="vb-input" value={editForm.last_name} onChange={e => setEditForm({...editForm, last_name: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="vb-label">Email Address</label>
                <input type="email" className="vb-input" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} required />
              </div>
              <div>
                <label className="vb-label">Phone Number</label>
                <input type="tel" className="vb-input" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
              </div>
              <div>
                <label className="vb-label">Organization / School (Optional)</label>
                <input className="vb-input" value={editForm.organisation} onChange={e => setEditForm({...editForm, organisation: e.target.value})} />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="submit" disabled={saving} className="vb-btn-primary flex-1">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setShowEdit(false)} className="vb-btn-ghost flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activity / Posts Section */}
      <h2 className="font-serif-display text-2xl font-bold mb-4">Recent Journal Entries</h2>
      <div className="grid gap-4">
        {recentActivity.length === 0 ? (
          <div className="text-on-surface-variant italic p-4 bg-surface-container-low rounded-2xl">No recent journal entries. Add some to your child's daily life log!</div>
        ) : (
          recentActivity.map((act) => (
            <div key={act.id} className="vb-card p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold shrink-0">
                  <span className="material-symbols-outlined">edit_note</span>
                </div>
                <p className="font-medium text-on-surface">{act.text}</p>
              </div>
              <span className="text-xs text-on-surface-variant font-medium bg-surface-container px-3 py-1 rounded-full shrink-0">
                {new Date(act.created_at).toLocaleDateString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
