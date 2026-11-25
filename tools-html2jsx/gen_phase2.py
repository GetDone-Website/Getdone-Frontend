import re, os, sys, json, html
sys.path.insert(0, os.path.dirname(__file__))
from html2jsx import convert
SRC="/home/claude/src"; OUT="/home/claude/gd/frontend"
def w(path, content):
    full=os.path.join(OUT,path); os.makedirs(os.path.dirname(full),exist_ok=True); open(full,"w",encoding="utf-8").write(content)
def indent(s,n): return "\n".join((" "*n+l if l.strip() else l) for l in s.strip("\n").split("\n"))
def sub(pat, rep, s, flags=re.S, count=1):
    new,n=re.subn(pat,rep,s,count=count,flags=flags); assert n>=1, f"patch gagal: {pat[:70]}"; return new
def block(j, start, tag="div"):
    depth=0
    for t in re.finditer(rf'<{tag}\b|</{tag}>', j[start:]):
        depth += 1 if t.group(0)=="<"+tag else -1
        if depth==0: return start, start+t.end()
    raise AssertionError("blok tidak seimbang")
norm=lambda t: html.unescape(re.sub(r"\s+"," ",t).strip())

J=convert(f"{SRC}/dashboard.html")

# ================= hooks & utils =================
w("src/hooks/usePageMeta.js","""import { useLayoutEffect } from "react";

/**
 * Mengatur <title> dan menambah class ke <body> selama halaman/layout aktif.
 * Memakai classList (bukan className) supaya layout dan halaman bisa menambah class masing-masing
 * tanpa saling menimpa (mis. "app-page" dari DashboardLayout + "gd-sidebar-collapsed").
 */
export function usePageMeta({ title, bodyClass = "" } = {}) {
  useLayoutEffect(() => {
    const prevTitle = document.title;
    if (title) document.title = title;
    const tokens = bodyClass.split(/\\s+/).filter(Boolean);
    if (tokens.length) document.body.classList.add(...tokens);
    return () => {
      document.title = prevTitle;
      if (tokens.length) document.body.classList.remove(...tokens);
    };
  }, [title, bodyClass]);
}
""")
w("src/utils/formatDate.js","""/** "Senin, 24 Oktober 2024" */
export function formatLongDate(date = new Date()) {
  return new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date);
}

/** Nama ringkas untuk header: dua kata pertama dari nama lengkap. */
export function shortName(fullName = "") {
  return fullName.trim().split(/\\s+/).slice(0, 2).join(" ");
}
""")
st=open(f"{OUT}/src/services/storage.js").read()
if "readFlag" not in st:
    st+="""
// Flag boolean sederhana (disimpan sebagai "true"/"false", sama seperti versi HTML).
export function readFlag(key, fallback = false) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : raw === "true";
  } catch (error) {
    return fallback;
  }
}

export function writeFlag(key, value) {
  try {
    localStorage.setItem(key, String(Boolean(value)));
  } catch (error) {
    /* mode sementara */
  }
}
"""
    w("src/services/storage.js", st)

# ================= DashboardLayout =================
a0=J.index("<aside"); aside=J[a0:J.index("</aside>")+8]
h0=J.index("<header", J.index('className="pl-64"')); header=J[h0:J.index("</header>",h0)+9]

aside=sub(r'<aside className="([^"]*)"', r'<aside id="gd-sidebar" className="\1 gd-sidebar"', aside)
aside=sub(r'<nav .*?</nav>', '''<nav className="flex flex-col gap-space-xs px-space-md" data-active-classes={ACTIVE_CLASS}>
          {items.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                data-path={item.dataPath}
                aria-current={active ? "page" : undefined}
                className={active ? ACTIVE_CLASS : INACTIVE_CLASS}
              >
                <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>''', aside)
fs,fe=block(aside, aside.index('<div className="px-space-md">'))
aside=aside[:fe-6]+'''<Link to="/" className="gd-back-landing">
            <span className="material-symbols-outlined" aria-hidden="true">home</span>
            <span>Kembali ke Halaman Landing Page</span>
          </Link>
        '''+aside[fe-6:]

