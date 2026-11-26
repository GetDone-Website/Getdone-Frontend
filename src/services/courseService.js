import { STORAGE_KEYS } from "../utils/constants.js";
import { API_ENABLED } from "./api.js";
import { getOnboarding, slug, taskMatchesCourse } from "./academicData.js";
import { syncCollection } from "./remoteSync.js";
import { readJSON, writeJSON } from "./storage.js";
import { DAYS, TIME_RE, applyCourseEdit, normalizeFormFields, validateCourseForm } from "./courseForm.js";

export { DAYS, TIME_RE, applyCourseEdit };

/**
 * Service mata kuliah.
 * SAAT INI: localStorage (sama dengan js/courses.js versi HTML).
 * Bila VITE_API_URL diisi, perubahan juga dikirim ke /api/courses (lihat remoteSync.js).
 */

export const ACCENTS = ["bg-primary-container", "bg-secondary", "bg-tertiary-container", "bg-state-progress", "bg-state-done", "bg-primary"];

const SEED = [
  { id: "s1", name: "Pemrograman Web Lanjut", code: "CS304", sks: 3, desc: "Full-stack React, Next.js, REST API & Arsitektur Mikroservis", lecturer: "Dr. Ir. Made Arya, M.T.", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDvwxW00Obt0pdl8DkAM98GlYYMvnUYBx3aiBd1MRaggav3nnx_wE4i9cktj8fjwZF3qZJYsKxO4IEnWmJxZk2G_ZQvFUgrAA000ukhDZzN4jbr1-kKlwo7WTk-qlVd5S_ZMjYeadj2tjZpfdfaSz2jkcKaSMJ0q2MrwemFmlbCUO7u2CcxB4Uq-5yRo2XNnsX2Y9KprA6XS90KWwDPAsw-9GK1OyKXTPWVOKcbtT6xMczKmUxtDnLAFA", day: "Senin", time: "08:00 - 10:30", room: "Lab Komputer 3", active: 3, progress: 65, accent: "bg-primary-container" },
  { id: "s2", name: "Basis Data Terdistribusi", code: "CS308", sks: 3, desc: "Replikasi, sharding, transaksi ACID, konsistensi data NoSQL", lecturer: "Ni Wayan Sri Rahayu, S.Kom., M.Cs.", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCQGhWFUrT5W7JB7_6GWIPs3gZX2gaYRLY9i80xymJxrhYNQqJ9CFeFWkdK1fa9Lo4uNhg5H7y0tPYM2WNtRPcRA6zeSl8xkGA1zWFASU_XheptMSJBswrSb3DYvjlBSM2B-sOvnIlMf1grcmjMHqf4FQbNK6-ddY1OR61JeeoYvxg_VmNSG_vJK0ngfzQ3UxY8bSn7XU46HpewLEQReukCyaW7ecYDqW9wzykgx8nEI6OBYskp1te-6Q", day: "Selasa", time: "10:45 - 13:15", room: "R. Teori 204", active: 2, progress: 50, accent: "bg-secondary" },
  { id: "s3", name: "Rekayasa Perangkat Lunak", code: "SE202", sks: 3, desc: "Metodologi Agile, Scrum framework, testing & documentation", lecturer: "Prof. I Ketut Gede Darmawan", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAfhYjMs0MGXPePoISiAlzTxolr0i91RyJvW7GJ2X-rML0s3exQu-QB4ZKOqxn-Y-7XIsoP30DnIchfJ9vkIXx1_Alt3SfyfN8tfdDlvXdOJd4n3EomMsIw7i8iCzqmdEnl8aPO_d3KiKnT7WS9-wJO2sSOlZXLEABpYkj4U1hKDR6IkgsU_xrxdk-FDP3Ik0s649M048PLEMhM76zcrX0SwsccgGrdEfy1iRCTEBFU365xXYUY838cmw", day: "Rabu", time: "13:30 - 16:00", room: "Aula Barat Lt. 2", active: 1, progress: 80, accent: "bg-tertiary-container" },
  { id: "s4", name: "Interaksi Manusia & Komputer", code: "UX301", sks: 3, desc: "Design thinking, usability testing, prototipe Figma & heuristik", lecturer: "Dewa Ayu Putri, M.Ds.", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDcCc0Wn0ykFq6KkY-4_2W5KeraeYCkxTqth9Ae-wH04CdujoIcBxGlW3wVy7GN7EQyap_DOEta0h29g3_Ln-fvI_8Ml-nCAB6W3POTzCLOfvEaeyzAcp1FVKkhPydH_ajmvczCvEQ5sQzFGJxhvH4OOJw75EGPPjeVlOzbmLr7RVegtMWz53nucMaIea4AWq_yTZ4-6FVWo_Ed3mMWb7zIUVvOYDkVeGzrmbQivU65vLH5oL5T5_92VA", day: "Kamis", time: "08:00 - 10:30", room: "Studio Desain 1", active: 4, progress: 35, accent: "bg-state-progress" },
  { id: "s5", name: "Jaringan Komputer & Siber", code: "NET205", sks: 3, desc: "Routing OSPF, protokol enkripsi TLS, IDS/IPS & penetration audit", lecturer: "I Gede Sukadana, S.T., M.Kom.", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuArlM-AxaiDdd7c2dy2NWNrVWUTuljnWIQFTkO4wxBbz8Lb89GJM--ojfwdMjg4dm2su3x4VvrKPATd0XLaPrhbLXZVGrdog1zMb4KImTkCM9CDYiAxDwCmS8mRcnsOiPUpIs_QjY6vuMuv1it7G2Nv3AdDTbUt1O-nisPJ7i7qWjWnEgM-ZciJoN-IwPF0o3LChLKyUPg3AIPKbD_y2G9379qC7YmUT2FdQ4ITmEvvj1CuKHmzl1rqeA", day: "Jumat", time: "09:00 - 11:30", room: "Lab Jaringan Siber", active: 0, progress: 100, accent: "bg-state-done" },
  { id: "s6", name: "Kecerdasan Buatan", code: "AI401", sks: 3, desc: "Machine learning, neural networks, PyTorch & representasi logika", lecturer: "Dr. Wayan Suartana, S.Si., M.Sc.", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB1s4k42w42XLm-vvs9vw7Ewxzhs_5Jhwd0RjW0yWmdT93-4XXh4NT98JkcN0THvNdy7YlJ0AFOiqHkldKzn17Jj10ZQUQtlR9z_p1ELCflfP9hQ0fy4Anx91r19f03S6H4B7dnwg2kELQsxOTPBEdofOHrQIRqvtgxClmqPs3hVjN0KwChVMcHREa_lPzZ-hEtloKomChavGhDHud9tZvW9pK_KQW8Qeck2VkjgrD38AXiJwLsqduUqg", day: "Kamis", time: "13:30 - 16:00", room: "R. Seminar 1", active: 2, progress: 55, accent: "bg-primary" },
];

function normalize(course) {
  const status = ["current", "passed", "failed"].includes(course.semesterStatus) ? course.semesterStatus : "current";
  return {
    ...course,
    semesterStatus: status,
    resultStatus: course.resultStatus || (status === "failed" ? "failed" : status === "passed" ? "passed" : ""),
    day: course.day || "Senin",
    time: course.time || "08:00 - 09:00",
    room: course.room || "Belum ditentukan",
    lecturer: course.lecturer || "Belum ditentukan",
    vision: typeof course.vision === "string" ? course.vision : "",
    mission: Array.isArray(course.mission) ? course.mission : [],
    contract: course.contract && course.contract.name ? course.contract : null,
    active: Number(course.active) || 0,
    progress: Number(course.progress) || 0,
  };
}

/** Menarik data onboarding ke daftar mata kuliah tanpa menimpa data yang pernah diedit. */
function syncOnboarding(courses) {
  const plan = getOnboarding();
  let changed = false;
  const exists = (name, status) =>
    courses.some((c) => c.name.toLowerCase() === String(name || "").trim().toLowerCase() && (!status || c.semesterStatus === status));
  (Array.isArray(plan.courses) ? plan.courses : []).forEach((item, index) => {
    const name = String(item.name || "").trim();
    if (!name || exists(name, "current")) return;
    courses.push({
      id: `onboard-${slug(name) || index + 1}`, name,
      code: item.code || `MK${String(courses.length + 1).padStart(3, "0")}`,
      sks: Number(item.credits || item.sks) || 3, desc: "Ditambahkan saat onboarding",
      lecturer: "Belum ditentukan", img: "", day: "Senin", time: "08:00 - 09:00",
      room: "Belum ditentukan", active: 0, progress: 0, accent: ACCENTS[courses.length % ACCENTS.length],
      semesterStatus: "current", semesterNumber: Number(plan.activeSemester) || 1, resultStatus: "",
    });
    changed = true;
  });
  (Array.isArray(plan.arrears) ? plan.arrears : []).forEach((item, index) => {
    const name = String(item.name || "").trim();
    if (!name || exists(name, "failed")) return;
    courses.push({
      id: `arrear-${slug(name) || index + 1}`, name,
      code: item.code || `UL${String(index + 1).padStart(2, "0")}`,
      sks: Number(item.credits || item.sks) || 3, desc: "Mata kuliah tanggungan dari onboarding",
      lecturer: "Belum ditentukan", img: "", day: "Senin", time: "08:00 - 09:00",
      room: "Riwayat semester sebelumnya", active: 0, progress: 0, accent: ACCENTS[courses.length % ACCENTS.length],
      semesterStatus: "failed", resultStatus: "failed", semesterNumber: Math.max(1, (Number(plan.activeSemester) || 1) - 1),
    });
    changed = true;
  });
  return changed;
}

export function saveCourses(courses) {
  const ok = writeJSON(STORAGE_KEYS.courses, courses);
  syncCollection("courses", courses); // no-op bila backend tidak aktif
  if (ok) window.dispatchEvent(new CustomEvent("getdone:courses-changed"));
  return ok;
}

/** Memuat mata kuliah; menyimpan balik bila ada item onboarding baru atau key belum ada. */
export function loadCourses() {
  const stored = readJSON(STORAGE_KEYS.courses, null);
  const courses = (Array.isArray(stored) ? stored : (API_ENABLED ? [] : JSON.parse(JSON.stringify(SEED)))).map(normalize);
  const changed = syncOnboarding(courses);
  if (changed || !Array.isArray(stored)) saveCourses(courses);
  return courses;
}

/** Tambahkan metrik tugas (aktif & progres) dari daftar tugas ke sebuah mata kuliah. */
export function withTaskMetrics(course, tasks, courses) {
  const linked = tasks.filter((t) => taskMatchesCourse(t.course, course.id, courses));
  const active = linked.filter((t) => t.status === "todo" || t.status === "in_progress").length;
  const done = linked.filter((t) => t.status === "done").length;
  const progress = linked.length ? Math.round((done / linked.length) * 100) : 0;
  return { ...course, active, progress: course.progress >= 100 && !linked.length ? 100 : progress };
}

/** Kemunculan kuliah berikutnya (hari + jam mulai) dari sekarang. */
export function nextOccurrence(course, now = new Date()) {
  const m = String(course.time || "").match(/(\d{1,2})[:.](\d{2})/);
  const t = new Date(now);
  t.setDate(now.getDate() + ((DAYS.indexOf(course.day) - now.getDay() + 7) % 7));
  t.setHours(m ? +m[1] : 0, m ? +m[2] : 0, 0, 0);
  if (t < now) t.setDate(t.getDate() + 7);
  return t;
}

/**
 * Validasi form tambah mata kuliah.
 * @returns {{error: string} | {course: object}}
 */
export function buildCourseFromForm(form, existing) {
  const error = validateCourseForm(form, existing);
  if (error) return { error };
  const f = normalizeFormFields(form);
  return {
    course: {
      id: String(Date.now()), name: f.name,
      code: f.code || "MK" + String(existing.length + 1).padStart(3, "0"),
      sks: f.sks, desc: f.desc, vision: f.vision, mission: f.mission, contract: null,
      lecturer: f.lecturer, img: "", day: f.day, time: f.time,
      room: f.room, active: 0, progress: 0, accent: ACCENTS[existing.length % ACCENTS.length],
      semesterStatus: "current", resultStatus: "",
    },
  };
}
