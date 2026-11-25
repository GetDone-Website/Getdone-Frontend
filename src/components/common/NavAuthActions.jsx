import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { DEFAULT_USER_NAME } from "../../utils/constants.js";

/**
 * Isi container aksi di navbar landing.
 * Struktur DOM sengaja dijaga (anak langsung <a>) karena spacing-fix.css memakai
 * selector struktural (header > div > div:last-child > a:first-of-type).
 */
export default function NavAuthActions() {
  const { isLoggedIn, session, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!isLoggedIn) {
    return (
      <>
        <Link
          className="font-label-lg text-label-lg text-secondary hover:text-on-surface px-space-sm py-space-xs transition-colors duration-150"
          data-path="login"
          to="/login"
        >
          Masuk
        </Link>
        <Link
          className="font-label-lg text-label-lg bg-primary-container hover:bg-cta-hover text-on-primary px-space-lg py-space-sm rounded-xl font-semibold transition-all duration-150 shadow-sm"
          data-path="register"
          to="/register"
        >
          Daftar
        </Link>
      </>
    );
  }

  const name = session?.fullName?.trim() || DEFAULT_USER_NAME;
  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  return (
    <div className="gd-profile-menu-wrap" ref={wrapRef}>
      <button
        className="gd-profile-trigger"
        id="gd-profile-trigger"
        type="button"
        ref={triggerRef}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="gd-profile-dropdown"
        onClick={() => setOpen((v) => !v)}
      >
        {session?.avatarUrl ? (
          <img src={session.avatarUrl} alt={name} className="w-6 h-6 rounded-full object-cover" />
        ) : (
          <span className="material-symbols-outlined" aria-hidden="true">account_circle</span>
        )}
        <span className="gd-profile-name">Profile</span>
        <span className="material-symbols-outlined" aria-hidden="true">expand_more</span>
      </button>
      <div className={`gd-profile-dropdown${open ? " is-open" : ""}`} id="gd-profile-dropdown" role="menu" aria-label="Menu profil">
        <div className="px-3 py-2">
          <div className="font-label-md text-label-md text-on-surface font-semibold">{name}</div>
          <div className="font-body-sm text-body-sm text-text-muted">{session?.email || ""}</div>
        </div>
        <div className="gd-dropdown-divider" role="separator"></div>
        <Link to="/profile" role="menuitem"><span className="material-symbols-outlined" aria-hidden="true">account_circle</span>Profile Saya</Link>
        <Link to="/dashboard" role="menuitem"><span className="material-symbols-outlined" aria-hidden="true">dashboard</span>Dashboard</Link>
        <Link to="/tasks" role="menuitem"><span className="material-symbols-outlined" aria-hidden="true">task_alt</span>Pusat Tugas</Link>
        <Link to="/courses" role="menuitem"><span className="material-symbols-outlined" aria-hidden="true">school</span>Mata Kuliah</Link>
        <Link to="/analytics" role="menuitem"><span className="material-symbols-outlined" aria-hidden="true">timer</span>Analytics &amp; Timer</Link>
        <div className="gd-dropdown-divider" role="separator"></div>
        <button type="button" id="gd-profile-logout" role="menuitem" onClick={handleLogout}><span className="material-symbols-outlined" aria-hidden="true">logout</span>Keluar</button>
      </div>
    </div>
  );
}
