import { STORAGE_KEYS } from "../utils/constants.js";
import { API_ENABLED } from "./api.js";
import { readJSON } from "./storage.js";

/**
 * Padanan js/academic-data.js (GetDoneData) versi HTML.
 * Fungsi di sini hanya MEMBACA localStorage dan menggabungkan data; tidak menulis apa pun.
 * Dipakai bersama oleh halaman Courses, Tasks, Analytics, dan Profile.
 * NANTI: ganti sumber data dengan panggilan API (courseService / taskService / userService).
 */

export const LEGACY_LABELS = {
  pemweb: "Pemrograman Web",
  basisdata: "Basis Data",
  algoritma: "Algoritma & Struktur Data",
  uiux: "UI/UX Design",
  jarkom: "Jaringan Komputer",
};
const LEGACY_TO_ID = { pemweb: "s1", basisdata: "s2", uiux: "s4", jarkom: "s5" };

export const DEFAULT_COURSES = [
  { id: "s1", name: "Pemrograman Web Lanjut", code: "CS304", sks: 3, semesterStatus: "current" },
  { id: "s2", name: "Basis Data Terdistribusi", code: "CS308", sks: 3, semesterStatus: "current" },
  { id: "s3", name: "Rekayasa Perangkat Lunak", code: "SE202", sks: 3, semesterStatus: "current" },
  { id: "s4", name: "Interaksi Manusia & Komputer", code: "UX301", sks: 3, semesterStatus: "current" },
  { id: "s5", name: "Jaringan Komputer & Siber", code: "NET205", sks: 3, semesterStatus: "current" },
  { id: "s6", name: "Kecerdasan Buatan", code: "AI401", sks: 3, semesterStatus: "current" },
];

export const slug = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export function getOnboarding() {
  const data = readJSON(STORAGE_KEYS.onboarding, {});
  return data && typeof data === "object" ? data : {};
}

/** Daftar mata kuliah (tersimpan atau bawaan) + item dari onboarding yang belum ada. */
export function getCourses() {
  const stored = readJSON(STORAGE_KEYS.courses, null);
  const list = Array.isArray(stored) ? stored.map((c) => ({ ...c })) : (API_ENABLED ? [] : DEFAULT_COURSES).map((c) => ({ ...c }));
  const plan = getOnboarding();
  const addPlanItems = (items, status) =>
    (Array.isArray(items) ? items : []).forEach((item, index) => {
      const name = String(item?.name || "").trim();
      if (
        !name ||
        list.some((c) => String(c.name || "").toLowerCase() === name.toLowerCase() && (c.semesterStatus || "current") === status)
      )
        return;
      const prefix = status === "failed" ? "arrear-" : "onboard-";
      const id = `${prefix}${slug(name) || index + 1}`;
      if (list.some((c) => String(c.id) === id)) return;
      list.push({ id, name, code: item.code || "", sks: Number(item.credits || item.sks) || 3, semesterStatus: status });
    });
  addPlanItems(plan.courses, "current");
  addPlanItems(plan.arrears, "failed");
  return list;
}

const pad = (n) => String(n).padStart(2, "0");
function dueAt(offsetDays, h, m) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(h)}:${pad(m)}`;
}

/** Data tugas demo (dipakai bila localStorage kosong). */
export function seedTasks() {
  return [
    { id: "1", title: "Implementasi API Authentication JWT", course: "pemweb", priority: "high", deadline: dueAt(1, 23, 59), desc: "Lengkapi refresh token, hashing Bcrypt, dan validasi middleware.", status: "todo" },
    { id: "2", title: "Normalisasi Tabel Sistem Akademik", course: "basisdata", priority: "medium", deadline: dueAt(3, 17, 0), desc: "", status: "todo" },
    { id: "3", title: "Desain Wireframe Hi-Fi Mobile App", course: "uiux", priority: "high", deadline: dueAt(4, 14, 0), desc: "Finalisasi komponen dan token tipografi.", status: "in_progress" },
    { id: "4", title: "Laporan Dynamic Programming", course: "algoritma", priority: "medium", deadline: dueAt(2, 20, 0), desc: "", status: "in_progress" },
    { id: "5", title: "Rancangan ERD Perpustakaan", course: "basisdata", priority: "low", deadline: dueAt(-1, 12, 0), desc: "", status: "done", doneAt: Date.now() - 864e5 },
  ];
}

export function getTasks() {
  const stored = readJSON(STORAGE_KEYS.tasks, null);
  return Array.isArray(stored) ? stored : (API_ENABLED ? [] : seedTasks());
}

export function resolveCourseId(value, courses = getCourses()) {
  const raw = String(value ?? "").trim();
  if (!raw || raw === "all") return raw;
  if (courses.some((c) => String(c.id) === raw)) return raw;
  if (LEGACY_TO_ID[raw] && courses.some((c) => String(c.id) === LEGACY_TO_ID[raw])) return LEGACY_TO_ID[raw];
  const target = slug(raw);
  const found = courses.find((c) => [c.name, c.code, c.id].some((field) => slug(field) === target));
  return found ? String(found.id) : raw;
}

export function taskMatchesCourse(taskCourse, selectedCourse, courses = getCourses()) {
  if (!selectedCourse || selectedCourse === "all") return true;
  const taskId = resolveCourseId(taskCourse, courses);
  const selectedId = resolveCourseId(selectedCourse, courses);
  if (taskId === selectedId) return true;
  // Mendukung label mata kuliah lama pada data demo.
  const taskLabel = LEGACY_LABELS[String(taskCourse)] || taskCourse;
  const selected = courses.find((c) => String(c.id) === String(selectedId));
  return Boolean(selected && slug(taskLabel) === slug(selected.name));
}

export function courseLabel(value, courses = getCourses()) {
  const raw = String(value ?? "");
  const course = courses.find((c) => String(c.id) === raw || slug(c.name) === slug(raw) || slug(c.code) === slug(raw));
  return course?.name || LEGACY_LABELS[raw] || raw || "Mata Kuliah";
}
