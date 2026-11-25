import { Link } from "react-router-dom";
import NavAuthActions from "../components/common/NavAuthActions.jsx";
import ThemeToggle from "../components/common/ThemeToggle.jsx";
import { usePageMeta } from "../hooks/usePageMeta.js";

export default function LandingPage() {
  usePageMeta({
    title: "GetDone — Kelola Tugas Kuliah | GetDone",
    bodyClass: "bg-surface font-body-md text-on-surface antialiased selection:bg-primary-fixed selection:text-on-primary-fixed",
  });

  return (
    <>
          <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
            <div className="h-20 max-w-7xl mx-auto px-margin flex items-center justify-between gap-gutter">
              <div className="flex items-center gap-space-xl">
                <a className="flex items-center gap-space-xs" data-path="landing-page" href="#hero-section"><span className="material-symbols-outlined text-primary text-3xl">task_alt</span><span className="font-headline-md text-headline-md font-bold tracking-tight text-primary">GetDone</span></a>
                <nav className="hidden lg:flex items-center gap-space-lg" data-active-classes="text-primary font-semibold">
                  <a className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors duration-150" data-path="modul-akademik" href="#modul-akademik">Modul Akademik</a>
                  <a className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors duration-150" data-path="fitur-unggulan" href="#fitur-unggulan">Fitur Unggulan</a><a className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors duration-150" data-path="alur-kerja" href="#alur-kerja">Alur Kerja</a><a className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors duration-150" data-path="testimoni" href="#testimoni">Testimoni</a>
                </nav>
              </div>
              <div className="flex items-center gap-space-md">
                <ThemeToggle />
                <NavAuthActions />
              </div>
            </div>
          </header>
          <main className="w-full pt-20 bg-surface min-h-[calc(100vh-80px)]">
            <div className="flex flex-col w-full">
              {/* Top Decorative Ambient Glow */}
              <div className="relative w-full overflow-hidden">
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-b from-primary-fixed/25 via-surface-container-high/40 to-transparent blur-3xl pointer-events-none -z-10"></div>
              </div>
              {/* Hero Section */}
              <section id="hero-section" className="lp-hero w-full max-w-7xl mx-auto px-margin">
                <div className="lp-hero-inner flex flex-col items-center text-center">
                  {/* Tagline / Overline Badge */}
                  <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-highest shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant tracking-wide uppercase font-semibold">Sistem Manajemen Studi Terpadu</span>
                  </div>
                  {/* Headline */}
                  <h1 className="font-display-lg text-display-lg font-bold text-on-surface tracking-tight text-balance leading-tight">
                    Kelola Beban Semester &amp; Tenggat Tugas Tanpa Rasa Cemas
                  </h1>
                  {/* Body description */}
                  <p className="font-body-lg text-body-lg text-secondary max-w-2xl text-balance">
                    Platform produktivitas bagi mahasiswa untuk menyelaraskan jadwal
                    kuliah mingguan, memprioritaskan tugas akademik, dan fokus belajar
                    dengan interval Pomodoro terukur.
                  </p>
                  {/* CTA Action Group */}
                  <div className="flex flex-wrap items-center justify-center gap-space-sm pt-space-xs">
                    <Link className="inline-flex items-center gap-space-xs bg-primary-container hover:bg-cta-hover text-on-primary font-label-lg text-label-lg font-semibold px-space-lg py-3 rounded-xl shadow-md transition-all duration-200 hover:scale-[1.02]" data-path="register" to="/register">
                      <span>Mulai Sekarang — Gratis</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </Link>
                    <a className="inline-flex items-center gap-space-xs bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-lg text-label-lg font-semibold px-space-lg py-3 rounded-xl shadow-sm transition-colors duration-150" href="#fitur">
                      <span className="material-symbols-outlined text-[18px]">explore</span>
                      <span>Eksplorasi Fitur</span>
                    </a>
                  </div>
                  {/* Trust Badges */}
                  <div className="flex flex-wrap items-center justify-center gap-space-md pt-space-sm">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-xs text-xs font-bold shadow-sm">
                        IF
                      </div>
                      <div className="w-8 h-8 rounded-full bg-tertiary-container text-on-tertiary flex items-center justify-center font-label-xs text-xs font-bold shadow-sm">
                        TI
                      </div>
                      <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-label-xs text-xs font-bold shadow-sm">
                        DK
                      </div>
                      <div className="w-8 h-8 rounded-full bg-state-done text-surface-clean flex items-center justify-center font-label-xs text-xs font-bold shadow-sm">
                        FK
                      </div>
                    </div>
                    <p className="font-body-sm text-body-sm text-text-muted">
                      Digunakan oleh 12.000+ mahasiswa di 80+ perguruan tinggi di
                      Indonesia
                    </p>
                  </div>
                </div>
              </section>
              {/* Editorial Section: Values & Visual Atmosphere */}
              <section id="modul-akademik" className="lp-section w-full max-w-7xl mx-auto px-margin">
                <div className="bg-surface-container rounded-3xl lp-panel shadow-sm">
                  <div className="grid grid-cols-1 lg:grid-cols-12 lp-split items-center">
                    {/* Visual Mood Collage (5 cols) */}
                    <div className="lg:col-span-5 relative">
                      <div className="relative w-full h-[380px] rounded-2xl overflow-hidden shadow-lg">
                        <img className="w-full h-full object-cover" data-alt="A focused Southeast Asian college student studying peacefully in a bright minimalist sunlit library desk with architectural parchment notebooks, a laptop showing academic clean charts, a ceramic mug, warm ambient morning light, tranquil teal stationery, aesthetic high-contrast academic focus" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbleocCGXlk0ewKjrMtrpBfdRx32mod-z81NHEuMvkV1dy-OPM_Rs9AAIZaZVIOIskr7bbGK-txGzvVK9jOJG4qIIXVNnzfZzOoq5ro7aojfKs-mNgitShCa7QyVxJHz8ptLX6mlDimdSpFnl-PwczqDje1KJqEY55FtFmZzsscexjK0qi74i7gfP_TDCVcig1zSLYPHfAFQFFTitGCYyPjEKfLyIBAfZ4t-prO3SII4wQ3Kma038OpA" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <span className="font-label-sm text-label-sm bg-primary-container px-2 py-0.5 rounded text-on-primary font-semibold">Ketenangan Kognitif</span>
                          <p className="font-headline-sm text-headline-sm font-bold mt-1">
                            Ritme Akademik yang Stabil dan Terkendali
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Narrative Column (7 cols) */}
                    <div className="lg:col-span-7 flex flex-col gap-space-md pl-0 lg:pl-space-md">
                      <div className="flex items-center gap-space-xs text-primary font-semibold">
                        <span className="material-symbols-outlined text-[20px]">architecture</span>
                        <span className="font-label-sm text-label-sm uppercase tracking-wider">Metodologi Studi Sadar Beban</span>
                      </div>
                      <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">
                        Kekacauan Tenggat Waktu Berakhir di Sini.
                      </h2>
                      <p className="font-body-md text-body-md text-secondary">
                        Banyak mahasiswa gagal bukan karena materi yang sulit,
                        melainkan karena fragmentasi jadwal antara grup perpesanan,
                        portal LMS kampus yang membingungkan, serta catatan pribadi
                        yang tercecer. GetDone merangkum seluruh denyut nadi
                        semestermu ke dalam satu kanvas jernih yang membebaskan
                        pikiran.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm pt-space-xs">
                        <div className="bg-surface-clean p-space-md rounded-xl shadow-sm">
                          <span className="font-headline-md text-headline-md font-bold text-primary">0%</span>
                          <p className="font-label-md text-label-md font-bold text-on-surface mt-1">
                            Nol Tugas Terlewat
                          </p>
                          <p className="font-body-sm text-body-sm text-text-muted">
                            Notifikasi bertahap H-3, H-1, dan 4 jam sebelum portal
                            ditutup.
                          </p>
                        </div>
                        <div className="bg-surface-clean p-space-md rounded-xl shadow-sm">
                          <span className="font-headline-md text-headline-md font-bold text-state-done">4.2 Jam</span>
                          <p className="font-label-md text-label-md font-bold text-on-surface mt-1">
                            Waktu Fokus Harian
                          </p>
                          <p className="font-body-sm text-body-sm text-text-muted">
                            Rata-rata deep work terukur melalui protokol Pomodoro
                            adaptif.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              {/* 3 Nilai Manfaat Utama Section */}
              <section className="lp-section w-full max-w-7xl mx-auto px-margin" id="fitur-unggulan">
                <div className="text-center max-w-2xl mx-auto lp-head">
                  <span className="font-label-sm text-label-sm font-semibold uppercase tracking-widest text-primary">Kapasitas Maksimal Tanpa Burnout</span>
                  <h2 className="font-display-lg text-headline-lg md:text-display-lg font-bold text-on-surface mt-space-xs">
                    Tiga Pilar Kendali Akademik GetDone
                  </h2>
                  <p className="font-body-md text-body-md text-secondary mt-space-xs">
                    Dirancang khusus mengakomodasi ekosistem perguruan tinggi
                    Indonesia dan ritme studi mandiri mahasiswa aktif.
                  </p>
                </div>
                {/* 3 Benefit Cards Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 lp-grid">
                  {/* Manfaat 1: Pengingat Tenggat Presisi */}
                  <div className="bg-surface-clean rounded-2xl lp-card shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between group">
                    <div className="flex flex-col gap-space-sm">
                      <div className="w-14 h-14 rounded-2xl bg-surface-container-high text-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined text-3xl">notifications_active</span>
                      </div>
                      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                        Pengingat Tenggat Presisi
                      </h3>
                      <p className="font-body-md text-body-md text-secondary">
                        Memetakan batas pengumpulan tugas sebelum tenggat waktu tiba.
                        Menghilangkan kepanikan menjelang tengah malam dengan
                        kalkulasi estimasi pengerjaan berbasis tingkat kerumitan
                        tugas.
                      </p>
                    </div>
                    {/* Inline SVG Visualization: Timeline Horizon */}
                    <div className="mt-space-lg pt-space-md bg-surface-container-low rounded-xl p-space-sm">
                      <div className="flex items-center justify-between text-xs text-text-muted mb-2 font-label-sm">
                        <span>Hari ini</span>
                        <span>H-2</span>
                        <span className="text-state-urgent font-bold">Batas Akhir</span>
                      </div>
                      <svg className="w-full h-8 text-primary" fill="none" viewBox="0 0 200 30">
                        <line stroke="currentColor" strokeDasharray="4 4" strokeOpacity="0.25" strokeWidth="2" x1="10" x2="190" y1="15" y2="15"></line>
                        <circle className="fill-state-done" cx="20" cy="15" r="5"></circle>
                        <circle className="fill-primary" cx="100" cy="15" r="5"></circle>
                        <circle className="fill-state-urgent" cx="180" cy="15" r="7"></circle>
                      </svg>
                      <p className="font-label-sm text-label-sm text-center text-text-muted mt-1">
                        Visualisasi jendela waktu pengerjaan
                      </p>
                    </div>
                  </div>
                  {/* Manfaat 2: Sesi Fokus Pomodoro */}
                  <div className="bg-surface-clean rounded-2xl lp-card shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between group">
                    <div className="flex flex-col gap-space-sm">
                      <div className="w-14 h-14 rounded-2xl bg-surface-container-high text-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined text-3xl">timer</span>
                      </div>
                      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                        Sesi Fokus Pomodoro
                      </h3>
                      <p className="font-body-md text-body-md text-secondary">
                        Belajar dengan sprint 25 menit untuk menghindari kelelahan
                        mental. Dilengkapi jeda istirahat teratur dan audio latar
                        suara putih (white noise) yang menenangkan konsentrasi saat
                        membaca jurnal tebal.
                      </p>
                    </div>
                    {/* Inline SVG Visualization: Pomodoro Arc Ring */}
                    <div className="mt-space-lg pt-space-md bg-surface-container-low rounded-xl p-space-sm flex items-center justify-around">
                      <svg className="w-16 h-16" viewBox="0 0 36 36">
                        <path className="text-surface-dim" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                        <path className="text-primary-container" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="75, 100" strokeLinecap="round" strokeWidth="3"></path>
                        <text className="font-headline-sm text-[8px] fill-on-surface font-bold text-anchor-middle" textAnchor="middle" x="18" y="20.5">
                          25m
                        </text>
                      </svg>
                      <div className="flex flex-col gap-1">
                        <span className="font-label-sm text-label-sm text-state-done font-bold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-state-done"></span>
                          Siklus Optimal
                        </span>
                        <span className="font-label-sm text-label-sm text-text-muted">4 Sesi • 1 Istirahat Panjang</span>
                      </div>
                    </div>
                  </div>
                  {/* Manfaat 3: Hub Mata Kuliah Terintegrasi */}
                  <div className="bg-surface-clean rounded-2xl lp-card shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between group">
                    <div className="flex flex-col gap-space-sm">
                      <div className="w-14 h-14 rounded-2xl bg-surface-container-high text-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined text-3xl">auto_stories</span>
                      </div>
                      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                        Hub Mata Kuliah Terintegrasi
                      </h3>
                      <p className="font-body-md text-body-md text-secondary">
                        Menyimpan detail dosen pengampu, ruang kelas, dan materi
                        kuliah dalam satu tempat. Tautkan catatan pertemuan daring,
                        silabus semester, serta repositori bahan tugas tanpa perlu
                        berpindah-pindah tab browser.
                      </p>
                    </div>
                    {/* Inline SVG Visualization: Stacked Course Badges */}
                    <div className="mt-space-lg pt-space-md bg-surface-container-low rounded-xl p-space-sm flex flex-col gap-2">
                      <div className="flex items-center justify-between bg-surface-clean px-2.5 py-1.5 rounded-lg shadow-xs">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[18px]">menu_book</span>
                          <span className="font-label-sm text-label-sm font-semibold text-on-surface">Kecerdasan Buatan</span>
                        </div>
                        <span className="font-label-sm text-label-sm text-secondary font-medium">Lab 402</span>
                      </div>
                      <div className="flex items-center justify-between bg-surface-clean px-2.5 py-1.5 rounded-lg shadow-xs">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[18px]">terminal</span>
                          <span className="font-label-sm text-label-sm font-semibold text-on-surface">Sistem Terdistribusi</span>
                        </div>
                        <span className="font-label-sm text-label-sm text-secondary font-medium">R. Teori A</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              {/* Alur Kerja Sederhana Section */}
              <section id="alur-kerja" className="lp-section w-full max-w-7xl mx-auto px-margin">
                <div className="bg-surface-clean rounded-3xl lp-panel shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm lp-head">
                    <div>
                      <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold">Langkah Mudah Memulai</span>
                      <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mt-1">
                        Alur Kerja Sederhana Tiga Langkah
                      </h2>
                    </div>
                    <p className="font-body-sm text-body-sm text-secondary max-w-md">
                      Mulai dalam hitungan dua menit tanpa formulir rumit. Struktur
                      instan yang langsung bekerja untuk kenyamanan perkuliahanmu.
                    </p>
                  </div>
                  {/* 3 Steps Grid with Connecting Line Logic */}
                  <div className="grid grid-cols-1 md:grid-cols-3 lp-grid relative">
                    {/* Step 1 */}
                    <div className="flex flex-col gap-space-sm relative">
                      <div className="flex items-center gap-space-sm">
                        <span className="w-12 h-12 rounded-2xl bg-surface-container text-primary font-headline-sm font-bold flex items-center justify-center shadow-sm">
                          01
                        </span>
                        <span className="h-1 flex-1 bg-surface-container rounded hidden md:block"></span>
                      </div>
                      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface pt-2">
                        Input Data Semester &amp; Mata Kuliah
                      </h3>
                      <p className="font-body-md text-body-md text-secondary">
                        Masukkan daftar mata kuliah, bobot SKS, jadwal kelas mingguan,
                        dan nama dosen pengampu semester aktifmu.
                      </p>
                      <div className="mt-2 p-3 rounded-xl bg-surface-container-low text-xs text-text-muted flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">upload_file</span>
                        <span>Dukungan sinkronisasi silabus &amp; kalender ICS</span>
                      </div>
                    </div>
                    {/* Step 2 */}
                    <div className="flex flex-col gap-space-sm relative">
                      <div className="flex items-center gap-space-sm">
                        <span className="w-12 h-12 rounded-2xl bg-primary-container text-on-primary font-headline-sm font-bold flex items-center justify-center shadow-md">
                          02
                        </span>
                        <span className="h-1 flex-1 bg-surface-container rounded hidden md:block"></span>
                      </div>
                      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface pt-2">
                        Catat Tugas Serta Tingkat Urgensi
                      </h3>
                      <p className="font-body-md text-body-md text-secondary">
                        Tambahkan tenggat esai, kuis, atau proyek akhir. Tentukan
                        matriks prioritas agar tidak ada tugas penting yang luput dari
                        pantauan.
                      </p>
                      <div className="mt-2 p-3 rounded-xl bg-surface-container-low text-xs text-text-muted flex items-center gap-2">
                        <span className="material-symbols-outlined text-state-urgent text-[18px]">flag</span>
                        <span>Pemberian label urgensi: Mendesak, Sedang, Rutin</span>
                      </div>
                    </div>
                    {/* Step 3 */}
                    <div className="flex flex-col gap-space-sm relative">
                      <div className="flex items-center gap-space-sm">
                        <span className="w-12 h-12 rounded-2xl bg-surface-container text-primary font-headline-sm font-bold flex items-center justify-center shadow-sm">
                          03
                        </span>
                        <span className="h-1 flex-1 bg-surface-container rounded hidden md:block"></span>
                      </div>
                      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface pt-2">
                        Kerjakan dengan Fokus &amp; Pantau
                      </h3>
                      <p className="font-body-md text-body-md text-secondary">
                        Aktifkan timer Pomodoro saat pengerjaan tugas dan tandai
                        selesai saat dikirimkan. Amati kurva produktivitas mingguanmu
                        meningkat.
                      </p>
                      <div className="mt-2 p-3 rounded-xl bg-surface-container-low text-xs text-text-muted flex items-center gap-2">
                        <span className="material-symbols-outlined text-state-done text-[18px]">insights</span>
                        <span>Laporan rekap SKS tuntas secara real-time</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              {/* Kutipan Pengalaman Pengguna (Testimoni) Section */}
              <section id="testimoni" className="lp-section w-full max-w-7xl mx-auto px-margin">
                <div className="text-center max-w-xl mx-auto lp-head">
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold">Pengalaman Nyata</span>
                  <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mt-1">
                    Ritme Belajar Lebih Tenang dan Teratur
                  </h2>
                </div>
                {/* Editorial Testimonials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 lp-grid">
                  {/* Testimonial 1 */}
                  <div className="bg-surface-clean rounded-2xl lp-card shadow-sm flex flex-col justify-between">
                    <div className="flex flex-col gap-space-sm">
                      <div className="flex items-center text-primary-container">
                        <span className="material-symbols-outlined" style={{"fontVariationSettings": "'FILL' 1"}}>star</span>
                        <span className="material-symbols-outlined" style={{"fontVariationSettings": "'FILL' 1"}}>star</span>
                        <span className="material-symbols-outlined" style={{"fontVariationSettings": "'FILL' 1"}}>star</span>
                        <span className="material-symbols-outlined" style={{"fontVariationSettings": "'FILL' 1"}}>star</span>
                        <span className="material-symbols-outlined" style={{"fontVariationSettings": "'FILL' 1"}}>star</span>
                      </div>
                      <p className="font-body-md text-body-md text-on-surface italic">
                        “Dulu sebelum pakai GetDone, tiap minggu ujian selalu panik
                        karena ada saja tugas praktikum yang terlewat. Sekarang semua
                        tenggat punya visualisasi jelas di kalender, saya bisa tidur
                        nyenyak tiap malam.”
                      </p>
                    </div>
                    <div className="flex items-center gap-3 pt-space-md mt-space-sm">
                      <div className="w-11 h-11 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm shadow-sm">
                        AN
                      </div>
                      <div>
                        <p className="font-label-md text-label-md font-bold text-on-surface">
                          Anindya Nirmala
                        </p>
                        <p className="font-label-sm text-label-sm text-text-muted">
                          Teknik Informatika • Sem 6
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Testimonial 2 (Featured) */}
                  <div className="bg-surface-container rounded-2xl lp-card shadow-md flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary-fixed/30 rounded-bl-full pointer-events-none"></div>
                    <div className="flex flex-col gap-space-sm relative">
                      <div className="flex items-center text-primary-container">
                        <span className="material-symbols-outlined" style={{"fontVariationSettings": "'FILL' 1"}}>star</span>
                        <span className="material-symbols-outlined" style={{"fontVariationSettings": "'FILL' 1"}}>star</span>
                        <span className="material-symbols-outlined" style={{"fontVariationSettings": "'FILL' 1"}}>star</span>
                        <span className="material-symbols-outlined" style={{"fontVariationSettings": "'FILL' 1"}}>star</span>
                        <span className="material-symbols-outlined" style={{"fontVariationSettings": "'FILL' 1"}}>star</span>
                      </div>
                      <p className="font-body-md text-body-md text-on-surface italic">
                        “Fitur Pomodoro terintegrasinya luar biasa. Begitu timer 25
                        menit berjalan, saya terdorong menuntaskan bab skripsi tanpa
                        tergoda scrolling media sosial. IPK saya naik signifikan
                        semester lalu.”
                      </p>
                    </div>
                    <div className="flex items-center gap-3 pt-space-md mt-space-sm relative">
                      <div className="w-11 h-11 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-sm shadow-sm">
                        RF
                      </div>
                      <div>
                        <p className="font-label-md text-label-md font-bold text-on-surface">
                          Rian Farhan
                        </p>
                        <p className="font-label-sm text-label-sm text-text-muted">
                          Ilmu Komunikasi • Sem 8
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Testimonial 3 */}
                  <div className="bg-surface-clean rounded-2xl lp-card shadow-sm flex flex-col justify-between">
                    <div className="flex flex-col gap-space-sm">
                      <div className="flex items-center text-primary-container">
                        <span className="material-symbols-outlined" style={{"fontVariationSettings": "'FILL' 1"}}>star</span>
                        <span className="material-symbols-outlined" style={{"fontVariationSettings": "'FILL' 1"}}>star</span>
                        <span className="material-symbols-outlined" style={{"fontVariationSettings": "'FILL' 1"}}>star</span>
                        <span className="material-symbols-outlined" style={{"fontVariationSettings": "'FILL' 1"}}>star</span>
                        <span className="material-symbols-outlined" style={{"fontVariationSettings": "'FILL' 1"}}>star</span>
                      </div>
                      <p className="font-body-md text-body-md text-on-surface italic">
                        “Menyusun 22 SKS bersama kepengurusan BEM dulunya serasa mimpi
                        buruk. GetDone menyatukan bahan kuliah dosen dan jadwal rapat
                        secara rapi. Sangat melegakan pikiran.”
                      </p>
                    </div>
                    <div className="flex items-center gap-3 pt-space-md mt-space-sm">
                      <div className="w-11 h-11 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-sm shadow-sm">
                        SM
                      </div>
                      <div>
                        <p className="font-label-md text-label-md font-bold text-on-surface">
                          Siti Maulida
                        </p>
                        <p className="font-label-sm text-label-sm text-text-muted">
                          Kedokteran Hewan • Sem 4
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              {/* Banner Ajakan Bertindak (Call to Action) */}
              <section className="lp-section w-full max-w-7xl mx-auto px-margin">
                <div className="bg-inverse-surface dark:bg-surface-container-high text-surface-clean dark:text-on-surface rounded-3xl lp-panel shadow-2xl relative overflow-hidden">
                  {/* Subtle Decorative Radial Glow inside banner */}
                  <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-primary-container/30 blur-3xl pointer-events-none"></div>
                  <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-space-lg">
                    <div className="max-w-2xl flex flex-col gap-space-xs text-center lg:text-left">
                      <span className="font-label-sm text-label-sm text-primary-fixed dark:text-primary uppercase tracking-widest font-semibold">Tahun Ajaran Baru, Kendali Baru</span>
                      <h2 className="font-display-lg text-headline-lg md:text-display-lg font-bold text-surface-clean dark:text-on-surface leading-tight">
                        Waktunya Mengubah Stres Semester Menjadi Prestasi Terukur
                      </h2>
                      <p className="font-body-md text-body-md text-surface-variant/80 dark:text-on-surface-variant mt-1 max-w-xl">
                        Bergabunglah bersama ribuan mahasiswa lainnya yang telah
                        beralih ke cara belajar yang terstruktur, tenang, dan
                        berorientasi hasil. Tanpa biaya langganan untuk fitur dasar.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-space-sm shrink-0">
                      <Link className="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs bg-primary-container hover:bg-cta-hover text-on-primary font-label-lg text-label-lg font-semibold px-space-xl py-3.5 rounded-xl shadow-lg transition-all duration-200 hover:scale-[1.03]" data-path="register" to="/register">
                        <span>Daftar Akun Mahasiswa</span>
                        <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                      </Link>
                      <a className="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs bg-surface-clean/10 hover:bg-surface-clean/20 text-surface-clean dark:bg-surface-container-highest dark:hover:bg-surface-muted dark:text-on-surface font-label-lg text-label-lg font-semibold px-space-lg py-3.5 rounded-xl transition-colors" data-path="modul-akademik" href="#">
                        <span>Pelajari Modul</span>
                      </a>
                    </div>
                  </div>
                </div>
              </section>
              {/* Interactive Client-side Script for Timer Simulator */}
            </div>
          </main>
          <footer className="w-full bg-surface-container-low text-on-surface-variant pt-space-xl pb-space-lg">
            <div className="max-w-7xl mx-auto px-margin">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-gutter pb-space-xl">
                <div className="lg:col-span-2 flex flex-col gap-space-sm pr-space-lg">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-primary text-2xl">task_alt</span><span className="font-headline-sm text-headline-sm font-bold text-primary">GetDone</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-secondary max-w-sm">
                    Platform orkestrasi studi dan manajemen tugas tersinkronisasi
                    untuk mahasiswa tingkat tinggi dan peneliti akademik berorientasi
                    hasil.
                  </p>
                  <div className="flex items-center gap-space-sm pt-space-xs">
                    <span className="font-label-sm text-label-sm bg-surface-container-high text-tertiary px-space-sm py-space-xs rounded-lg font-medium">Akreditasi Kompatibel</span><span className="font-label-sm text-label-sm bg-surface-container-high text-tertiary px-space-sm py-space-xs rounded-lg font-medium">Standar Dikti</span>
                  </div>
                </div>
                <div className="flex flex-col gap-space-sm">
                  <h4 className="font-label-lg text-label-lg font-semibold text-on-surface">
                    Produktivitas
                  </h4>
                  <ul className="flex flex-col gap-space-xs">
                    <li className="font-body-sm text-body-sm hover:text-on-surface cursor-pointer">
                      Kanban Tugas Kuliah
                    </li>
                    <li className="font-body-sm text-body-sm hover:text-on-surface cursor-pointer">
                      Pomodoro Sesi Studi
                    </li>
                    <li className="font-body-sm text-body-sm hover:text-on-surface cursor-pointer">
                      Matriks Prioritas
                    </li>
                    <li className="font-body-sm text-body-sm hover:text-on-surface cursor-pointer">
                      Analisis Sks &amp; Beban
                    </li>
                  </ul>
                </div>
                <div className="flex flex-col gap-space-sm">
                  <h4 className="font-label-lg text-label-lg font-semibold text-on-surface">
                    Koneksi Kampus
                  </h4>
                  <ul className="flex flex-col gap-space-xs">
                    <li className="font-body-sm text-body-sm hover:text-on-surface cursor-pointer">
                      Integrasi LMS Moodle
                    </li>
                    <li className="font-body-sm text-body-sm hover:text-on-surface cursor-pointer">
                      Google Classroom Sync
                    </li>
                    <li className="font-body-sm text-body-sm hover:text-on-surface cursor-pointer">
                      Penyelarasan Kalender
                    </li>
                    <li className="font-body-sm text-body-sm hover:text-on-surface cursor-pointer">
                      Grup Belajar Peer-to-Peer
                    </li>
                  </ul>
                </div>
                <div className="flex flex-col gap-space-sm">
                  <h4 className="font-label-lg text-label-lg font-semibold text-on-surface">
                    Etika &amp; Privasi
                  </h4>
                  <ul className="flex flex-col gap-space-xs">
                    <li className="font-body-sm text-body-sm hover:text-on-surface cursor-pointer">
                      Kebijakan Data Mahasiswa
                    </li>
                    <li className="font-body-sm text-body-sm hover:text-on-surface cursor-pointer">
                      Integritas Riset
                    </li>
                    <li className="font-body-sm text-body-sm hover:text-on-surface cursor-pointer">
                      Dukungan Aksesibilitas
                    </li>
                    <li className="font-body-sm text-body-sm hover:text-on-surface cursor-pointer">
                      Bantuan &amp; Panduan
                    </li>
                  </ul>
                </div>
              </div>
              <div className="pt-space-md flex flex-col md:flex-row items-center justify-between gap-space-sm font-label-sm text-label-sm text-secondary">
                <p>
                  © 2025 GetDone Indonesia. Dirancang untuk kejelasan mental dan
                  keberhasilan akademik.
                </p>
                <div className="flex items-center gap-space-md">
                  <span>Privasi</span><span>Syarat Layanan</span><span>Protokol Keamanan</span>
                </div>
              </div>
            </div>
          </footer>
    
    
  
    </>
  );
}
