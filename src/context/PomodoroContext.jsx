/**
 * PomodoroContext — state timer global yang persisten saat navigasi antar halaman.
 * Menyediakan timer, musik YouTube (termasuk skip playlist), mini-player,
 * serta Document Picture-in-Picture agar mini-player tetap terlihat di atas aplikasi lain.
 */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  clampNumber,
  loadFocusSettings,
  loadSettingsHidden,
  logFocusSession,
  saveFocusSettings,
  saveSettingsHidden,
} from "../services/focusService.js";
import { loadPreferences } from "../services/preferencesService.js";
import { playAlarm, sendPomodoroNotification, stopAlarm } from "../services/alarmSound.js";
import { loadTasks } from "../services/taskService.js";

// ─── Helpers ────────────────────────────────────────────────────────────────

const MODES = ["focus", "short", "long"];

function durationFor(mode, s) {
  if (mode === "focus") return s.focusMinutes * 60;
  if (mode === "long") return Math.min(120, s.breakMinutes * 2) * 60;
  return s.breakMinutes * 60;
}

function modeLabel(mode, s) {
  if (mode === "focus") return `Fokus (${s.focusMinutes}m)`;
  if (mode === "short") return `Jeda (${s.breakMinutes}m)`;
  return `Panjang (${Math.min(120, s.breakMinutes * 2)}m)`;
}

function parseYouTubeTarget(raw) {
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (!["youtu.be", "youtube.com", "m.youtube.com", "music.youtube.com", "youtube-nocookie.com"].includes(host))
      return null;
    const playlistId = url.searchParams.get("list") || "";
    if (playlistId && /^[A-Za-z0-9_-]{10,100}$/.test(playlistId)) return { type: "playlist", id: playlistId };
    let videoId = "";
    if (host === "youtu.be") videoId = url.pathname.split("/").filter(Boolean)[0] || "";
    else
      videoId =
        url.searchParams.get("v") || url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1] || "";
    return /^[A-Za-z0-9_-]{11}$/.test(videoId) ? { type: "video", id: videoId } : null;
  } catch {
    return null;
  }
}

const ytEmbedSrc = (t) =>
  t.type === "playlist"
    ? `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(t.id)}&autoplay=1&controls=0&playsinline=1&enablejsapi=1`
    : `https://www.youtube-nocookie.com/embed/${t.id}?autoplay=1&controls=0&loop=1&playlist=${t.id}&playsinline=1&enablejsapi=1`;

// ─── Context ─────────────────────────────────────────────────────────────────

const PomodoroContext = createContext(null);

export function usePomodoroContext() {
  const ctx = useContext(PomodoroContext);
  if (!ctx) throw new Error("usePomodoroContext must be used inside PomodoroProvider");
  return ctx;
}

