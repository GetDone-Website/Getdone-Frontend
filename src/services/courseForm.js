// Validasi & normalisasi formulir mata kuliah (tambah dan edit). Murni: tanpa impor browser agar bisa diuji di Node.

export const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
export const TIME_RE = /^(\d{1,2})[:.](\d{2})\s*-\s*(\d{1,2})[:.](\d{2})(\s*WITA)?$/i;

export const MAX_MISSION_ITEMS = 10;
export const MAX_MISSION_ITEM_LENGTH = 300;
export const MAX_VISION_LENGTH = 2000;
export const MAX_DESC_LENGTH = 2000;

const p2 = (n) => String(n).padStart(2, "0");

/** Teks textarea (satu baris = satu poin) -> daftar poin tanpa baris kosong. */
export function parseMissionLines(text) {
  return String(text ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export const missionToText = (mission) => (Array.isArray(mission) ? mission.join("\n") : "");

/** Merapikan isian formulir menjadi bidang mata kuliah (waktu dinormalkan bila formatnya benar). */
export function normalizeFormFields(form) {
  const rawTime = String(form.time ?? "").trim();
  const tm = rawTime.match(TIME_RE);
  return {
    name: String(form.name ?? "").trim(),
    code: String(form.code ?? "").trim().toUpperCase(),
    sks: Number(form.sks),
    lecturer: String(form.lecturer ?? "").trim(),
    day: form.day,
    time: tm ? `${p2(+tm[1])}:${tm[2]} - ${p2(+tm[3])}:${tm[4]}` : rawTime,
    room: String(form.room ?? "").trim(),
    desc: String(form.desc ?? "").trim(),
    vision: String(form.vision ?? "").trim(),
    mission: parseMissionLines(form.missionText),
  };
}

/**
 * @param form     isian formulir
 * @param others   mata kuliah LAIN (saat edit: tanpa mata kuliah yang sedang diedit)
 * @param original (edit) mata kuliah sebelum diubah: isian yang nilainya tidak diubah tidak divalidasi ulang,
 *                 supaya data lama (mis. 5 SKS, kode "TI.101", hari Minggu) tetap bisa disimpan saat mengubah isian lain.
 * @returns pesan error pertama, atau null bila valid
 */
export function validateCourseForm(form, others = [], original = null) {
  const f = normalizeFormFields(form);
  const o = original ? normalizeFormFields({ ...original, missionText: missionToText(original.mission) }) : null;
  const changed = (field) => !o || f[field] !== o[field];
  const tm = f.time.match(TIME_RE);
  if (changed("name") && f.name.length < 3) return "Nama mata kuliah minimal 3 karakter.";
  if (changed("code") && f.code && !/^[A-Z0-9-]{2,10}$/.test(f.code)) return "Kode hanya huruf/angka (2-10 karakter), contoh: CS405.";
  if (changed("lecturer") && f.lecturer.length < 3) return "Nama dosen pengampu wajib diisi.";
  if (changed("day") && !DAYS.slice(1, 7).includes(f.day)) return "Hari atau SKS tidak valid.";
  if (changed("sks") && ![1, 2, 3, 4, 5, 6].includes(f.sks)) return "Hari atau SKS tidak valid.";
  if (changed("time") && (!tm || +tm[1] > 23 || +tm[3] > 23 || +tm[2] > 59 || +tm[4] > 59)) return "Format waktu: 08:00 - 10:30 (opsional WITA).";
  if (changed("desc") && f.desc.length > MAX_DESC_LENGTH) return `Deskripsi maksimal ${MAX_DESC_LENGTH} karakter.`;
  if (f.vision.length > MAX_VISION_LENGTH) return `Visi maksimal ${MAX_VISION_LENGTH} karakter.`;
  if (f.mission.length > MAX_MISSION_ITEMS) return `Misi maksimal ${MAX_MISSION_ITEMS} poin.`;
  if (f.mission.some((item) => item.length > MAX_MISSION_ITEM_LENGTH)) return `Setiap poin misi maksimal ${MAX_MISSION_ITEM_LENGTH} karakter.`;
  if (others.some((c) => String(c.name).toLowerCase() === f.name.toLowerCase())) return "Mata kuliah ini sudah ada.";
  return null;
}

/**
 * Menerapkan hasil edit ke sebuah mata kuliah. Identitas & status (id, accent, img, semester, kontrak, metrik) dipertahankan.
 * @returns {{error: string} | {course: object}}
 */
export function applyCourseEdit(form, course, existing = []) {
  const others = existing.filter((c) => String(c.id) !== String(course.id));
  const error = validateCourseForm(form, others, course);
  if (error) return { error };
  const f = normalizeFormFields(form);
  return {
    course: {
      ...course,
      name: f.name,
      code: f.code || course.code,
      sks: f.sks,
      lecturer: f.lecturer,
      day: f.day,
      time: f.time,
      room: f.room,
      desc: f.desc,
      vision: f.vision,
      mission: f.mission,
    },
  };
}
