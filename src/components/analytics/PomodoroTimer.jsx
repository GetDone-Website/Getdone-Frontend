import { useEffect, useRef, useState } from "react";
import { courseLabel } from "../../services/academicData.js";
import { usePomodoroContext } from "../../context/PomodoroContext.jsx";

const FULL_STROKE = 640.88;
const pad = (n) => String(n).padStart(2, "0");

/** Kartu timer Pomodoro: pengaturan, tugas fokus, audio YouTube (dengan skip playlist), layar penuh, dan pop-out mini player. */
export default function PomodoroTimer({ initialTaskId = "" }) {
  const {
    settings,
    draft,
    settingsHidden,
    mode,
    remaining,
    duration,
    running,
    paused,
    completed,
    stateLabel,
    message,
    inProgress,
    selectedTaskId,
    taskTouched,
    selectedTask,
    ytUrl,
    ytSrc,
    ytMessage,
    isPlaylist,
    currentCycle,
    isPipSupported,
    pipWindow,
    MODES,
    modeLabel,
    setDraftField,
    setSelectedTaskId,
    setTaskTouched,
    setYtUrl,
    start,
    pause,
    reset,
    switchMode,
    applySettings,
    changeAutoStart,
    toggleSettings,
    submitYouTube,
    stopYouTube,
    skipNextTrack,
    skipPrevTrack,
    openPip,
    closePip,
  } = usePomodoroContext();

  // Sinkronkan initialTaskId dari query param jika ada dan belum dipilih
  useEffect(() => {
    if (
      initialTaskId &&
      !taskTouched &&
      inProgress.some((t) => String(t.id) === String(initialTaskId))
    ) {
      setSelectedTaskId(String(initialTaskId));
    }
  }, [initialTaskId, taskTouched, inProgress, setSelectedTaskId]);

  const taskNote = selectedTask
    ? `Sesi fokus akan dicatat untuk: ${selectedTask.title}`
    : taskTouched
      ? "Sesi fokus tidak dikaitkan dengan tugas tertentu."
      : inProgress.length
        ? "Pilih salah satu tugas In Progress untuk mengaitkan sesi fokus."
        : "Belum ada tugas In Progress. Ubah status tugas di Pusat Tugas terlebih dahulu.";

  // Layar penuh
  const cardRef = useRef(null);
  const [nativeFullscreen, setNativeFullscreen] = useState(false);
  const [fallbackFullscreen, setFallbackFullscreen] = useState(false);
  const fullscreen = nativeFullscreen || fallbackFullscreen;

  useEffect(() => {
    const onChange = () => setNativeFullscreen(document.fullscreenElement === cardRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("gd-timer-no-scroll", fallbackFullscreen);
    if (!fallbackFullscreen) return undefined;
    const onKey = (e) => e.key === "Escape" && setFallbackFullscreen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("gd-timer-no-scroll");
    };
  }, [fallbackFullscreen]);

  useEffect(
    () => () => {
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    },
    [],
  );

  const toggleFullscreen = async () => {
    const card = cardRef.current;
    if (!card) return;
    if (document.fullscreenElement === card) {
      await document.exitFullscreen().catch(() => {});
      return;
    }
    if (fallbackFullscreen) {
      setFallbackFullscreen(false);
      return;
    }
    if (card.requestFullscreen) {
      try {
        await card.requestFullscreen();
        return;
      } catch {
        /* Browser tidak mendukung: lanjutkan ke mode fallback. */
      }
    }
    setFallbackFullscreen(true);
  };

  // Tampilan
  const fraction = duration > 0 ? (duration - remaining) / duration : 0;
  const dashOffset = FULL_STROKE - Math.min(1, Math.max(0, fraction)) * FULL_STROKE;
  const toggleText = running ? "Jeda" : paused ? "Lanjut" : "Mulai";

  return (
    <div
      id="gd-timer-focus"
      ref={cardRef}
      className={`bg-surface-clean rounded-xl p-space-lg shadow-sm flex flex-col items-center relative overflow-hidden${fallbackFullscreen ? " gd-timer-fallback-fullscreen" : ""}`}
    >
      <div className={fullscreen ? "w-full max-w-3xl mx-auto my-auto flex flex-col items-center" : "w-full flex flex-col items-center"}>
        <div className="w-full flex flex-wrap items-center justify-between mb-space-md gap-2">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-[20px] text-primary">hourglass_bottom</span>
            <span className="font-headline-sm text-headline-sm text-on-surface">Pomodoro Focus</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-space-sm py-space-xs rounded-full bg-surface-container font-label-sm text-label-sm text-primary font-medium">
              Siklus {currentCycle}/{settings.sessions}
            </span>
            {isPipSupported && (
              <button
                type="button"
                className="gd-fullscreen-toggle"
                title="Buka mini-player mengambang agar tetap terlihat di atas aplikasi lain"
                onClick={pipWindow ? closePip : openPip}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  picture_in_picture_alt
                </span>
                <span>{pipWindow ? "Tutup Mini" : "Mini Player"}</span>
              </button>
            )}
            <button
              type="button"
              id="gd-fullscreen-toggle"
              className="gd-fullscreen-toggle"
              aria-label={fullscreen ? "Keluar dari mode fokus layar penuh" : "Aktifkan mode fokus layar penuh"}
              onClick={toggleFullscreen}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                {fullscreen ? "fullscreen_exit" : "fullscreen"}
              </span>
              <span>{fullscreen ? "Keluar Fokus" : "Mode Fokus"}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center p-space-xs bg-surface-muted rounded-full w-full max-w-xs justify-between mb-space-lg" id="timer-modes">
          {MODES.map((m) => (
            <button
              key={m}
              type="button"
              data-mode={m}
              onClick={() => switchMode(m)}
              className={`timer-mode-btn flex-1 py-1.5 px-2 rounded-full font-label-sm text-label-sm transition-all duration-200 text-center ${
                mode === m ? "bg-primary-container text-on-primary shadow-sm font-semibold" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {modeLabel(m, settings)}
            </button>
          ))}
        </div>

        <div className="relative w-64 h-64 flex items-center justify-center my-space-xs">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 240 240">
            <circle className="opacity-60 text-border-subtle" cx="120" cy="120" fill="transparent" r="102" stroke="currentColor" strokeWidth="12" />
            <circle
              className="transition-all duration-700 ease-out text-primary-container"
              cx="120"
              cy="120"
              fill="transparent"
              id="timer-progress"
              r="102"
              stroke="currentColor"
              strokeDasharray="640.88"
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              strokeWidth="12"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-display-timer text-display-timer text-on-surface font-extrabold tracking-tighter" id="timer-display" role="timer">
              {pad(Math.floor(remaining / 60))}:{pad(remaining % 60)}
            </span>
            <div className="flex items-center gap-1.5 mt-space-xs">
              <span className="w-2 h-2 rounded-full bg-state-done animate-pulse" />
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted" id="timer-state-label">
                {stateLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-space-sm mt-space-md w-full justify-center">
          <button
            className="flex-1 max-w-[140px] flex items-center justify-center gap-space-xs py-2.5 px-space-md rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg hover:bg-cta-hover active:scale-[0.98] transition-all shadow-sm"
            id="btn-toggle"
            type="button"
            onClick={running ? pause : start}
          >
            <span className="material-symbols-outlined text-[20px]" id="btn-toggle-icon">
              {running ? "pause" : "play_arrow"}
            </span>
            <span id="btn-toggle-text">{toggleText}</span>
          </button>
          <button
            className="py-2.5 px-space-md rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg active:scale-[0.98] transition-all flex items-center gap-1"
            id="btn-reset"
            type="button"
            onClick={reset}
          >
            <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            <span>Reset</span>
          </button>
        </div>

        <div className="w-full mt-space-lg pt-space-md bg-surface-container-low rounded-xl p-space-md flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-full bg-surface-clean flex items-center justify-center text-primary shadow-xs">
              <span className="material-symbols-outlined text-[20px]">local_fire_department</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                Sesi ke-{currentCycle} dari {settings.sessions}
              </span>
              <span className="font-body-sm text-body-sm text-text-muted">Total fokus: {completed * settings.focusMinutes} menit</span>
            </div>
          </div>
          <div className="flex gap-1.5" aria-hidden="true">
            {Array.from({ length: Math.min(settings.sessions, 12) }, (_, i) => (
              <span
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${
                  i < completed ? "bg-primary-container" : i === completed ? "bg-primary-fixed-dim" : "bg-border-subtle"
                }`}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          id="gd-settings-toggle"
          className="gd-settings-toggle mt-space-md"
          aria-expanded={!settingsHidden}
          aria-controls="gd-timer-settings-panel"
          onClick={toggleSettings}
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            {settingsHidden ? "tune" : "expand_less"}
          </span>
          <span>{settingsHidden ? "Tampilkan pengaturan" : "Sembunyikan pengaturan"}</span>
        </button>

        <div id="gd-timer-settings-panel" className={`gd-collapsible w-full${settingsHidden ? " is-collapsed" : ""}`}>
          <div className="gd-collapsible-inner">
            <section className="gd-timer-settings" aria-label="Pengaturan Pomodoro dan tugas fokus">
              <div className="gd-timer-settings-heading">
                <div>
                  <strong>Atur sesi fokus</strong>
                  <p>Sesuaikan ritme belajar dengan kebutuhanmu.</p>
                </div>
                <span id="gd-session-progress" className="gd-session-badge">
                  Sesi {completed}/{settings.sessions}
                </span>
              </div>
              <div className="gd-timer-fields">
                <label>
                  Durasi fokus (menit)
                  <input id="gd-focus-minutes" type="number" min="1" max="120" step="1" inputMode="numeric" value={draft.focus} onChange={setDraftField("focus")} />
                </label>
                <label>
                  Durasi istirahat (menit)
                  <input id="gd-break-minutes" type="number" min="1" max="60" step="1" inputMode="numeric" value={draft.rest} onChange={setDraftField("rest")} />
                </label>
                <label>
                  Jumlah sesi
                  <input id="gd-session-count" type="number" min="1" max="12" step="1" inputMode="numeric" value={draft.sessions} onChange={setDraftField("sessions")} />
                </label>
                <button id="gd-apply-settings" className="gd-control-primary" type="button" onClick={applySettings}>
                  Terapkan
                </button>
              </div>
              <div className="gd-autostart" role="radiogroup" aria-label="Cara memulai timer berikutnya">
                <span className="gd-autostart-label">Memulai timer berikutnya</span>
                <div className="gd-segmented">
                  <button type="button" role="radio" aria-checked={!settings.autoStart} className={!settings.autoStart ? "is-active" : undefined} onClick={() => changeAutoStart(false)}>
                    Manual
                  </button>
                  <button type="button" role="radio" aria-checked={settings.autoStart} className={settings.autoStart ? "is-active" : undefined} onClick={() => changeAutoStart(true)}>
                    Otomatis
                  </button>
                </div>
                <p className="gd-autostart-hint">
                  {settings.autoStart ? "Fokus dan istirahat berganti otomatis tanpa menekan Mulai." : "Setiap fase menunggu kamu menekan Mulai."}
                </p>
              </div>
              <p id="gd-settings-message" className={`gd-settings-message${message.warn ? " is-warning" : ""}`} role="status" aria-live="polite">
                {message.text}
              </p>
              <div className="gd-task-focus-control">
                <label htmlFor="gd-active-task">Tugas yang sedang dikerjakan</label>
                <select
                  id="gd-active-task"
                  value={selectedTaskId}
                  onChange={(e) => {
                    setTaskTouched(true);
                    setSelectedTaskId(e.target.value);
                  }}
                >
                  <option value="">Pilih tugas In Progress</option>
                  {inProgress.map((t) => (
                    <option key={t.id} value={String(t.id)}>{`${t.title} — ${courseLabel(t.course)}`}</option>
                  ))}
                </select>
                <p id="gd-active-task-note" role="status">
                  {taskNote}
                </p>
              </div>

              <form id="gd-youtube-form" className="gd-youtube-form" onSubmit={submitYouTube}>
                <label htmlFor="gd-youtube-url">Lo-fi YouTube</label>
                <div className="gd-youtube-row">
                  <input
                    id="gd-youtube-url"
                    type="url"
                    placeholder="Tempel link video atau playlist YouTube"
                    autoComplete="url"
                    value={ytUrl}
                    onChange={(e) => setYtUrl(e.target.value)}
                  />
                  <button className="gd-control-primary" type="submit">
                    Putar audio
                  </button>
                  <button className="gd-control-secondary" id="gd-youtube-stop" type="button" onClick={stopYouTube}>
                    Hentikan
                  </button>
                </div>
                <p id="gd-youtube-message" className={ytMessage.warn ? "is-warning" : undefined} role="status">
                  {ytMessage.text}
                </p>
                {ytSrc && (
                  <div className="flex items-center justify-between gap-2 mt-1.5 px-3 py-2 rounded-xl bg-surface-container-low">
                    <span className="text-xs text-primary font-medium">
                      {isPlaylist ? "Playlist YouTube sedang diputar" : "Audio YouTube sedang diputar"}
                    </span>
                    {isPlaylist && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={skipPrevTrack}
                          title="Lagu sebelumnya"
                          className="p-1.5 rounded-lg bg-surface-clean hover:bg-surface-container-high text-on-surface transition-colors flex items-center"
                        >
                          <span className="material-symbols-outlined text-[18px]">skip_previous</span>
                        </button>
                        <button
                          type="button"
                          onClick={skipNextTrack}
                          title="Lewati ke lagu berikutnya"
                          className="p-1.5 rounded-lg bg-surface-clean hover:bg-surface-container-high text-on-surface transition-colors flex items-center"
                        >
                          <span className="material-symbols-outlined text-[18px]">skip_next</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
