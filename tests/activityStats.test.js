import test from "node:test";
import assert from "node:assert/strict";
import { buildWeek, niceMax, formatMinutes } from "../src/services/activityStats.js";

const at = (y, m, d, h = 12, mi = 0) => new Date(y, m - 1, d, h, mi);
const session = (date, durationMinutes) => ({ completedAt: date.toISOString(), durationMinutes });
const NOW = at(2026, 11, 25, 15, 35); // Rabu

test("total dan rata-rata minggu berjalan dibagi hari yang sudah berjalan", () => {
  const sessions = [session(at(2026, 11, 23), 30), session(at(2026, 11, 24), 90), session(at(2026, 11, 25, 9), 60)];
  const week = buildWeek(sessions, [], 0, NOW);
  assert.equal(week.totals.focusMinutes, 180);
  assert.equal(week.averages.focusMinutes, 60);
  assert.deepEqual(week.days.map((d) => d.focusMinutes), [30, 90, 60, 0, 0, 0, 0]);
});

test("minggu lampau dibagi 7", () => {
  const week = buildWeek([session(at(2026, 11, 18), 70)], [], -1, NOW);
  assert.equal(week.totals.focusMinutes, 70);
  assert.equal(week.averages.focusMinutes, 10);
  assert.ok(week.days.every((d) => !d.isFuture));
});

test("label dan rentang minggu mengikuti ISO, Senin sebagai awal", () => {
  const week = buildWeek([], [], 0, NOW);
  assert.equal(week.label, "W48");
  assert.equal(week.rangeLabel, "23 Nov – 29 Nov");
  assert.deepEqual(week.days.map((d) => d.label), ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]);
  assert.equal(buildWeek([], [], -1, NOW).label, "W47");
});

test("label minggu melintasi tahun memakai nomor ISO", () => {
  const now = at(2027, 1, 4, 10);
  assert.equal(buildWeek([], [], 0, now).label, "W1");
  assert.equal(buildWeek([], [], -1, now).label, "W53");
});

test("sesi pukul 23:30 lokal tetap di hari lokalnya", () => {
  const week = buildWeek([session(at(2026, 11, 24, 23, 30), 25)], [], 0, NOW);
  assert.equal(week.days[1].focusMinutes, 25);
  assert.equal(week.days[2].focusMinutes, 0);
});

test("hari ini ditandai dan hari mendatang tidak dihitung", () => {
  const week = buildWeek([], [], 0, NOW);
  assert.deepEqual(week.days.map((d) => d.isToday), [false, false, true, false, false, false, false]);
  assert.deepEqual(week.days.map((d) => d.isFuture), [false, false, false, true, true, true, true]);
});

test("Senin tanpa data menghasilkan rata-rata 0, bukan NaN", () => {
  const week = buildWeek([], [], 0, at(2026, 11, 23, 8));
  assert.equal(week.averages.focusMinutes, 0);
  assert.equal(week.averages.tasksDone, 0);
});

test("data tidak valid diabaikan tanpa error", () => {
  const sessions = [
    { completedAt: "bukan-tanggal", durationMinutes: 40 },
    { completedAt: at(2026, 11, 24).toISOString(), durationMinutes: "abc" },
    { completedAt: null, durationMinutes: 10 },
    session(at(2026, 11, 24), 20),
  ];
  const tasks = [{ status: "done" }, { doneAt: "x" }, { doneAt: at(2026, 11, 24).getTime() }];
  const week = buildWeek(sessions, tasks, 0, NOW);
  assert.equal(week.totals.focusMinutes, 20);
  assert.equal(week.totals.tasksDone, 1);
});

test("tugas selesai dikelompokkan per hari dari doneAt", () => {
  const tasks = [{ doneAt: at(2026, 11, 23).getTime() }, { doneAt: at(2026, 11, 23, 20).getTime() }, { doneAt: at(2026, 11, 25).getTime() }];
  const week = buildWeek([], tasks, 0, NOW);
  assert.deepEqual(week.days.map((d) => d.tasksDone), [2, 0, 1, 0, 0, 0, 0]);
  assert.equal(week.totals.tasksDone, 3);
  assert.equal(week.averages.tasksDone, 1);
});

test("niceMax membulatkan skala sumbu", () => {
  assert.ok(niceMax(0) >= 1);
  assert.equal(niceMax(137), 150);
  assert.equal(niceMax(3), 3);
  assert.ok(niceMax(61) >= 61);
});

test("formatMinutes", () => {
  assert.equal(formatMinutes(135), "2j 15m");
  assert.equal(formatMinutes(45), "45m");
  assert.equal(formatMinutes(0), "0m");
  assert.equal(formatMinutes(120), "2j 0m");
});
