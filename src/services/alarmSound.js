/**
 * Mesin bunyi alarm Pomodoro berbasis Web Audio API (untuk preset bawaan)
 * dan HTMLAudioElement (untuk file/tautan audio kustom).
 */

export const ALARM_PRESETS = [
  { id: "bell", label: "Classic Bell (Bel Klasik)" },
  { id: "chime", label: "Soft Chime (Nada Lembut)" },
  { id: "digital", label: "Digital Beep (Timer Digital)" },
  { id: "gong", label: "Zen Gong (Gema Tenang)" },
  { id: "custom", label: "Audio Kustom (Upload / Link)" },
  { id: "none", label: "Tanpa Suara (Mute)" },
];

let activeAudioElement = null;
let activeAudioCtx = null;

export function stopAlarm() {
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
    } catch {
      /* abaikan */
    }
    activeAudioElement = null;
  }
  if (activeAudioCtx) {
    try {
      activeAudioCtx.close();
    } catch {
      /* abaikan */
    }
    activeAudioCtx = null;
  }
}

function playTone(ctx, { freq, type = "sine", start = 0, duration = 0.5, gainPeak = 0.3 }) {
  const now = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.001, gainPeak), now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.05);
}

function playPresetSound(preset, volumePercent) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();
  activeAudioCtx = ctx;
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  const vol = Math.min(1, Math.max(0, volumePercent / 100));

  if (preset === "bell") {
    [0, 0.55, 1.1].forEach((offset) => {
      playTone(ctx, { freq: 880, type: "sine", start: offset, duration: 0.48, gainPeak: 0.4 * vol });
      playTone(ctx, { freq: 1318.5, type: "sine", start: offset, duration: 0.35, gainPeak: 0.2 * vol });
    });
  } else if (preset === "chime") {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 - E5 - G5 - C6
    notes.forEach((freq, idx) => {
      playTone(ctx, { freq, type: "triangle", start: idx * 0.18, duration: 0.7, gainPeak: 0.35 * vol });
    });
  } else if (preset === "digital") {
    [0, 0.22, 0.44, 0.9, 1.12, 1.34].forEach((offset) => {
      playTone(ctx, { freq: 1000, type: "square", start: offset, duration: 0.14, gainPeak: 0.22 * vol });
    });
  } else if (preset === "gong") {
    playTone(ctx, { freq: 196, type: "sine", start: 0, duration: 2.2, gainPeak: 0.5 * vol });
    playTone(ctx, { freq: 293.66, type: "sine", start: 0, duration: 1.6, gainPeak: 0.25 * vol });
  }
}

export function playAlarm({ sound = "bell", volume = 75, customSrc = "" } = {}) {
  stopAlarm();
  if (sound === "none" || volume <= 0) return;

  if (sound === "custom") {
    if (!customSrc) {
      playPresetSound("bell", volume);
      return;
    }
    try {
      const audio = new Audio(customSrc);
      audio.volume = Math.min(1, Math.max(0, volume / 100));
      activeAudioElement = audio;
      audio.play().catch(() => {
        playPresetSound("bell", volume);
      });
      return;
    } catch {
      playPresetSound("bell", volume);
      return;
    }
  }

  playPresetSound(sound, volume);
}

export function sendPomodoroNotification(title, body) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "granted") {
    try {
      new Notification(title, { body });
    } catch {
      /* abaikan jika browser memblokir */
    }
  }
}
