import re, os, sys, shutil
sys.path.insert(0, os.path.dirname(__file__))
from html2jsx import convert

SRC = "/home/claude/src"
OUT = "/home/claude/gd/frontend"
def w(path, content):
    full = os.path.join(OUT, path); os.makedirs(os.path.dirname(full), exist_ok=True)
    open(full, "w", encoding="utf-8").write(content)
def title_of(f):
    return re.search(r"<title>(.*?)</title>", open(f"{SRC}/{f}", encoding="utf-8").read(), re.S).group(1).strip()
def indent(s, n=6): return "\n".join((" "*n + l if l.strip() else l) for l in s.strip("\n").split("\n"))

shutil.rmtree(OUT, ignore_errors=True)

# ---------- styles (disalin apa adanya) ----------
for f in ["style.css", "features.css", "spacing-fix.css", "transition.css"]:
    shutil.copy(f"{SRC}/css/{f}", f"{OUT}/src/styles/{f}") if os.makedirs(f"{OUT}/src/styles", exist_ok=True) is None else None
w("src/styles/react-overrides.css", """/* Penyesuaian khusus migrasi React (tidak mengubah file CSS asli).
   spacing-fix.css memberi padding-bottom pada <main> di semua body yang bukan .app-page.
   Di versi HTML, halaman login/register tidak memuat spacing-fix.css, jadi dinetralkan di sini. */
body.auth-page main { padding-bottom: 0; }
""")

# ---------- config ----------
w("package.json", """{
  "name": "getdone-frontend",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^5.4.11"
  }
}
""")
w("vite.config.js", """import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
""")
w(".gitignore", "node_modules\ndist\n.env\n.DS_Store\n")
w("index.html", """<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>GetDone</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;display=swap"
      rel="stylesheet"
    />
    <link
      href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
      rel="stylesheet"
    />
    <link
      href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
""")

