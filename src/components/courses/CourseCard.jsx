import { Link } from "react-router-dom";

function Avatar({ course }) {
  if (course.img) return <img className="w-9 h-9 rounded-full object-cover shadow-xs" alt="" src={course.img} />;
  const words = String(course.lecturer || "").split(/\s+/).filter((w) => w && !/[.,]/.test(w));
  const initials = (((words[0] || course.lecturer || "?")[0] || "?") + (words[1] ? words[1][0] : "")).toUpperCase();
  return (
    <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md text-label-md font-bold shadow-xs">
      {initials}
    </div>
  );
}

function TaskSummary({ course }) {
  const link = (
    <Link
      className="mt-space-xs inline-flex items-center justify-center gap-space-xs py-2 px-space-md rounded-xl bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors"
      data-path="pusat-tugas"
      to={`/tasks?course=${encodeURIComponent(course.id)}`}
    >
      <span>Buka Tugas Terkait</span>
      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
    </Link>
  );
  const wrap = "flex flex-col gap-space-sm pt-space-lg mt-space-md border-t border-border-subtle/40";
  const track = "w-full bg-surface-muted h-2 rounded-full overflow-hidden";

  if (course.active > 0) {
    return (
      <div className={wrap}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-state-progress/15 text-state-progress font-label-sm text-label-sm font-semibold">
            <span className="material-symbols-outlined text-[15px]">pending_actions</span>
            <span>{course.active} Tugas Aktif</span>
          </div>
          <span className="font-label-sm text-label-sm text-text-muted">Progress: {course.progress}%</span>
        </div>
        <div className={track}><div className="bg-primary-container h-full rounded-full transition-all duration-500" style={{ width: `${course.progress}%` }}></div></div>
        {link}
      </div>
    );
  }
  if (course.progress >= 100) {
    return (
      <div className={wrap}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-state-done/15 text-state-done font-label-sm text-label-sm font-semibold">
            <span className="material-symbols-outlined text-[15px]">task_alt</span>
            <span>Semua Tugas Selesai</span>
          </div>
          <span className="font-label-sm text-label-sm text-state-done font-semibold">100%</span>
        </div>
        <div className={track}><div className="bg-state-done h-full rounded-full transition-all duration-500" style={{ width: "100%" }}></div></div>
        {link}
      </div>
    );
  }
  return (
    <div className={wrap}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-text-muted font-label-sm text-label-sm font-semibold">
          <span className="material-symbols-outlined text-[15px]">inbox</span>
          <span>Belum Ada Tugas</span>
        </div>
        <span className="font-label-sm text-label-sm text-text-muted">0%</span>
      </div>
      <div className={track}><div className="bg-surface-muted h-full rounded-full transition-all duration-500" style={{ width: "0%" }}></div></div>
      {link}
    </div>
  );
}

/** Kartu mata kuliah. `course` sudah memuat metrik tugas (active, progress). */
export default function CourseCard({ course, menuOpen, onToggleMenu, onDelete, onStatusChange }) {
  const selectId = `gd-semester-status-${course.id}`;
  return (
    <div className="course-card group relative bg-surface-clean rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between" data-id={course.id}>
      <div className={`absolute top-0 left-0 right-0 h-1 ${course.accent || "bg-primary-container"} rounded-t-xl`}></div>
      <div className="flex flex-col gap-space-md">
        <div className="flex items-start justify-between gap-space-sm">
          <div className="flex items-center gap-space-xs">
            <span className="px-2.5 py-1 rounded-full bg-primary-fixed/40 text-on-primary-fixed-variant font-label-sm text-label-sm font-semibold tracking-wide">{course.code}</span>
            <span className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">{course.sks} SKS</span>
          </div>
          <div className="relative">
            <button
              className="action-menu-btn w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-on-surface hover:bg-surface-container-high transition-colors"
              type="button" aria-haspopup="menu" aria-expanded={menuOpen} aria-label={`Menu ${course.name}`}
              onClick={(e) => { e.stopPropagation(); onToggleMenu(); }}
            >
              <span className="material-symbols-outlined text-[20px]">more_vert</span>
            </button>
            {menuOpen && (
              <div className="action-dropdown absolute right-0 top-9 w-44 bg-surface-clean rounded-xl shadow-lg p-1.5 z-20" onClick={(e) => e.stopPropagation()}>
                <a className="flex items-center gap-2 px-space-sm py-2 rounded-lg text-body-sm font-body-sm text-on-surface hover:bg-surface-container transition-colors" href="#" onClick={(e) => e.preventDefault()}>
                  <span className="material-symbols-outlined text-[16px]">visibility</span><span>Lihat Detail</span>
                </a>
                <button className="w-full flex items-center gap-2 px-space-sm py-2 rounded-lg text-body-sm font-body-sm text-on-surface hover:bg-surface-container transition-colors" type="button">
                  <span className="material-symbols-outlined text-[16px]">edit</span><span>Edit Mata Kuliah</span>
                </button>
                <div className="h-[1px] bg-border-subtle my-1"></div>
                <button className="w-full flex items-center gap-2 px-space-sm py-2 rounded-lg text-body-sm font-body-sm text-state-urgent hover:bg-error-container/30 transition-colors" type="button" onClick={onDelete}>
                  <span className="material-symbols-outlined text-[16px]">delete</span><span>Hapus</span>
                </button>
              </div>
            )}
          </div>
        </div>
        <div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold leading-snug group-hover:text-primary-container transition-colors">{course.name}</h2>
          {course.desc ? <p className="font-body-sm text-body-sm text-text-muted mt-1">{course.desc}</p> : null}
        </div>
        <div className="flex items-center gap-space-sm p-space-sm rounded-xl bg-surface-container-low">
          <Avatar course={course} />
          <div className="flex flex-col min-w-0">
            <span className="font-label-sm text-label-sm text-text-muted">Dosen Pengampu</span>
            <span className="font-label-md text-label-md text-on-surface font-semibold truncate">{course.lecturer}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-space-sm text-body-sm font-body-sm pt-space-xs">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px] text-text-muted">schedule</span>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-text-muted">Hari &amp; Jam</span>
              <span className="font-medium text-body-sm">{course.day}, {course.time}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px] text-text-muted">room</span>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-text-muted">Ruangan</span>
              <span className="font-medium text-body-sm truncate">{course.room || "-"}</span>
            </div>
          </div>
        </div>
      </div>
      <TaskSummary course={course} />
      <div className="gd-course-status-control">
        <label htmlFor={selectId}>Status semester</label>
        <select id={selectId} aria-label={`Status semester ${course.name}`} value={course.semesterStatus || "current"} onChange={(e) => onStatusChange(e.target.value)}>
          <option value="current">Semester berjalan</option>
          <option value="passed">Sebelumnya — Lulus</option>
          <option value="failed">Sebelumnya — Tidak lulus</option>
        </select>
      </div>
    </div>
  );
}
