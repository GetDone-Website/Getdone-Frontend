import { useLayoutEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { PomodoroProvider } from "./context/PomodoroContext.jsx";
import PomodoroMiniPlayer from "./components/analytics/PomodoroMiniPlayer.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import { applyFontScale, loadPreferences } from "./services/preferencesService.js";

export default function App() {
  useLayoutEffect(() => {
    applyFontScale(loadPreferences().fontScale);
    const onPrefs = () => applyFontScale(loadPreferences().fontScale);
    window.addEventListener("getdone:preferences-changed", onPrefs);
    return () => window.removeEventListener("getdone:preferences-changed", onPrefs);
  }, []);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <PomodoroProvider>
            <AppRoutes />
            <PomodoroMiniPlayer />
          </PomodoroProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
