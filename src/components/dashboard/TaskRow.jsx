/** Satu baris tugas di widget "Tugas Hari Ini". */
export default function TaskRow({ task, onToggle }) {
  const done = Boolean(task.done);
  return (
    <div
      className={`task-card flex flex-col sm:flex-row sm:items-center justify-between p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all gap-space-sm${done ? " opacity-60" : ""}`}
      data-id={task.id}
    >
      <div className="flex items-start gap-space-md min-w-0">
        <button
          aria-label="Tandai selesai"
          aria-pressed={done}
          className={`task-toggle-btn mt-1 h-5 w-5 rounded-md shadow-inner flex items-center justify-center hover:bg-primary/20 transition-colors ${done ? "bg-state-done text-on-primary" : "bg-surface-clean text-surface-clean"}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task.id);
          }}
        >
          <span className={`material-symbols-outlined text-[16px] transition-opacity ${done ? "opacity-100" : "opacity-0"}`}>check</span>
        </button>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-space-xs flex-wrap">
            <span className={task.courseClass}>{task.course}</span>
            <span className={task.priorityClass}>
              {task.urgent && <span className="h-1.5 w-1.5 rounded-full bg-state-urgent"></span>}
              {task.priority}
            </span>
          </div>
          <h3 className={`task-title font-label-lg text-label-lg text-on-surface font-semibold mt-1 truncate${done ? " line-through text-text-muted" : ""}`}>
            {task.title}
          </h3>
          <p className="font-body-sm text-body-sm text-text-muted line-clamp-1">{task.description}</p>
        </div>
      </div>
      <div className="flex items-center justify-between sm:justify-end gap-space-md shrink-0 pt-space-xs sm:pt-0">
        <div className={task.deadlineClass}>
          <span className="material-symbols-outlined text-[16px]">schedule</span>
          <span>{task.deadline}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="p-1 rounded-md text-text-muted hover:text-on-surface hover:bg-surface-clean transition-colors"
            title="Detail"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">more_vert</span>
          </button>
        </div>
      </div>
    </div>
  );
}
