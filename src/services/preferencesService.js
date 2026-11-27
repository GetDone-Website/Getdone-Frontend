import { STORAGE_KEYS } from "../utils/constants.js";
import { clampNumber } from "./focusService.js";
import { readJSON, writeJSON } from "./storage.js";

export const FONT_SCALE_OPTIONS = [
  { id: "small", label: "Kecil (90%)", px: "14.4px" },
  { id: "normal", label: "Normal (100%)", px: "16px" },
  { id: "large", label: "Besar (112%)", px: "18px" },
  { id: "xlarge", label: "Sangat Besar (125%)", px: "20px" },
];

export function applyFontScale(scale = "normal") {
  const found = FONT_SCALE_OPTIONS.find((o) => o.id === scale) || FONT_SCALE_OPTIONS[1];
  document.documentElement.style.fontSize = found.px;
  return found.px;
}

export const DEFAULT_PREFERENCES = {
  // Pomodoro & Alarm
  alarmSound: "bell", // "bell" | "chime" | "digital" | "gong" | "custom" | "none"
  alarmVolume: 75,
  customAlarmDataUrl: "",
  customAlarmName: "",
  desktopNotification: true,
  // Manajemen Tugas
  tasksDefaultView: "kanban", // "kanban" | "table"
  tasksDefaultSort: "deadline", // "deadline" | "priority" | "newest"
  urgentThresholdHours: 24, // 12 | 24 | 48
  confirmDeleteTask: true,
  // Manajemen Mata Kuliah
  maxSksLimit: 24,
  coursesDefaultSemester: "current", // "current" | "passed" | "failed"
  coursesDefaultSort: "schedule", // "schedule" | "tasks" | "name"
  // Tampilan
  fontScale: "normal", // "small" | "normal" | "large" | "xlarge"
};

const VALID_SOUNDS = new Set(["bell", "chime", "digital", "gong", "custom", "none"]);
const VALID_VIEWS = new Set(["kanban", "table"]);
const VALID_TASK_SORTS = new Set(["deadline", "priority", "newest"]);
const VALID_THRESHOLDS = new Set([12, 24, 48]);
const VALID_SEMESTERS = new Set(["current", "passed", "failed"]);
const VALID_COURSE_SORTS = new Set(["schedule", "tasks", "name"]);
const VALID_FONT_SCALES = new Set(["small", "normal", "large", "xlarge"]);

export function loadPreferences() {
  const saved = readJSON(STORAGE_KEYS.preferences, null);
  if (!saved || typeof saved !== "object") return { ...DEFAULT_PREFERENCES };
  return {
    alarmSound: VALID_SOUNDS.has(saved.alarmSound) ? saved.alarmSound : DEFAULT_PREFERENCES.alarmSound,
    alarmVolume: clampNumber(saved.alarmVolume, DEFAULT_PREFERENCES.alarmVolume, 0, 100),
    customAlarmDataUrl: typeof saved.customAlarmDataUrl === "string" ? saved.customAlarmDataUrl : "",
    customAlarmName: typeof saved.customAlarmName === "string" ? saved.customAlarmName : "",
    desktopNotification: saved.desktopNotification !== false,
    tasksDefaultView: VALID_VIEWS.has(saved.tasksDefaultView) ? saved.tasksDefaultView : DEFAULT_PREFERENCES.tasksDefaultView,
    tasksDefaultSort: VALID_TASK_SORTS.has(saved.tasksDefaultSort) ? saved.tasksDefaultSort : DEFAULT_PREFERENCES.tasksDefaultSort,
    urgentThresholdHours: VALID_THRESHOLDS.has(Number(saved.urgentThresholdHours))
      ? Number(saved.urgentThresholdHours)
      : DEFAULT_PREFERENCES.urgentThresholdHours,
    confirmDeleteTask: saved.confirmDeleteTask !== false,
    maxSksLimit: clampNumber(saved.maxSksLimit, DEFAULT_PREFERENCES.maxSksLimit, 18, 28),
    coursesDefaultSemester: VALID_SEMESTERS.has(saved.coursesDefaultSemester)
      ? saved.coursesDefaultSemester
      : DEFAULT_PREFERENCES.coursesDefaultSemester,
    coursesDefaultSort: VALID_COURSE_SORTS.has(saved.coursesDefaultSort)
      ? saved.coursesDefaultSort
      : DEFAULT_PREFERENCES.coursesDefaultSort,
    fontScale: VALID_FONT_SCALES.has(saved.fontScale) ? saved.fontScale : DEFAULT_PREFERENCES.fontScale,
  };
}

export function savePreferences(next) {
  const normalized = { ...loadPreferences(), ...next };
  const ok = writeJSON(STORAGE_KEYS.preferences, normalized);
  window.dispatchEvent(new CustomEvent("getdone:preferences-changed", { detail: normalized }));
  return ok;
}

export function resetPreferences() {
  const ok = writeJSON(STORAGE_KEYS.preferences, DEFAULT_PREFERENCES);
  window.dispatchEvent(new CustomEvent("getdone:preferences-changed", { detail: DEFAULT_PREFERENCES }));
  return ok;
}
