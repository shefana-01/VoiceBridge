import { useAuth } from '../context/AuthContext';
import { useState, useRef } from 'react';
import { auth as authApi } from '../api/endpoints';
import { toast } from '../components/Toaster';

export default function Profile() {
  const { user, logout } = useAuth();
  const fileInputRef = useRef(null);
  
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    organisation: user?.organisation || ''
  });
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setUploadingAvatar(true);
    try {
      await authApi.updateMe(formData);
      toast.success("Profile picture updated!");
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      toast.error("Failed to update profile picture.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const displayName = user?.first_name || user?.username || 'Caregiver';

  return (
    <div className="max-w-3xl mx-auto w-full pb-20 pt-8 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col items-center mb-10">
        
        {/* Profile Picture Upload */}
        <div className="relative mb-6 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className={`w-40 h-40 rounded-full border-4 border-white/50 shadow-2xl overflow-hidden bg-surface-container-low flex items-center justify-center transition-transform group-hover:scale-105 ${uploadingAvatar ? 'opacity-50' : ''}`}>
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-6xl font-bold text-primary opacity-50">{displayName[0]?.toUpperCase() || 'C'}</span>
            )}
          </div>
          
          <div className="absolute bottom-2 right-2 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
            <span className="material-symbols-outlined text-xl">camera_alt</span>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleAvatarChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        <h1 className="font-serif-display text-3xl font-bold text-on-surface mb-1">
          {displayName} {user?.last_name}
        </h1>
        <p className="text-on-surface-variant text-lg">
          {user?.role === 'PARENT' ? 'Parent / Family' : user?.role || 'Caregiver'}
        </p>
      </div>

      <div className="glass-card rounded-[2rem] border border-white/20 p-6 md:p-8 shadow-xl mb-8 bg-surface-bright">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined">person</span> Personal Information
          </h2>
          <button onClick={() => setShowEdit(true)} className="text-primary hover:text-primary/80 font-bold bg-primary-container/30 px-4 py-2 rounded-xl transition-colors">
            Edit
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col border-b border-outline-variant/20 pb-4">
            <span className="text-sm text-on-surface-variant mb-1 font-semibold">Name</span>
            <span className="text-lg text-on-surface">{displayName} {user?.last_name}</span>
          </div>
          <div className="flex flex-col border-b border-outline-variant/20 pb-4">
            <span className="text-sm text-on-surface-variant mb-1 font-semibold">Email</span>
            <span className="text-lg text-on-surface">{user?.email || 'Not provided'}</span>
          </div>
          <div className="flex flex-col border-b border-outline-variant/20 pb-4">
            <span className="text-sm text-on-surface-variant mb-1 font-semibold">Phone</span>
            <span className="text-lg text-on-surface">{user?.phone || 'Not provided'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-on-surface-variant mb-1 font-semibold">Organisation / Note</span>
            <span className="text-lg text-on-surface">{user?.organisation || 'Not provided'}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button onClick={logout} className="px-8 py-3 rounded-full bg-error-container text-error font-bold flex items-center gap-2 hover:bg-error hover:text-white transition-all shadow-md">
          <span className="material-symbols-outlined">logout</span> Log Out
        </button>
      </div>

      {/* Edit Profile Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="vb-card max-w-md w-full p-8 animate-[slideUp_0.3s_ease-out] rounded-[2rem]">
            <h2 className="font-serif-display text-2xl font-bold mb-6">Edit Profile</h2>
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="vb-label">First Name</label>
                  <input className="vb-input bg-surface-container-lowest" value={editForm.first_name} onChange={e => setEditForm({...editForm, first_name: e.target.value})} required />
                </div>
                <div>
                  <label className="vb-label">Last Name</label>
                  <input className="vb-input bg-surface-container-lowest" value={editForm.last_name} onChange={e => setEditForm({...editForm, last_name: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="vb-label">Email Address</label>
                <input type="email" className="vb-input bg-surface-container-lowest" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} required />
              </div>
              <div>
                <label className="vb-label">Phone Number</label>
                <input type="tel" className="vb-input bg-surface-container-lowest" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
              </div>
              <div>
                <label className="vb-label">Organization</label>
                <input className="vb-input bg-surface-container-lowest" value={editForm.organisation} onChange={e => setEditForm({...editForm, organisation: e.target.value})} />
              </div>
              
              <div className="pt-6 flex gap-4">
                <button type="submit" disabled={saving} className="vb-btn-primary flex-1 py-3 text-lg shadow-md">
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={() => setShowEdit(false)} className="vb-btn-secondary flex-1 py-3 text-lg">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
