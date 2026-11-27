import { STORAGE_KEYS } from "../utils/constants.js";
import { syncFocusSession } from "./remoteSync.js";
import { readFlag, readJSON, writeFlag, writeJSON } from "./storage.js";

/** Pengaturan & log sesi Pomodoro. Dengan backend aktif, log juga dikirim ke POST /api/analytics/focus-sessions. */
export const DEFAULT_FOCUS_SETTINGS = { focusMinutes: 25, breakMinutes: 5, sessions: 4, autoStart: false };

export function clampNumber(value, fallback, min, max) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, Math.round(number))) : fallback;
}

export function loadFocusSettings() {
  const saved = readJSON(STORAGE_KEYS.focusSettings, null);
  return {
    focusMinutes: clampNumber(saved?.focusMinutes, 25, 1, 120),
    breakMinutes: clampNumber(saved?.breakMinutes, 5, 1, 60),
    sessions: clampNumber(saved?.sessions, 4, 1, 12),
    // false = manual (tekan Mulai tiap fase), true = fase berikutnya berjalan otomatis.
    autoStart: saved?.autoStart === true,
  };
}

// Status panel pengaturan (disembunyikan/ditampilkan) dipisah dari pengaturan durasi.
export const loadSettingsHidden = () => readFlag(STORAGE_KEYS.focusSettingsHidden, false);
export const saveSettingsHidden = (hidden) => writeFlag(STORAGE_KEYS.focusSettingsHidden, hidden);

export const saveFocusSettings = (settings) => {
  const ok = writeJSON(STORAGE_KEYS.focusSettings, settings);
  window.dispatchEvent(new CustomEvent("getdone:focus-settings-changed", { detail: settings }));
  return ok;
};

export function logFocusSession({ taskId, taskTitle, durationMinutes }) {
  const log = readJSON(STORAGE_KEYS.focusSessions, []);
  if (!Array.isArray(log)) return;
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    taskId: taskId || null,
    taskTitle: taskTitle || "Sesi fokus mandiri",
    durationMinutes,
    completedAt: new Date().toISOString(),
  };
  log.push(entry);
  syncFocusSession(entry);
  writeJSON(STORAGE_KEYS.focusSessions, log.slice(-500));
  window.dispatchEvent(new CustomEvent("getdone:focus-changed"));
}
