// Pemetaan bentuk data frontend <-> kolom tabel backend (snake_case, sesuai PRD + kolom tambahan di migrasi backend Laravel: database/migrations).

export const isUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value ?? ""));

const pad = (n) => String(n).padStart(2, "0");
/** ISO (UTC) dari backend -> "YYYY-MM-DDTHH:mm" waktu lokal (format input datetime-local yang dipakai UI). */
const toLocalInput = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// ---------- Mata kuliah ----------
export function courseToApi(c) {
  return {
    code: c.code || "MK",
    title: c.name,
    credits: Number(c.sks) || 3,
    description: c.desc || "",
    vision: c.vision || null,
    mission: Array.isArray(c.mission) ? c.mission : [],
    lecturer: c.lecturer || null,
    schedule_day: c.day || null,
    schedule_time: c.time || null,
    room: c.room || null,
    image_url: c.img || null,
    accent: c.accent || null,
    progress: Number(c.progress) || 0,
    semester_status: c.semesterStatus || "current",
    semester_number: Number(c.semesterNumber) || null,
    result_status: c.resultStatus || "",
  };
}

export function courseFromApi(row) {
  return {
    id: row.id,
    name: row.title,
    code: row.code,
    sks: row.credits,
    desc: row.description || "",
    vision: row.vision || "",
    mission: Array.isArray(row.mission) ? row.mission : [],
    contract: row.contract && row.contract.name ? { name: row.contract.name, size: Number(row.contract.size) || 0 } : null,
    lecturer: row.lecturer || "",
    img: row.image_url || "",
    day: row.schedule_day || "Senin",
    time: row.schedule_time || "08:00 - 09:00",
    room: row.room || "",
    accent: row.accent || "bg-primary-container",
    active: 0,
    progress: Number(row.progress) || 0,
    semesterStatus: row.semester_status || "current",
    semesterNumber: row.semester_number || undefined,
    resultStatus: row.result_status || "",
  };
}

// ---------- Tugas ----------
/** @param {(localId: string) => string} resolveCourseId ubah id lokal mata kuliah menjadi id server (atau id apa adanya) */
export function taskToApi(t, resolveCourseId = (x) => x) {
  const courseId = resolveCourseId(t.course);
  const due = new Date(t.deadline);
  return {
    title: t.title,
    description: t.desc || "",
    course_id: isUuid(courseId) ? courseId : null, // slug lama dari data demo tidak punya padanan di server
    due_date: Number.isNaN(due.getTime()) ? new Date().toISOString() : due.toISOString(),
    priority: ["low", "medium", "high"].includes(t.priority) ? t.priority : "medium",
    status: t.status === "done" ? "completed" : t.status === "in_progress" ? "in_progress" : "todo",
    completed_at: t.status === "done" && t.doneAt ? new Date(t.doneAt).toISOString() : null,
  };
}

export function taskFromApi(row) {
  return {
    id: row.id,
    title: row.title,
    course: row.course_id || "",
    priority: row.priority,
    deadline: toLocalInput(row.due_date),
    desc: row.description || "",
    status: row.status === "completed" ? "done" : row.status,
    ...(row.completed_at ? { doneAt: new Date(row.completed_at).getTime() } : {}),
  };
}
