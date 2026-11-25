# GetDone Frontend (React + Vite)

Frontend Single Page Application (SPA) untuk **GetDone — Academic Clarity System**, dibangun menggunakan **React 18**, **Vite**, **Tailwind CSS**, dan **React Router v6**.

---

## Daftar Isi
- [Tech Stack](#tech-stack)
- [Prasyarat](#prasyarat)
- [Setup Awal & Menjalankan Aplikasi](#setup-awal--menjalankan-aplikasi)
- [Variabel Lingkungan](#variabel-lingkungan)
- [Fitur Utama](#fitur-utama)
- [Arsitektur & Struktur Direktori](#arsitektur--struktur-direktori)
- [Manajemen State & Sinkronisasi Data](#manajemen-state--sinkronisasi-data)

---

## Tech Stack
- **UI Library**: React `^18.3.1` (`react`, `react-dom`)
- **Routing**: React Router DOM `^6.28.0`
- **HTTP Client**: Axios `^1.7.9`
- **Styling**: Tailwind CSS `^3.4.17` + CSS Variables (`globals.css`, `dark.css`, `features.css`)
- **Build Tool**: Vite `^5.4.11` (`@vitejs/plugin-react`)

---

## Prasyarat
- **Node.js 18+** & **npm**
- Backend Laravel GetDone berjalan di `http://127.0.0.1:4000` (opsional jika ingin menjalankan dalam mode demo lokal tanpa backend)

---

## Setup Awal & Menjalankan Aplikasi

1. **Masuk ke direktori frontend**
   ```bash
   cd frontend
   ```

2. **Install dependensi**
   ```bash
   npm install
   ```

3. **Konfigurasi file `.env`**
   Salin `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```

4. **Jalankan mode pengembangan (Development Server)**
   ```bash
   npm run dev
   ```
   Aplikasi dapat diakses di `http://localhost:5173`.

5. **Build untuk produksi**
   ```bash
   npm run build
   ```
   Hasil build statis akan ditempatkan di folder `dist/`. Untuk meninjau hasil build:
   ```bash
   npm run preview
   ```

---

## Variabel Lingkungan

Dikonfigurasi di `frontend/.env`:

| Variabel | Default | Keterangan |
| :--- | :--- | :--- |
| `VITE_API_URL` | `http://127.0.0.1:4000/api` | URL base API backend Laravel. Kosongkan (`VITE_API_URL=`) jika ingin mencoba UI dalam mode demo lokal berbasis `localStorage` tanpa backend. |

---

## Fitur Utama
- **Landing Page & Auth**: Halaman pengenalan produk, login, dan registrasi mahasiswa (termasuk NIM, universitas, dan email institusi).
- **Onboarding Akademik**: Wizard pengaturan semester aktif, tahun masuk, dan mata kuliah awal.
- **Dashboard & Pusat Tugas**: Ringkasan progres mingguan, manajemen tugas dengan filter/status, serta modal tambah/edit tugas.
- **Mata Kuliah**: Manajemen daftar mata kuliah per semester beserta SKS, dosen pengampu, dan jadwal.
- **Analytics & Pomodoro Focus**:
  - Timer Pomodoro dengan mode *Fokus*, *Jeda*, *Istirahat Panjang*, dan *Mode Fokus Layar Penuh*.
  - Pemutar audio **Lo-fi YouTube** dengan dukungan **skip lagu (Next/Prev)** untuk link playlist.
  - **Persistent Mini-Player**: Otomatis muncul sebagai popup *draggable* di seluruh halaman (termasuk Landing Page) saat berpindah dari halaman Analytics tanpa memutus timer maupun audio.
  - **Always-on-Top Mini-Player (Document Picture-in-Picture)**: Jendela mengambang di atas aplikasi lain untuk browser berbasis Chromium.
- **Profil Mahasiswa**: Edit nama lengkap, NIM, universitas, ubah email (dengan konfirmasi password), upload foto profil, serta pemilih 6 avatar default.
- **Dark Mode & Light Mode**: Tersinkronisasi antara halaman Landing Page dan Dashboard tanpa *flash* saat reload (didukung inline script di `index.html`).

---

## Arsitektur & Struktur Direktori

```text
frontend/
├── public/
│   └── avatars/                  # Aset SVG avatar default mahasiswa
├── src/
│   ├── components/               # Komponen UI modular per domain
│   │   ├── analytics/            # PomodoroTimer.jsx, PomodoroMiniPlayer.jsx
│   │   ├── common/               # NavAuthActions.jsx, ThemeToggle.jsx
│   │   ├── courses/              # CourseCard.jsx, AddCourseModal.jsx
│   │   ├── dashboard/            # TaskRow.jsx
│   │   ├── onboarding/           # ProgressStepper.jsx
│   │   └── tasks/                # TaskCard.jsx, TaskTable.jsx, TaskModals.jsx, StatusSelect.jsx
│   ├── context/                  # Global React Contexts
│   │   ├── AuthContext.jsx       # State sesi login & helper updateSessionUser
│   │   ├── ThemeContext.jsx      # Sinkronisasi tema terang/gelap lintas halaman
│   │   └── PomodoroContext.jsx   # State global timer, YouTube player, & Document PiP
│   ├── hooks/                    # Custom hooks (useAuth, useTheme, useTasks, useCourses, dll.)
│   ├── layouts/
│   │   ├── AuthLayout.jsx        # Layout halaman publik (Landing, Login, Register, Onboarding)
│   │   └── DashboardLayout.jsx   # Layout internal (Sidebar collapsible + Header + Outlet)
│   ├── pages/                    # Komponen halaman utama per rute
│   ├── routes/
│   │   ├── AppRoutes.jsx         # Konfigurasi routing publik & terproteksi
│   │   └── ProtectedRoute.jsx    # Route guard untuk pengguna terautentikasi
│   ├── services/                 # Lapisan komunikasi API & penyimpanan lokal
│   │   ├── api.js                # Instance Axios + interceptor Bearer token
│   │   ├── authService.js        # Login, register, logout
│   │   ├── userService.js        # Update profil, ubah email, upload avatar
│   │   ├── courseService.js      # CRUD mata kuliah
│   │   ├── taskService.js        # CRUD tugas
│   │   ├── focusService.js       # Pengaturan Pomodoro & log sesi fokus
│   │   ├── remoteSync.js         # Hidrasi data server ke localStorage saat layout dimuat
│   │   ├── mappers.js            # Transformasi payload snake_case (API) <-> camelCase (UI)
│   │   └── storage.js            # Helper aman akses localStorage
│   ├── styles/                   # Token desain CSS, dark mode, animasi, dan styling fitur
│   ├── utils/                    # Konstanta rute/storage & formatter tanggal
│   ├── App.jsx                   # Root providers (Router, Theme, Auth, Pomodoro) & MiniPlayer
│   └── main.jsx                  # Entry point React
├── index.html                    # Entry HTML + anti-flash dark mode script
├── package.json
└── tailwind.config.js
```

---

## Manajemen State & Sinkronisasi Data

1. **Hierarki Provider (`App.jsx`)**:
   - `BrowserRouter` → `ThemeProvider` → `AuthProvider` → `PomodoroProvider` → `AppRoutes` + `PomodoroMiniPlayer`.
   - Penempatan `PomodoroMiniPlayer` di level root `App.jsx` memastikan timer dan `<iframe>` YouTube tidak pernah di-*unmount* ketika pengguna bernavigasi antara halaman Dashboard dan Landing Page.
2. **Offline-Friendly Caching & Optimistic Sync (`remoteSync.js` + `services/`)**:
   - Saat `DashboardLayout` dimuat dengan backend aktif (`API_ENABLED`), `hydrateFromServer()` menarik data terbaru dari API dan menyimpannya ke `localStorage`.
   - Perubahan data langsung memperbarui UI dan `localStorage` sambil mengirimkan sinkronisasi ke backend; jika terjadi kegagalan jaringan, event `getdone:sync-error` dipancarkan untuk menampilkan notifikasi non-blokir.
3. **Payload Mapping (`mappers.js`)**:
   - Memisahkan konvensi penamaan database/Laravel (`snake_case`) dari konvensi komponen React (`camelCase`).
