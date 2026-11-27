import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import TaskRow from "../components/dashboard/TaskRow.jsx";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { courseLabel } from "../services/academicData.js";
import { loadCourses } from "../services/courseService.js";
import { loadPreferences } from "../services/preferencesService.js";
import { loadTasks, saveTasks, formatDeadline } from "../services/taskService.js";

const badgeBase = "px-2 py-0.5 rounded-md font-label-sm text-label-sm font-semibold";
const priorityLabels = { high: "Tinggi", medium: "Sedang", low: "Rendah" };
const priorityClasses = { high: "bg-error-container text-state-urgent", medium: "bg-tertiary-fixed text-on-tertiary-fixed", low: "bg-surface-muted text-text-muted" };
const nextDay = () => {
  const d = new Date(Date.now() + 86400000);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  return local;
};
const newDraft = () => ({ title: "", course: "", priority: "medium", description: "", deadline: nextDay() });

export default function DashboardPage() {
  usePageMeta({ title: "Dashboard | GetDone" });
  const [tasks, setTasks] = useState(loadTasks);
  const [courses, setCourses] = useState(loadCourses);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState(newDraft);
  const [notice, setNotice] = useState("");
  const [urgentHours, setUrgentHours] = useState(() => loadPreferences().urgentThresholdHours);

  useEffect(() => {
    const refreshTasks = () => setTasks(loadTasks());
    const refreshCourses = () => setCourses(loadCourses());
    const refreshPrefs = () => setUrgentHours(loadPreferences().urgentThresholdHours);
    window.addEventListener("getdone:tasks-changed", refreshTasks);
    window.addEventListener("getdone:courses-changed", refreshCourses);
    window.addEventListener("getdone:preferences-changed", refreshPrefs);
    return () => {
      window.removeEventListener("getdone:tasks-changed", refreshTasks);
      window.removeEventListener("getdone:courses-changed", refreshCourses);
      window.removeEventListener("getdone:preferences-changed", refreshPrefs);
    };
  }, []);

  const counts = useMemo(() => {
    const completed = tasks.filter((t) => t.status === "done").length;
    const urgent = tasks.filter((t) => t.status !== "done" && new Date(t.deadline) <= Date.now() + urgentHours * 3600000).length;
    return { total: tasks.length, active: tasks.length - completed, completed, urgent,
      rate: tasks.length ? Math.round(completed / tasks.length * 100) : 0 };
  }, [tasks, urgentHours]);

  const visibleTasks = useMemo(() => tasks
    .filter((t) => [t.title, t.desc, t.priority, courseLabel(t.course, courses)].join(" ").toLowerCase().includes(query.toLowerCase().trim()))
    .sort((a, b) => (a.status === "done") - (b.status === "done") || new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 8)
    .map((t) => ({ id: t.id, title: t.title, description: t.desc || "Tidak ada catatan", course: courseLabel(t.course, courses) || "Umum",
      courseClass: `${badgeBase} bg-secondary-container text-on-secondary-fixed`, priority: priorityLabels[t.priority] || "Sedang",
      priorityClass: `${badgeBase} ${priorityClasses[t.priority] || priorityClasses.medium}`, urgent: t.priority === "high",
      deadline: formatDeadline(t.deadline), deadlineClass: "flex items-center gap-1 font-label-sm text-label-sm text-text-muted",
      done: t.status === "done" })), [tasks, query, courses]);

  const toggleTask = (id) => {
    const next = tasks.map((t) => String(t.id) !== String(id) ? t : t.status === "done"
      ? { ...t, status: "todo", doneAt: undefined }
      : { ...t, status: "done", doneAt: Date.now() });
    saveTasks(next);
    setTasks(next);
  };

  const saveQuickTask = (event) => {
    event.preventDefault();
    if (!draft.title.trim() || !draft.deadline) return;
    const next = [{ id: `dashboard-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: draft.title.trim(), course: draft.course, priority: draft.priority, deadline: draft.deadline,
      desc: draft.description.trim(), status: "todo" }, ...tasks];
    saveTasks(next);
    setTasks(next);
    setNotice("Tugas baru berhasil ditambahkan. Perubahan dikirim ke Laravel.");
    setModalOpen(false);
    setDraft(newDraft());
  };

  const todayCourses = courses.filter((c) => c.semesterStatus === "current" && c.day === new Date().toLocaleDateString("id-ID", { weekday: "long" }));

  return (
    <main className="relative w-full pt-16 bg-background px-margin py-gutter min-h-screen">
      <div className="flex flex-col w-full gap-space-xl">
        <div className="relative overflow-hidden rounded-xl bg-surface-container p-space-lg shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
            <div className="flex flex-col gap-space-xs">
              <div className="font-label-sm text-label-sm text-state-done font-semibold">● Data akademik GetDone</div>
              <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight">Ringkasan Belajar &amp; Agenda Harian</h1>
              <p className="font-body-sm text-body-sm text-text-muted max-w-xl">Status dan tugas pada halaman ini bersumber dari data akun Anda, bukan data demo.</p>
            </div>
            <div className="flex flex-wrap gap-space-sm">
              <button type="button" onClick={() => setModalOpen(true)} className="bg-primary-container text-on-primary rounded-xl px-space-md py-space-sm font-label-lg font-semibold hover:bg-cta-hover flex items-center gap-space-xs">
                <span className="material-symbols-outlined">add</span>Tambah Tugas
              </button>
              <Link to="/analytics" className="bg-surface-clean text-primary rounded-xl px-space-md py-space-sm flex items-center gap-space-xs"><span className="material-symbols-outlined">timer</span> Timer</Link>
            </div>
          </div>
        </div>
        {notice && <div role="status" className="bg-surface-container-low rounded-lg px-space-md py-space-sm text-on-surface font-body-sm">{notice} <button onClick={() => setNotice("")} className="underline ml-2">Tutup</button></div>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {[
            { label: "Tugas Berjalan", value: counts.active, meta: `${counts.total} tugas terdaftar`, icon: "assignment", color: "text-primary" },
            { label: "Tugas Selesai", value: counts.completed, meta: `${counts.rate}% dari seluruh tugas`, icon: "check_circle", color: "text-state-done" },
            { label: `Tenggat ≤ ${urgentHours} Jam`, value: counts.urgent, meta: "Belum diselesaikan", icon: "alarm_on", color: "text-state-urgent" },
          ].map((stat) => (
            <div key={stat.label} className="bg-surface-clean rounded-xl p-space-lg shadow-sm">
              <div className="flex justify-between items-start gap-3">
                <div><p className="font-label-md text-label-md text-text-muted uppercase tracking-wider">{stat.label}</p><div className={`font-display-lg text-display-lg font-bold mt-space-sm ${stat.color}`}>{stat.value}</div></div>
                <span className={`material-symbols-outlined text-[30px] ${stat.color}`}>{stat.icon}</span>
              </div>
              <div className="font-body-sm text-body-sm text-text-muted mt-space-md">{stat.meta}</div>
            </div>
          ))}
        </div>
        <div className="bg-primary-container text-on-primary rounded-xl p-space-lg flex flex-col md:flex-row md:items-center md:justify-between gap-space-md">
          <div><div className="font-headline-sm text-headline-sm font-bold">Mulai Sesi Fokus Pomodoro Baru</div><div className="font-body-sm text-body-sm opacity-85">Selesaikan tugas Anda dan catat waktu belajar.</div></div>
          <Link to="/analytics" className="rounded-xl bg-surface-clean text-primary px-space-md py-space-sm font-semibold flex items-center justify-center gap-2"><span className="material-symbols-outlined">play_arrow</span>Buka Timer</Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          <div className="lg:col-span-8 flex flex-col gap-space-md">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div><h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Prioritas Tugas</h2><p className="font-body-sm text-body-sm text-text-muted">Urutan berdasarkan tenggat terdekat</p></div>
              <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto"><input aria-label="Cari tugas" placeholder="Cari tugas..." value={query} onChange={(e) => setQuery(e.target.value)} className="min-w-0 flex-1 sm:flex-initial bg-surface-clean rounded-lg p-2 shadow-sm text-on-surface"/><Link to="/tasks" className="font-label-sm text-primary underline whitespace-nowrap">Semua Tugas</Link></div>
            </div>
            <div className="flex flex-col gap-space-sm">
              {visibleTasks.length ? visibleTasks.map((t) => <TaskRow key={t.id} task={t} onToggle={toggleTask} />) : <div className="rounded-xl bg-surface-clean p-space-lg text-text-muted">Belum ada tugas. Tambahkan tugas pertama melalui tombol di atas.</div>}
            </div>
          </div>
          <div className="lg:col-span-4 flex flex-col gap-space-md">
            <div><h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Jadwal Kuliah Hari Ini</h2><p className="font-body-sm text-body-sm text-text-muted">{todayCourses.length} sesi dalam data Anda</p></div>
            {todayCourses.length ? todayCourses.map((c) => <div key={c.id} className="bg-surface-clean rounded-xl p-space-md shadow-sm border-l-4 border-primary-container">
              <div className="font-label-sm text-label-sm text-primary font-semibold">{c.time || "Jadwal belum diisi"} WITA</div>
              <div className="font-headline-sm text-headline-sm text-on-surface font-bold mt-1">{c.name}</div>
              <p className="font-body-sm text-body-sm text-text-muted mt-1">{c.lecturer || "Dosen belum ditentukan"}</p>
              <p className="font-body-sm text-body-sm text-text-muted">{c.room || "Ruangan belum ditentukan"}</p>
            </div>) : <div className="rounded-xl bg-surface-clean p-space-md text-text-muted font-body-sm">Tidak ada jadwal hari ini.</div>}
            <Link to="/courses" className="font-label-md text-primary underline">Kelola Mata Kuliah</Link>
          </div>
        </div>
      </div>
      {modalOpen && <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && setModalOpen(false)}>
        <section role="dialog" aria-modal="true" aria-label="Tambah tugas" className="w-full max-w-xl bg-surface-clean rounded-2xl shadow-xl p-space-lg">
          <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-md">Tambah Tugas</h2>
          <form className="space-y-4" onSubmit={saveQuickTask}>
            <label className="block text-on-surface">Judul Tugas<input required maxLength={255} value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} className="block w-full rounded-lg border border-border-subtle bg-surface-container-lowest p-3 mt-1" /></label>
            <label className="block text-on-surface">Mata Kuliah<select value={draft.course} onChange={(e) => setDraft((d) => ({ ...d, course: e.target.value }))} className="block w-full rounded-lg border border-border-subtle bg-surface-container-lowest p-3 mt-1"><option value="">Tanpa mata kuliah</option>{courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block text-on-surface">Tenggat<input type="datetime-local" required value={draft.deadline} onChange={(e) => setDraft((d) => ({ ...d, deadline: e.target.value }))} className="block w-full rounded-lg border border-border-subtle bg-surface-container-lowest p-3 mt-1" /></label>
              <label className="block text-on-surface">Prioritas<select value={draft.priority} onChange={(e) => setDraft((d) => ({ ...d, priority: e.target.value }))} className="block w-full rounded-lg border border-border-subtle bg-surface-container-lowest p-3 mt-1"><option value="high">Tinggi</option><option value="medium">Sedang</option><option value="low">Rendah</option></select></label>
            </div>
            <label className="block text-on-surface">Deskripsi<textarea rows={3} value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} className="block w-full rounded-lg border border-border-subtle bg-surface-container-lowest p-3 mt-1" /></label>
            <div className="flex justify-end gap-3"><button type="button" className="px-4 py-2 text-text-muted" onClick={() => setModalOpen(false)}>Batal</button><button type="submit" className="rounded-lg bg-primary-container px-4 py-2 text-on-primary font-semibold">Simpan Tugas</button></div>
          </form>
        </section>
      </div>}
    </main>
  );
}
