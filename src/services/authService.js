import { DEFAULT_USER_NAME, STORAGE_KEYS } from "../utils/constants.js";
import api, { API_ENABLED, getToken, setToken, unwrap } from "./api.js";
import { hydrateFromServer, resetHydration } from "./remoteSync.js";
import { readJSON, removeKey, writeJSON } from "./storage.js";

/**
 * Service autentikasi.
 * Saat API diaktifkan, login/register tervalidasi Laravel dan token Sanctum disimpan lokal.
 * Mode localStorage tanpa password hanya untuk demo offline.
 */
const STORAGE_ERROR = "Sesi demo tidak dapat disimpan di browser ini. Periksa izin penyimpanan lokal.";

export function getSession() {
  const auth = readJSON(STORAGE_KEYS.auth, null);
  // Sesi lama di localStorage tidak cukup untuk mengakses API: token wajib ada.
  return auth && auth.isLoggedIn === true && (!API_ENABLED || getToken()) ? auth : null;
}

export function getSavedUser() {
  return readJSON(STORAGE_KEYS.user, {}) || {};
}

function persistSession({ fullName, email }) {
  const session = { isLoggedIn: true, fullName, email, loggedAt: new Date().toISOString() };
  if (!writeJSON(STORAGE_KEYS.auth, session)) throw new Error(STORAGE_ERROR);
  return session;
}

export function register({ fullName, nim = "", email, university = "" }) {
  const name = (fullName || "").trim() || DEFAULT_USER_NAME;
  const cleanEmail = (email || "").trim();
  writeJSON(STORAGE_KEYS.user, {
    fullName: name,
    nim: (nim || "").trim(),
    email: cleanEmail,
    university: (university || "").trim(),
    createdAt: new Date().toISOString(),
  });
  return persistSession({ fullName: name, email: cleanEmail });
}

export function login({ email }) {
  const saved = getSavedUser();
  const fullName = saved.fullName || DEFAULT_USER_NAME;
  return persistSession({ fullName, email: (email || "").trim() });
}

export function logout() {
  removeKey(STORAGE_KEYS.auth);
  if (API_ENABLED) {
    // Jangan tampilkan data akun sebelumnya saat logout / ganti akun.
    [STORAGE_KEYS.user, STORAGE_KEYS.courses, STORAGE_KEYS.tasks, STORAGE_KEYS.onboarding, STORAGE_KEYS.focusSessions].forEach(removeKey);
  }
  if (API_ENABLED) {
    const token = getToken();
    // Cabut token di server (Laravel Sanctum). Header diberikan eksplisit karena token lokal dihapus tepat di bawah,
    // sebelum interceptor axios sempat membacanya. Gagal pun tidak masalah: sesi lokal tetap berakhir.
    if (token) api.post("/auth/logout", null, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
    setToken(null);
    resetHydration();
  }
}

// ---------- Mode backend (aktif bila VITE_API_URL diisi) ----------
async function finishRemoteAuth(payload) {
  if (!payload?.access_token) throw new Error("Token dari server tidak tersedia.");
  // Isolasi cache antar-akun, tidak mengubah preferensi tema.
  [STORAGE_KEYS.auth, STORAGE_KEYS.user, STORAGE_KEYS.courses, STORAGE_KEYS.tasks, STORAGE_KEYS.onboarding, STORAGE_KEYS.focusSessions].forEach(removeKey);
  setToken(payload.access_token);
  resetHydration();
  await hydrateFromServer(); // mengisi localStorage dengan data akun ini
  return getSession();
}

export async function registerRemote({ fullName, nim = "", email, password, university = "" }) {
  const body = {
    full_name: (fullName || "").trim(),
    nim: (nim || "").trim(),
    email: (email || "").trim(),
    password,
    university: (university || "").trim(),
  };
  return finishRemoteAuth(unwrap(await api.post("/auth/register", body)));
}

export async function loginRemote({ email, password }) {
  return finishRemoteAuth(unwrap(await api.post("/auth/login", { email: (email || "").trim(), password })));
}
