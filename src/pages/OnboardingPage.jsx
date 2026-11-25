import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProgressStepper from "../components/onboarding/ProgressStepper.jsx";
import { usePageMeta } from "../hooks/usePageMeta.js";
import {
  MIN_ENTRY_YEAR,
  computeActiveSemester,
  getAcademicCalendar,
  saveOnboarding,
} from "../services/onboardingService.js";
import { ROUTES } from "../utils/constants.js";

const HERO_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDPpjHyEcyLoN3rT4CYq9cf4E-yW2HcA-59HWanJa57OkXt7CxFLzAXtiFe5U4T2g0XaGFGHAL1YsyDmYs8bta2bn-ypnxr5EUYoMpikavTPyHy8WOvADA7wszOr8hzHJ1UPtbZdP9OnJT5D5mBJyAvsVCYZz0UfbSRhI6gnADS6fj7Cm4f5HcM7fkpDZuBnrmZGoODn3qqI2ZGVlssSXBDWAN6TRbkm5ZiRTE8kTUe";

// Kartu contoh dari templat HTML; pengguna dapat menghapusnya.
const TEMPLATE_COURSES = [
  { id: "t1", code: "CS304", name: "Pemrograman Web Lanjut", credits: 3, detail: "3 SKS • Dosen: Dr. Ir. Rian Ardianto, M.Kom", schedule: "Senin, 08:00 WIB" },
  { id: "t2", code: "CS308", name: "Basis Data Terdistribusi", credits: 3, detail: "3 SKS • Dosen: Prof. Sinta Wardhani", schedule: "Selasa, 10:45 WIB" },
  { id: "t3", code: "SE202", name: "Rekayasa Perangkat Lunak", credits: 3, detail: "3 SKS • Dosen: Fajar Santoso, S.T., M.T.", schedule: "Rabu, 13:30 WIB" },
];

const INPUT_CLS = "w-full px-4 py-3 font-body-md text-body-md";
const SECTION_TITLE = "font-headline-sm text-headline-sm text-on-surface";
const TOGGLE_TRACK =
  "w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-clean after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container";

function sksStatus(value) {
  if (value < 15) return { text: "Beban Belajar Ringan", cls: "text-secondary" };
  if (value <= 20) return { text: "Beban Seimbang & Ideal", cls: "text-state-done" };
  return { text: "Beban Intensif & Padat", cls: "text-state-urgent" };
}

let rowCounter = 0;
const newArrear = () => ({ key: `a${++rowCounter}`, name: "", code: "", credits: "" });

