import api, { API_ENABLED, getToken, unwrap } from "./api.js";
import { courseFromApi, courseToApi, taskFromApi, taskToApi } from "./mappers.js";
import { writeJSON } from "./storage.js";
import { STORAGE_KEYS } from "../utils/constants.js";

/**
 * Sinkronisasi "write-through": UI tetap memakai localStorage (cepat & sinkron),
 * sedangkan perubahan didorong ke backend lewat antrean berurutan.
 *  - hydrateFromServer(): tarik data server -> localStorage (saat login / buka aplikasi)
 *  - syncCollection(): bandingkan daftar baru dengan snapshot terakhir -> POST / PUT / DELETE
 */
const idMap = new Map(); // id lokal -> id server (untuk item yang dibuat di sesi ini)
const serverId = (id) => idMap.get(String(id)) ?? String(id);

const RESOURCES = {
  courses: { path: "/courses", key: STORAGE_KEYS.courses, toApi: courseToApi, fromApi: courseFromApi },
  tasks: {
    path: "/tasks", key: STORAGE_KEYS.tasks,
    toApi: (item) => taskToApi(item, serverId), fromApi: taskFromApi,
  },
};
const snapshots = { courses: new Map(), tasks: new Map() };

let queue = Promise.resolve();
let generation = 0;
const enqueue = (job) => {
  const tokenAtEnqueue = getToken();
  const generationAtEnqueue = generation;
  queue = queue.then(() => {
    // Antrean milik akun lama tidak boleh berjalan dengan token akun baru.
    if (tokenAtEnqueue !== getToken() || generationAtEnqueue !== generation) return;
    return job(() => tokenAtEnqueue === getToken() && generationAtEnqueue === generation);
  }).catch((error) => {
    console.error("[sync] gagal:", error);
    window.dispatchEvent(new CustomEvent("getdone:sync-error", { detail: error.message }));
  });
  return queue;
};

const enabled = () => API_ENABLED && Boolean(getToken());

/** Dorong perubahan sebuah koleksi (courses/tasks) ke server. Aman dipanggil tanpa backend (no-op). */
export function syncCollection(name, nextList) {
  if (!enabled() || !Array.isArray(nextList)) return;
  const res = RESOURCES[name];
  const snap = snapshots[name];
  const next = nextList.map((item) => ({ item, id: String(item.id) }));
  const nextIds = new Set(next.map((n) => n.id));

  enqueue(async (stillCurrent) => {
    for (const { item, id } of next) {
      if (!stillCurrent()) return;
      const payload = res.toApi(item);
      const json = JSON.stringify(payload);
      if (!snap.has(id)) {
        const created = unwrap(await api.post(res.path, payload));
        if (!stillCurrent()) return;
        idMap.set(id, created.id);
        snap.set(id, json);
      } else if (snap.get(id) !== json) {
        await api.put(`${res.path}/${serverId(id)}`, payload);
        if (!stillCurrent()) return;
        snap.set(id, json);
      }
    }
    for (const id of [...snap.keys()]) {
      if (!stillCurrent()) return;
      if (nextIds.has(id)) continue;
      await api.delete(`${res.path}/${serverId(id)}`);
      if (!stillCurrent()) return;
      snap.delete(id);
    }
  });
}

export const syncOnboarding = (data) => {
  if (!enabled()) return;
  enqueue(() => api.post("/users/onboarding", { onboarding: data }));
};

export const syncFocusSession = (entry) => {
  if (!enabled()) return;
  enqueue(() =>
    api.post("/analytics/focus-sessions", {
      task_id: entry.taskId && /^[0-9a-f-]{36}$/i.test(serverId(entry.taskId)) ? serverId(entry.taskId) : null,
      task_title: entry.taskTitle,
      duration_minutes: entry.durationMinutes,
      completed_at: entry.completedAt,
    }),
  );
};

let hydration = null;
export const resetHydration = () => {
  generation += 1;
  hydration = null;
  idMap.clear();
  Object.values(snapshots).forEach((s) => s.clear());
};

/** Tarik profil, mata kuliah, dan tugas dari server ke localStorage (sekali per sesi halaman). */
export function hydrateFromServer() {
  if (!enabled()) return Promise.resolve(false);
  if (!hydration) {
    hydration = (async () => {
      const [me, courses, tasks, analytics] = await Promise.all([
        api.get("/users/me"), api.get("/courses"), api.get("/tasks"), api.get("/analytics")
      ]);
      const profile = unwrap(me);
      const email = profile.email || "";
      const avatarUrl = profile.avatar_url || "";
      writeJSON(STORAGE_KEYS.user, { fullName: profile.full_name, nim: profile.nim || "", email, university: profile.university || "", avatarUrl, createdAt: profile.created_at });
      writeJSON(STORAGE_KEYS.auth, { isLoggedIn: true, fullName: profile.full_name, email, avatarUrl, loggedAt: new Date().toISOString() });
      if (profile.onboarding_data) writeJSON(STORAGE_KEYS.onboarding, profile.onboarding_data);

      const load = (name, rows) => {
        const res = RESOURCES[name];
        const list = rows.map(res.fromApi);
        snapshots[name].clear();
        list.forEach((item) => snapshots[name].set(String(item.id), JSON.stringify(res.toApi(item))));
        writeJSON(res.key, list); // langsung ke storage (bukan lewat save*) agar tidak memicu push balik
      };
      // Mata kuliah dulu: pemetaan course_id tugas bergantung pada id server mata kuliah.
      load("courses", unwrap(courses));
      load("tasks", unwrap(tasks));
      const focusRows = unwrap(analytics)?.focus_sessions || [];
      writeJSON(STORAGE_KEYS.focusSessions, focusRows.map((row) => ({
        id: row.id, taskId: row.task_id, taskTitle: row.task_title,
        durationMinutes: row.duration_minutes, completedAt: row.completed_at,
      })));
      return true;
    })().catch((error) => {
      hydration = null;
      throw error;
    });
  }
  return hydration;
}