# ---------- core ----------
w("src/main.jsx", """import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// Urutan impor sama dengan urutan <link> di versi HTML.
import "./styles/style.css";
import "./styles/features.css";
import "./styles/transition.css";
import "./styles/spacing-fix.css";
import "./styles/react-overrides.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
""")
w("src/App.jsx", """import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
""")
w("src/utils/constants.js", """export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  onboarding: "/onboarding",
  dashboard: "/dashboard",
  courses: "/courses",
  tasks: "/tasks",
  analytics: "/analytics",
  profile: "/profile",
};

// Kunci localStorage dipertahankan sama dengan versi HTML agar data demo lama tetap terbaca.
export const STORAGE_KEYS = {
  auth: "getdoneAuth",
  user: "getdoneUser",
  onboarding: "getdoneOnboarding",
  sidebarHidden: "getdoneSidebarHidden",
  courses: "getdone_courses_v1",
  tasks: "getdone_tasks_v1",
};

export const DEFAULT_USER_NAME = "Mahasiswa GetDone";
""")
w("src/services/storage.js", """// Pembungkus localStorage yang aman (tidak melempar error saat storage diblokir).
export function readJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.warn(`Tidak dapat membaca ${key} dari localStorage.`, error);
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Tidak dapat menyimpan ${key} ke localStorage.`, error);
    return false;
  }
}

export function removeKey(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Tidak dapat menghapus ${key} dari localStorage.`, error);
  }
}
""")
w("src/services/authService.js", """import { DEFAULT_USER_NAME, STORAGE_KEYS } from "../utils/constants.js";
import { readJSON, removeKey, writeJSON } from "./storage.js";

/**
 * Service autentikasi.
 * SAAT INI: dummy berbasis localStorage (perilaku sama dengan common.js versi HTML).
 * NANTI: ganti isi fungsi-fungsi ini dengan Axios -> /api/auth/* atau Supabase Auth,
 * tanpa mengubah komponen yang memakainya.
 */
const STORAGE_ERROR = "Sesi demo tidak dapat disimpan di browser ini. Periksa izin penyimpanan lokal.";

export function getSession() {
  const auth = readJSON(STORAGE_KEYS.auth, null);
  return auth && auth.isLoggedIn === true ? auth : null;
}

export function getSavedUser() {
  return readJSON(STORAGE_KEYS.user, {}) || {};
}

function persistSession({ fullName, email }) {
  const session = { isLoggedIn: true, fullName, email, loggedAt: new Date().toISOString() };
  if (!writeJSON(STORAGE_KEYS.auth, session)) throw new Error(STORAGE_ERROR);
  return session;
}

export function register({ fullName, email, university = "" }) {
  const name = (fullName || "").trim() || DEFAULT_USER_NAME;
  const cleanEmail = (email || "").trim();
  writeJSON(STORAGE_KEYS.user, {
    fullName: name,
    email: cleanEmail,
    university: (university || "").trim(),
    createdAt: new Date().toISOString(),
  });
  return persistSession({ fullName: name, email: cleanEmail });
}

export function login({ email }) {
  const saved = getSavedUser();
  const fullName = saved.fullName || DEFAULT_USER_NAME;
  return persistSession({ fullName, email: (email || "").trim() });
}

export function logout() {
  removeKey(STORAGE_KEYS.auth);
}
""")
w("src/context/AuthContext.jsx", """import { createContext, useCallback, useMemo, useState } from "react";
import * as authService from "../services/authService.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => authService.getSession());

  const login = useCallback((credentials) => {
    const next = authService.login(credentials);
    setSession(next);
    return next;
  }, []);

  const register = useCallback((payload) => {
    const next = authService.register(payload);
    setSession(next);
    return next;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({ session, isLoggedIn: Boolean(session?.isLoggedIn), login, register, logout }),
    [session, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
""")
w("src/hooks/useAuth.js", """import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>.");
  return ctx;
}
""")
w("src/hooks/usePageMeta.js", """import { useLayoutEffect } from "react";

/** Mengatur <title> dan class <body> per halaman (di HTML asli keduanya ada di tiap file). */
export function usePageMeta({ title, bodyClass = "" }) {
  useLayoutEffect(() => {
    const prevTitle = document.title;
    document.title = title;
    document.body.className = bodyClass;
    return () => {
      document.title = prevTitle;
      document.body.className = "";
    };
  }, [title, bodyClass]);
}
""")
w("src/routes/ProtectedRoute.jsx", """import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { ROUTES } from "../utils/constants.js";

export default function ProtectedRoute() {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  if (!isLoggedIn) return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
""")
w("src/routes/AppRoutes.jsx", """import { Navigate, Route, Routes } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import LandingPage from "../pages/LandingPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import RegisterPage from "../pages/RegisterPage.jsx";
import OnboardingPage from "../pages/OnboardingPage.jsx";
import DashboardPage from "../pages/DashboardPage.jsx";
import CoursesPage from "../pages/CoursesPage.jsx";
import TasksPage from "../pages/TasksPage.jsx";
import AnalyticsPage from "../pages/AnalyticsPage.jsx";
import ProfilePage from "../pages/ProfilePage.jsx";
import { ROUTES } from "../utils/constants.js";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Publik: Landing, Login, Register */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.home} element={<LandingPage />} />
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.register} element={<RegisterPage />} />
      </Route>

      {/* Wajib login. Onboarding memakai AuthLayout; halaman internal akan memakai
          DashboardLayout (Fase berikutnya). */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.onboarding} element={<OnboardingPage />} />
        </Route>
        <Route path={ROUTES.dashboard} element={<DashboardPage />} />
        <Route path={ROUTES.courses} element={<CoursesPage />} />
        <Route path={ROUTES.tasks} element={<TasksPage />} />
        <Route path={ROUTES.analytics} element={<AnalyticsPage />} />
        <Route path={ROUTES.profile} element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
    </Routes>
  );
}
""")
w("src/layouts/AuthLayout.jsx", """import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

/** Layout untuk Landing, Login, Register, Onboarding. Halaman menentukan title/body-class sendiri via usePageMeta. */
export default function AuthLayout() {
  const { pathname, hash } = useLocation();

  // Pindah halaman -> scroll ke atas; link anchor (#fitur) tetap ditangani browser.
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);

  return <Outlet />;
}
""")
w("src/pages/ComingSoon.jsx", """import { Link } from "react-router-dom";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { useAuth } from "../hooks/useAuth.js";

/** Placeholder sementara untuk halaman yang akan dimigrasi di fase berikutnya. */
export default function ComingSoon({ title }) {
  const { logout } = useAuth();
  usePageMeta({ title: `${title} | GetDone`, bodyClass: "bg-background font-body-md text-on-surface antialiased min-h-screen" });
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
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
for name, title in [("Onboarding","Onboarding"),("Dashboard","Dashboard"),("Courses","Mata Kuliah"),("Tasks","Pusat Tugas"),("Analytics","Analytics"),("Profile","Profil")]:
    w(f"src/pages/{name}Page.jsx", f"""import ComingSoon from "./ComingSoon.jsx";

export default function {name}Page() {{
  return <ComingSoon title="{title}" />;
}}
""")

# ---------- NavAuthActions + ProfileMenu ----------
idx = convert(f"{SRC}/index.html")
m = re.search(r'(<Link [^>]*data-path="login"[^>]*>Masuk</Link><Link [^>]*data-path="register"[^>]*>Daftar Gratis</Link>)\s*(<div className="w-8 h-8 rounded-full bg-primary[^"]*">.*?</div>)', idx, re.S)
assert m, "nav actions tidak ketemu"
logged_out = m.group(1) + "\n" + m.group(2)
idx = idx.replace(m.group(0), "<NavAuthActions />")
w("src/components/common/NavAuthActions.jsx", f"""import {{ useEffect, useRef, useState }} from "react";
import {{ Link, useNavigate }} from "react-router-dom";
import {{ useAuth }} from "../../hooks/useAuth.js";
import {{ DEFAULT_USER_NAME }} from "../../utils/constants.js";

/**
 * Isi container aksi di navbar landing.
 * Struktur DOM sengaja dijaga (anak langsung <a>) karena spacing-fix.css memakai
 * selector struktural (header > div > div:last-child > a:first-of-type).
 */
export default function NavAuthActions() {{
  const {{ isLoggedIn, session, logout }} = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {{
    if (!open) return undefined;
    const onClick = (e) => {{
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    }};
    const onKey = (e) => {{
      if (e.key === "Escape") {{
        setOpen(false);
        triggerRef.current?.focus();
      }}
    }};
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {{
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    }};
  }}, [open]);

  if (!isLoggedIn) {{
    return (
      <>
{indent(logged_out, 8)}
      </>
    );
  }}

  const name = session?.fullName?.trim() || DEFAULT_USER_NAME;
  const handleLogout = () => {{
    logout();
    setOpen(false);
    navigate("/");
  }};

  return (
    <div className="gd-profile-menu-wrap" ref={{wrapRef}}>
      <button
        className="gd-profile-trigger"
        id="gd-profile-trigger"
        type="button"
        ref={{triggerRef}}
        aria-haspopup="true"
        aria-expanded={{open}}
        aria-controls="gd-profile-dropdown"
        onClick={{() => setOpen((v) => !v)}}
      >
        <span className="material-symbols-outlined" aria-hidden="true">account_circle</span>
        <span className="gd-profile-name">Profile</span>
        <span className="material-symbols-outlined" aria-hidden="true">expand_more</span>
      </button>
      <div className={{`gd-profile-dropdown${{open ? " is-open" : ""}}`}} id="gd-profile-dropdown" role="menu" aria-label="Menu profil">
        <div className="px-3 py-2">
          <div className="font-label-md text-label-md text-on-surface font-semibold">{{name}}</div>
          <div className="font-body-sm text-body-sm text-text-muted">{{session?.email || ""}}</div>
        </div>
        <div className="gd-dropdown-divider" role="separator"></div>
        <Link to="/profile" role="menuitem"><span className="material-symbols-outlined" aria-hidden="true">account_circle</span>Profile Saya</Link>
        <Link to="/dashboard" role="menuitem"><span className="material-symbols-outlined" aria-hidden="true">dashboard</span>Dashboard</Link>
        <Link to="/tasks" role="menuitem"><span className="material-symbols-outlined" aria-hidden="true">task_alt</span>Pusat Tugas</Link>
        <Link to="/courses" role="menuitem"><span className="material-symbols-outlined" aria-hidden="true">school</span>Mata Kuliah</Link>
        <Link to="/analytics" role="menuitem"><span className="material-symbols-outlined" aria-hidden="true">timer</span>Analytics &amp; Timer</Link>
        <div className="gd-dropdown-divider" role="separator"></div>
        <button type="button" id="gd-profile-logout" role="menuitem" onClick={{handleLogout}}><span className="material-symbols-outlined" aria-hidden="true">logout</span>Keluar</button>
      </div>
    </div>
  );
}}
""")

# ---------- Landing ----------
w("src/pages/LandingPage.jsx", f"""import {{ Link }} from "react-router-dom";
import NavAuthActions from "../components/common/NavAuthActions.jsx";
import {{ usePageMeta }} from "../hooks/usePageMeta.js";

