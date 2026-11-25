import { useCallback, useState } from "react";
import { loadTasks, saveTasks } from "../services/taskService.js";

/** State tugas + persistensi ke Laravel melalui service syncCollection. */
export function useTasks() {
  const [tasks, setTasks] = useState(loadTasks);

  const commit = useCallback((updater) => {
    setTasks((prev) => {
      const next = updater(prev);
      saveTasks(next);
      return next;
    });
  }, []);

  const addTask = useCallback((task) => commit((list) => [...list, task]), [commit]);
  const removeTask = useCallback((id) => commit((list) => list.filter((t) => String(t.id) !== String(id))), [commit]);

  const updateTask = useCallback(
    (id, patch) =>
      commit((list) =>
        list.map((t) => {
          if (String(t.id) !== String(id)) return t;
          const next = { ...t, ...patch };
          if (patch.status !== undefined) {
            if (patch.status === "done") next.doneAt = Date.now();
            else delete next.doneAt;
          }
          return next;
        }),
      ),
    [commit],
  );

  return { tasks, addTask, removeTask, updateTask };
}
