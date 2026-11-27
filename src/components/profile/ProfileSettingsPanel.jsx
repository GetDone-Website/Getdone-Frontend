import { useRef, useState } from "react";
import { useTheme } from "../../hooks/useTheme.js";
import { ALARM_PRESETS, playAlarm, stopAlarm } from "../../services/alarmSound.js";
import { clampNumber, loadFocusSettings, saveFocusSettings } from "../../services/focusService.js";
import { DEFAULT_PREFERENCES, FONT_SCALE_OPTIONS, loadPreferences, resetPreferences, savePreferences } from "../../services/preferencesService.js";
import { readFlag, writeFlag } from "../../services/storage.js";
import { STORAGE_KEYS } from "../../utils/constants.js";

const TABS = [
  { id: "pomodoro", label: "Timer & Alarm", icon: "timer" },
  { id: "tasks", label: "Manajemen Tugas", icon: "task_alt" },
  { id: "courses", label: "Mata Kuliah", icon: "school" },
  { id: "appearance", label: "Tampilan & Umum", icon: "palette" },
];

const SELECT_CLS =
  "w-full rounded-xl border border-border-subtle bg-surface-container-lowest px-3.5 py-2.5 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/30";
const INPUT_CLS =
  "w-full rounded-xl border border-border-subtle bg-surface-container-lowest px-3.5 py-2.5 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/30";