header=sub(r'<header className="([^"]*)"', r'<header className="\1 gd-dashboard-header gd-has-sidebar-toggle"', header)
header=sub(r'Selamat Datang, [^<]*?\s*</div>', 'Selamat Datang, {fullName}\n          </div>', header)
header=sub(r'<span>Senin, 24 Oktober 2024</span>', '<span>{today}</span>', header)
header=sub(r'>Agung Mantra</span>', '>{displayName}</span>', header)
header=sub(r'data-path="login" to="/"', 'data-path="login" to="/" onClick={logout}', header)
header=header[:-9]+'''<button
          type="button"
          className="gd-sidebar-toggle"
          id="gd-sidebar-toggle"
          aria-label={hidden ? "Tampilkan sidebar" : "Sembunyikan sidebar"}
          aria-controls="gd-sidebar"
          aria-expanded={!hidden}
          onClick={() => setHidden((v) => !v)}
        >
          <span className="material-symbols-outlined" aria-hidden="true">{hidden ? "left_panel_open" : "left_panel_close"}</span>
        </button>
      </header>'''

w("src/layouts/DashboardLayout.jsx", """import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { readFlag, writeFlag } from "../services/storage.js";
import { formatLongDate, shortName } from "../utils/formatDate.js";
import { DEFAULT_USER_NAME, STORAGE_KEYS } from "../utils/constants.js";

const ACTIVE_CLASS =
  "flex items-center gap-space-md px-space-md py-space-sm rounded-xl transition-all bg-primary-container text-on-primary font-label-lg text-label-lg shadow-sm";
const INACTIVE_CLASS =
  "flex items-center gap-space-md px-space-md py-space-sm rounded-xl font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all";

const NAV_ITEMS = [
  { to: "/dashboard", dataPath: "dashboard-utama", icon: "dashboard", label: "Dashboard" },
  { to: "/tasks", dataPath: "pusat-tugas", icon: "task_alt", label: "Pusat Tugas" },
  { to: "/courses", dataPath: "mata-kuliah", icon: "school", label: "Mata Kuliah" },
  { to: "/analytics", dataPath: "analytics-&-timer", icon: "timer", label: "Analytics & Timer" },
];
// Di versi HTML, item "Profile" hanya muncul di halaman profile.html.
const PROFILE_ITEM = { to: "/profile", dataPath: "profile", icon: "account_circle", label: "Profile" };

/** Layout halaman internal: sidebar + header tetap, isi halaman lewat <Outlet />. */
export default function DashboardLayout() {
  const { session, logout } = useAuth();
  const { pathname } = useLocation();
  usePageMeta({ bodyClass: "app-page" });

  const [hidden, setHidden] = useState(() => readFlag(STORAGE_KEYS.sidebarHidden, false));
  useEffect(() => {
    document.body.classList.toggle("gd-sidebar-collapsed", hidden);
    writeFlag(STORAGE_KEYS.sidebarHidden, hidden);
    return () => document.body.classList.remove("gd-sidebar-collapsed");
  }, [hidden]);

  const items = useMemo(() => (pathname === PROFILE_ITEM.to ? [...NAV_ITEMS, PROFILE_ITEM] : NAV_ITEMS), [pathname]);
  const fullName = session?.fullName?.trim() || DEFAULT_USER_NAME;
  const displayName = shortName(fullName);
  const today = formatLongDate();

  return (
    <>
""" + indent(aside,6) + """
      <div className="pl-64 gd-dashboard-shell">
""" + indent(header,8) + """
        <Outlet />
      </div>
    </>
  );
}
""")

# ================= data & TaskRow dari kartu tugas =================
cards=[];pos=0
while True:
    m=re.search(r'<div className="task-card[^"]*"',J[pos:])
    if not m: break
    st=pos+m.start(); s_,e_=block(J,st); cards.append((s_,e_)); pos=e_
tasks=[]
for i,(a,b) in enumerate(cards,1):
    c=J[a:b]
    spans=re.findall(r'<span className="(px-2 py-0\.5 rounded-md [^"]*)">\s*(?:<span className="h-1\.5[^"]*"></span>)?\s*([^<]+?)\s*</span>',c)
    dl=re.search(r'<div className="(flex items-center gap-1 font-label-sm[^"]*)">\s*<span className="material-symbols-outlined text-\[16\]px?">schedule</span>\s*<span>(.*?)</span>',c,re.S) or \
       re.search(r'<div className="(flex items-center gap-1 font-label-sm[^"]*)">\s*<span className="material-symbols-outlined text-\[16px\]">schedule</span>\s*<span>(.*?)</span>',c,re.S)
    tasks.append(dict(id=i,course=norm(spans[0][1]),courseClass=spans[0][0],priority=norm(spans[1][1]),priorityClass=spans[1][0],
        urgent="bg-state-urgent" in c, title=norm(re.search(r'<h3 className="task-title[^"]*">\s*(.*?)\s*</h3>',c,re.S).group(1)),
        description=norm(re.search(r'<p className="font-body-sm text-body-sm text-text-muted line-clamp-1">\s*(.*?)\s*</p>',c,re.S).group(1)),
        deadline=norm(dl.group(2)),deadlineClass=dl.group(1),done=False))
