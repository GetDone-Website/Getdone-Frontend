import test from "node:test";
import assert from "node:assert/strict";
import { DAYS, normalizeFormFields, validateCourseForm, parseMissionLines, missionToText } from "../src/services/courseForm.js";

const base = { name: "Pemrograman Web", code: "cs304", sks: "3", lecturer: "Dr. Made Arya", day: "Senin", time: "8:00-10:30 WITA", room: "Lab 3", desc: "", vision: "", missionText: "" };
const others = [{ id: "x1", name: "Basis Data" }, { id: "x2", name: "Pemrograman Web Lanjut" }];

test("parseMissionLines membuang baris kosong dan merapikan spasi", () => {
  assert.deepEqual(parseMissionLines("a\n\n  b  \r\n \n"), ["a", "b"]);
  assert.deepEqual(parseMissionLines(""), []);
  assert.deepEqual(parseMissionLines(undefined), []);
});

test("missionToText menggabungkan butir per baris", () => {
  assert.equal(missionToText(["a", "b"]), "a\nb");
  assert.equal(missionToText(undefined), "");
  assert.equal(missionToText(null), "");
});

test("form valid menghasilkan null", () => {
  assert.equal(validateCourseForm(base, others), null);
});

test("misi lebih dari 10 butir ditolak", () => {
  const form = { ...base, missionText: Array.from({ length: 11 }, (_, i) => `poin ${i}`).join("\n") };
  assert.match(validateCourseForm(form, others), /10/);
  assert.equal(validateCourseForm({ ...base, missionText: Array.from({ length: 10 }, (_, i) => `p${i}`).join("\n") }, others), null);
});

test("butir misi lebih dari 300 karakter ditolak", () => {
  assert.match(validateCourseForm({ ...base, missionText: "x".repeat(301) }, others), /300/);
});

test("visi dan deskripsi lebih dari 2000 karakter ditolak", () => {
  assert.match(validateCourseForm({ ...base, vision: "v".repeat(2001) }, others), /2000/);
  assert.match(validateCourseForm({ ...base, desc: "d".repeat(2001) }, others), /2000/);
});

test("nama, dosen, kode, hari/SKS, dan waktu tetap divalidasi seperti sebelumnya", () => {
  assert.equal(validateCourseForm({ ...base, name: "ab" }, others), "Nama mata kuliah minimal 3 karakter.");
  assert.equal(validateCourseForm({ ...base, lecturer: "" }, others), "Nama dosen pengampu wajib diisi.");
  assert.match(validateCourseForm({ ...base, code: "!!" }, others), /Kode/);
  assert.equal(validateCourseForm({ ...base, day: "Minggu" }, others), "Hari atau SKS tidak valid.");
  assert.match(validateCourseForm({ ...base, time: "pagi" }, others), /Format waktu/);
});

test("nama kembar ditolak tanpa memedulikan huruf besar-kecil, kecuali dirinya sendiri", () => {
  assert.equal(validateCourseForm({ ...base, name: "BASIS DATA" }, others), "Mata kuliah ini sudah ada.");
  // mata kuliah yang sedang diedit tidak ada di `others`, jadi namanya sendiri boleh tetap / berubah huruf
  assert.equal(validateCourseForm({ ...base, name: "PEMROGRAMAN WEB" }, others), null);
});

test("waktu tersimpan dari onboarding (08:00 - 09:00) valid", () => {
  assert.equal(validateCourseForm({ ...base, time: "08:00 - 09:00" }, others), null);
});

test("normalizeFormFields merapikan isian", () => {
  const f = normalizeFormFields({ ...base, name: "  Web  ", missionText: "a\n\nb", desc: " d ", vision: " v " });
  assert.equal(f.name, "Web");
  assert.equal(f.code, "CS304");
  assert.equal(f.sks, 3);
  assert.equal(f.time, "08:00 - 10:30");
  assert.deepEqual(f.mission, ["a", "b"]);
  assert.equal(f.desc, "d");
  assert.equal(f.vision, "v");
});

test("DAYS dipertahankan", () => {
  assert.equal(DAYS[0], "Minggu");
  assert.equal(DAYS.length, 7);
});

import { applyCourseEdit } from "../src/services/courseForm.js";