export function PomodoroProvider({ children }) {
  // ── Settings ──
  const [settings, setSettings] = useState(loadFocusSettings);
  const [draft, setDraft] = useState(() => {
    const s = loadFocusSettings();
    return { focus: String(s.focusMinutes), rest: String(s.breakMinutes), sessions: String(s.sessions) };
  });
  const [settingsHidden, setSettingsHidden] = useState(loadSettingsHidden);

  // ── Timer core ──
  const [mode, setMode] = useState("focus");
  const [remaining, setRemaining] = useState(() => loadFocusSettings().focusMinutes * 60);
  const [duration, setDuration] = useState(() => loadFocusSettings().focusMinutes * 60);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [stateLabel, setStateLabel] = useState("Siap Belajar");
  const [message, setMessage] = useState({
    text: "Timer menggunakan pengaturan yang tersimpan di browser ini.",
    warn: false,
  });
  const [alarmToast, setAlarmToast] = useState(null); // { id, title, body }

  const dismissAlarmToast = useCallback(() => {
    stopAlarm();
    setAlarmToast(null);
  }, []);

  // ── Task ──
  const [tasks] = useState(loadTasks);
  const inProgress = tasks.filter((t) => t.status === "in_progress");
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [taskTouched, setTaskTouched] = useState(false);
  const selectedTask = inProgress.find((t) => String(t.id) === selectedTaskId);

  // ── YouTube Audio ──
  const [ytUrl, setYtUrl] = useState("");
  const [ytTarget, setYtTarget] = useState(null); // { type: "video"|"playlist", id }
  const [ytSrc, setYtSrc] = useState("");
  const [ytMessage, setYtMessage] = useState({
    text: "Audio diputar setelah tombol ditekan, sesuai kebijakan autoplay browser.",
    warn: false,
  });
  const ytIframeRef = useRef(null);

  // ── Document Picture-in-Picture (Always-on-Top Mini Player) ──
  const isPipSupported = typeof window !== "undefined" && "documentPictureInPicture" in window;
  const [pipWindow, setPipWindow] = useState(null);

  const closePip = useCallback(() => {
    setPipWindow((prev) => {
      if (prev && !prev.closed) prev.close();
      return null;
    });
  }, []);

  const openPip = useCallback(async () => {
    if (!isPipSupported) return;
    if (pipWindow && !pipWindow.closed) {
      pipWindow.focus();
      return;
    }
    try {
      const win = await window.documentPictureInPicture.requestWindow({
        width: 320,
        height: 210,
      });

      // Salin stylesheet dari halaman utama agar tampilan konsisten
      for (const sheet of document.styleSheets) {
        try {
          if (sheet.href) {
            const link = win.document.createElement("link");
            link.rel = "stylesheet";
            link.href = sheet.href;
            win.document.head.appendChild(link);
          } else if (sheet.cssRules) {
            const style = win.document.createElement("style");
            style.textContent = [...sheet.cssRules].map((r) => r.cssText).join("\n");
            win.document.head.appendChild(style);
          }
        } catch {
          /* Abaikan stylesheet cross-origin */
        }
      }

      if (document.documentElement.classList.contains("dark")) {
        win.document.documentElement.classList.add("dark");
      }
      if (document.documentElement.style.fontSize) {
        win.document.documentElement.style.fontSize = document.documentElement.style.fontSize;
      }
      win.document.title = "Pomodoro Mini | GetDone";
      win.document.body.style.margin = "0";
      win.document.body.style.overflow = "hidden";

      win.addEventListener("pagehide", () => {
        setPipWindow(null);
      });

      setPipWindow(win);
    } catch (err) {
      console.warn("Gagal membuka mode mengambang (Picture-in-Picture):", err);
    }
  }, [isPipSupported, pipWindow]);

  // Sinkronkan tema (dark/light) & ukuran font secara real-time ke jendela PiP saat berubah
  useEffect(() => {
    if (!pipWindow || pipWindow.closed) return undefined;
    const syncRoot = () => {
      if (pipWindow.closed) return;
      pipWindow.document.documentElement.classList.toggle(
        "dark",
        document.documentElement.classList.contains("dark"),
      );
      if (document.documentElement.style.fontSize) {
        pipWindow.document.documentElement.style.fontSize = document.documentElement.style.fontSize;
      }
    };
    syncRoot();
    const observer = new MutationObserver(syncRoot);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });
    return () => observer.disconnect();
  }, [pipWindow]);

  // Tutup PiP saat unmount
  useEffect(() => () => {
    if (pipWindow && !pipWindow.closed) pipWindow.close();
  }, [pipWindow]);

  // ── Countdown ──
  useEffect(() => {
    if (!running) return undefined;
    const id = window.setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  // Sinkronkan pengaturan Pomodoro jika diubah dari halaman Profil
  useEffect(() => {
    const onSettingsChanged = (e) => {
      const next = e.detail || loadFocusSettings();
      setSettings(next);
      setDraft({ focus: String(next.focusMinutes), rest: String(next.breakMinutes), sessions: String(next.sessions) });
      if (!running && !paused) {
        const nextDur = durationFor(mode, next);
        setDuration(nextDur);
        setRemaining(nextDur);
      }
    };
    window.addEventListener("getdone:focus-settings-changed", onSettingsChanged);
    return () => window.removeEventListener("getdone:focus-settings-changed", onSettingsChanged);
  }, [running, paused, mode]);

  // ── switchMode ──
  const switchMode = useCallback(
    (nextMode, s = settings) => {
      const next = durationFor(nextMode, s);
      setRunning(false);
      setPaused(false);
      setMode(nextMode);
      setDuration(next);
      setRemaining(next);
      setStateLabel(nextMode === "focus" ? "Siap Belajar" : "Waktunya Istirahat");
    },
    [settings],
  );

  // ── beginPhase ──
  const beginPhase = useCallback(
    (nextMode, s = settings) => {
      const next = durationFor(nextMode, s);
      setMode(nextMode);
      setDuration(next);
      setRemaining(next);
      setPaused(false);
      setRunning(true);
      setStateLabel(nextMode === "focus" ? "Sedang Fokus" : "Sedang Istirahat");
    },
    [settings],
  );

  // ── Phase completion ──
  useEffect(() => {
    if (!running || remaining > 0) return;
    setRunning(false);
    setPaused(false);
    const prefs = loadPreferences();
    playAlarm({
      sound: prefs.alarmSound,
      volume: prefs.alarmVolume,
      customSrc: prefs.customAlarmDataUrl,
    });

    if (mode === "focus") {
      const total = Math.min(settings.sessions, completed + 1);
      setCompleted(total);
      logFocusSession({
        taskId: selectedTaskId,
        taskTitle: selectedTask?.title,
        durationMinutes: settings.focusMinutes,
      });
      const toastTitle = "Sesi Fokus Selesai!";
      const toastBody =
        total >= settings.sessions
          ? `Selamat! ${total} sesi fokus telah tercapai.`
          : `Sesi ${total}/${settings.sessions} selesai. Waktunya istirahat sejenak.`;
      setAlarmToast({ id: Date.now(), title: toastTitle, body: toastBody });
      if (prefs.desktopNotification) {
        sendPomodoroNotification(toastTitle, toastBody);
      }
      if (total >= settings.sessions) {
        setStateLabel("Target sesi tercapai!");
        setMessage({
          text: `Selesai ${total} sesi fokus. Terapkan pengaturan baru untuk memulai siklus lainnya.`,
          warn: false,
        });
        return;
      }
      if (settings.autoStart) {
        beginPhase("short");
        setMessage({
          text: `Sesi fokus ${total}/${settings.sessions} selesai. Waktu istirahat dimulai otomatis.`,
          warn: false,
        });
        return;
      }
      switchMode("short");
      setStateLabel("Fokus selesai · waktunya istirahat");
      setMessage({
        text: `Sesi fokus ${total}/${settings.sessions} selesai. Mulai timer jeda saat siap.`,
        warn: false,
      });
    } else {
      const toastTitle = "Waktu Istirahat Selesai!";
      const toastBody = "Saatnya kembali ke sesi fokus berikutnya.";
      setAlarmToast({ id: Date.now(), title: toastTitle, body: toastBody });
      if (prefs.desktopNotification) {
        sendPomodoroNotification(toastTitle, toastBody);
      }
      if (settings.autoStart) {
        beginPhase("focus");
        setMessage({ text: "Waktu istirahat selesai. Sesi fokus berikutnya dimulai otomatis.", warn: false });
        return;
      }
      switchMode("focus");
      setStateLabel("Istirahat selesai · siap fokus");
      setMessage({ text: "Waktu istirahat selesai. Mulai sesi fokus berikutnya saat siap.", warn: false });
    }
  }, [running, remaining, mode, completed, settings, selectedTaskId, selectedTask, switchMode, beginPhase]);

  // ── Timer controls ──
  const start = useCallback(() => {
    if (running) return;
    if (mode === "focus" && completed >= settings.sessions) {
      setMessage({
        text: "Target sesi telah tercapai. Ubah atau terapkan pengaturan untuk memulai siklus baru.",
        warn: false,
      });
      return;
    }
    setAlarmToast(null);
    const prefs = loadPreferences();
    if (prefs.desktopNotification && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
    if (remaining <= 0) setRemaining(duration);
    setRunning(true);
    setPaused(false);
    setStateLabel(mode === "focus" ? "Sedang Fokus" : "Sedang Istirahat");
  }, [running, mode, completed, settings, remaining, duration]);

  const pause = useCallback(() => {
    setRunning(false);
    setPaused(true);
    setStateLabel("Dijeda");
  }, []);

  const reset = useCallback(() => {
    setRunning(false);
    setPaused(false);
    setRemaining(duration);
    setStateLabel(mode === "focus" ? "Siap Belajar" : "Waktunya Istirahat");
  }, [duration, mode]);

  const stopAll = useCallback(() => {
    setRunning(false);
    setPaused(false);
    setYtSrc("");
    setYtTarget(null);
    setStateLabel("Siap Belajar");
    closePip();
  }, [closePip]);

  // ── Settings ──
  const applySettings = useCallback(() => {
    const focus = Number(draft.focus);
    const rest = Number(draft.rest);
    const sessions = Number(draft.sessions);
    const valid =
      Number.isInteger(focus) && focus >= 1 && focus <= 120 &&
      Number.isInteger(rest) && rest >= 1 && rest <= 60 &&
      Number.isInteger(sessions) && sessions >= 1 && sessions <= 12;
    if (!valid) {
      setMessage({ text: "Gunakan fokus 1–120 menit, istirahat 1–60 menit, dan 1–12 sesi.", warn: true });
      return;
    }
    const next = {
      focusMinutes: clampNumber(focus, 25, 1, 120),
      breakMinutes: clampNumber(rest, 5, 1, 60),
      sessions: clampNumber(sessions, 4, 1, 12),
      autoStart: settings.autoStart,
    };
    setSettings(next);
    setCompleted(0);
    if (!saveFocusSettings(next)) console.warn("Pengaturan timer tidak tersimpan.");
    setMessage({ text: "Pengaturan diterapkan dan disimpan di browser ini.", warn: false });
    switchMode("focus", next);
  }, [draft, settings, switchMode]);

  const changeAutoStart = useCallback(
    (autoStart) => {
      const next = { ...settings, autoStart };
      setSettings(next);
      if (!saveFocusSettings(next)) console.warn("Pengaturan timer tidak tersimpan.");
      setMessage({
        text: autoStart
          ? "Mode otomatis aktif: fase fokus dan istirahat berganti sendiri sampai target sesi tercapai."
          : "Mode manual aktif: tekan Mulai setiap kali fase baru akan dijalankan.",
        warn: false,
      });
    },
    [settings],
  );

  const toggleSettings = useCallback(() => {
    setSettingsHidden((h) => {
      saveSettingsHidden(!h);
      return !h;
    });
  }, []);

  const setDraftField = useCallback(
    (name) => (e) => setDraft((d) => ({ ...d, [name]: e.target.value })),
    [],
  );

  // ── YouTube + Playlist Skip via IFrame postMessage API ──
  const sendYouTubeCommand = useCallback((func) => {
    const win = ytIframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage(JSON.stringify({ event: "command", func, args: "" }), "*");
  }, []);

  const skipNextTrack = useCallback(() => sendYouTubeCommand("nextVideo"), [sendYouTubeCommand]);
  const skipPrevTrack = useCallback(() => sendYouTubeCommand("previousVideo"), [sendYouTubeCommand]);

  const submitYouTube = useCallback(
    (e) => {
      e?.preventDefault();
      const target = parseYouTubeTarget(ytUrl.trim());
      if (!target) {
        setYtMessage({
          text: "Masukkan link video atau playlist YouTube yang valid (watch, youtu.be, shorts, embed, atau playlist).",
          warn: true,
        });
        return;
      }
      setYtTarget(target);
      setYtSrc(ytEmbedSrc(target));
      setYtMessage({
        text:
          target.type === "playlist"
            ? "Playlist YouTube dimuat. Gunakan tombol Lewati/Sebelumnya untuk berpindah lagu."
            : "Permintaan pemutaran dikirim. Jika audio belum terdengar, periksa izin autoplay atau buka video melalui YouTube.",
        warn: false,
      });
    },
    [ytUrl],
  );

  const stopYouTube = useCallback(() => {
    setYtSrc("");
    setYtTarget(null);
    setYtMessage({ text: "Audio dihentikan.", warn: false });
  }, []);

  // ── Derived ──
  const isActive = running || paused;
  const isPlaylist = ytTarget?.type === "playlist";
  const currentCycle = Math.min(completed + 1, settings.sessions);
  const safeRemaining = Math.max(0, Math.floor(remaining));

  const value = {
    // State
    settings,
    draft,
    settingsHidden,
    mode,
    remaining: safeRemaining,
    duration,
    running,
    paused,
    completed,
    stateLabel,
    message,
    tasks,
    inProgress,
    selectedTaskId,
    taskTouched,
    selectedTask,
    ytUrl,
    ytTarget,
    ytSrc,
    ytMessage,
    ytIframeRef,
    isActive,
    isPlaylist,
    currentCycle,
    isPipSupported,
    pipWindow,
    alarmToast,
    // Actions
    dismissAlarmToast,
    setDraft,
    setDraftField,
    setSelectedTaskId,
    setTaskTouched,
    setYtUrl,
    start,
    pause,
    reset,
    stopAll,
    switchMode,
    beginPhase,
    applySettings,
    changeAutoStart,
    toggleSettings,
    submitYouTube,
    stopYouTube,
    skipNextTrack,
    skipPrevTrack,
    openPip,
    closePip,
    MODES,
    modeLabel,
  };

  return <PomodoroContext.Provider value={value}>{children}</PomodoroContext.Provider>;
}