assert len(tasks)==4
course_styles={t["course"]:t["courseClass"] for t in tasks}
prio_styles={t["priority"]:{"className":t["priorityClass"],"urgent":t["urgent"]} for t in tasks}
default_dl=next(t["deadlineClass"] for t in tasks if "text-state-urgent" not in t["deadlineClass"])
w("src/data/dashboardDemo.js","// Data demo untuk DashboardPage (diambil dari markup dashboard.html). Akan diganti data dari API/Supabase.\n"
  f"export const INITIAL_TASKS = {json.dumps(tasks,ensure_ascii=False,indent=2)};\n\n"
  f"export const COURSE_STYLES = {json.dumps(course_styles,ensure_ascii=False,indent=2)};\n\n"
  f"export const PRIORITY_STYLES = {json.dumps(prio_styles,ensure_ascii=False,indent=2)};\n\n"
  f"export const DEFAULT_DEADLINE_CLASS = {json.dumps(default_dl)};\n\n"
  "export const INITIAL_COUNTS = { active: 12, completed: 28 };\n")
w("src/components/dashboard/TaskRow.jsx","""/** Satu baris tugas di widget "Tugas Hari Ini". */
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
""")

# ================= DashboardPage =================
m0=J.index("<main"); main=J[m0:J.index("</main>")+7]
cs=main.index('<div className="task-card'); ce=block(main,main.rindex('<div className="task-card'))[1]
main=main[:cs]+"{visibleTasks.map((task) => (\n  <TaskRow key={task.id} task={task} onToggle={toggleTask} />\n))}"+main[ce:]
main=sub(r'(id="active-tasks-count">)12(</span>)', r'\1{counts.active}\2', main)
main=sub(r'(id="completed-tasks-count">)28(</span>)', r'\1{counts.completed}\2', main)
main=sub(r'id="task-filter"', 'id="task-filter" value={query} onChange={(e) => setQuery(e.target.value)}', main)
main=sub(r'id="btn-quick-task"', 'id="btn-quick-task" type="button" onClick={openModal}', main)
# tip
tip_start=main.index('<div className="rounded-xl bg-surface-container-high/60 p-space-md flex items-center justify-between gap-space-md">')
ts,te=block(main,tip_start)
tip=main[ts:te].replace('id="dismiss-tip"','id="dismiss-tip" type="button" onClick={() => setTipVisible(false)}')
main=main[:ts]+"{tipVisible && (\n"+tip+"\n)}"+main[te:]
# link "Pusat Tugas"
main=sub(r'<a (className="[^"]*") data-path="pusat-tugas" href="#" (title="Lihat Seluruh Pusat Tugas")>(.*?)</a>', r'<Link \1 data-path="pusat-tugas" to="/tasks" \2>\3</Link>', main)
# modal
main=sub(r'className="(fixed inset-0 z-50 [^"]*?) opacity-0 pointer-events-none( transition-all duration-200)" id="quick-modal"',
         r'className={`\1 ${modalOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}\2`} id="quick-modal"', main)
main=sub(r'className="(w-full max-w-lg [^"]*?) transform scale-95 transition-all duration-200"', r'className={`\1 transform ${modalOpen ? "" : "scale-95"} transition-all duration-200`}', main)
main=sub(r'id="close-modal-btn"', 'id="close-modal-btn" type="button" aria-label="Tutup" onClick={closeModal}', main)
main=sub(r'id="cancel-modal-btn"', 'id="cancel-modal-btn" onClick={closeModal}', main)
main=sub(r'<form className="flex flex-col gap-space-md mt-space-sm" id="new-task-form">', '<form className="flex flex-col gap-space-md mt-space-sm" id="new-task-form" onSubmit={handleSubmit}>', main)
main=sub(r'id="modal-task-title"', 'id="modal-task-title" value={draft.title} onChange={setField("title")}', main)
main=sub(r'id="modal-task-course"', 'id="modal-task-course" value={draft.course} onChange={setField("course")}', main)
main=sub(r'id="modal-task-urgency"', 'id="modal-task-urgency" value={draft.urgency} onChange={setField("urgency")}', main)
main=sub(r'id="modal-task-desc"', 'id="modal-task-desc" value={draft.description} onChange={setField("description")}', main)

