// Ekspor data grafik aktivitas mingguan ke CSV/JSON. Fungsi murni (tanpa impor browser) agar bisa diuji di Node.
import { buildWeek, MIN_WEEK_OFFSET } from "./activityStats.js";

const p2 = (n) => String(n).padStart(2, "0");
const isoDate = (d) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
const CSV_HEADER = ["tanggal", "hari", "minggu", "menit_fokus", "tugas_selesai"];

/**
 * Data yang sama dengan grafik: 4 minggu terakhir (terlama dulu), hari yang belum berjalan tidak ikut.
 * @param timeZone nama zona waktu untuk keterangan (mis. Intl.DateTimeFormat().resolvedOptions().timeZone)
 */
export function buildExportData(sessions, tasks, now = new Date(), timeZone = "") {
  const offsets = [];
  for (let o = MIN_WEEK_OFFSET; o <= 0; o += 1) offsets.push(o);
  return {
    diekspor_pada: now.toISOString(),
    zona_waktu: timeZone,
    minggu: offsets.map((offset) => {
      const week = buildWeek(sessions, tasks, offset, now);
      return {
        label: week.label,
        rentang: week.rangeLabel,
        total_fokus_menit: week.totals.focusMinutes,
        total_tugas_selesai: week.totals.tasksDone,
        rata_rata_fokus_menit: week.averages.focusMinutes,
        rata_rata_tugas_per_hari: week.averages.tasksDone,
        hari: week.days
          .filter((d) => !d.isFuture)
          .map((d) => ({ tanggal: isoDate(d.date), hari: d.label, menit_fokus: d.focusMinutes, tugas_selesai: d.tasksDone })),
      };
    }),
  };
}

const csvCell = (value) => {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** CSV UTF-8 dengan BOM (agar Excel membaca benar), pemisah koma, baris CRLF. */
export function toCsv(data) {
  const rows = [CSV_HEADER];
  for (const week of data.minggu) {
    for (const day of week.hari) rows.push([day.tanggal, day.hari, week.label, day.menit_fokus, day.tugas_selesai]);
  }
  return `﻿${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}\r\n`;
}

export const toJson = (data) => JSON.stringify(data, null, 2);

export const exportFileName = (kind, now = new Date()) => `getdone-aktivitas-mingguan-${isoDate(now)}.${kind}`;
