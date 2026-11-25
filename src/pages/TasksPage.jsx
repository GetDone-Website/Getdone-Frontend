import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import TaskCard from "../components/tasks/TaskCard.jsx";
import TaskTable from "../components/tasks/TaskTable.jsx";
import { CreateTaskModal, EditTaskModal } from "../components/tasks/TaskModals.jsx";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { useTasks } from "../hooks/useTasks.js";
import { courseLabel, getCourses, resolveCourseId, taskMatchesCourse } from "../services/academicData.js";
import { STATUS } from "../services/taskService.js";
import { API_ENABLED } from "../services/api.js";
import { loadCourses } from "../services/courseService.js";

const COLUMNS = [
  { key: "todo", title: "To Do", dot: "bg-text-muted", countId: "count-todo", cardsId: "col-todo-cards", addTitle: "Tambah ke kolom To Do" },
  { key: "in_progress", title: "In Progress", dot: "bg-state-progress", countId: "count-inprogress", cardsId: "col-inprogress-cards", addTitle: "Tambah ke kolom In Progress" },
  { key: "done", title: "Done", dot: "bg-state-done", countId: "count-done", cardsId: "col-done-cards" },
];
const VIEW_ON = "bg-surface-clean text-tertiary shadow-sm";
const VIEW_OFF = "text-text-muted hover:text-tertiary";
const SELECT = "w-full appearance-none bg-surface-clean px-space-md py-2.5 pr-8 rounded-xl text-tertiary text-body-sm font-medium shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-container cursor-pointer";

const LEGACY_CREATE = [
  { value: "pemweb", label: "Pemrograman Web" },
  { value: "basisdata", label: "Basis Data" },
  { value: "algoritma", label: "Algoritma & Struktur Data" },
  { value: "uiux", label: "UI/UX Design" },
  { value: "jarkom", label: "Jaringan Komputer" },
];
const LEGACY_FILTER = [
  { value: "pemweb", label: "Pemrograman Web" },
  { value: "basisdata", label: "Basis Data" },
  { value: "algoritma", label: "Algoritma" },
  { value: "uiux", label: "UI/UX Design" },
  { value: "jarkom", label: "Jaringan Komputer" },
];

/** Opsi legacy + mata kuliah akademik (tanpa duplikasi value), seperti populateCourseOptions() di versi HTML. */
function mergeOptions(base, courses) {
  const seen = new Set(base.map((o) => o.value));
  const extra = courses.filter((c) => !seen.has(String(c.id))).map((c) => ({ value: String(c.id), label: c.name }));
  return [...base, ...extra];
}

const byDeadline = (a, b) => new Date(a.deadline) - new Date(b.deadline); // paling mendesak di atas