w("src/pages/DashboardPage.jsx","""import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import TaskRow from "../components/dashboard/TaskRow.jsx";
import { usePageMeta } from "../hooks/usePageMeta.js";
import {
  COURSE_STYLES,
  DEFAULT_DEADLINE_CLASS,
  INITIAL_COUNTS,
  INITIAL_TASKS,
  PRIORITY_STYLES,
} from "../data/dashboardDemo.js";

const EMPTY_DRAFT = { title: "", course: "Pemrograman Web", urgency: "Sedang", description: "" };

export default function DashboardPage() {
  usePageMeta({ title: "Dashboard | GetDone" });

  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [counts, setCounts] = useState(INITIAL_COUNTS);
  const [query, setQuery] = useState("");
  const [tipVisible, setTipVisible] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  const visibleTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter((t) =>
      [t.course, t.priority, t.title, t.description, t.deadline].join(" ").toLowerCase().includes(q),
    );
  }, [tasks, query]);

  const toggleTask = (id) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;
    const nowDone = !target.done;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: nowDone } : t)));
    setCounts((c) =>
      nowDone
        ? { active: Math.max(0, c.active - 1), completed: c.completed + 1 }
        : { active: c.active + 1, completed: Math.max(0, c.completed - 1) },
    );
  };

  const openModal = () => setModalOpen(true);
  const closeModal = () => {
    setModalOpen(false);
    setDraft(EMPTY_DRAFT);
  };
  const setField = (name) => (e) => setDraft((d) => ({ ...d, [name]: e.target.value }));

  // Tutup modal dengan tombol Escape.
  useEffect(() => {
    if (!modalOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && closeModal();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const prio = PRIORITY_STYLES[draft.urgency] || PRIORITY_STYLES.Sedang;
    const next = {
      id: `new-${Date.now()}`,
      course: draft.course,
      courseClass: COURSE_STYLES[draft.course] || COURSE_STYLES["Basis Data"],
      priority: draft.urgency,
      priorityClass: prio.className,
      urgent: prio.urgent,
      title: draft.title.trim() || "Tugas Baru",
      description: draft.description.trim() || "Catatan perkuliahan terlampir.",
      deadline: "Tanpa tenggat",
      deadlineClass: DEFAULT_DEADLINE_CLASS,
      done: false,
    };
    setTasks((prev) => [next, ...prev]);
    setCounts((c) => ({ ...c, active: c.active + 1 }));
    closeModal();
  };

  return (
""" + indent(main,4) + """
  );
}
""")

# ================= routes & placeholder =================
w("src/pages/ComingSoon.jsx","""import { Link } from "react-router-dom";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { useAuth } from "../hooks/useAuth.js";

/** Placeholder sementara untuk halaman yang akan dimigrasi di fase berikutnya. */
export default function ComingSoon({ title }) {
  const { logout } = useAuth();
  usePageMeta({ title: `${title} | GetDone` });
  return (
    <main className="min-h-screen pt-16 bg-background flex flex-col items-center justify-center gap-4 text-center px-4">
      <span className="material-symbols-outlined text-5xl text-primary">construction</span>
      <h1 className="font-headline-md text-headline-md font-bold">{title}</h1>
      <p className="font-body-md text-body-md text-text-muted">Halaman ini akan dimigrasi ke React di fase berikutnya.</p>
      <div className="flex gap-3">
        <Link to="/" className="py-2 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high">Beranda</Link>
        <button type="button" onClick={logout} className="py-2 px-4 rounded-xl bg-primary-container text-on-primary">Keluar</button>
      </div>
    </main>
  );
}
""")
ar=open(f"{OUT}/src/routes/AppRoutes.jsx").read()
if "DashboardLayout" not in ar:
    ar=ar.replace('import AuthLayout from "../layouts/AuthLayout.jsx";','import AuthLayout from "../layouts/AuthLayout.jsx";\nimport DashboardLayout from "../layouts/DashboardLayout.jsx";')
    ar=sub(r'        <Route path=\{ROUTES.dashboard\}.*?<Route path=\{ROUTES.profile\} element=\{<ProfilePage />\} />\n',
'''        <Route element={<DashboardLayout />}>
          <Route path={ROUTES.dashboard} element={<DashboardPage />} />
          <Route path={ROUTES.courses} element={<CoursesPage />} />
          <Route path={ROUTES.tasks} element={<TasksPage />} />
          <Route path={ROUTES.analytics} element={<AnalyticsPage />} />
          <Route path={ROUTES.profile} element={<ProfilePage />} />
        </Route>
''',ar)
    ar=ar.replace("halaman internal akan memakai\n          DashboardLayout (Fase berikutnya).","halaman internal memakai DashboardLayout.")
    w("src/routes/AppRoutes.jsx",ar)
print("OK",len(tasks),"tasks")
