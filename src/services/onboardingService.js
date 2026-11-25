import { STORAGE_KEYS } from "../utils/constants.js";
import { syncOnboarding } from "./remoteSync.js";
import { readJSON, writeJSON } from "./storage.js";

/** Rencana akademik dari onboarding. Dengan backend aktif, juga dikirim ke POST /api/users/onboarding. */
export function loadOnboarding() {
  const data = readJSON(STORAGE_KEYS.onboarding, {});
  return data && typeof data === "object" ? data : {};
}

/** @returns {boolean} true bila tersimpan */
export function saveOnboarding(data) {
  const ok = writeJSON(STORAGE_KEYS.onboarding, data);
  if (ok) syncOnboarding(data); // no-op bila backend tidak aktif
  return ok;
}

export const MIN_ENTRY_YEAR = 1990;

/** Tahun awal akademik berjalan: Agustus s.d. Desember = tahun ini, Januari s.d. Juli = tahun lalu. */
export function getAcademicCalendar(now = new Date()) {
  const month = now.getMonth(); // 0 = Januari
  const year = now.getFullYear();
  const academicStartYear = month >= 7 ? year : year - 1;
  const currentTerm = month >= 7 || month === 0 ? "ganjil" : "genap";
  return { academicStartYear, currentTerm };
}

/** Nomor semester aktif, atau null bila tahun masuk tidak valid. */
export function computeActiveSemester(entryYear, term, academicStartYear) {
  const year = Number(entryYear);
  if (!Number.isInteger(year) || year < MIN_ENTRY_YEAR || year > academicStartYear) return null;
  return (academicStartYear - year) * 2 + (term === "genap" ? 2 : 1);
}