export default function ProfileSettingsPanel() {
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("pomodoro");
  const [prefs, setPrefs] = useState(() => loadPreferences());
  const [focusCfg, setFocusCfg] = useState(() => loadFocusSettings());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => readFlag(STORAGE_KEYS.sidebarHidden, false));
  const [customUrlInput, setCustomUrlInput] = useState(() =>
    prefs.customAlarmDataUrl && !prefs.customAlarmDataUrl.startsWith("data:") ? prefs.customAlarmDataUrl : "",
  );
  const [statusMsg, setStatusMsg] = useState("");
  const fileRef = useRef(null);

  const notifySaved = (msg) => {
    setStatusMsg(msg);
    window.clearTimeout(notifySaved._t);
    notifySaved._t = window.setTimeout(() => setStatusMsg(""), 3500);
  };

  const updatePref = (patch, msg = "Pengaturan disimpan.") => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    savePreferences(next);
    notifySaved(msg);
  };

  const updateFocus = (patch) => {
    const next = {
      focusMinutes: clampNumber(patch.focusMinutes ?? focusCfg.focusMinutes, 25, 1, 120),
      breakMinutes: clampNumber(patch.breakMinutes ?? focusCfg.breakMinutes, 5, 1, 60),
      sessions: clampNumber(patch.sessions ?? focusCfg.sessions, 4, 1, 12),
      autoStart: patch.autoStart !== undefined ? Boolean(patch.autoStart) : focusCfg.autoStart,
    };
    setFocusCfg(next);
    saveFocusSettings(next);
    notifySaved("Pengaturan default Pomodoro diperbarui.");
  };

  const handleNotificationToggle = async (enabled) => {
    if (enabled && "Notification" in window && Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch {
        /* abaikan */
      }
    }
    updatePref({ desktopNotification: enabled }, enabled ? "Notifikasi desktop diaktifkan." : "Notifikasi desktop dinonaktifkan.");
  };

  const handleUploadCustomAlarm = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      notifySaved("Ukuran file audio maksimal 2 MB agar dapat disimpan di browser.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updatePref(
        {
          alarmSound: "custom",
          customAlarmDataUrl: String(reader.result || ""),
          customAlarmName: file.name,
        },
        `Audio kustom "${file.name}" berhasil dimuat.`,
      );
      setCustomUrlInput("");
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = () => {
    const trimmed = customUrlInput.trim();
    if (!trimmed) return;
    updatePref(
      {
        alarmSound: "custom",
        customAlarmDataUrl: trimmed,
        customAlarmName: trimmed,
      },
      "Tautan audio kustom berhasil diterapkan.",
    );
  };

  const handleSidebarToggle = (collapsed) => {
    setSidebarCollapsed(collapsed);
    writeFlag(STORAGE_KEYS.sidebarHidden, collapsed);
    window.dispatchEvent(new CustomEvent("getdone:sidebar-pref-changed", { detail: collapsed }));
    notifySaved(collapsed ? "Sidebar diatur terlipat secara default." : "Sidebar diatur terbuka secara default.");
  };

  const handleResetAll = () => {
    stopAlarm();
    resetPreferences();
    setPrefs({ ...DEFAULT_PREFERENCES });
    const defFocus = { focusMinutes: 25, breakMinutes: 5, sessions: 4, autoStart: false };
    setFocusCfg(defFocus);
    saveFocusSettings(defFocus);
    setCustomUrlInput("");
    handleSidebarToggle(false);
    notifySaved("Semua pengaturan dikembalikan ke bawaan.");
  };

  return (
    <section className="gd-profile-panel" aria-labelledby="profile-settings-heading">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 id="profile-settings-heading" className="!mb-1">Pengaturan Aplikasi &amp; Preferensi</h2>
          <p className="gd-profile-note">Kustomisasi alarm Pomodoro, perilaku manajemen tugas, mata kuliah, serta tampilan aplikasi.</p>
        </div>
        <button
          type="button"
          onClick={handleResetAll}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container-high hover:bg-surface-muted text-on-surface font-label-md text-label-md transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">restart_alt</span>
          <span>Reset Default</span>
        </button>
      </div>

      {statusMsg && (
        <div role="status" className="mb-4 px-3.5 py-2.5 rounded-xl bg-surface-container-high text-primary font-label-md text-label-md flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="gd-course-tabs mb-5" role="tablist" aria-label="Kategori pengaturan">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={activeTab === t.id}
            onClick={() => setActiveTab(t.id)}
            className={`gd-course-tab inline-flex items-center gap-2${activeTab === t.id ? " is-active" : ""}`}
          >
            <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Timer & Alarm Pomodoro */}
      {activeTab === "pomodoro" && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pref-alarm-sound" className="block font-label-md text-label-md text-on-surface mb-1.5">
                Suara Alarm Saat Waktu Habis
              </label>
              <select
                id="pref-alarm-sound"
                className={SELECT_CLS}
                value={prefs.alarmSound}
                onChange={(e) => updatePref({ alarmSound: e.target.value }, "Suara alarm diperbarui.")}
              >
                {ALARM_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="pref-alarm-volume" className="block font-label-md text-label-md text-on-surface mb-1.5">
                Volume Alarm ({prefs.alarmVolume}%)
              </label>
              <div className="flex items-center gap-3 pt-1">
                <input
                  id="pref-alarm-volume"
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={prefs.alarmVolume}
                  onChange={(e) => updatePref({ alarmVolume: Number(e.target.value) }, "Volume alarm diperbarui.")}
                  className="flex-1 accent-primary-container cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() =>
                    playAlarm({
                      sound: prefs.alarmSound,
                      volume: prefs.alarmVolume,
                      customSrc: prefs.customAlarmDataUrl,
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md hover:bg-cta-hover transition-colors whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[18px]">volume_up</span>
                  <span>Tes Bunyi</span>
                </button>
              </div>
            </div>
          </div>

          {/* Custom Alarm Upload / URL */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-border-subtle flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-label-md text-label-md text-on-surface font-semibold">Kustomisasi Suara Alarm Sendiri</div>
                <p className="gd-profile-note">
                  {prefs.customAlarmName
                    ? `Audio tersimpan: ${prefs.customAlarmName}`
                    : "Unggah file audio (.mp3 / .wav / .ogg, maks. 2 MB) atau masukkan tautan audio."}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleUploadCustomAlarm}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-clean border border-border-subtle hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">upload_file</span>
                  <span>Upload Audio</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                placeholder="Atau tempel tautan file audio (https://.../alarm.mp3)"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                className={INPUT_CLS}
              />
              <button
                type="button"
                onClick={handleApplyCustomUrl}
                className="px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-muted text-on-surface font-label-md text-label-md whitespace-nowrap transition-colors"
              >
                Pakai Tautan
              </button>
            </div>
          </div>

          {/* Durasi & Notifikasi */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="pref-focus-min" className="block font-label-md text-label-md text-on-surface mb-1.5">
                Durasi Fokus Default (menit)
              </label>
              <input
                id="pref-focus-min"
                type="number"
                min="1"
                max="120"
                className={INPUT_CLS}
                value={focusCfg.focusMinutes}
                onChange={(e) => updateFocus({ focusMinutes: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="pref-break-min" className="block font-label-md text-label-md text-on-surface mb-1.5">
                Durasi Istirahat Default (menit)
              </label>
              <input
                id="pref-break-min"
                type="number"
                min="1"
                max="60"
                className={INPUT_CLS}
                value={focusCfg.breakMinutes}
                onChange={(e) => updateFocus({ breakMinutes: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="pref-sessions-count" className="block font-label-md text-label-md text-on-surface mb-1.5">
                Jumlah Sesi per Siklus
              </label>
              <input
                id="pref-sessions-count"
                type="number"
                min="1"
                max="12"
                className={INPUT_CLS}
                value={focusCfg.sessions}
                onChange={(e) => updateFocus({ sessions: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-surface-container-low cursor-pointer">
              <div>
                <div className="font-label-md text-label-md text-on-surface font-semibold">Transisi Fase Otomatis</div>
                <div className="gd-profile-note">Langsung mulai jeda/fokus berikutnya saat timer habis.</div>
              </div>
              <input
                type="checkbox"
                checked={focusCfg.autoStart}
                onChange={(e) => updateFocus({ autoStart: e.target.checked })}
                className="w-5 h-5 accent-primary-container cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-surface-container-low cursor-pointer">
              <div>
                <div className="font-label-md text-label-md text-on-surface font-semibold">Notifikasi Desktop Browser</div>
                <div className="gd-profile-note">Tampilkan notifikasi pop-up saat waktu fokus atau istirahat habis.</div>
              </div>
              <input
                type="checkbox"
                checked={prefs.desktopNotification}
                onChange={(e) => handleNotificationToggle(e.target.checked)}
                className="w-5 h-5 accent-primary-container cursor-pointer"
              />
            </label>
          </div>
        </div>
      )}

      {/* Tab 2: Manajemen Tugas */}
      {activeTab === "tasks" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="pref-tasks-view" className="block font-label-md text-label-md text-on-surface mb-1.5">
              Tampilan Default Pusat Tugas
            </label>
            <select
              id="pref-tasks-view"
              className={SELECT_CLS}
              value={prefs.tasksDefaultView}
              onChange={(e) => updatePref({ tasksDefaultView: e.target.value })}
            >
              <option value="kanban">Papan Kanban</option>
              <option value="table">Daftar Tabel</option>
            </select>
          </div>

          <div>
            <label htmlFor="pref-tasks-sort" className="block font-label-md text-label-md text-on-surface mb-1.5">
              Urutan Default Daftar Tugas
            </label>
            <select
              id="pref-tasks-sort"
              className={SELECT_CLS}
              value={prefs.tasksDefaultSort}
              onChange={(e) => updatePref({ tasksDefaultSort: e.target.value })}
            >
              <option value="deadline">Tenggat Terdekat</option>
              <option value="priority">Prioritas Tertinggi</option>
              <option value="newest">Terbaru Ditambahkan</option>
            </select>
          </div>

          <div>
            <label htmlFor="pref-urgent-hours" className="block font-label-md text-label-md text-on-surface mb-1.5">
              Batas Peringatan Tenggat Mendesak (Dashboard)
            </label>
            <select
              id="pref-urgent-hours"
              className={SELECT_CLS}
              value={prefs.urgentThresholdHours}
              onChange={(e) => updatePref({ urgentThresholdHours: Number(e.target.value) })}
            >
              <option value={12}>≤ 12 Jam Sebelum Tenggat</option>
              <option value={24}>≤ 24 Jam Sebelum Tenggat</option>
              <option value={48}>≤ 48 Jam Sebelum Tenggat</option>
            </select>
          </div>

          <label className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-surface-container-low cursor-pointer self-end">
            <div>
              <div className="font-label-md text-label-md text-on-surface font-semibold">Konfirmasi Sebelum Hapus Tugas</div>
              <div className="gd-profile-note">Mencegah penghapusan tugas secara tidak sengaja.</div>
            </div>
            <input
              type="checkbox"
              checked={prefs.confirmDeleteTask}
              onChange={(e) => updatePref({ confirmDeleteTask: e.target.checked })}
              className="w-5 h-5 accent-primary-container cursor-pointer"
            />
          </label>
        </div>
      )}

      {/* Tab 3: Mata Kuliah */}
      {activeTab === "courses" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="pref-max-sks" className="block font-label-md text-label-md text-on-surface mb-1.5">
              Batas Maksimal SKS per Semester
            </label>
            <input
              id="pref-max-sks"
              type="number"
              min="18"
              max="28"
              className={INPUT_CLS}
              value={prefs.maxSksLimit}
              onChange={(e) => updatePref({ maxSksLimit: clampNumber(e.target.value, 24, 18, 28) })}
            />
          </div>

          <div>
            <label htmlFor="pref-courses-semester" className="block font-label-md text-label-md text-on-surface mb-1.5">
              Tab Semester Default
            </label>
            <select
              id="pref-courses-semester"
              className={SELECT_CLS}
              value={prefs.coursesDefaultSemester}
              onChange={(e) => updatePref({ coursesDefaultSemester: e.target.value })}
            >
              <option value="current">Semester Berjalan</option>
              <option value="passed">Semester Sebelumnya · Lulus</option>
              <option value="failed">Semester Sebelumnya · Tidak Lulus</option>
            </select>
          </div>

          <div>
            <label htmlFor="pref-courses-sort" className="block font-label-md text-label-md text-on-surface mb-1.5">
              Urutan Default Mata Kuliah
            </label>
            <select
              id="pref-courses-sort"
              className={SELECT_CLS}
              value={prefs.coursesDefaultSort}
              onChange={(e) => updatePref({ coursesDefaultSort: e.target.value })}
            >
              <option value="schedule">Jadwal Terdekat</option>
              <option value="tasks">Beban Tugas Terbanyak</option>
              <option value="name">Nama (A–Z)</option>
            </select>
          </div>
        </div>
      )}

      {/* Tab 4: Tampilan & Umum */}
      {activeTab === "appearance" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-surface-container-low">
            <div>
              <div className="font-label-md text-label-md text-on-surface font-semibold">Tema Tampilan Aplikasi</div>
              <div className="gd-profile-note">Saat ini menggunakan {isDark ? "Dark Mode (Gelap)" : "Light Mode (Terang)"}.</div>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md hover:bg-cta-hover transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">{isDark ? "light_mode" : "dark_mode"}</span>
              <span>{isDark ? "Mode Terang" : "Mode Gelap"}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-2">
            <label htmlFor="pref-font-scale" className="font-label-md text-label-md text-on-surface font-semibold">
              Ukuran Tulisan Aplikasi
            </label>
            <select
              id="pref-font-scale"
              className={SELECT_CLS}
              value={prefs.fontScale}
              onChange={(e) => updatePref({ fontScale: e.target.value }, "Ukuran tulisan aplikasi diperbarui.")}
            >
              {FONT_SCALE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>

          <label className="md:col-span-2 flex items-center justify-between gap-3 p-4 rounded-xl bg-surface-container-low cursor-pointer">
            <div>
              <div className="font-label-md text-label-md text-on-surface font-semibold">Lipat Sidebar Dashboard Secara Default</div>
              <div className="gd-profile-note">Menyembunyikan panel kiri pada layar desktop untuk ruang kerja lebih luas.</div>
            </div>
            <input
              type="checkbox"
              checked={sidebarCollapsed}
              onChange={(e) => handleSidebarToggle(e.target.checked)}
              className="w-5 h-5 accent-primary-container cursor-pointer"
            />
          </label>
        </div>
      )}
    </section>
  );
}
