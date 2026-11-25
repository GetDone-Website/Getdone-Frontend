import StatusSelect from "./StatusSelect.jsx";
import { COURSE_BADGE, DEFAULT_BADGE, PRIORITY, formatDeadline, isUrgent } from "../../services/taskService.js";

export default function TaskTable({ tasks, courseName, onEdit, onDelete, onStatusChange }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="text-text-muted font-label-sm text-label-sm uppercase tracking-wider bg-surface-muted/60">
            <th className="py-space-sm px-space-md rounded-l-lg">Judul Tugas</th>
            <th className="py-space-sm px-space-md">Mata Kuliah</th>
            <th className="py-space-sm px-space-md">Status</th>
            <th className="py-space-sm px-space-md">Prioritas</th>
            <th className="py-space-sm px-space-md">Batas Waktu</th>
            <th className="py-space-sm px-space-md text-right rounded-r-lg">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-muted font-body-sm text-body-sm" id="table-body">
          {tasks.length === 0 ? (
            <tr><td colSpan={6} className="py-space-lg text-center text-text-muted">Belum ada tugas</td></tr>
          ) : (
            tasks.map((task) => (
              <tr key={task.id} className="hover:bg-surface-container-low/40 transition-colors">
                <td className="py-space-md px-space-md font-label-md text-label-md text-tertiary font-semibold">{task.title}</td>
                <td className="py-space-md px-space-md">
                  <span className={`px-2 py-0.5 rounded font-label-sm text-label-sm ${COURSE_BADGE[task.course] || DEFAULT_BADGE}`}>{courseName(task.course)}</span>
                </td>
                <td className="py-space-md px-space-md">
                  <StatusSelect className="gd-task-table-status" task={task} onChange={(status) => onStatusChange(task.id, status)} />
                </td>
                <td className="py-space-md px-space-md">
                  <span className={`font-semibold ${task.priority === "high" ? "text-state-urgent" : "text-text-muted"}`}>{(PRIORITY[task.priority] || PRIORITY.medium).label}</span>
                </td>
                <td className={`py-space-md px-space-md ${isUrgent(task) ? "text-state-urgent font-medium" : "text-text-muted"}`}>{formatDeadline(task.deadline)}</td>
                <td className="py-space-md px-space-md text-right">
                  {task.status === "done" ? null : (
                    <button type="button" className="text-text-muted hover:text-tertiary p-1" title="Edit" aria-label={`Edit tugas ${task.title}`} onClick={() => onEdit(task)}>
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                  )}
                  <button type="button" className="text-text-muted hover:text-state-urgent p-1" title="Hapus" aria-label={`Hapus tugas ${task.title}`} onClick={() => onDelete(task.id)}>
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
