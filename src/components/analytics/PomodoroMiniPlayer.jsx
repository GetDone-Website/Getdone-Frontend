import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { usePomodoroContext } from "../../context/PomodoroContext.jsx";

const pad = (n) => String(n).padStart(2, "0");
const MINI_STROKE = 113.1; // 2 * PI * 18

function MiniPlayerBody({
  modeText,
  remaining,
  duration,
  running,
  stateLabel,
  selectedTask,
  ytSrc,
  isPlaylist,
  alarmToast,
  dismissAlarmToast,
  start,
  pause,
  reset,
  stopYouTube,
  skipPrevTrack,
  skipNextTrack,
}) {
  const fraction = duration > 0 ? (duration - remaining) / duration : 0;
  const dashOffset = MINI_STROKE - Math.min(1, Math.max(0, fraction)) * MINI_STROKE;

  return (
    <div className="p-3.5 flex flex-col gap-3">
      {alarmToast && (
        <div
          role="alert"
          className="px-2.5 py-2 rounded-xl bg-primary-container text-on-primary flex items-center justify-between gap-2 shadow-sm"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="material-symbols-outlined text-[18px] animate-bounce flex-shrink-0">notifications_active</span>
            <div className="min-w-0">
              <div className="text-xs font-bold leading-tight truncate">{alarmToast.title}</div>
              <div className="text-[11px] opacity-90 truncate">{alarmToast.body}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={dismissAlarmToast}
            className="px-2 py-1 rounded-lg bg-surface-clean text-primary text-[11px] font-bold flex-shrink-0"
          >
            OK
          </button>
        </div>
      )}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="3.5"
                className="text-border-subtle opacity-60"
              />
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeDasharray={MINI_STROKE}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                className="text-primary-container transition-all duration-500"
              />
            </svg>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                running ? "bg-state-done animate-pulse" : "bg-text-muted"
              }`}
            />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-headline-md text-2xl font-extrabold tracking-tight text-on-surface leading-none tabular-nums">
                {pad(Math.floor(remaining / 60))}:{pad(remaining % 60)}
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-primary-container/15 text-primary text-[10px] font-bold">
                {modeText}
              </span>
            </div>
            <span className="text-[11px] text-text-muted truncate mt-1">
              {selectedTask ? selectedTask.title : stateLabel}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={running ? pause : start}
            title={running ? "Jeda" : "Mulai"}
            className="w-9 h-9 rounded-full bg-primary-container text-on-primary hover:bg-cta-hover flex items-center justify-center shadow-sm transition-transform active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">
              {running ? "pause" : "play_arrow"}
            </span>
          </button>
          <button
            type="button"
            onClick={reset}
            title="Reset"
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[17px]">restart_alt</span>
          </button>
        </div>
      </div>

      {ytSrc && (
        <div className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl bg-surface-container-low text-xs">
          <div className="flex items-center gap-1.5 min-w-0 text-on-surface">
            <span className="material-symbols-outlined text-[16px] text-primary">music_note</span>
            <span className="truncate font-medium">
              {isPlaylist ? "Playlist YouTube" : "Lo-fi YouTube"}
            </span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {isPlaylist && (
              <>
                <button
                  type="button"
                  onClick={skipPrevTrack}
                  title="Lagu sebelumnya"
                  className="p-1 rounded-lg hover:bg-surface-container-high text-on-surface transition-colors flex items-center"
                >
                  <span className="material-symbols-outlined text-[16px]">skip_previous</span>
                </button>
                <button
                  type="button"
                  onClick={skipNextTrack}
                  title="Lewati ke lagu berikutnya"
                  className="p-1 rounded-lg hover:bg-surface-container-high text-on-surface transition-colors flex items-center"
                >
                  <span className="material-symbols-outlined text-[16px]">skip_next</span>
                </button>
              </>
            )}
            <button
              type="button"
              onClick={stopYouTube}
              title="Hentikan musik"
              className="p-1 rounded-lg hover:bg-surface-container-high text-state-urgent transition-colors flex items-center"
            >
              <span className="material-symbols-outlined text-[16px]">stop</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Floating draggable Pomodoro Mini-Player & persistent YouTube audio layer.
 * Mendukung Document Picture-in-Picture agar mini-player tetap terlihat saat
 * user berpindah ke aplikasi lain.
 */
export default function PomodoroMiniPlayer() {
  const { pathname } = useLocation();
  const {
    mode,
    remaining,
    duration,
    running,
    stateLabel,
    selectedTask,
    ytSrc,
    ytIframeRef,
    isActive,
    isPlaylist,
    isPipSupported,
    pipWindow,
    alarmToast,
    dismissAlarmToast,
    start,
    pause,
    reset,
    stopAll,
    stopYouTube,
    skipPrevTrack,
    skipNextTrack,
    openPip,
    closePip,
  } = usePomodoroContext();

  const onAnalytics = pathname === "/analytics";
  const onAuthPage = pathname === "/login" || pathname === "/register";
  // Tampilkan mini-player di halaman lain (termasuk Landing Page) jika timer/musik aktif & tidak sedang dalam mode PiP eksternal
  const showInPage = !onAnalytics && !onAuthPage && (isActive || Boolean(ytSrc)) && !pipWindow;

  const [collapsed, setCollapsed] = useState(false);
  const [pos, setPos] = useState(null);
  const cardRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragRef.current || !cardRef.current) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const rect = cardRef.current.getBoundingClientRect();
      const maxX = Math.max(8, window.innerWidth - rect.width - 8);
      const maxY = Math.max(8, window.innerHeight - rect.height - 8);
      const nextX = Math.min(maxX, Math.max(8, clientX - dragRef.current.offsetX));
      const nextY = Math.min(maxY, Math.max(8, clientY - dragRef.current.offsetY));
      setPos({ x: nextX, y: nextY });
    };
    const onUp = () => {
      dragRef.current = null;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  const beginDrag = (e) => {
    if (e.target.closest("button, a")) return;
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragRef.current = {
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top,
    };
  };

  const modeText = mode === "focus" ? "Fokus" : mode === "long" ? "Panjang" : "Jeda";
  const positionStyle = pos
    ? { left: `${pos.x}px`, top: `${pos.y}px`, right: "auto", bottom: "auto" }
    : { right: "24px", bottom: "24px" };

  const sharedBodyProps = {
    modeText,
    remaining,
    duration,
    running,
    stateLabel,
    selectedTask,
    ytSrc,
    isPlaylist,
    alarmToast,
    dismissAlarmToast,
    start,
    pause,
    reset,
    stopYouTube,
    skipPrevTrack,
    skipNextTrack,
  };

  return (
    <>
      {/* Hidden YouTube audio iframe — tetap ter-mount di seluruh halaman dashboard */}
      {ytSrc && (
        <div className="gd-youtube-player" aria-hidden="true">
          <iframe
            ref={ytIframeRef}
            title="Audio latar YouTube"
            src={ytSrc}
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      )}

      {/* Draggable In-Page Mini-Player */}
      {showInPage && (
        <aside
          ref={cardRef}
          style={positionStyle}
          aria-label="Pomodoro Mini Player"
          className="gd-mini-player fixed z-[9990] w-[320px] max-w-[calc(100vw-24px)] rounded-2xl shadow-2xl border border-border-subtle bg-surface-clean/95 backdrop-blur-xl overflow-hidden"
        >
          <div
            onMouseDown={beginDrag}
            onTouchStart={beginDrag}
            className="flex items-center justify-between gap-2 px-3 py-2 bg-surface-container-low border-b border-border-subtle cursor-grab active:cursor-grabbing select-none"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="material-symbols-outlined text-[16px] text-text-muted">drag_indicator</span>
              <span className="material-symbols-outlined text-[16px] text-primary">hourglass_bottom</span>
              <span className="font-label-sm text-label-sm font-semibold text-on-surface truncate">
                Pomodoro Mini
              </span>
            </div>

            <div className="flex items-center gap-1">
              {isPipSupported && (
                <button
                  type="button"
                  title="Mengambang di atas aplikasi lain (Always on Top)"
                  onClick={openPip}
                  className="p-1 rounded-lg text-text-muted hover:text-primary hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">picture_in_picture_alt</span>
                </button>
              )}
              <Link
                to="/analytics"
                title="Buka halaman Timer"
                className="p-1 rounded-lg text-text-muted hover:text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              </Link>
              <button
                type="button"
                title={collapsed ? "Perluas" : "Perkecil"}
                onClick={() => setCollapsed((c) => !c)}
                className="p-1 rounded-lg text-text-muted hover:text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {collapsed ? "expand_less" : "expand_more"}
                </span>
              </button>
              <button
                type="button"
                title="Tutup & hentikan"
                onClick={stopAll}
                className="p-1 rounded-lg text-text-muted hover:text-state-urgent hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          </div>

          {!collapsed && <MiniPlayerBody {...sharedBodyProps} />}
        </aside>
      )}

      {/* Always-on-Top Document Picture-in-Picture Portal (tetap terlihat di atas aplikasi lain) */}
      {pipWindow &&
        !pipWindow.closed &&
        createPortal(
          <div className="min-h-screen w-full bg-surface-clean text-on-surface flex flex-col justify-between">
            <div className="flex items-center justify-between px-3 py-2 bg-surface-container-low border-b border-border-subtle">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">hourglass_bottom</span>
                <span className="font-label-sm text-label-sm font-semibold text-on-surface">
                  GetDone · Pomodoro
                </span>
              </div>
              <button
                type="button"
                onClick={closePip}
                title="Kembalikan ke tab"
                className="p-1 rounded-lg text-text-muted hover:text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">close_fullscreen</span>
              </button>
            </div>
            <MiniPlayerBody {...sharedBodyProps} />
          </div>,
          pipWindow.document.body,
        )}
    </>
  );
}
