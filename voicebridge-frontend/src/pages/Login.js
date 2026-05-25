import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { toast } from '../components/Toaster';

export default function Login() {
  const { login, user } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', code: '' });
  const [busy, setBusy] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);

  useEffect(() => {
    if (user) {
      nav('/');
    }
  }, [user, nav]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(form.username, form.password, form.code);
      toast.success('Welcome back.');
      nav('/');
    } catch (err) {
      if (err.response?.data?.mfa_required) {
        setMfaRequired(true);
        toast.info('Please enter your authenticator code.');
      } else {
        toast.error(err.response?.data?.detail || err.response?.data?.error || 'Sign in failed.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <img alt="Atmospheric background" className="sanctuary-bg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_4PWmZ-0nCsZ6edf5iXGGOwdnfekV-dyb4r5NPCKZqMDNuJpN0d7Au1LDy2AYlpBduY_2y6JHCIXUeXgHi_schp9M59u2falVJpaMr1vrpAI9xFullCRKufMRByHD7b4Fd8VRszK0MaxBuofUzdcg-1a7s102PGD_Yg-N02KBivFs0p9SY3CJIwBS4U770khGppnKF6kdqbdkT6PzkdbFLs8U-mP3KKteIVtRCwNak_Or6abPsXXO_JLUYUg0JHzfrH2Ga831Y7A"/>
      <div className="min-h-screen flex items-center justify-center px-4 bg-transparent relative z-10">
        <form onSubmit={submit}
              className="w-full max-w-md vb-card shadow-2xl glass-card">
        <div className="font-serif-display text-3xl font-bold text-on-surface mb-2">
          VoiceBridge
        </div>
        <p className="text-on-surface-variant mb-8 text-sm">
          Sign in to manage your child's communication boards.
        </p>

        <label className="vb-label">Username</label>
        <input className="vb-input mb-4" required autoFocus
               value={form.username}
               onChange={(e) => setForm({ ...form, username: e.target.value })}
               disabled={mfaRequired} />

        <label className="vb-label">Password</label>
        <input className="vb-input mb-6" required type="password"
               value={form.password}
               onChange={(e) => setForm({ ...form, password: e.target.value })}
               disabled={mfaRequired} />

        {mfaRequired && (
          <>
            <label className="vb-label text-secondary">Authenticator Code</label>
            <input className="vb-input mb-6 border-secondary focus:ring-secondary" 
                   required type="text" maxLength="6" placeholder="000000" autoFocus
                   value={form.code}
                   onChange={(e) => setForm({ ...form, code: e.target.value })} />
          </>
        )}

        <button className="vb-btn-primary w-full" disabled={busy}>
          {busy ? 'Signing in…' : mfaRequired ? 'Verify & Sign in' : 'Sign in'}
        </button>

        {!mfaRequired && (
          <p className="text-center text-sm text-on-surface-variant mt-6">
            New here?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        )}
      </form>
      </div>
    </>
  );
}