export default function LandingPage() {{
  usePageMeta({{
    title: {title_of("index.html")!r},
    bodyClass: "bg-surface font-body-md text-on-surface antialiased selection:bg-primary-fixed selection:text-on-primary-fixed",
  }});

  return (
    <>
{indent(idx, 6)}
    </>
  );
}}
""".replace("'GetDone", '"GetDone').replace("| GetDone'", '| GetDone"'))

# ---------- Login (mode masuk/daftar dalam satu halaman, seperti login.html) ----------
lg = convert(f"{SRC}/login.html")
def sub(pat, rep, s, flags=re.S):
    new, n = re.subn(pat, rep, s, count=1, flags=flags)
    assert n == 1, f"patch gagal: {pat[:60]}"
    return new

lg = sub(r'className="[^"]*"( id="tab-login")', r'className={`${TAB_BASE} ${!isRegister ? TAB_ACTIVE : TAB_INACTIVE}`}\1', lg)
lg = sub(r'id="tab-login" type="button">', 'id="tab-login" type="button" onClick={() => setMode(false)}>', lg)
lg = sub(r'className="[^"]*"( id="tab-register")', r'className={`${TAB_BASE} ${isRegister ? TAB_ACTIVE : TAB_INACTIVE}`}\1', lg)
lg = sub(r'id="tab-register" type="button">', 'id="tab-register" type="button" onClick={() => setMode(true)}>', lg)
lg = sub(r'(id="form-heading">).*?(</h2>)', r'\1{isRegister ? "Daftarkan Akun Perkuliahan" : "Selamat datang kembali"}\2', lg)
lg = sub(r'(id="form-subheading">).*?(</p>)', r'\1{isRegister ? "Mulai kelola tenggat tugas dan jadwal belajar dengan teratur." : "Gunakan kredensial kampus untuk mengakses dasbor akademik Anda."}\2', lg)
lg = sub(r'<form className="space-y-4" id="auth-form">', '<form className="space-y-4" id="auth-form" onSubmit={handleSubmit}>', lg)
lg = sub(r'className="hidden space-y-1.5" id="field-fullname"', 'className={isRegister ? "space-y-1.5" : "hidden space-y-1.5"} id="field-fullname"', lg)
lg = sub(r'id="fullname"', 'id="fullname" value={form.fullname} onChange={onChange}', lg)
lg = sub(r'id="email"', 'id="email" value={form.email} onChange={onChange}', lg)
lg = sub(r'id="password"( [^>]*?)type="password"', r'id="password" value={form.password} onChange={onChange}\1type={showPassword ? "text" : "password"}', lg)
lg = sub(r'id="toggle-password" type="button"', 'id="toggle-password" type="button" onClick={() => setShowPassword((v) => !v)}', lg)
lg = sub(r'(id="pwd-icon">)visibility(</span>)', r'\1{showPassword ? "visibility_off" : "visibility"}\2', lg)
lg = sub(r'className="([^"]*)" href="#" id="forgot-password-link"', r'className={`\1${isRegister ? " hidden" : ""}`} href="#" id="forgot-password-link"', lg)
lg = sub(r'className="hidden items-start gap-2 pt-1" id="field-terms"', 'className={isRegister ? "flex items-start gap-2 pt-1" : "hidden items-start gap-2 pt-1"} id="field-terms"', lg)
lg = sub(r'id="terms"', 'id="terms" checked={form.terms} onChange={onChange}', lg)
lg = sub(r'className="flex items-center justify-between pt-1" id="row-remember"', 'className={isRegister ? "hidden" : "flex items-center justify-between pt-1"} id="row-remember"', lg)
lg = sub(r'(id="btn-submit" type="submit">).*?(</button>)',
  r'''\1
                    {isRegister ? (
                      <>
                        <span>Buat Akun Mahasiswa</span>
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                      </>
                    ) : (
                      <>
                        <span>Masuk Sekarang</span>
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                      </>
                    )}
                  \2''', lg)
w("src/pages/LoginPage.jsx", f"""import {{ useState }} from "react";
import {{ Link, useLocation, useNavigate }} from "react-router-dom";
import {{ useAuth }} from "../hooks/useAuth.js";
import {{ usePageMeta }} from "../hooks/usePageMeta.js";

