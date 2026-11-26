import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ActivityChart from "../components/analytics/ActivityChart.jsx";
import PomodoroTimer from "../components/analytics/PomodoroTimer.jsx";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { loadTasks } from "../services/taskService.js";
import { loadCourses } from "../services/courseService.js";
import { readJSON } from "../services/storage.js";
import { STORAGE_KEYS } from "../utils/constants.js";

const loadFocus = () => readJSON(STORAGE_KEYS.focusSessions, []) || [];
const minutesToLabel = (m) => m >= 60 ? `${Math.floor(m / 60)}j ${m % 60}m` : `${m}m`;

export default function AnalyticsPage() {
  usePageMeta({ title: "Analytics & Timer | GetDone" });
  const [searchParams] = useSearchParams();
  const [tasks, setTasks] = useState(loadTasks);
  const [courses, setCourses] = useState(loadCourses);
  const [sessions, setSessions] = useState(loadFocus);

  useEffect(() => {
    const refresh = () => { setTasks(loadTasks()); setCourses(loadCourses()); setSessions(loadFocus()); };
    for (const key of ["getdone:tasks-changed", "getdone:courses-changed", "getdone:focus-changed"]) window.addEventListener(key, refresh);
    return () => { for (const key of ["getdone:tasks-changed", "getdone:courses-changed", "getdone:focus-changed"]) window.removeEventListener(key, refresh); };
  }, []);

  const metrics = useMemo(() => {
    const completed = tasks.filter((t) => t.status === "done").length;
    const minutes = sessions.reduce((s, e) => s + (Number(e.durationMinutes) || 0), 0);
    const last7 = sessions.filter((x) => Date.now() - new Date(x.completedAt).getTime() <= 7 * 86400000);
    const weekMinutes = last7.reduce((s, e) => s + (Number(e.durationMinutes) || 0), 0);
    const group = new Map(courses.map((c) => [String(c.id), { name: c.name, count: 0 }]));
    tasks.forEach((t) => {
      const k = String(t.course || "");
      if (group.has(k)) group.get(k).count += 1;
      else if (k) group.set(k, { name: "Tugas tanpa kelas terhubung", count: 1 });
    });
    const workload = [...group.values()].filter((x) => x.count > 0).sort((a, b) => b.count - a.count).slice(0, 6);
    const maxCount = Math.max(1, ...workload.map((x) => x.count));
    return { completed, total: tasks.length, minutes, weekMinutes, sessions: sessions.length, workload, maxCount,
      rate: tasks.length ? Math.round(completed / tasks.length * 100) : 0 };
  }, [tasks, courses, sessions]);

  return (
    <main className="relative w-full pt-16 bg-background px-margin py-gutter min-h-screen">
      <div className="flex flex-col w-full gap-space-lg">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div>
            <div className="font-label-sm text-label-sm text-primary uppercase tracking-widest font-semibold">Ruang Fokus &amp; Metrik Akademik</div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-space-xs">Analytics &amp; Produktivitas</h1>
            <p className="font-body-md text-body-md text-text-muted mt-space-xs">Statistik berikut berasal dari tugas dan riwayat sesi fokus akun Anda.</p>
          </div>
          <div className="bg-surface-clean px-space-md py-space-sm rounded-xl shadow-sm flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">verified</span>
            <div className="text-on-surface font-label-md font-semibold">{metrics.rate}% tugas selesai</div>
            <div className="w-16 h-2 bg-surface-muted rounded-full overflow-hidden"><div className="h-full bg-primary-container rounded-full" style={{ width: `${metrics.rate}%` }} /></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          <div className="lg:col-span-5 flex flex-col gap-space-lg">
            <PomodoroTimer initialTaskId={searchParams.get("task") || ""} />
          </div>
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
              {[
                { title: "Waktu Fokus", value: minutesToLabel(metrics.minutes), subtitle: `${metrics.sessions} sesi selesai`, icon: "schedule" },
                { title: "Fokus 7 Hari", value: minutesToLabel(metrics.weekMinutes), subtitle: "Total pekan terakhir", icon: "calendar_month" },
                { title: "Tugas Selesai", value: `${metrics.completed}/${metrics.total}`, subtitle: `${metrics.rate}% progres`, icon: "task_alt" },
              ].map((stat) => <div key={stat.title} className="bg-surface-clean p-space-md rounded-xl shadow-sm">
                <div className="flex justify-between items-center font-label-sm text-label-sm text-text-muted uppercase">{stat.title}<span className="material-symbols-outlined text-primary">{stat.icon}</span></div>
                <div className="font-headline-md text-headline-md text-on-surface font-bold mt-space-sm">{stat.value}</div>
                <div className="font-body-sm text-body-sm text-text-muted mt-space-xs">{stat.subtitle}</div>
              </div>)}
            </div>
            <div className="bg-surface-clean rounded-xl p-space-md shadow-sm flex items-center gap-space-md">
              <span className="material-symbols-outlined text-primary text-[28px]">tips_and_updates</span>
              <div><h3 className="font-label-md text-label-md text-on-surface font-semibold">Tips Produktivitas</h3><p className="font-body-sm text-body-sm text-text-muted">Pilih satu tugas penting, fokus selama satu sesi, lalu ambil istirahat singkat.</p></div>
            </div>
          </div>
        </div>
        <ActivityChart sessions={sessions} tasks={tasks} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter items-start">
          <section className="bg-surface-clean rounded-xl shadow-sm p-space-lg">
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Beban Tugas per Mata Kuliah</h2>
            <p className="font-body-sm text-body-sm text-text-muted mt-1">Jumlah tugas dari database untuk setiap mata kuliah.</p>
            <div className="flex flex-col gap-space-md mt-space-lg">
              {metrics.workload.length ? metrics.workload.map((c) => <div key={c.name}>
                <div className="flex justify-between gap-4 text-on-surface font-label-md text-label-md mb-2"><span className="truncate">{c.name}</span><span className="font-semibold">{c.count} tugas</span></div>
                <div className="w-full h-2 bg-surface-muted rounded-full overflow-hidden"><div className="h-full bg-primary-container rounded-full" style={{ width: `${Math.round(c.count / metrics.maxCount * 100)}%` }} /></div>
              </div>) : <div className="text-text-muted font-body-sm py-6">Belum ada tugas untuk dianalisis.</div>}
            </div>
          </section>
          <section className="bg-surface-clean rounded-xl shadow-sm p-space-lg">
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Sesi Fokus Terbaru</h2>
            {sessions.length ? [...sessions].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)).slice(0, 5).map((s) =>
              <div key={s.id} className="flex justify-between gap-3 border-b border-border-subtle py-3 text-on-surface font-body-sm"><span>{s.taskTitle || "Sesi fokus mandiri"}</span><span className="text-text-muted whitespace-nowrap">{s.durationMinutes} menit · {new Date(s.completedAt).toLocaleDateString("id-ID")}</span></div>
            ) : <p className="font-body-sm text-body-sm text-text-muted mt-4">Belum ada sesi fokus tercatat.</p>}
          </section>
        </div>
      </div>
    </main>
  );
}