export default function TasksPage() {
  usePageMeta({
    title: "Pusat Tugas | GetDone",
    bodyClass: "bg-background font-body-md text-body-md text-on-surface antialiased min-h-screen",
  });

  const { tasks, addTask, removeTask, updateTask } = useTasks();
  const [searchParams] = useSearchParams();
  const academicCourses = useMemo(() => API_ENABLED ? loadCourses() : getCourses(), []);

  const requestedCourse = searchParams.get("course") || "all";
  const requestedId = requestedCourse === "all" ? "all" : resolveCourseId(requestedCourse, academicCourses);

  const createOptions = useMemo(() => API_ENABLED
    ? [{ value: "", label: "Tanpa mata kuliah" }, ...academicCourses.map((c) => ({ value: String(c.id), label: c.name }))]
    : mergeOptions(LEGACY_CREATE, academicCourses), [academicCourses]);
  const filterOptions = useMemo(() => {
    const options = API_ENABLED ? academicCourses.map((c) => ({ value: String(c.id), label: c.name })) : mergeOptions(LEGACY_FILTER, academicCourses);
    if (requestedId !== "all" && !options.some((o) => o.value === requestedId)) {
      options.push({ value: requestedId, label: courseLabel(requestedCourse, academicCourses) });
    }
    return options;
  }, [academicCourses, requestedId, requestedCourse]);

  const [query, setQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState(requestedId);
  const [statusFilter, setStatusFilter] = useState("all");
  const [view, setView] = useState("kanban");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const courseName = (value) => courseLabel(value, academicCourses);
  const defaultCreateCourse = createOptions.some((o) => o.value === requestedId) ? requestedId : createOptions[0].value;

  const { filtered, groups } = useMemo(() => {
    const q = query.toLowerCase().trim();
    const list = tasks.filter(
      (t) =>
        (!q || t.title.toLowerCase().includes(q) || courseLabel(t.course, academicCourses).toLowerCase().includes(q)) &&
        taskMatchesCourse(t.course, courseFilter, academicCourses) &&
        (statusFilter === "all" || t.status === statusFilter),
    );
    const g = { todo: [], in_progress: [], done: [] };
    list.forEach((t) => (g[t.status] || g.todo).push(t));
    g.todo.sort(byDeadline);
    g.in_progress.sort(byDeadline);
    g.done.sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0));
    return { filtered: [...list].sort(byDeadline), groups: g };
  }, [tasks, query, courseFilter, statusFilter, academicCourses]);

  const handleDelete = (id) => {
    if (window.confirm("Hapus tugas ini?")) removeTask(id);
  };
  const handleStatus = (id, status) => STATUS[status] && updateTask(id, { status });
  const handleCreate = (task) => {
    addTask(task);
    setCreateOpen(false);
  };
  const handleSave = (id, patch) => {
    updateTask(id, patch);
    setEditing(null);
  };

  return (
    <main className="relative w-full pt-16 bg-background px-margin py-gutter min-h-screen">
      <div className="flex flex-col w-full">
        <CreateTaskModal
          open={createOpen} onClose={() => setCreateOpen(false)} onCreate={handleCreate}
          courseOptions={createOptions} defaultCourse={defaultCreateCourse}
        />
        <EditTaskModal task={editing} courseName={editing ? courseName(editing.course) : ""} onClose={() => setEditing(null)} onSave={handleSave} />

        <section className="flex flex-col gap-space-lg mb-space-xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
            <div className="flex flex-col">
              <div className="flex items-center gap-space-xs text-text-muted font-label-sm text-label-sm uppercase tracking-wider">
                <span>Akademik</span>
                <span>/</span>
                <span className="text-primary-container font-semibold">Pusat Tugas Mahasiswa</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-tertiary tracking-tight">Pusat Tugas</h1>
              <p className="font-body-md text-body-md text-text-muted">Kelola beban semester, pantau tenggat waktu, dan tuntaskan proyek terstruktur.</p>
            </div>
            <div className="flex items-center gap-space-sm">
              <button type="button" id="open-modal-btn" onClick={() => setCreateOpen(true)} className="bg-primary-container hover:bg-cta-hover text-on-primary font-label-lg text-label-lg px-space-lg py-2.5 rounded-xl shadow-sm transition-all duration-150 flex items-center gap-space-xs active:scale-[0.98]">
                <span className="material-symbols-outlined text-[20px]">add</span>
                <span>Tambah Tugas Baru</span>
              </button>
            </div>
          </div>

          <div className="bg-surface-clean rounded-xl p-space-md shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-space-md top-1/2 -translate-y-1/2 text-text-muted text-[20px]">search</span>
              <input
                className="w-full bg-surface-clean pl-11 pr-space-md py-2.5 rounded-xl text-tertiary placeholder-text-muted text-body-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-container transition-all"
                id="task-live-search" placeholder="Cari tugas, modul, atau kata kunci..." type="text"
                value={query} onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-space-sm">
              <div className="relative min-w-[170px]">
                <select className={SELECT} id="filter-matkul" aria-label="Filter mata kuliah" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
                  <option value="all">Semua Mata Kuliah</option>
                  {filterOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-space-sm top-1/2 -translate-y-1/2 text-text-muted pointer-events-none text-[18px]">expand_more</span>
              </div>
              <div className="relative min-w-[150px]">
                <select className={SELECT} id="filter-status" aria-label="Filter status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">Semua Status</option>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
                <span className="material-symbols-outlined absolute right-space-sm top-1/2 -translate-y-1/2 text-text-muted pointer-events-none text-[18px]">expand_more</span>
              </div>
              <div className="h-6 w-[1px] bg-surface-container-highest hidden sm:block mx-space-xs"></div>
              <div className="flex items-center bg-surface-muted p-1 rounded-xl shadow-inner">
                <button type="button" id="view-kanban-btn" aria-pressed={view === "kanban"} onClick={() => setView("kanban")} className={`flex items-center gap-space-xs px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-all duration-150 ${view === "kanban" ? VIEW_ON : VIEW_OFF}`}>
                  <span className="material-symbols-outlined text-[18px]">view_kanban</span>
                  <span className="hidden md:inline">Kanban</span>
                </button>
                <button type="button" id="view-table-btn" aria-pressed={view === "table"} onClick={() => setView("table")} className={`flex items-center gap-space-xs px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-all duration-150 ${view === "table" ? VIEW_ON : VIEW_OFF}`}>
                  <span className="material-symbols-outlined text-[18px]">table_rows</span>
                  <span className="hidden md:inline">Table</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {view === "kanban" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter items-start transition-opacity duration-200" id="kanban-view">
            {COLUMNS.map((col) => (
              <div key={col.key} className="flex flex-col gap-space-md">
                <div className="bg-surface-clean px-space-md py-space-sm rounded-xl shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-space-sm">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`}></span>
                    <h2 className="font-headline-sm text-headline-sm text-tertiary">{col.title}</h2>
                    <span className="bg-surface-muted text-text-muted font-label-md text-label-md px-2 py-0.5 rounded-full" id={col.countId}>{groups[col.key].length}</span>
                  </div>
                  {col.addTitle ? (
                    <button type="button" className="text-text-muted hover:text-primary-container p-1 rounded-lg transition-colors" title={col.addTitle} aria-label={col.addTitle} onClick={() => setCreateOpen(true)}>
                      <span className="material-symbols-outlined text-[20px]">add</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-state-done text-[20px]">check_circle</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-space-md min-h-[400px]" id={col.cardsId}>
                  {groups[col.key].length === 0 ? (
                    <p className="text-center text-text-muted font-body-sm text-body-sm py-space-lg">Belum ada tugas</p>
                  ) : (
                    groups[col.key].map((task) => (
                      <TaskCard
                        key={task.id} task={task} courseName={courseName(task.course)}
                        onEdit={() => setEditing(task)} onDelete={() => handleDelete(task.id)}
                        onStatusChange={(status) => handleStatus(task.id, status)}
                      />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-space-md w-full bg-surface-clean rounded-xl p-space-lg shadow-sm transition-opacity duration-200" id="table-view">
            <TaskTable tasks={filtered} courseName={courseName} onEdit={setEditing} onDelete={handleDelete} onStatusChange={handleStatus} />
          </div>
        )}

        <footer className="mt-space-xl bg-surface-clean rounded-xl p-space-md shadow-sm flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md">
            <div className="p-space-sm bg-primary-container/10 text-primary-container rounded-lg">
              <span className="material-symbols-outlined text-[24px]">school</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-tertiary font-bold">Ringkasan Selesai Pekan Ini</span>
              <span className="font-body-sm text-body-sm text-text-muted">{tasks.filter((t) => t.status === "done").length} dari {tasks.length} tugas telah diselesaikan.</span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm">
            <span className="font-label-sm text-label-sm text-text-muted">Efisiensi Studi</span>
            <div className="flex items-center gap-1.5 font-label-md text-label-md text-state-done font-bold bg-secondary-container/30 px-space-md py-1 rounded-full">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>{tasks.length ? Math.round(tasks.filter((t) => t.status === "done").length / tasks.length * 100) : 0}% Selesai</span>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
