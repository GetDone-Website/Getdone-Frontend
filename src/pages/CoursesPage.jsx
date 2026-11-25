import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AddCourseModal from "../components/courses/AddCourseModal.jsx";
import CourseCard from "../components/courses/CourseCard.jsx";
import { useCourses } from "../hooks/useCourses.js";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { DAYS, nextOccurrence, withTaskMetrics } from "../services/courseService.js";
import { loadTasks } from "../services/taskService.js";
import { getOnboarding } from "../services/academicData.js";
import { formatLongDate } from "../utils/formatDate.js";

const MAX_SKS = 24;
const SEMESTER_TABS = [
  { value: "current", label: "Semester Berjalan" },
  { value: "passed", label: "Semester Sebelumnya · Lulus" },
  { value: "failed", label: "Semester Sebelumnya · Tidak Lulus" },
];
const FILTERS = [
  { value: "all", label: "Semua" },
  { value: "active", label: "Ada Tugas" },
  { value: "done", label: "Selesai" },
];
const CHIP_ON = "bg-surface-clean text-on-surface shadow-xs";
const CHIP_OFF = "text-text-muted hover:text-on-surface";

const EMPTY_TEXT = {
  passed: "Belum ada mata kuliah berstatus lulus.",
  failed: "Belum ada mata kuliah tanggungan.",
  current: "Tidak ada mata kuliah yang cocok.",
};

