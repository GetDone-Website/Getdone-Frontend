import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { API_ENABLED } from "../services/api.js";
import { hydrateFromServer } from "../services/remoteSync.js";
import ThemeToggle from "../components/common/ThemeToggle.jsx";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { readFlag, readJSON, writeFlag } from "../services/storage.js";
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

/** Layout halaman internal: sidebar + header responsif, isi halaman lewat <Outlet />. */
export default function DashboardLayout() {
  const { session, logout } = useAuth();
  const { pathname } = useLocation();
  usePageMeta({ bodyClass: "app-page" });

  // Backend aktif: tarik data server sebelum halaman dirender.
  const [ready, setReady] = useState(!API_ENABLED);
  const [loadError, setLoadError] = useState("");
  const [syncError, setSyncError] = useState("");
  useEffect(() => {
    if (!API_ENABLED) return undefined;
    let cancelled = false;
    hydrateFromServer()
      .then(() => !cancelled && setReady(true))
      .catch((error) => !cancelled && setLoadError(error.message));
    const onSyncError = (e) => setSyncError(e.detail || "Perubahan terakhir belum tersimpan ke server.");
    window.addEventListener("getdone:sync-error", onSyncError);
    return () => {
      cancelled = true;
      window.removeEventListener("getdone:sync-error", onSyncError);
    };
  }, []);

  // Desktop sidebar collapse (persisted) & mobile drawer open state
  const [hidden, setHidden] = useState(() => readFlag(STORAGE_KEYS.sidebarHidden, false));
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("gd-sidebar-collapsed", hidden);
    writeFlag(STORAGE_KEYS.sidebarHidden, hidden);
    return () => document.body.classList.remove("gd-sidebar-collapsed");
  }, [hidden]);

  useEffect(() => {
    const onSidebarPref = (e) => setHidden(Boolean(e.detail));
    window.addEventListener("getdone:sidebar-pref-changed", onSidebarPref);
    return () => window.removeEventListener("getdone:sidebar-pref-changed", onSidebarPref);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("gd-sidebar-mobile-open", mobileOpen);
    return () => document.body.classList.remove("gd-sidebar-mobile-open");
  }, [mobileOpen]);

  // Tutup drawer mobile otomatis saat berpindah rute
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleToggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setMobileOpen((v) => !v);
    } else {
      setHidden((v) => !v);
    }
  };

  const fullName = session?.fullName?.trim() || DEFAULT_USER_NAME;
  const onProfile = pathname === "/profile";
  const displayName = onProfile ? fullName : shortName(fullName);
  const today = formatLongDate();
  const onboarding = readJSON(STORAGE_KEYS.onboarding, {});
  const academicPeriod = onboarding?.academicStartYear
    ? `Semester ${onboarding.activeSemester || "?"} • ${onboarding.semesterTerm === "genap" ? "Genap" : "Ganjil"} ${onboarding.academicStartYear}/${onboarding.academicStartYear + 1}`
    : "Belum mengatur semester";

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[1px] lg:hidden"
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        id="gd-sidebar"
        className="fixed left-0 top-0 h-full w-64 bg-surface-container-low shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between py-space-lg gd-sidebar"
      >
        <div className="flex flex-col gap-space-lg">
          <div className="flex items-center justify-between px-space-lg">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-3xl">task_alt</span>
              <span className="font-headline-md text-headline-md font-bold tracking-tight text-primary">GetDone</span>
            </div>
            <button
              type="button"
              className="lg:hidden p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high"
              aria-label="Tutup menu"
              onClick={() => setMobileOpen(false)}
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <nav className="flex flex-col gap-space-xs px-space-md" data-active-classes={ACTIVE_CLASS}>
            {NAV_ITEMS.map((item) => {
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
          </nav>
        </div>
        <div className="px-space-md">
          <div className="p-space-md rounded-xl bg-surface-container flex flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider">Sesi Aktif</span>
            <span className="font-label-md text-label-md text-on-surface">{academicPeriod}</span>
          </div>
          <Link to="/" className="gd-back-landing">
            <span>Landing Page</span>
          </Link>
        </div>
      </aside>

      <div className="lg:pl-64 gd-dashboard-shell">
        <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 gd-dashboard-header gd-has-sidebar-toggle">
          <div className="flex flex-col justify-center min-w-0 flex-1 pr-3">
            <div className="font-label-lg text-label-lg text-on-surface font-semibold truncate">
              {onProfile ? `Profil, ${fullName}` : `Selamat Datang, ${fullName}`}
            </div>
            <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-text-muted truncate">
              <span className="material-symbols-outlined text-[15px] flex-shrink-0">calendar_today</span>
              <span className="truncate">{today}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-5 flex-shrink-0">
            <ThemeToggle />
            <button
              className="hidden sm:inline-flex p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
              type="button"
              aria-label="Notifikasi"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
            </button>
            <div className="hidden sm:block h-5 w-[1px] bg-border-subtle mx-0.5"></div>
            <Link
              to="/profile"
              title="Lihat Profil"
              className={`flex items-center gap-2.5 rounded-lg px-2 sm:px-2.5 py-1.5 transition-colors ${onProfile ? "bg-surface-container-high" : "hover:bg-surface-container-high"}`}
            >
              {session?.avatarUrl ? (
                <img alt={fullName} className="w-8 h-8 rounded-full object-cover flex-shrink-0" src={session.avatarUrl} />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md text-label-md font-bold flex-shrink-0">
                  {fullName.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase() || "GD"}
                </div>
              )}
              <div className="hidden lg:flex flex-col">
                <span className="font-label-md text-label-md text-on-surface font-medium leading-none">{displayName}</span>
                <span className="font-label-sm text-label-sm text-text-muted leading-tight mt-0.5">Mahasiswa</span>
              </div>
            </Link>
            <Link
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-label-md text-label-md text-text-muted hover:bg-surface-container-high hover:text-state-urgent transition-colors"
              data-path="login"
              to="/"
              onClick={logout}
              title="Keluar"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span className="hidden sm:inline">Keluar</span>
            </Link>
          </div>
          <button
            type="button"
            className="gd-sidebar-toggle"
            id="gd-sidebar-toggle"
            aria-label={hidden ? "Tampilkan sidebar" : "Sembunyikan sidebar"}
            aria-controls="gd-sidebar"
            aria-expanded={!hidden}
            onClick={handleToggleSidebar}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              {mobileOpen ? "close" : hidden ? "left_panel_open" : "left_panel_close"}
            </span>
          </button>
        </header>

        {!ready ? (
          <main className="pt-16 px-margin py-gutter min-h-screen" role="status" aria-live="polite">
            <p className="font-body-md text-body-md text-text-muted mt-space-xl">
              {loadError ? `Gagal memuat data: ${loadError}` : "Memuat data akun…"}
            </p>
            {loadError && (
              <button type="button" className="gd-control-primary mt-space-md" onClick={() => window.location.reload()}>
                Coba lagi
              </button>
            )}
          </main>
        ) : (
          <Outlet />
        )}

        {syncError && (
          <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-error-container text-on-error-container rounded-xl shadow-lg p-space-md font-label-md text-label-md flex items-start gap-space-sm" role="alert">
            <span>{syncError} Data tetap tersimpan di browser ini.</span>
            <button type="button" className="underline" onClick={() => setSyncError("")}>Tutup</button>
          </div>
        )}
      </div>
    </>
  );
}
