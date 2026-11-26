// Statistik aktivitas mingguan (fokus & tugas selesai). Fungsi murni: tanpa impor browser agar bisa diuji di Node.

const DAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
export const MIN_WEEK_OFFSET = -3;

const dayKey = (d) => d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const mondayOf = (d) => addDays(d, -((d.getDay() + 6) % 7));

/** Nomor minggu ISO (Kamis menentukan tahun ISO). */
function isoWeekNumber(monday) {
  const thursday = addDays(monday, 3);
  const jan1 = new Date(thursday.getFullYear(), 0, 1);
  const dayIndex = Math.round((thursday - jan1) / 86400000);
  return Math.floor(dayIndex / 7) + 1;
}

const toDate = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

/**
 * @param sessions  [{ completedAt: ISO string, durationMinutes: number }]
 * @param tasks     [{ doneAt?: number (ms) }]
 * @param weekOffset 0 = minggu berjalan, -1 = sebelumnya, dst. (minimal -3)
 */
export function buildWeek(sessions, tasks, weekOffset = 0, now = new Date()) {
  const offset = Math.max(MIN_WEEK_OFFSET, Math.min(0, Math.trunc(weekOffset) || 0));
  const monday = addDays(mondayOf(now), offset * 7);
  const todayKey = dayKey(now);
  const days = DAY_LABELS.map((label, i) => {
    const date = addDays(monday, i);
    const key = dayKey(date);
    return { date, key, label, focusMinutes: 0, tasksDone: 0, isToday: key === todayKey, isFuture: key > todayKey };
  });
  const byKey = new Map(days.map((d) => [d.key, d]));

  for (const s of Array.isArray(sessions) ? sessions : []) {
    const when = toDate(s?.completedAt);
    const minutes = Number(s?.durationMinutes);
    if (!when || !Number.isFinite(minutes) || minutes <= 0) continue;
    const day = byKey.get(dayKey(when));
    if (day) day.focusMinutes += minutes;
  }
  for (const t of Array.isArray(tasks) ? tasks : []) {
    const raw = t?.doneAt;
    const when = typeof raw === "number" || (typeof raw === "string" && raw.trim() !== "") ? toDate(Number(raw)) : null;
    if (!when) continue;
    const day = byKey.get(dayKey(when));
    if (day) day.tasksDone += 1;
  }

  const totals = {
    focusMinutes: days.reduce((sum, d) => sum + d.focusMinutes, 0),
    tasksDone: days.reduce((sum, d) => sum + d.tasksDone, 0),
  };
  const elapsed = days.filter((d) => !d.isFuture).length;
  const averages = {
    focusMinutes: elapsed ? Math.round(totals.focusMinutes / elapsed) : 0,
    tasksDone: elapsed ? Math.round((totals.tasksDone / elapsed) * 10) / 10 : 0,
  };
  const end = days[6].date;
  const fmt = (d) => `${d.getDate()} ${MONTH_LABELS[d.getMonth()]}`;
  return {
    offset,
    label: `W${isoWeekNumber(monday)}`,
    rangeLabel: `${fmt(monday)} – ${fmt(end)}`,
    days: days.map(({ key, ...rest }) => rest),
    totals,
    averages,
  };
}

/** Batas atas sumbu-Y yang "bulat" (>= value, minimal 1). */
export function niceMax(value) {
  const v = Number(value);
  if (!Number.isFinite(v) || v <= 1) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(v));
  const normalized = v / magnitude;
  const step = [1, 1.5, 2, 3, 5, 7.5, 10].find((s) => normalized <= s + 1e-9);
  return Math.ceil(step * magnitude);
}

export function formatMinutes(minutes) {
  const m = Math.max(0, Math.round(Number(minutes) || 0));
  return m >= 60 ? `${Math.floor(m / 60)}j ${m % 60}m` : `${m}m`;
}
