import { STATUS, STATUS_KEYS } from "../../services/taskService.js";

export default function StatusSelect({ task, onChange, className }) {
  return (
    <select
      className={className} value={task.status} data-status-task={task.id}
      aria-label={`Ubah status tugas ${task.title}`} onChange={(e) => onChange(e.target.value)}
    >
      {STATUS_KEYS.map((key) => <option key={key} value={key}>{STATUS[key]}</option>)}
    </select>
  );
}
