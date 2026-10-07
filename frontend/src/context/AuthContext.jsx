import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { authApi } from '@/api/auth.api';
import { AUTH_LOGOUT_EVENT } from '@/api/client';
import { tokenStorage } from '@/utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(() => (tokenStorage.get() ? 'loading' : 'anonymous'));

  const clearSession = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    setStatus('anonymous');
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    if (!tokenStorage.get()) return;
    authApi
      .me()
      .then((me) => {
        setUser(me);
        setStatus('authenticated');
      })
      .catch(clearSession);
  }, [clearSession]);

  useEffect(() => {
    window.addEventListener(AUTH_LOGOUT_EVENT, clearSession);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, clearSession);
  }, [clearSession]);

  const login = useCallback(async (credentials) => {
    const { access_token: token, user: loggedIn } = await authApi.login(credentials);
    tokenStorage.set(token);
    setUser(loggedIn);
    setStatus('authenticated');
    return loggedIn;
  }, []);

  const hasRole = useCallback((roles) => Boolean(user && roles.includes(user.role)), [user]);

  const value = useMemo(
    () => ({ user, status, login, logout: clearSession, hasRole }),
    [user, status, login, clearSession, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
