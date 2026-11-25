// Data demo untuk DashboardPage (diambil dari markup dashboard.html). Akan diganti data dari GET /api/dashboard/summary.
export const INITIAL_TASKS = [
  {
    "id": 1,
    "course": "Pemrograman Web",
    "courseClass": "px-2 py-0.5 rounded-md bg-secondary-container text-on-secondary-fixed font-label-sm text-label-sm font-semibold",
    "priority": "Tinggi",
    "priorityClass": "px-2 py-0.5 rounded-md bg-error-container text-on-error-container font-label-sm text-label-sm font-bold flex items-center gap-0.5",
    "urgent": true,
    "title": "Integrasi RESTful API Express dengan Auth JWT",
    "description": "Implementasikan middleware verifikasi token dan hashing sandi bcrypt untuk endpoint otentikasi pengguna.",
    "deadline": "13:00 WIB (2 jam lagi)",
    "deadlineClass": "flex items-center gap-1 font-label-sm text-label-sm font-semibold text-state-urgent",
    "done": false
  },
  {
    "id": 2,
    "course": "Basis Data",
    "courseClass": "px-2 py-0.5 rounded-md bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm font-semibold",
    "priority": "Sedang",
    "priorityClass": "px-2 py-0.5 rounded-md bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold",
    "urgent": false,
    "title": "Laporan Praktikum Normalisasi Skema BCNF & 3NF",
    "description": "Kaji ketergantungan fungsional tabel transaksi ritel dan selesaikan anomalinya ke format PDF.",
    "deadline": "18:30 WIB",
    "deadlineClass": "flex items-center gap-1 font-label-sm text-label-sm font-medium text-text-muted",
    "done": false
  },
  {
    "id": 3,
    "course": "Rekayasa Perangkat Lunak",
    "courseClass": "px-2 py-0.5 rounded-md bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold",
    "priority": "Tinggi",
    "priorityClass": "px-2 py-0.5 rounded-md bg-error-container text-on-error-container font-label-sm text-label-sm font-bold flex items-center gap-0.5",
    "urgent": true,
    "title": "Finalisasi Diagram Sequence & Activity SRS",
    "description": "Sinkronisasi alur checkout aplikasi dan unggah ke repositori Git tim.",
    "deadline": "23:59 WIB",
    "deadlineClass": "flex items-center gap-1 font-label-sm text-label-sm font-semibold text-state-urgent",
    "done": false
  },
  {
    "id": 4,
    "course": "Kecerdasan Buatan",
    "courseClass": "px-2 py-0.5 rounded-md bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold",
    "priority": "Rendah",
    "priorityClass": "px-2 py-0.5 rounded-md bg-surface-muted text-text-muted font-label-sm text-label-sm font-semibold",
    "urgent": false,
    "title": "Resume Paper: Heuristic Search dalam Game State",
    "description": "Baca 12 halaman paper IEEE tentang algoritma A* dan Minimax dengan Alpha-Beta Pruning.",
    "deadline": "Besok, 09:00 WIB",
    "deadlineClass": "flex items-center gap-1 font-label-sm text-label-sm font-medium text-text-muted",
    "done": false
  }
];

export const COURSE_STYLES = {
  "Pemrograman Web": "px-2 py-0.5 rounded-md bg-secondary-container text-on-secondary-fixed font-label-sm text-label-sm font-semibold",
  "Basis Data": "px-2 py-0.5 rounded-md bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm font-semibold",
  "Rekayasa Perangkat Lunak": "px-2 py-0.5 rounded-md bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold",
  "Kecerdasan Buatan": "px-2 py-0.5 rounded-md bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold"
};

export const PRIORITY_STYLES = {
  "Tinggi": {
    "className": "px-2 py-0.5 rounded-md bg-error-container text-on-error-container font-label-sm text-label-sm font-bold flex items-center gap-0.5",
    "urgent": true
  },
  "Sedang": {
    "className": "px-2 py-0.5 rounded-md bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold",
    "urgent": false
  },
  "Rendah": {
    "className": "px-2 py-0.5 rounded-md bg-surface-muted text-text-muted font-label-sm text-label-sm font-semibold",
    "urgent": false
  }
};

export const DEFAULT_DEADLINE_CLASS = "flex items-center gap-1 font-label-sm text-label-sm font-medium text-text-muted";

export const INITIAL_COUNTS = { active: 12, completed: 28 };
