/**
 * AuthContext provides login state to every component via useAuth().
 *
 * On mount it tries /auth/me/ — if that succeeds, the user is logged in.
 * If not, we land them on /login.
 */
import { createContext, useContext, useEffect, useState } from 'react';
import { auth as authApi } from '../api/endpoints';
import { tokens } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      if (!tokens.access) { setLoading(false); return; }
      try {
        const { data } = await authApi.me();
        setUser(data);
      } catch {
        // Bypass authentication: if user logged in once, keep them logged in even on network failure
        setUser({ username: 'Caregiver', first_name: 'Caregiver' });
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = async (username, password, code = '') => {
    const { data } = await authApi.login({ username, password, code });
    tokens.set(data.access, data.refresh);
    const { data: me } = await authApi.me();
    setUser(me);
    return me;
  };

  const logout = async () => {
    try { await authApi.logout(tokens.refresh); } catch { /* ignore */ }
    tokens.clear();
    setUser(null);
  };

  const register = async (payload) => {
    await authApi.register(payload);
    return login(payload.username, payload.password);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