export default function CoursesPage() {
  usePageMeta({
    title: "Mata Kuliah | GetDone",
    bodyClass: "bg-background font-body-md text-body-md text-on-surface antialiased min-h-screen",
  });

  const { courses, addCourse, removeCourse, setSemesterStatus } = useCourses();
  const [tasks] = useState(loadTasks);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("schedule");
  const [filter, setFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("current");
  const [menuId, setMenuId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Klik di luar menu aksi menutup menu.
  useEffect(() => {
    if (menuId === null) return undefined;
    const close = () => setMenuId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuId]);

  const withMetrics = useMemo(() => courses.map((c) => withTaskMetrics(c, tasks, courses)), [courses, tasks]);

  const visible = useMemo(() => {
    const q = query.toLowerCase().trim();
    const list = withMetrics.filter((c) => {
      const status = c.semesterStatus || "current";
      const searchMatch = !q || [c.name, c.lecturer || "", c.code || ""].some((v) => v.toLowerCase().includes(q));
      const taskMatch = semesterFilter !== "current" || filter === "all" || (filter === "active" ? c.active > 0 : c.active === 0);
      return status === semesterFilter && searchMatch && taskMatch;
    });
    const bySchedule = (a, b) => nextOccurrence(a) - nextOccurrence(b);
    return list.sort(
      sort === "name"
        ? (a, b) => a.name.localeCompare(b.name, "id")
        : sort === "tasks"
          ? (a, b) => b.active - a.active || bySchedule(a, b)
          : bySchedule,
    );
  }, [withMetrics, query, sort, filter, semesterFilter]);

  const current = useMemo(() => withMetrics.filter((c) => (c.semesterStatus || "current") === "current"), [withMetrics]);
  const totalSks = current.reduce((sum, c) => sum + (Number(c.sks) || 0), 0);
  const totalActive = current.reduce((sum, c) => sum + c.active, 0);
  const usedPct = Math.min(100, Math.round((totalSks / MAX_SKS) * 100));

  const plan = getOnboarding();
  const termLabel = plan.semesterTerm === "genap" ? "Genap" : "Ganjil";
  const todayName = DAYS[new Date().getDay()];
  const todayClasses = current
    .filter((c) => c.day === todayName)
    .sort((a, b) => String(a.time).localeCompare(String(b.time)));

  const handleSubmit = (form) => {
    const message = addCourse(form);
    if (!message) setModalOpen(false);
    return message;
  };
  const handleDelete = (id) => {
    setMenuId(null);
    if (window.confirm("Hapus mata kuliah ini?")) removeCourse(id);
  };

  return (
    <main className="relative w-full pt-16 bg-background px-margin py-gutter min-h-screen">
      <div className="flex flex-col w-full">
        <div className="flex flex-col gap-space-lg w-full max-w-[1440px] mx-auto pb-space-xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pt-space-xs">
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center gap-space-sm text-text-muted font-label-md text-label-md">
                <span className="inline-block w-2 h-2 rounded-full bg-primary-container"></span>
                <span>{plan.activeSemester ? `Semester ${plan.activeSemester} • ${termLabel} ${plan.academicStartYear}/${Number(plan.academicStartYear) + 1}` : "Semester belum diatur"}</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">Mata Kuliah Semester {termLabel}</h1>
              <div className="flex items-center gap-space-md text-text-muted font-body-sm text-body-sm">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px] text-primary-container">school</span>
                  <strong className="text-on-surface font-semibold" id="stat-count">{current.length}</strong>
                  Mata Kuliah Terdaftar
                </span>
                <span className="inline-block w-1 h-1 rounded-full bg-border-subtle"></span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px] text-primary-container">credit_card</span>
                  <strong className="text-on-surface font-semibold" id="stat-sks">{totalSks}</strong>
                  SKS Beban Studi
                </span>
                <span className="inline-block w-1 h-1 rounded-full bg-border-subtle"></span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px] text-state-progress">assignment</span>
                  <strong className="text-on-surface font-semibold" id="stat-tasks">{totalActive}</strong>
                  Tugas Semester Ini
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-space-sm">
              <button className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-xl bg-surface-container-high text-on-surface font-label-lg text-label-lg hover:bg-surface-container-highest transition-colors shadow-sm" type="button">
                <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                <span>Jadwal Mingguan</span>
              </button>
              <button className="inline-flex items-center gap-space-xs px-space-lg py-2.5 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg hover:bg-cta-hover transition-all shadow-md hover:shadow-lg active:scale-[0.99]" id="open-modal-btn" type="button" onClick={() => setModalOpen(true)}>
                <span className="material-symbols-outlined text-[20px]">add</span>
                <span>Tambah Mata Kuliah</span>
              </button>
            </div>
          </div>

          <div className="bg-surface-clean rounded-xl p-space-md shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-md">
            <div className="relative flex-1 max-w-lg">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">search</span>
              <input
                className="w-full pl-10 pr-space-md py-2.5 bg-surface-container-low rounded-xl text-on-surface placeholder:text-text-muted font-body-md text-body-md outline-none focus:bg-surface-clean focus:ring-2 focus:ring-primary-container/20 transition-all"
                id="course-search" placeholder="Cari mata kuliah, nama dosen, atau kode..." type="text"
                value={query} onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-space-sm">
              <div className="flex items-center bg-surface-container-low p-1 rounded-xl">
                {FILTERS.map((f) => (
                  <button
                    key={f.value} type="button" data-filter={f.value} onClick={() => setFilter(f.value)}
                    className={`filter-chip px-space-md py-1.5 rounded-lg text-label-md font-label-md transition-colors ${filter === f.value ? CHIP_ON : CHIP_OFF}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="h-6 w-[1px] bg-border-subtle hidden sm:block"></div>
              <div className="flex items-center gap-space-xs text-text-muted font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[18px]">sort</span>
                <select className="bg-surface-container-low py-2 px-space-sm rounded-xl text-on-surface font-label-md text-label-md outline-none cursor-pointer" id="course-sort" aria-label="Urutkan mata kuliah" value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="schedule">Urutkan: Jadwal Terdekat</option>
                  <option value="tasks">Urutkan: Beban Tugas</option>
                  <option value="name">Urutkan: Nama (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="gd-course-tabs" role="tablist" aria-label="Filter semester mata kuliah">
            {SEMESTER_TABS.map((tab) => (
              <button
                key={tab.value} type="button" role="tab" data-course-tab={tab.value}
                aria-selected={semesterFilter === tab.value}
                className={`gd-course-tab${semesterFilter === tab.value ? " is-active" : ""}`}
                onClick={() => setSemesterFilter(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter items-stretch" id="course-grid">
            {visible.length === 0 ? (
              <div className="col-span-full gd-course-empty">
                <strong>{EMPTY_TEXT[semesterFilter]}</strong>
                <span>Gunakan pilihan Status semester pada kartu untuk mengelola riwayat mata kuliah.</span>
              </div>
            ) : (
              visible.map((course) => (
                <CourseCard
                  key={course.id} course={course}
                  menuOpen={menuId === course.id}
                  onToggleMenu={() => setMenuId((id) => (id === course.id ? null : course.id))}
                  onDelete={() => handleDelete(course.id)}
                  onStatusChange={(status) => setSemesterStatus(course.id, status)}
                />
              ))
            )}
          </div>

          <div className="mt-space-md grid grid-cols-1 lg:grid-cols-3 gap-gutter items-stretch">
            <div className="bg-surface-clean rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-text-muted uppercase tracking-wider">Distribusi SKS Semester</span>
                <span className="px-2 py-0.5 rounded-full bg-primary-fixed/40 text-on-primary-fixed-variant font-label-sm text-label-sm font-semibold">Target Maksimal</span>
              </div>
              <div className="flex items-center gap-space-lg my-space-md">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-surface-muted" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5"></path>
                    <path className="text-primary-container" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${usedPct}, 100`} strokeLinecap="round" strokeWidth="3.5"></path>
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="font-headline-sm text-headline-sm font-bold text-on-surface">{totalSks}</span>
                    <span className="font-label-sm text-label-sm text-text-muted -mt-1">/ {MAX_SKS} SKS</span>
                  </div>
                </div>
                <div className="flex flex-col gap-space-xs text-body-sm font-body-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
                    <span className="text-on-surface">{totalSks} SKS Diambil ({usedPct}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-surface-dim"></span>
                    <span className="text-text-muted">{Math.max(0, MAX_SKS - totalSks)} SKS Tersisa (Kapasitas Maks)</span>
                  </div>
                  <span className="font-label-sm text-label-sm text-state-done font-medium mt-1">IPK Semester Lalu: 3.84 (Memenuhi Syarat 24 SKS)</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-clean rounded-xl p-space-lg shadow-sm lg:col-span-2 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-space-sm">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-text-muted uppercase tracking-wider">Jadwal Kuliah Hari Ini</span>
                  <span className="font-headline-sm text-headline-sm font-bold text-on-surface">{formatLongDate()}</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-state-done/15 text-state-done font-label-sm text-label-sm font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-state-done animate-pulse"></span>
                  {todayClasses.length} Kelas Terjadwal
                </span>
              </div>
              {todayClasses.length === 0 ? (
                <div className="p-space-md rounded-xl bg-surface-container-low font-body-sm text-body-sm text-text-muted">Tidak ada kuliah terjadwal hari ini.</div>
              ) : (
                <div className="flex flex-col gap-space-sm">
                  {todayClasses.map((c) => (
                    <div key={c.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-space-md rounded-xl bg-surface-container-low gap-space-md">
                      <div className="flex items-center gap-space-md">
                        <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-bold font-headline-sm text-headline-sm shadow-sm">
                          {String(c.time).slice(0, 2)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-lg text-label-lg font-bold text-on-surface">{c.name}</span>
                          <span className="font-body-sm text-body-sm text-text-muted">{c.time} WITA • {c.room}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
                        <span className="px-3 py-1 rounded-lg bg-surface-clean text-on-surface font-label-md text-label-md shadow-xs">Sesi Kuliah</span>
                        <Link className="px-space-md py-1.5 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md hover:bg-cta-hover transition-colors inline-flex items-center gap-1 shadow-xs" data-path="analytics-&-timer" to="/analytics">
                          <span className="material-symbols-outlined text-[16px]">timer</span>
                          <span>Buka Timer</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {modalOpen && <AddCourseModal onClose={() => setModalOpen(false)} onSubmit={handleSubmit} />}
      </div>
    </main>
  );
}