export default function OnboardingPage() {
  usePageMeta({
    title: "Setup Awal | GetDone",
    bodyClass: "auth-page bg-background font-body-md text-body-md text-on-surface antialiased min-h-screen",
  });
  const navigate = useNavigate();
  const { academicStartYear, currentTerm } = useMemo(() => getAcademicCalendar(), []);

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const cardRef = useRef(null);
  const entryYearRef = useRef(null);

  // Langkah 1
  const [entryYear, setEntryYear] = useState("");
  const [term, setTerm] = useState(currentTerm);
  // Langkah 2
  const [targetSks, setTargetSks] = useState(18);
  // Langkah 3
  const [arrears, setArrears] = useState([]);
  const [noArrears, setNoArrears] = useState(false);
  // Langkah 4
  const [courses, setCourses] = useState(TEMPLATE_COURSES);
  const [composer, setComposer] = useState({ name: "", code: "", credits: "3" });
  const [composerError, setComposerError] = useState("");
  const [prefs, setPrefs] = useState({ deadlineReminder: true, calendarSync: true });

  const activeSemester = computeActiveSemester(entryYear, term, academicStartYear);
  const yearNumber = Number(entryYear);
  const yearEntered = entryYear !== "" && Number.isInteger(yearNumber);
  const yearInvalid = yearEntered && (yearNumber > academicStartYear || yearNumber < MIN_ENTRY_YEAR);
  const status = sksStatus(targetSks);

  const arrearsSks = noArrears ? 0 : arrears.reduce((sum, r) => sum + (Number(r.credits) || 0), 0);
  const coursesSks = courses.reduce((sum, c) => sum + c.credits, 0);
  const totalSks = arrearsSks + coursesSks;
  const overTarget = totalSks > targetSks;

  const goToStep = (next) => {
    setStep(Math.max(1, Math.min(4, next)));
    setError("");
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const fail = (atStep, message) => {
    if (step !== atStep) goToStep(atStep);
    setError(message);
  };

  const updateArrear = (key, field) => (e) =>
    setArrears((rows) => rows.map((r) => (r.key === key ? { ...r, [field]: e.target.value } : r)));
  const addArrear = () => {
    if (noArrears) setNoArrears(false);
    setArrears((rows) => [...rows, newArrear()]);
  };
  const toggleNoArrears = (checked) => {
    setNoArrears(checked);
    if (checked) setArrears([]);
  };

  const addCourse = () => {
    const name = composer.name.trim();
    const credits = Number(composer.credits);
    if (!name) return setComposerError("Nama mata kuliah perlu diisi sebelum ditambahkan.");
    if (!Number.isInteger(credits) || credits < 1 || credits > 6) return setComposerError("Jumlah SKS harus berada di antara 1 dan 6.");
    setComposerError("");
    setCourses((list) => [
      ...list,
      {
        id: `c${Date.now()}`, code: composer.code.trim(), name, credits,
        detail: `${credits} SKS • Mata kuliah semester berjalan`, schedule: "Jadwal dapat dilengkapi nanti",
      },
    ]);
    setComposer({ name: "", code: "", credits: "3" });
  };
  const setComposerField = (field) => (e) => {
    setComposerError("");
    setComposer((c) => ({ ...c, [field]: e.target.value }));
  };

  const validateArrears = () => {
    if (noArrears) return true;
    if (arrears.length === 0) {
      fail(3, "Langkah ini perlu dikonfirmasi: tambahkan mata kuliah yang belum lulus atau centang bahwa tidak ada tanggungan.");
      return false;
    }
    for (const row of arrears) {
      if (!row.name.trim()) return fail(3, "Isi nama semua mata kuliah tanggungan terlebih dahulu."), false;
      if (!row.credits) return fail(3, "Pilih jumlah SKS untuk setiap mata kuliah tanggungan."), false;
    }
    return true;
  };

  const finishSetup = (skipCurrentCourses = false) => {
    if (!yearEntered || yearInvalid) {
      fail(1, "Masukkan tahun masuk akademik yang valid sebelum menyimpan konfigurasi.");
      entryYearRef.current?.focus();
      return;
    }
    if (!validateArrears()) return;
    const savedArrears = noArrears
      ? []
      : arrears.map((r) => ({ name: r.name.trim(), code: r.code.trim(), credits: Number(r.credits) }));
    const savedCourses = skipCurrentCourses ? [] : courses.map((c) => ({ name: c.name, code: c.code, credits: c.credits }));
    const plannedArrears = savedArrears.reduce((sum, c) => sum + c.credits, 0);
    const plannedCourses = savedCourses.reduce((sum, c) => sum + c.credits, 0);
    if (!skipCurrentCourses && plannedArrears + plannedCourses > targetSks) {
      const proceed = window.confirm(
        `Total rencana adalah ${plannedArrears + plannedCourses} SKS, melebihi target ${targetSks} SKS. Simpan rencana ini tetap?`,
      );
      if (!proceed) return goToStep(4);
    }
    const saved = saveOnboarding({
      entryYear: yearNumber,
      academicStartYear,
      semesterTerm: term,
      activeSemester,
      targetSks,
      arrears: savedArrears,
      courses: savedCourses,
      skippedCurrentCourses: skipCurrentCourses,
      preferences: { ...prefs },
      savedAt: new Date().toISOString(),
    });
    if (!saved) {
      fail(4, "Penyimpanan lokal gagal. Periksa pengaturan penyimpanan browser, lalu coba lagi.");
      return;
    }
    navigate(ROUTES.dashboard);
  };

  const onContinue = () => {
    setError("");
    if (step === 1) {
      const input = entryYearRef.current;
      if (!entryYear) return input?.reportValidity();
      if (input && !input.reportValidity()) return undefined;
      if (activeSemester === null || activeSemester < 1) {
        return fail(1, "Tahun masuk harus berada pada atau sebelum tahun akademik berjalan.");
      }
      return goToStep(2);
    }
    if (step === 2) return goToStep(3);
    if (step === 3) return validateArrears() && goToStep(4);
    return finishSetup(false);
  };

  const termOptions = [
    {
      value: "ganjil",
      title: `Semester Ganjil ${academicStartYear}/${academicStartYear + 1}`,
      period: `Periode perkuliahan Agustus ${academicStartYear} – Januari ${academicStartYear + 1}`,
    },
    {
      value: "genap",
      title: `Semester Genap ${academicStartYear}/${academicStartYear + 1}`,
      period: `Periode perkuliahan Februari – Juli ${academicStartYear + 1}`,
    },
  ];

  return (
    <main className="w-full bg-background min-h-screen">
      <div className="flex flex-col w-full">
        <div className="relative w-full overflow-hidden py-10 px-4 sm:px-6 lg:px-8">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-fixed-dim/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-tertiary-fixed-dim/30 rounded-full blur-3xl pointer-events-none"></div>
          <div className="max-w-4xl mx-auto flex flex-col gap-8 relative z-10">
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm">
                  <span className="material-symbols-outlined text-headline-sm">school</span>
                </div>
                <span className="font-headline-md text-headline-md tracking-tight text-on-surface">
                  Get<span className="text-primary-container">Done.</span>
                </span>
              </div>
              <ProgressStepper step={step} />
            </div>

            <div ref={cardRef} className="bg-surface-clean rounded-2xl shadow-md p-6 sm:p-10 flex flex-col gap-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 bg-surface-container-low p-6 rounded-xl">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed mb-3">
                    <span className="material-symbols-outlined text-label-md">verified_user</span>
                    <span className="font-label-md text-label-md">Konfigurasi Akademik Baru</span>
                  </div>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-2">
                    Mari Konfigurasi Semester &amp; Mata Kuliah Anda 🎓
                  </h1>
                  <p className="font-body-md text-body-md text-text-muted max-w-2xl">
                    Sesuaikan pengaturan agar jadwal kuliah dan sistem deteksi deadline bekerja secara otomatis untuk perkuliahan Anda.
                  </p>
                </div>
                <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden shadow-sm hidden md:block">
                  <img className="w-full h-full object-cover" alt="" src={HERO_IMG} />
                </div>
              </div>

              {/* ---------- Langkah 1 ---------- */}
              {step === 1 && (
                <section className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-5 bg-primary-container rounded-full"></span>
                    <h2 className={SECTION_TITLE}>1. Tahun Masuk &amp; Semester Akademik</h2>
                  </div>
                  <div className="gd-intake-panel p-4 rounded-xl bg-surface-container-low flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="font-label-md text-label-md text-on-surface" htmlFor="gd-entry-year">Tahun Masuk Akademik</label>
                      <p className="font-body-sm text-body-sm text-text-muted">
                        Masukkan tahun pertama kamu mulai kuliah. Semester aktif dihitung otomatis berdasarkan kalender akademik saat ini.
                      </p>
                    </div>
                    <input
                      id="gd-entry-year" ref={entryYearRef} className={INPUT_CLS} type="number" inputMode="numeric"
                      min={MIN_ENTRY_YEAR} max={academicStartYear} required placeholder="Contoh: 2024"
                      aria-describedby="gd-semester-result" value={entryYear}
                      onChange={(e) => setEntryYear(e.target.value)}
                    />
                    <div id="gd-semester-result" className={`gd-intake-result${yearInvalid ? " is-warning" : ""}`} role="status" aria-live="polite">
                      <span className="material-symbols-outlined" aria-hidden="true">{yearInvalid ? "warning" : "event_available"}</span>
                      {!yearEntered ? (
                        <div><strong>Semester aktif</strong><div>Semester akan dihitung setelah tahun masuk dipilih.</div></div>
                      ) : yearInvalid ? (
                        <div><strong>Tahun masuk belum sesuai</strong><div>Pilih tahun masuk yang tidak melewati awal tahun akademik berjalan.</div></div>
                      ) : (
                        <div>
                          <strong>Semester {activeSemester}</strong>
                          <div>
                            Periode {term === "ganjil" ? "Ganjil" : "Genap"} {academicStartYear}/{academicStartYear + 1}. Kamu dapat mengganti periode akademik di pilihan di bawah.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {termOptions.map((opt) => {
                      const checked = term === opt.value;
                      return (
                        <label key={opt.value} className="cursor-pointer">
                          <input className="peer sr-only" name="semester" type="radio" value={opt.value} checked={checked} onChange={() => setTerm(opt.value)} />
                          <div className="p-4 rounded-xl bg-surface-container-low peer-checked:bg-surface-container peer-checked:shadow-sm transition-all flex items-start gap-4">
                            <div className={`mt-0.5 w-5 h-5 rounded-full bg-surface-clean flex items-center justify-center ${checked ? "" : "text-text-muted"}`}>
                              <span className={`material-symbols-outlined text-label-sm${checked ? " text-primary-container" : ""}`}>
                                {checked ? "radio_button_checked" : "radio_button_unchecked"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-label-lg text-label-lg text-on-surface">{opt.title}</span>
                              <span className="font-body-sm text-body-sm text-text-muted">{opt.period}</span>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  <div className="mt-2 flex flex-col gap-2">
                    <label className="font-label-md text-label-md text-text-muted uppercase tracking-wider">Jenjang Studi &amp; Program Studi</label>
                    <div className="flex items-center gap-3 px-4 py-3 bg-surface-container-low rounded-xl">
                      <span className="material-symbols-outlined text-primary-container">domain_verification</span>
                      <input className="bg-transparent font-body-md text-body-md text-on-surface w-full focus:outline-none" placeholder="Masukkan Program Studi..." type="text" defaultValue="S1 Teknik Informatika / Ilmu Komputer" />
                      <span className="font-label-sm text-label-sm bg-surface-clean text-text-muted px-2.5 py-1 rounded-md shadow-xs">Terverifikasi</span>
                    </div>
                  </div>
                </section>
              )}

              {/* ---------- Langkah 2 ---------- */}
              {step === 2 && (
                <section className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-5 bg-primary-container rounded-full"></span>
                      <h2 className={SECTION_TITLE}>2. Target Beban SKS Semester Ini</h2>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-surface-container rounded-full">
                      <span className="w-2.5 h-2.5 rounded-full bg-state-done animate-pulse"></span>
                      <span className={`font-label-md text-label-md ${status.cls}`} id="sks-status">{status.text}</span>
                    </div>
                  </div>
                  <div className="bg-surface-container-low p-6 rounded-xl flex flex-col gap-6">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="font-display-lg text-display-lg text-primary tracking-tight" id="sks-value">{targetSks}</span>
                        <span className="font-headline-sm text-headline-sm text-text-muted ml-1">/ 24 SKS Max</span>
                      </div>
                      <div className="text-right">
                        <span className="font-label-md text-label-md text-text-muted block">Estimasi Waktu Belajar Mandiri</span>
                        <span className="font-headline-sm text-headline-sm text-on-surface" id="study-hours">~{Math.round(targetSks * 1.5)} Jam / Minggu</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <input
                        className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary-container"
                        id="sks-range" max="24" min="10" type="range" value={targetSks}
                        onChange={(e) => setTargetSks(Number.parseInt(e.target.value, 10))}
                      />
                      <div className="flex justify-between font-label-sm text-label-sm text-text-muted px-1">
                        <span>10 SKS (Santai)</span>
                        <span>18 SKS (Standar)</span>
                        <span>24 SKS (Maksimal)</span>
                      </div>
                    </div>
                    <div className="w-full bg-surface-clean p-4 rounded-xl flex items-center gap-4 shadow-xs">
                      <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center text-primary-container shrink-0">
                        <span className="material-symbols-outlined">insights</span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Mengambil 18 SKS memberi ruang ideal untuk fokus di 6 mata kuliah utama serta mempertahankan keseimbangan organisasi dan istirahat optimal.
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* ---------- Langkah 3 ---------- */}
              {step === 3 && (
                <section className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-5 bg-primary-container rounded-full"></span>
                      <h2 className={SECTION_TITLE}>3. Tanggungan Mata Kuliah dari Semester Sebelumnya</h2>
                    </div>
                    <p className="font-body-sm text-body-sm text-text-muted">
                      Catat mata kuliah yang belum lulus terlebih dahulu. SKS tanggungan akan dihitung bersama target semester ini.
                    </p>
                  </div>
                  <div className={`flex flex-col gap-3${noArrears ? " gd-onboarding-hidden" : ""}`}>
                    {arrears.map((row) => (
                      <div key={row.key} className="gd-arrear-row grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-xl bg-surface-container-low">
                        <label>Nama mata kuliah
                          <input type="text" required maxLength={120} placeholder="Contoh: Kalkulus I" value={row.name} onChange={updateArrear(row.key, "name")} autoFocus={!row.name && arrears[arrears.length - 1] === row} />
                        </label>
                        <label>Kode mata kuliah
                          <input type="text" maxLength={24} placeholder="Contoh: MAT101" value={row.code} onChange={updateArrear(row.key, "code")} />
                        </label>
                        <label>Jumlah SKS
                          <select required className="px-3 py-2" value={row.credits} onChange={updateArrear(row.key, "credits")}>
                            <option value="">Pilih SKS</option>
                            {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} SKS</option>)}
                          </select>
                        </label>
                        <button type="button" className="gd-arrear-remove md:col-span-3" aria-label="Hapus mata kuliah tanggungan" onClick={() => setArrears((rows) => rows.filter((r) => r.key !== row.key))}>
                          <span className="material-symbols-outlined" aria-hidden="true">delete</span> Hapus tanggungan
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <button
                      type="button" onClick={addArrear} disabled={noArrears}
                      className={`w-full sm:w-auto px-4 py-3 rounded-xl bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-colors font-label-lg text-label-lg flex items-center justify-center gap-2${noArrears ? " opacity-50" : ""}`}
                    >
                      <span className="material-symbols-outlined text-body-md">add_circle</span>Tambah Mata Kuliah Tanggungan
                    </button>
                  </div>
                  <label className="flex items-start gap-3 p-4 rounded-xl bg-surface-container-low cursor-pointer">
                    <input className="mt-1" type="checkbox" checked={noArrears} onChange={(e) => toggleNoArrears(e.target.checked)} />
                    <span className="flex flex-col gap-1">
                      <span className="font-label-md text-label-md text-on-surface">Saya tidak memiliki mata kuliah tanggungan</span>
                      <span className="font-body-sm text-body-sm text-text-muted">
                        Pilih ini untuk mengonfirmasi bahwa semua mata kuliah sebelumnya sudah lulus atau tidak ada mata kuliah yang perlu diulang.
                      </span>
                    </span>
                  </label>
                  <div className="font-body-sm text-body-sm text-text-muted" role="status" aria-live="polite">
                    {noArrears
                      ? "Tidak ada tanggungan yang akan ditambahkan ke perhitungan SKS."
                      : "Minimal tambahkan satu mata kuliah atau konfirmasi bahwa tidak ada tanggungan."}
                  </div>
                </section>
              )}

              {/* ---------- Langkah 4 ---------- */}
              {step === 4 && (
                <>
                  <section className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-5 bg-primary-container rounded-full"></span>
                        <h2 className={SECTION_TITLE}>4. Mata Kuliah Semester Ini (Opsional)</h2>
                      </div>
                      <span className="font-label-md text-label-md text-text-muted">Opsional</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-text-muted">
                      Tambahkan mata kuliah semester ini setelah tanggungan. Kamu dapat melewati langkah ini dan melengkapinya nanti.
                    </p>
                    <div className="gd-course-composer">
                      <label>Nama mata kuliah
                        <input type="text" maxLength={120} placeholder="Contoh: Basis Data" value={composer.name} onChange={setComposerField("name")} />
                      </label>
                      <label>Kode
                        <input type="text" maxLength={24} placeholder="BD201" value={composer.code} onChange={setComposerField("code")} />
                      </label>
                      <label>SKS
                        <input type="number" min="1" max="6" value={composer.credits} onChange={setComposerField("credits")} />
                      </label>
                      <div className="flex flex-col gap-1">
                        <span className="font-label-sm text-label-sm text-text-muted">&nbsp;</span>
                        <span className="font-body-sm text-body-sm text-text-muted">Isi detail lalu tekan Tambah.</span>
                      </div>
                      {composerError && <p id="gd-course-composer-error" className="gd-step-error">{composerError}</p>}
                    </div>
                    <div className="flex flex-col gap-3" id="course-list">
                      {courses.map((course) => (
                        <div key={course.id} className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 rounded-xl bg-surface-container-low transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-surface-clean flex flex-col items-center justify-center shadow-xs shrink-0">
                              <span className="font-label-sm text-label-sm text-text-muted uppercase">Kode</span>
                              <span className="font-label-lg text-label-lg text-primary-container">{course.code || "MK"}</span>
                            </div>
                            <div>
                              <h3 className="font-headline-sm text-headline-sm text-on-surface">{course.name}</h3>
                              <span className="font-body-sm text-body-sm text-text-muted">{course.detail}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-clean text-on-surface shadow-xs">
                              <span className="material-symbols-outlined text-body-md text-primary-container">schedule</span>
                              <span className="font-label-md text-label-md">{course.schedule}</span>
                            </div>
                            <button type="button" aria-label="Hapus mata kuliah" onClick={() => setCourses((list) => list.filter((c) => c.id !== course.id))} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-error hover:bg-error-container/30 transition-colors">
                              <span className="material-symbols-outlined text-body-md">close</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={addCourse} className="w-full py-3 rounded-xl bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-colors font-label-lg text-label-lg flex items-center justify-center gap-2" id="add-course-btn">
                      <span className="material-symbols-outlined text-body-md">add_circle</span> Tambah Mata Kuliah
                    </button>
                    <div id="gd-course-summary" className={`gd-course-summary${overTarget ? " is-warning" : ""}`} role="status" aria-live="polite">
                      {overTarget
                        ? `Total perencanaan ${totalSks} SKS (${arrearsSks} SKS tanggungan + ${coursesSks} SKS mata kuliah saat ini), melebihi target ${targetSks} SKS. Periksa pilihan sebelum menyimpan.`
                        : `Rencana saat ini: ${totalSks} dari target ${targetSks} SKS (${arrearsSks} SKS tanggungan + ${coursesSks} SKS mata kuliah semester ini).`}
                    </div>
                  </section>

                  <section className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-5 bg-primary-container rounded-full"></span>
                      <h2 className={SECTION_TITLE}>Preferensi Notifikasi &amp; Timer Fokus</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: "deadlineReminder", icon: "notifications_active", title: "Pengingat Deadline Kuliah", desc: "Kirim pengingat H-1 hari & H-3 jam via browser" },
                        { key: "calendarSync", icon: "sync", title: "Sinkronisasi Kalender", desc: "Hubungkan otomatis ke Google Calendar / iCal" },
                      ].map((p) => (
                        <div key={p.key} className="p-4 rounded-xl bg-surface-container-low flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-primary-container mt-0.5">{p.icon}</span>
                            <div className="flex flex-col">
                              <span className="font-label-lg text-label-lg text-on-surface">{p.title}</span>
                              <span className="font-body-sm text-body-sm text-text-muted">{p.desc}</span>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                            <input className="sr-only peer" type="checkbox" aria-label={p.title} checked={prefs[p.key]} onChange={(e) => setPrefs((s) => ({ ...s, [p.key]: e.target.checked }))} />
                            <div className={TOGGLE_TRACK}></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}

              {error && <div id="gd-onboarding-step-error" className="gd-step-error" role="alert">{error}</div>}

              <div className="pt-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                {step > 1 && (
                  <button type="button" id="gd-onboarding-back" onClick={() => goToStep(step - 1)} className="gd-step-button w-full sm:w-auto px-6 py-3 rounded-xl font-label-lg text-label-lg text-secondary hover:bg-surface-container-high transition-colors">
                    Kembali
                  </button>
                )}
                <div className="w-full sm:w-auto sm:ml-auto flex flex-col-reverse sm:flex-row items-center gap-4">
                  {step === 4 && (
                    <button type="button" id="gd-skip-current-courses" onClick={() => finishSetup(true)} className="gd-course-skip w-full sm:w-auto px-6 py-3 rounded-xl font-label-lg text-label-lg text-secondary hover:bg-surface-container-high transition-colors">
                      Lewati Mata Kuliah
                    </button>
                  )}
                  <button type="button" id="gd-onboarding-continue" onClick={onContinue} className="gd-step-button w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary-container hover:bg-cta-hover text-on-primary font-label-lg text-label-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group">
                    <span>{step === 4 ? "Simpan & Masuk ke Dashboard Utama" : "Lanjutkan"}</span>
                    <span className="material-symbols-outlined text-body-md transition-transform group-hover:translate-x-1">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-text-muted font-body-sm text-body-sm px-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-body-md text-primary-container">lock</span>
                <span>Data tersimpan aman di server akademik kampus terintegrasi.</span>
              </div>
              <div className="flex items-center gap-4">
                <a className="hover:underline" href="#">Bantuan Setup</a>
                <span>•</span>
                <a className="hover:underline" href="#">Import KRS PDF</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
