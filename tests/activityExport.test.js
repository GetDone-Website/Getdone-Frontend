import test from "node:test";
import assert from "node:assert/strict";
import { buildExportData, toCsv, toJson, exportFileName } from "../src/services/activityExport.js";

const at = (y, m, d, h = 12) => new Date(y, m - 1, d, h, 0);
const NOW = at(2026, 11, 25, 15); // Rabu, W48
const sessions = [
  { completedAt: at(2026, 11, 23).toISOString(), durationMinutes: 30 },
  { completedAt: at(2026, 11, 24).toISOString(), durationMinutes: 90 },
  { completedAt: at(2026, 11, 18).toISOString(), durationMinutes: 70 },
];
const tasks = [{ doneAt: at(2026, 11, 24).getTime() }, { doneAt: at(2026, 11, 24, 18).getTime() }];

test("buildExportData memuat 4 minggu, terlama dulu, hari mendatang tidak ikut", () => {
  const data = buildExportData(sessions, tasks, NOW, "Asia/Makassar");
  assert.equal(data.zona_waktu, "Asia/Makassar");
  assert.equal(data.diekspor_pada, NOW.toISOString());
  assert.deepEqual(data.minggu.map((w) => w.label), ["W45", "W46", "W47", "W48"]);
  assert.equal(data.minggu[0].hari.length, 7);
  assert.equal(data.minggu[3].hari.length, 3); // Sen-Rab
  assert.equal(data.minggu[3].rentang, "23 Nov – 29 Nov");
});

test("nilai harian, total, dan rata-rata sama dengan grafik", () => {
  const w = buildExportData(sessions, tasks, NOW, "UTC").minggu[3];
  assert.deepEqual(w.hari[0], { tanggal: "2026-11-23", hari: "Sen", menit_fokus: 30, tugas_selesai: 0 });
  assert.deepEqual(w.hari[1], { tanggal: "2026-11-24", hari: "Sel", menit_fokus: 90, tugas_selesai: 2 });
  assert.equal(w.total_fokus_menit, 120);
  assert.equal(w.total_tugas_selesai, 2);
  assert.equal(w.rata_rata_fokus_menit, 40);
  assert.equal(w.rata_rata_tugas_per_hari, 0.7);
  assert.equal(buildExportData(sessions, tasks, NOW, "UTC").minggu[2].rata_rata_fokus_menit, 10);
});

test("toCsv: BOM, header, urutan kronologis, satu baris per hari", () => {
  const csv = toCsv(buildExportData(sessions, tasks, NOW, "UTC"));
  assert.ok(csv.startsWith("﻿tanggal,hari,minggu,menit_fokus,tugas_selesai\r\n"));
  const lines = csv.slice(1).trimEnd().split("\r\n");
  assert.equal(lines.length, 1 + 7 * 3 + 3);
  assert.equal(lines[1], "2026-11-02,Sen,W45,0,0");
  assert.equal(lines[lines.length - 2], "2026-11-24,Sel,W48,90,2");
  assert.equal(lines[lines.length - 1], "2026-11-25,Rab,W48,0,0");
});

test("tanpa data tetap menghasilkan baris bernilai 0, bukan kosong atau NaN", () => {
  const csv = toCsv(buildExportData([], [], NOW, "UTC"));
  assert.ok(!/NaN|undefined/.test(csv));
  assert.equal(csv.slice(1).trimEnd().split("\r\n").length, 1 + 24);
});

test("toJson menghasilkan JSON valid yang sama dengan datanya", () => {
  const data = buildExportData(sessions, tasks, NOW, "UTC");
  assert.deepEqual(JSON.parse(toJson(data)), data);
});

test("exportFileName memakai tanggal lokal", () => {
  assert.equal(exportFileName("csv", NOW), "getdone-aktivitas-mingguan-2026-11-25.csv");
  assert.equal(exportFileName("json", at(2027, 1, 4)), "getdone-aktivitas-mingguan-2027-01-04.json");
});

test("input tidak valid tidak membuat ekspor gagal", () => {
  const data = buildExportData(undefined, null, NOW, "UTC");
  assert.equal(data.minggu.length, 4);
});
