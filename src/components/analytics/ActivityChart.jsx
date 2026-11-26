import { useEffect, useMemo, useState } from "react";
import { useEscapeKey } from "../../hooks/useEscapeKey.js";
import { buildExportData, exportFileName, toCsv, toJson } from "../../services/activityExport.js";
import { buildWeek, formatMinutes, niceMax } from "../../services/activityStats.js";

const OFFSETS = [-3, -2, -1, 0];
const METRICS = [
  { key: "focus", label: "Waktu Fokus", icon: "schedule" },
  { key: "tasks", label: "Tugas Selesai", icon: "task_alt" },
];
const CHIP_ON = "bg-surface-clean text-on-surface shadow-xs";
const CHIP_OFF = "text-text-muted hover:text-on-surface";

/** Grafik batang 7 hari: waktu fokus atau tugas selesai, dengan garis rata-rata dan tab 4 minggu terakhir. */
export default function ActivityChart({ sessions, tasks }) {
  const [metric, setMetric] = useState("focus");
  const [offset, setOffset] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // Menu ekspor menutup saat klik di luar atau menekan Esc.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = () => setMenuOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuOpen]);
  useEscapeKey(menuOpen, () => setMenuOpen(false));

  /** Mengunduh data 4 minggu (sama dengan yang tampil di grafik) sebagai CSV atau JSON. */
  const exportData = (kind) => {
    const now = new Date();
    const data = buildExportData(sessions, tasks, now, Intl.DateTimeFormat().resolvedOptions().timeZone || "");
    const content = kind === "csv" ? toCsv(data) : toJson(data);
    const type = kind === "csv" ? "text/csv;charset=utf-8" : "application/json;charset=utf-8";
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement("a");
    link.href = url;
    link.download = exportFileName(kind, now);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMenuOpen(false);
  };

  const weeks = useMemo(() => {
    const now = new Date();
    return OFFSETS.map((o) => buildWeek(sessions, tasks, o, now));
  }, [sessions, tasks]);
  const week = weeks.find((w) => w.offset === offset) || weeks[weeks.length - 1];

  const isFocus = metric === "focus";
  const fmt = isFocus ? formatMinutes : (v) => String(v);
  const values = week.days.map((d) => (isFocus ? d.focusMinutes : d.tasksDone));
  const average = isFocus ? week.averages.focusMinutes : week.averages.tasksDone;
  const total = isFocus ? week.totals.focusMinutes : week.totals.tasksDone;
  const max = niceMax(Math.max(...values, average));
  const pct = (v) => Math.min(100, (v / max) * 100);
  const hasData = total > 0;
  const summary = week.days.map((d, i) => `${d.label} ${d.isFuture ? "belum berjalan" : fmt(values[i])}`).join(", ");

  return (
    <section className="bg-surface-clean rounded-xl shadow-sm p-space-lg" aria-labelledby="activity-chart-title">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div>
          <h2 id="activity-chart-title" className="font-headline-sm text-headline-sm font-bold text-on-surface">Aktivitas Mingguan</h2>
          <p className="font-body-sm text-body-sm text-text-muted mt-1">{week.label} · {week.rangeLabel}</p>
        </div>
        <div className="flex flex-wrap items-center gap-space-sm">
          <div className="flex items-center bg-surface-container-low p-1 rounded-xl" role="group" aria-label="Pilih metrik grafik">
            {METRICS.map((m) => (
              <button key={m.key} type="button" aria-pressed={metric === m.key} onClick={() => setMetric(m.key)}
                className={`px-space-md py-1.5 rounded-lg text-label-md font-label-md transition-colors ${metric === m.key ? CHIP_ON : CHIP_OFF}`}>
                {m.label}
              </button>
            ))}
          </div>
          <div className="flex items-center bg-surface-container-low p-1 rounded-xl" role="group" aria-label="Pilih minggu">
            {weeks.map((w) => (
              <button key={w.offset} type="button" aria-pressed={offset === w.offset} onClick={() => setOffset(w.offset)} title={w.rangeLabel}
                className={`px-space-md py-1.5 rounded-lg text-label-md font-label-md transition-colors ${offset === w.offset ? CHIP_ON : CHIP_OFF}`}>
                {w.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <button type="button" aria-haspopup="menu" aria-expanded={menuOpen}
              onClick={(e) => { e.stopPropagation(); setMenuOpen((open) => !open); }}
              className="inline-flex items-center gap-1 px-space-md py-2 rounded-xl bg-surface-container-low text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-[18px]">download</span>Ekspor
            </button>
            {menuOpen && (
              <div role="menu" className="absolute right-0 top-11 w-44 bg-surface-clean rounded-xl shadow-lg p-1.5 z-20" onClick={(e) => e.stopPropagation()}>
                {[{ kind: "csv", label: "Unduh CSV", icon: "table_chart" }, { kind: "json", label: "Unduh JSON", icon: "data_object" }].map((item) => (
                  <button key={item.kind} type="button" role="menuitem" onClick={() => exportData(item.kind)}
                    className="w-full flex items-center gap-2 px-space-sm py-2 rounded-lg text-body-sm font-body-sm text-on-surface hover:bg-surface-container transition-colors">
                    <span className="material-symbols-outlined text-[16px]">{item.icon}</span><span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-space-lg">
        <div className="font-headline-md text-headline-md font-bold text-on-surface">{isFocus ? formatMinutes(average) : total}</div>
        <div className="font-body-sm text-body-sm text-text-muted">
          {isFocus ? `rata-rata fokus harian · total ${formatMinutes(total)}` : `tugas selesai minggu ini · rata-rata ${average}/hari`}
        </div>
      </div>

      <div className="mt-space-lg flex gap-space-sm">
        <div className="relative flex-1">
          <div className="relative h-52 mt-5" role="img" aria-label={`Grafik ${isFocus ? "waktu fokus" : "tugas selesai"} minggu ${week.label}: ${summary}. Rata-rata ${fmt(average)}.`}>
            {[0, 50, 100].map((line) => (
              <div key={line} className="absolute left-0 right-0 border-t border-border-subtle/60" style={{ bottom: `${line}%` }} aria-hidden="true" />
            ))}
            {average > 0 && (
              <div className="absolute left-0 right-0 border-t-2 border-dashed border-text-muted/70 z-10 pointer-events-none" style={{ bottom: `${pct(average)}%` }} aria-hidden="true">
                <span className="absolute right-0 -top-5 px-2 py-0.5 rounded-md bg-surface-container text-text-muted font-label-sm text-label-sm">Rata-rata {fmt(average)}</span>
              </div>
            )}
            <div className="absolute inset-0 flex gap-2 sm:gap-3">
              {week.days.map((d, i) => {
                const v = values[i];
                return (
                  <div key={d.label} className="relative flex-1 h-full" title={`${d.label}, ${d.date.getDate()}: ${d.isFuture ? "belum berjalan" : fmt(v)}`}>
                    {!d.isFuture && (
                      <>
                        {v > 0 && (
                          <span className="absolute left-0 right-0 text-center font-label-sm text-label-sm text-on-surface whitespace-nowrap" style={{ bottom: `calc(${pct(v)}% + 4px)` }}>{fmt(v)}</span>
                        )}
                        <div
                          className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[44px] rounded-t-lg transition-all duration-500 ${v > 0 ? (d.isToday ? "bg-primary-container" : "bg-primary-container/70") : "bg-surface-muted"}`}
                          style={{ height: v > 0 ? `max(6px, ${pct(v)}%)` : "4px" }}
                        />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            {!hasData && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="px-3 py-1.5 rounded-lg bg-surface-clean/90 text-text-muted font-body-sm text-body-sm">Belum ada aktivitas minggu ini.</span>
              </div>
            )}
          </div>
          <div className="flex gap-2 sm:gap-3 mt-2" aria-hidden="true">
            {week.days.map((d) => (
              <div key={d.label} className={`flex-1 text-center font-label-md text-label-md ${d.isToday ? "text-primary font-bold" : "text-text-muted"}`}>{d.label}</div>
            ))}
          </div>
        </div>
        <div className="relative w-12 h-52 mt-5 shrink-0 text-text-muted font-label-sm text-label-sm" aria-hidden="true">
          {[100, 50, 0].map((line) => (
            <span key={line} className="absolute left-0 -translate-y-1/2" style={{ bottom: `${line}%` }}>{line === 0 ? "0" : fmt(Math.round((max * line) / 100))}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
