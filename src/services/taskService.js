import { STORAGE_KEYS } from "../utils/constants.js";
import { getTasks } from "./academicData.js";
import { syncCollection } from "./remoteSync.js";
import { writeJSON } from "./storage.js";

/**
 * Service tugas.
 * SAAT INI: localStorage (sama dengan js/tasks.js versi HTML).
 * Bila VITE_API_URL diisi, perubahan juga dikirim ke /api/tasks (lihat remoteSync.js).
 */
export const loadTasks = getTasks;
export const saveTasks = (tasks) => {
  const ok = writeJSON(STORAGE_KEYS.tasks, tasks);
  syncCollection("tasks", tasks); // no-op bila backend tidak aktif
  if (ok) window.dispatchEvent(new CustomEvent("getdone:tasks-changed"));
  return ok;
};

export const LEGACY_COURSES = {
  pemweb: "Pemrograman Web",
  basisdata: "Basis Data",
  algoritma: "Algoritma & Struktur Data",
  uiux: "UI/UX Design",
  jarkom: "Jaringan Komputer",
};
export const COURSE_BADGE = {
  pemweb: "bg-secondary-container text-on-secondary-fixed",
  basisdata: "bg-tertiary-fixed text-on-tertiary-fixed",
  algoritma: "bg-surface-container-high text-tertiary",
  uiux: "bg-primary-fixed text-on-primary-fixed-variant",
  jarkom: "bg-surface-muted text-text-muted",
};
export const DEFAULT_BADGE = "bg-surface-muted text-text-muted";
export const PRIORITY = {
  high: { label: "High", badge: "bg-error-container text-state-urgent", dot: "bg-state-urgent" },
  medium: { label: "Medium", badge: "bg-tertiary-fixed text-on-tertiary-fixed", dot: "bg-tertiary" },
  low: { label: "Low", badge: "bg-surface-muted text-text-muted", dot: "bg-text-muted" },
};
export const STATUS = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};
export const STATUS_KEYS = Object.keys(STATUS);

const pad = (n) => String(n).padStart(2, "0");

/** "Hari ini, 23:59" / "Besok, 17:00" / "28 Okt, 14:00" */
export function formatDeadline(value, now = new Date()) {
  const d = new Date(value);
  const day = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
  const diff = Math.round((day(d) - day(now)) / 864e5);
  const label = diff === 0 ? "Hari ini" : diff === 1 ? "Besok" : d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  return `${label}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const isUrgent = (task) => task.status !== "done" && new Date(task.deadline) - Date.now() < 864e5;
export const isLate = (task) => isUrgent(task) && new Date(task.deadline) < new Date();