const TAB_BASE = "w-1/2 py-2.5 rounded-lg font-label-lg text-label-lg transition-all duration-200 text-center";
const TAB_ACTIVE = "bg-surface-clean text-primary shadow-sm font-semibold";
const TAB_INACTIVE = "text-text-muted font-medium hover:text-on-surface";

export default function LoginPage() {{
  usePageMeta({{
    title: "Masuk | GetDone",
    bodyClass: "auth-page bg-background font-body-md text-body-md text-on-surface antialiased min-h-screen",
  }});

  const {{ login, register }} = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isRegister, setMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({{ fullname: "", email: "", password: "", terms: false }});

  const onChange = (e) => {{
    const {{ id, type, checked, value }} = e.target;
    setForm((prev) => ({{ ...prev, [id]: type === "checkbox" ? checked : value }}));
  }};

  const handleSubmit = (e) => {{
    e.preventDefault();
    try {{
      if (isRegister) {{
        register({{ fullName: form.fullname, email: form.email }});
        navigate("/onboarding");
      }} else {{
        login({{ email: form.email }});
        navigate(location.state?.from || "/dashboard");
      }}
    }} catch (error) {{
      window.alert(error.message);
    }}
  }};

  return (
    <>
{indent(lg, 6)}
    </>
  );
}}
""")

# ---------- Register ----------
rg = convert(f"{SRC}/register.html")
rg = sub(r'<form className="space-y-4" id="auth-form">', '<form className="space-y-4" id="auth-form" onSubmit={handleSubmit}>', rg)
for fid in ["fullname", "university", "email"]:
    rg = sub(rf'id="{fid}"', f'id="{fid}" value={{form.{fid}}} onChange={{onChange}}', rg)
rg = sub(r'id="password"( [^>]*?)type="password"', r'id="password" value={form.password} onChange={onChange}\1type={show.password ? "text" : "password"}', rg)
rg = sub(r'id="confirm-password"( [^>]*?)type="password"', r'id="confirm-password" ref={confirmRef} value={form.confirm} onChange={onChange}\1type={show.confirm ? "text" : "password"}', rg)
rg = sub(r'id="toggle-password" type="button"', 'id="toggle-password" type="button" onClick={() => toggle("password")}', rg)
rg = sub(r'id="toggle-confirm-password" type="button"', 'id="toggle-confirm-password" type="button" onClick={() => toggle("confirm")}', rg)
rg = sub(r'(id="pwd-icon">)visibility(</span>)', r'\1{show.password ? "visibility_off" : "visibility"}\2', rg)
rg = sub(r'(id="confirm-pwd-icon">)visibility(</span>)', r'\1{show.confirm ? "visibility_off" : "visibility"}\2', rg)
rg = sub(r'id="terms"', 'id="terms" checked={form.terms} onChange={onChange}', rg)
w("src/pages/RegisterPage.jsx", f"""import {{ useRef, useState }} from "react";
import {{ Link, useNavigate }} from "react-router-dom";
import {{ useAuth }} from "../hooks/useAuth.js";
import {{ usePageMeta }} from "../hooks/usePageMeta.js";

