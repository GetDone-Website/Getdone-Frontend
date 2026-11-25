# GetDone Frontend (React + Vite)

Versi integrasi Laravel 12 + Supabase PostgreSQL. **Lihat `../README_GETDONE_INTEGRASI.md` di root ZIP sebelum menjalankan aplikasi.**

## Mulai (setelah Laravel + Supabase dikonfigurasi)

```powershell
Copy-Item .env.example .env
npm ci
npm run dev -- --host 127.0.0.1
```

- Frontend: http://127.0.0.1:5173
- Backend: http://127.0.0.1:4000/api
- Dalam mode API, sesi harus memiliki token Laravel Sanctum; data halaman Dashboard, Tasks, Courses, Profile, Analytics dan Pomodoro berasal dari akun tersinkron ke backend.
- `VITE_API_URL` default ke backend lokal. Mengosongkannya dalam `.env` hanya untuk demo offline, bukan produksi.
- Google OAuth dan reset password belum diimplementasikan.

## File integrasi

- `src/services/api.js` — Axios / Bearer token.
- `src/services/authService.js` — login, register, logout, dan cache isolation.
- `src/services/remoteSync.js` — hydrate server -> localStorage dan write-through asynchronous.
- `src/services/mappers.js` — pemetaan kolom React ↔ Laravel.
- `src/services/{courseService,taskService,onboardingService,focusService}.js` — layanan data.
- `src/pages/{DashboardPage,AnalyticsPage}.jsx` — sekarang memakai data nyata, bukan mock.

Status sinkronisasi **tidak otomatis menjamin** server menerima setiap perubahan saat koneksi putus. Lihat notifikasi kesalahan sinkronisasi dan periksa endpoint sebelum mengandalkan data.
