import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth as authApi } from '../api/endpoints';
import api from '../api/client';
import { toast } from '../components/Toaster';
import { Link } from 'react-router-dom';

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('notifications');
  
  // MFA States
  const [qrCode, setQrCode] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaBusy, setMfaBusy] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(user?.mfa_enabled || false);

  // Preference States
  const [prefs, setPrefs] = useState({
    soundEnabled: true,
    pushEnabled: true,
    emailAlerts: false,
    ...(user?.preferences || {})
  });

  useEffect(() => {
    // Setup MFA if active tab is privacy and not enabled
    if (activeTab === 'privacy' && !mfaEnabled) {
      api.get('/auth/mfa/setup/')
        .then(res => setQrCode(res.data.qr_code))
        .catch(() => toast.error('Could not fetch MFA details.'));
    }
  }, [activeTab, mfaEnabled]);

  const togglePref = async (key) => {
    const newPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(newPrefs);
    try {
      await authApi.updateMe({ preferences: newPrefs });
    } catch {
      toast.error('Failed to save preference.');
      // revert
      setPrefs({ ...prefs });
    }
  };

  const verifyMfa = async (e) => {
    e.preventDefault();
    setMfaBusy(true);
    try {
      await api.post('/auth/mfa/verify/', { code: mfaCode });
      setMfaEnabled(true);
      toast.success('MFA successfully enabled!');
    } catch (err) {
      toast.error('Invalid code. Please try again.');
    } finally {
      setMfaBusy(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full pb-20 flex flex-col md:flex-row gap-8">
      {/* Settings Sidebar (WhatsApp Style) */}
      <div className="w-full md:w-64 shrink-0">
        <h1 className="font-serif-display text-3xl font-bold text-on-surface mb-6">Settings</h1>
        <div className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 custom-scrollbar">
          {[
            { id: 'account', label: 'Account', icon: 'person' },
            { id: 'privacy', label: 'Privacy & Security', icon: 'lock' },
            { id: 'notifications', label: 'Notifications', icon: 'notifications' },
            { id: 'appearance', label: 'Appearance', icon: 'palette' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-md'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Settings Content Area */}
      <div className="flex-1 min-w-0">
        <div className="vb-card p-6 md:p-8 min-h-[400px]">
          
          {/* ACCOUNT SETTINGS */}
          {activeTab === 'account' && (
            <div className="animate-[fadeIn_0.2s_ease-out]">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">person</span> Account
              </h2>
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-surface-container-low rounded-xl gap-4">
                  <div>
                    <h3 className="font-bold text-on-surface">Profile Information</h3>
                    <p className="text-sm text-on-surface-variant">Update your name, email, and phone number.</p>
                  </div>
                  <Link to="/profile" className="vb-btn-secondary text-sm whitespace-nowrap">Edit Profile</Link>
                </div>
                <div className="border-t border-outline-variant my-4" />
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-error-container/20 border border-error-container/50 rounded-xl gap-4">
                  <div>
                    <h3 className="font-bold text-error">Delete Account</h3>
                    <p className="text-sm text-on-surface-variant">Permanently delete your account and all data.</p>
                  </div>
                  <button className="vb-btn-danger text-sm whitespace-nowrap">Delete</button>
                </div>
              </div>
            </div>
          )}

          {/* PRIVACY & SECURITY */}
          {activeTab === 'privacy' && (
            <div className="animate-[fadeIn_0.2s_ease-out]">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">lock</span> Privacy & Security
              </h2>
              
              <div className="p-5 border border-outline-variant rounded-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-full text-white ${mfaEnabled ? 'bg-green-500 shadow-green-500/20 shadow-lg' : 'bg-orange-400 shadow-orange-400/20 shadow-lg'}`}>
                    <span className="material-symbols-outlined text-2xl">{mfaEnabled ? 'gpp_good' : 'shield_moon'}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Two-Step Verification</h3>
                    <p className="text-sm text-on-surface-variant">
                      {mfaEnabled ? 'Your account is highly secure.' : 'Add extra security to your account.'}
                    </p>
                  </div>
                </div>

                {!mfaEnabled && (
                  <div className="mt-6 p-4 bg-surface-container-low rounded-xl">
                    <p className="text-sm text-on-surface-variant mb-4">
                      1. Scan this QR code with your authenticator app (like Google Authenticator or Authy).
                    </p>
                    {qrCode && (
                      <div className="bg-white p-4 rounded-xl inline-block mb-4 border border-outline-variant shadow-sm">
                        <img src={`data:image/png;base64,${qrCode}`} alt="MFA QR Code" className="w-32 h-32" />
                      </div>
                    )}
                    <p className="text-sm text-on-surface-variant mb-4">
                      2. Enter the 6-digit code generated by the app.
                    </p>
                    <form onSubmit={verifyMfa} className="flex gap-2">
                      <input
                        type="text"
                        className="vb-input flex-1 max-w-[200px] tracking-[0.2em] text-center font-bold"
                        placeholder="000000"
                        maxLength="6"
                        required
                        value={mfaCode}
                        onChange={e => setMfaCode(e.target.value)}
                      />
                      <button type="submit" disabled={mfaBusy || mfaCode.length !== 6} className="vb-btn-primary">
                        {mfaBusy ? 'Verifying...' : 'Enable'}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="animate-[fadeIn_0.2s_ease-out]">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">notifications</span> Notifications
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-5 hover:bg-surface-container-low rounded-xl transition-colors cursor-pointer border border-transparent hover:border-outline-variant" onClick={() => togglePref('soundEnabled')}>
                  <div>
                    <h3 className="font-bold text-on-surface text-lg">In-App Sounds</h3>
                    <p className="text-sm text-on-surface-variant">Play sounds for incoming alerts and messages.</p>
                  </div>
                  <div className={`w-14 h-7 rounded-full flex items-center transition-colors ${prefs.soundEnabled ? 'bg-primary' : 'bg-surface-variant'} p-1 shadow-inner`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${prefs.soundEnabled ? 'translate-x-7' : 'translate-x-0'}`}></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-5 hover:bg-surface-container-low rounded-xl transition-colors cursor-pointer border border-transparent hover:border-outline-variant" onClick={() => togglePref('pushEnabled')}>
                  <div>
                    <h3 className="font-bold text-on-surface text-lg">Push Notifications</h3>
                    <p className="text-sm text-on-surface-variant">Show desktop/mobile alerts when app is closed.</p>
                  </div>
                  <div className={`w-14 h-7 rounded-full flex items-center transition-colors ${prefs.pushEnabled ? 'bg-primary' : 'bg-surface-variant'} p-1 shadow-inner`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${prefs.pushEnabled ? 'translate-x-7' : 'translate-x-0'}`}></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-5 hover:bg-surface-container-low rounded-xl transition-colors cursor-pointer border border-transparent hover:border-outline-variant" onClick={() => togglePref('emailAlerts')}>
                  <div>
                    <h3 className="font-bold text-on-surface text-lg">Email Alerts</h3>
                    <p className="text-sm text-on-surface-variant">Send weekly summaries to your email.</p>
                  </div>
                  <div className={`w-14 h-7 rounded-full flex items-center transition-colors ${prefs.emailAlerts ? 'bg-primary' : 'bg-surface-variant'} p-1 shadow-inner`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${prefs.emailAlerts ? 'translate-x-7' : 'translate-x-0'}`}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* APPEARANCE */}
          {activeTab === 'appearance' && (
            <div className="animate-[fadeIn_0.2s_ease-out]">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">palette</span> Appearance
              </h2>
              
              <div className="p-6 bg-surface-container-low rounded-xl flex items-center justify-between border border-outline-variant">
                <div>
                  <h3 className="font-bold text-on-surface text-lg">Dark Mode</h3>
                  <p className="text-sm text-on-surface-variant">Toggle dark theme across the application.</p>
                </div>
                <button onClick={() => document.documentElement.classList.toggle('dark')} className="vb-btn-secondary">
                  Toggle Theme
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
