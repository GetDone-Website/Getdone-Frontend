import { useTheme } from "../../hooks/useTheme.js";

/** Tombol ganti tema Terang/Gelap untuk header dashboard. */
export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      className="gd-theme-toggle text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
      aria-label={isDark ? "Beralih ke tema terang" : "Beralih ke tema gelap"}
      aria-pressed={isDark}
      title={isDark ? "Tema terang" : "Tema gelap"}
      onClick={toggleTheme}
    >
      <span className="material-symbols-outlined text-[20px]" aria-hidden="true">{isDark ? "light_mode" : "dark_mode"}</span>
    </button>
  );
}
