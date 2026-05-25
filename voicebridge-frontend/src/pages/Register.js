import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { toast } from '../components/Toaster';

const initial = {
  username: '', email: '',
  first_name: '', last_name: '',
  role: 'PARENT',
  password: '', password_confirm: '',
};

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState(initial);
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);

  const upd = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const errOf = (k) => (Array.isArray(errs[k]) ? errs[k][0] : errs[k]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErrs({});
    try {
      await register(form);
      toast.success('Account created. Welcome to VoiceBridge.');
      nav('/');
    } catch (err) {
      setErrs(err.response?.data || {});
      toast.error('Could not create account — see fields below.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10
                    bg-gradient-to-br from-primary-fixed via-background to-secondary-container">
      <form onSubmit={submit}
            className="w-full max-w-md vb-card shadow-xl">
        <div className="font-serif-display text-3xl font-bold text-on-surface mb-2">
          Join VoiceBridge
        </div>
        <p className="text-on-surface-variant mb-6 text-sm">
          Help give a voice to someone you love.
        </p>

        {[
          ['Username',  'username',  'text'],
          ['Email',     'email',     'email'],
          ['First name','first_name','text'],
          ['Last name', 'last_name', 'text'],
        ].map(([label, key, type]) => (
          <div key={key} className="mb-3">
            <label className="vb-label">{label}</label>
            <input type={type} className="vb-input"
                   value={form[key]} onChange={upd(key)}
                   required={key !== 'last_name'} />
            {errOf(key) && (
              <div className="text-error text-xs mt-1">{errOf(key)}</div>
            )}
          </div>
        ))}

        <div className="mb-3">
          <label className="vb-label">I am a…</label>
          <select className="vb-input" value={form.role} onChange={upd('role')}>
            <option value="PARENT">Parent / family member</option>
            <option value="THERAPIST">Speech / OT therapist</option>
            <option value="TEACHER">Teacher / school staff</option>
            <option value="OTHER">Other caregiver</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="vb-label">Password</label>
          <input type="password" className="vb-input"
                 value={form.password} onChange={upd('password')} required />
          {errOf('password') && (
            <div className="text-error text-xs mt-1">{errOf('password')}</div>
          )}
        </div>

        <div className="mb-6">
          <label className="vb-label">Confirm password</label>
          <input type="password" className="vb-input"
                 value={form.password_confirm} onChange={upd('password_confirm')}
                 required />
        </div>

        <button className="vb-btn-primary w-full" disabled={busy}>
          {busy ? 'Creating account…' : 'Create account'}
        </button>

        <p className="text-center text-sm text-on-surface-variant mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
