import { STORAGE_KEYS } from "../utils/constants.js";
import { DEFAULT_USER_NAME } from "../utils/constants.js";
import api, { API_ENABLED, unwrap } from "./api.js";
import { courseLabel, getCourses, getOnboarding, getTasks } from "./academicData.js";
import { readJSON } from "./storage.js";

/**
 * Menyusun data halaman Profil dari data lokal (padanan js/profile.js).
 * NANTI: ganti dengan GET /api/users/me + GET /api/analytics.
 */
export function loadProfile() {
  const user = readJSON(STORAGE_KEYS.user, {}) || {};
  const auth = readJSON(STORAGE_KEYS.auth, {}) || {};
  const plan = getOnboarding();
  const courses = getCourses();
  const tasks = getTasks();

  const completedTasks = tasks.filter((t) => t.status === "done").sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0));
  const sksOf = (c) => Number(c.sks || c.credits) || 0;
  const currentCourses = courses.filter((c) => (c.semesterStatus || "current") === "current");
  const failedCourses = courses.filter((c) => c.semesterStatus === "failed");
  const sum = (list, pick) => list.reduce((total, item) => total + pick(item), 0);

  const fullName = user.fullName || auth.fullName || DEFAULT_USER_NAME;
  const termName = plan.semesterTerm === "genap" ? "Genap" : "Ganjil";
  const academicStartYear = Number(plan.academicStartYear) || new Date().getFullYear();
  const entryYear = Number(plan.entryYear) || 0;
  const activeSemester = Math.max(0, Math.min(40, Number(plan.activeSemester) || 0));

  const semesterPeriod = (number) => {
    if (number === activeSemester) return `${termName} ${academicStartYear}/${academicStartYear + 1}`;
    const year = entryYear + Math.floor((number - 1) / 2);
    return `${number % 2 === 1 ? "Ganjil" : "Genap"} ${year}/${year + 1}`;
  };
  const currentSks = sum(currentCourses, sksOf);
  const semesters = [];
  if (entryYear && activeSemester) {
    for (let number = 1; number <= activeSemester; number += 1) {
      const inSemester = courses.filter((c) => Number(c.semesterNumber) === number);
      const isCurrent = number === activeSemester;
      const detail = inSemester.length
        ? `${inSemester.length} mata kuliah · ${sum(inSemester, (c) => Number(c.sks) || 0)} SKS tercatat`
        : isCurrent && currentCourses.length
          ? `${currentCourses.length} mata kuliah semester berjalan · ${currentSks} SKS`
          : "Detail mata kuliah semester ini belum dilengkapi";
      semesters.push({ number, label: semesterPeriod(number), detail, isCurrent });
    }
  }

  const credits = (list) => sum(Array.isArray(list) ? list : [], (c) => Number(c.credits) || 0);
  return {
    fullName,
    nim: user.nim || "",
    email: user.email || auth.email || "Belum diisi",
    university: user.university || "",
    avatarUrl: user.avatarUrl || auth.avatarUrl || "",
    createdAt: user.createdAt || auth.loggedAt || "",
    initials: fullName.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase() || "GD",
    entryYear,
    activeSemester,
    activeSemesterLabel: activeSemester ? `Semester ${activeSemester} · ${termName} ${academicStartYear}/${academicStartYear + 1}` : "",
    targetSks: Number(plan.targetSks) || 0,
    currentSks,
    allSks: sum(courses, sksOf),
    currentCourseCount: currentCourses.length,
    failedCount: failedCourses.length,
    plannedSks: credits(plan.arrears) + credits(plan.courses),
    taskCount: tasks.length,
    completedTasks: completedTasks.map((t) => ({
      id: t.id,
      title: t.title,
      courseName: courseLabel(t.course, courses),
      doneAt: t.doneAt,
    })),
    semesters,
  };
}

export async function saveProfile({ fullName, nim = "", university = "", avatarUrl }) {
  const payload = {
    full_name: (fullName || "").trim(),
    nim: (nim || "").trim() || null,
    university: (university || "").trim() || null,
    ...(avatarUrl !== undefined ? { avatar_url: avatarUrl || null } : {}),
  };
  if (API_ENABLED) return unwrap(await api.put("/users/profile", payload));
  return payload;
}

export async function changeEmail({ email, currentPassword }) {
  const payload = { email: (email || "").trim(), current_password: currentPassword };
  if (API_ENABLED) return unwrap(await api.put("/users/email", payload));
  return { email: payload.email };
}

export async function uploadProfileAvatar(file) {
  if (API_ENABLED) {
    const formData = new FormData();
    formData.append("avatar", file);
    return unwrap(await api.post("/users/avatar", formData, { headers: { "Content-Type": "multipart/form-data" } }));
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ avatar_url: String(reader.result || "") });
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.readAsDataURL(file);
  });
}
