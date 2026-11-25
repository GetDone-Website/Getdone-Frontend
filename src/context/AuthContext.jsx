import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { API_ENABLED } from "../services/api.js";
import * as authService from "../services/authService.js";
import { readJSON, writeJSON } from "../services/storage.js";
import { STORAGE_KEYS } from "../utils/constants.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => authService.getSession());

  // login/register selalu mengembalikan Promise (lokal maupun backend) agar pemanggil cukup memakai `await`.
  const login = useCallback(async (credentials) => {
    const next = API_ENABLED ? await authService.loginRemote(credentials) : authService.login(credentials);
    setSession(next);
    return next;
  }, []);

  const register = useCallback(async (payload) => {
    const next = API_ENABLED ? await authService.registerRemote(payload) : authService.register(payload);
    setSession(next);
    return next;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setSession(null);
  }, []);

  const updateSessionUser = useCallback((profile) => {
    const prevUser = readJSON(STORAGE_KEYS.user, {}) || {};
    const prevAuth = readJSON(STORAGE_KEYS.auth, {}) || {};
    const nextUser = {
      ...prevUser,
      fullName: profile.full_name ?? profile.fullName ?? prevUser.fullName,
      nim: profile.nim !== undefined ? (profile.nim || "") : (prevUser.nim || ""),
      email: profile.email ?? prevUser.email,
      university: profile.university !== undefined ? (profile.university || "") : (prevUser.university || ""),
      avatarUrl: profile.avatar_url !== undefined ? (profile.avatar_url || "") : (prevUser.avatarUrl || ""),
      createdAt: profile.created_at ?? prevUser.createdAt,
    };
    const nextAuth = {
      ...prevAuth,
      isLoggedIn: true,
      fullName: nextUser.fullName,
      email: nextUser.email,
      avatarUrl: nextUser.avatarUrl,
    };
    writeJSON(STORAGE_KEYS.user, nextUser);
    writeJSON(STORAGE_KEYS.auth, nextAuth);
    setSession(nextAuth);
    return nextUser;
  }, []);

  // Token ditolak server (kedaluwarsa): keluar dari sesi; ProtectedRoute akan mengarahkan ke /login.
  useEffect(() => {
    const onUnauthorized = () => {
      authService.logout();
      setSession(null);
    };
    window.addEventListener("getdone:unauthorized", onUnauthorized);
    return () => window.removeEventListener("getdone:unauthorized", onUnauthorized);
  }, []);

  const value = useMemo(
    () => ({ session, isLoggedIn: Boolean(session?.isLoggedIn), login, register, logout, updateSessionUser }),
    [session, login, register, logout, updateSessionUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
