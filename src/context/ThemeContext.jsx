import { createContext, useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { ROUTES, STORAGE_KEYS } from "../utils/constants.js";

export const ThemeContext = createContext(null);

// Dark mode diterapkan di area aplikasi, landing page, serta halaman login/register.
const THEMED_PATHS = [
  ROUTES.home,
  ROUTES.login,
  ROUTES.register,
  ROUTES.onboarding,
  ROUTES.dashboard,
  ROUTES.courses,
  ROUTES.tasks,
  ROUTES.analytics,
  ROUTES.profile,
];

function readStoredTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.theme);
    if (saved === "light" || saved === "dark") return saved;
  } catch (error) {
    /* storage diblokir: pakai preferensi sistem */
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readStoredTheme);
  const { pathname } = useLocation();
  const themed = THEMED_PATHS.includes(pathname);
  const isDark = themed && theme === "dark";

  useLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.theme, theme);
    } catch (error) {
      /* mode sementara */
    }
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);
  const value = useMemo(() => ({ theme, isDark, themed, setTheme, toggleTheme }), [theme, isDark, themed, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