const existing = {
  id: "abc", name: "Pemrograman Web", code: "CS304", sks: 3, desc: "lama", lecturer: "Dr. Made Arya", img: "http://img", day: "Senin", time: "08:00 - 10:30",
  room: "Lab 3", active: 2, progress: 40, accent: "bg-secondary", semesterStatus: "passed", semesterNumber: 2, resultStatus: "passed",
  contract: { name: "k.pdf", size: 10 },
};
const editForm = { name: "pemrograman web", code: "cs304", sks: "4", lecturer: "Dr. Made Arya", day: "Selasa", time: "09:00 - 11:00", room: "R1", desc: "baru", vision: "v", missionText: "a\nb" };

test("applyCourseEdit memperbarui isian tetapi mempertahankan identitas dan status", () => {
  const result = applyCourseEdit(editForm, existing, [existing, { id: "z", name: "Basis Data" }]);
  assert.equal(result.error, undefined);
  const c = result.course;
  assert.equal(c.id, "abc");
  assert.equal(c.accent, "bg-secondary");
  assert.equal(c.img, "http://img");
  assert.equal(c.semesterStatus, "passed");
  assert.equal(c.semesterNumber, 2);
  assert.equal(c.resultStatus, "passed");
  assert.deepEqual(c.contract, { name: "k.pdf", size: 10 });
  assert.equal(c.name, "pemrograman web");
  assert.equal(c.sks, 4);
  assert.equal(c.day, "Selasa");
  assert.deepEqual(c.mission, ["a", "b"]);
  assert.equal(c.vision, "v");
  assert.equal(c.desc, "baru");
});

test("applyCourseEdit menolak nama mata kuliah lain dan mengembalikan error", () => {
  const result = applyCourseEdit({ ...editForm, name: "Basis Data" }, existing, [existing, { id: "z", name: "Basis Data" }]);
  assert.equal(result.error, "Mata kuliah ini sudah ada.");
  assert.equal(result.course, undefined);
});

test("applyCourseEdit bekerja pada mata kuliah lama tanpa vision/mission/contract", () => {
  const legacy = { id: "old", name: "Lama", code: "MK001", sks: 3, lecturer: "Belum ditentukan", day: "Senin", time: "08:00 - 09:00", room: "Belum ditentukan" };
  const result = applyCourseEdit({ ...editForm, name: "Lama", lecturer: "Belum ditentukan", time: "08:00 - 09:00", sks: "3" }, legacy, [legacy]);
  assert.equal(result.error, undefined);
  assert.equal(result.course.contract ?? null, null);
});

test("SKS 1-6 diterima (sesuai backend), di luar itu ditolak", () => {
  assert.equal(validateCourseForm({ ...base, sks: "5" }, others), null);
  assert.equal(validateCourseForm({ ...base, sks: "6" }, others), null);
  assert.equal(validateCourseForm({ ...base, sks: "7" }, others), "Hari atau SKS tidak valid.");
});

test("edit mata kuliah lama: isian lama yang tidak diubah tidak diblokir validasi baru", () => {
  const old = {
    id: "o1", name: "TI", code: "TI.101", sks: 6, desc: "d".repeat(3000), lecturer: "Belum ditentukan",
    day: "Minggu", time: "08:00 - 09:00", room: "Lab",
  };
  const form = { name: "TI", code: "TI.101", sks: "6", lecturer: "Belum ditentukan", day: "Minggu", time: "08:00 - 09:00", room: "Ruang baru", desc: "d".repeat(3000), vision: "", missionText: "" };
  const result = applyCourseEdit(form, old, [old]);
  assert.equal(result.error, undefined);
  assert.equal(result.course.room, "Ruang baru");
});

test("edit: isian yang DIUBAH tetap divalidasi", () => {
  const old = { id: "o1", name: "TI", code: "TI.101", sks: 6, desc: "", lecturer: "Belum ditentukan", day: "Minggu", time: "08:00 - 09:00", room: "" };
  const form = { name: "TI", code: "TI.101", sks: "6", lecturer: "Belum ditentukan", day: "Minggu", time: "08:00 - 09:00", room: "", desc: "", vision: "", missionText: "" };
  assert.match(applyCourseEdit({ ...form, code: "!!" }, old, [old]).error, /Kode/);
  assert.equal(applyCourseEdit({ ...form, name: "ab" }, { ...old, name: "TI" }, [old]).error, "Nama mata kuliah minimal 3 karakter.");
  assert.match(applyCourseEdit({ ...form, desc: "x".repeat(2001) }, old, [old]).error, /2000/);
  assert.equal(applyCourseEdit({ ...form, day: "Hari" }, old, [old]).error, "Hari atau SKS tidak valid.");
});
