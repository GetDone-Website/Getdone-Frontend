import { Link } from "react-router-dom";
import StatusSelect from "./StatusSelect.jsx";
import { COURSE_BADGE, DEFAULT_BADGE, PRIORITY, formatDeadline, isLate, isUrgent } from "../../services/taskService.js";

export default function TaskCard({ task, courseName, onEdit, onDelete, onStatusChange }) {
  const priority = PRIORITY[task.priority] || PRIORITY.medium;
  const done = task.status === "done";
  const urgent = isUrgent(task);
  return (
    <div className={`task-card bg-surface-clean rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all duration-200 group relative flex flex-col gap-space-md${done ? " opacity-70" : ""}`}>
      <div className="flex items-start justify-between gap-space-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`px-2.5 py-0.5 rounded-full font-label-sm text-label-sm ${COURSE_BADGE[task.course] || DEFAULT_BADGE} font-semibold tracking-tight`}>{courseName}</span>
          <span className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm ${priority.badge} font-medium flex items-center gap-1`}>
            <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`}></span>{priority.label}
          </span>
        </div>
        <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center gap-1">
          <button type="button" className="p-1 text-text-muted hover:text-tertiary rounded transition-colors" title="Edit tugas" aria-label={`Edit tugas ${task.title}`} onClick={onEdit}>
            <span className="material-symbols-outlined text-[16px]">edit</span>
          </button>
          <button type="button" className="p-1 text-text-muted hover:text-state-urgent rounded transition-colors" title="Hapus" aria-label={`Hapus tugas ${task.title}`} onClick={onDelete}>
            <span className="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-space-xs">
        <h3 className={`font-label-lg text-label-lg text-tertiary font-bold leading-snug${done ? " line-through" : ""}`}>{task.title}</h3>
        {task.desc ? <p className="font-body-sm text-body-sm text-text-muted line-clamp-2">{task.desc}</p> : null}
      </div>
      <div className="flex items-center justify-between pt-space-xs mt-auto">
        <div className={`flex items-center gap-1.5 font-label-sm text-label-sm ${urgent ? "text-state-urgent font-semibold bg-error-container/40" : "text-text-muted bg-surface-muted"} px-2 py-1 rounded-lg`}>
          <span className="material-symbols-outlined text-[14px]">schedule</span>
          <span>{isLate(task) ? "Terlambat • " : ""}{formatDeadline(task.deadline)}</span>
        </div>
      </div>
      <div className="gd-task-card-actions">
        <label className="gd-task-status-label">Status
          <StatusSelect task={task} onChange={onStatusChange} />
        </label>
        {task.status === "in_progress" && (
          <Link className="gd-task-focus-link" to={`/analytics?task=${encodeURIComponent(String(task.id))}`}>
            <span className="material-symbols-outlined" aria-hidden="true">timer</span> Fokus pada tugas
          </Link>
        )}
      </div>
    </div>
  );
}