// Nama id elemen di JSX = kunci state, kecuali "confirm-password" -> confirm.
const FIELD_KEY = {{ "confirm-password": "confirm" }};

export default function RegisterPage() {{
  usePageMeta({{
    title: "Daftar Akun | GetDone",
    bodyClass: "auth-page bg-background font-body-md text-body-md text-on-surface antialiased min-h-screen",
  }});

  const {{ register }} = useAuth();
  const navigate = useNavigate();
  const confirmRef = useRef(null);
  const [form, setForm] = useState({{ fullname: "", university: "", email: "", password: "", confirm: "", terms: false }});
  const [show, setShow] = useState({{ password: false, confirm: false }});

  const toggle = (key) => setShow((prev) => ({{ ...prev, [key]: !prev[key] }}));

  const onChange = (e) => {{
    const {{ id, type, checked, value }} = e.target;
    const key = FIELD_KEY[id] || id;
    if (key === "confirm" || key === "password") confirmRef.current?.setCustomValidity("");
    setForm((prev) => ({{ ...prev, [key]: type === "checkbox" ? checked : value }}));
  }};

  const handleSubmit = (e) => {{
    e.preventDefault();
    if (form.password !== form.confirm) {{
      // Validasi bawaan browser dipakai agar tidak perlu menambah elemen baru ke layout.
      confirmRef.current?.setCustomValidity("Kata sandi dan konfirmasi tidak sama.");
      confirmRef.current?.reportValidity();
      return;
    }}
    try {{
      register({{ fullName: form.fullname, email: form.email, university: form.university }});
      navigate("/onboarding");
    }} catch (error) {{
      window.alert(error.message);
    }}
  }};

  return (
    <>
{indent(rg, 6)}
    </>
  );
}}
""")

w("README.md", """# GetDone Frontend (React + Vite)

```bash
npm install
npm run dev
```

## Status migrasi
- [x] Fase 1 — Scaffold, routing, AuthLayout, auth (dummy localStorage), Landing, Login, Register
- [ ] Fase 2 — DashboardLayout (sidebar + header) + DashboardPage
- [ ] Fase 3 — OnboardingPage
- [ ] Fase 4 — CoursesPage + TasksPage
- [ ] Fase 5 — AnalyticsPage + ProfilePage
- [ ] Fase 6 — Tailwind config (token tema), dark mode, backend (Axios/Supabase)

CSS asli (`style.css`, `features.css`, `spacing-fix.css`, `transition.css`) disalin tanpa perubahan ke `src/styles/`.
""")
print("OK")
