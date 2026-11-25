export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  onboarding: "/onboarding",
  dashboard: "/dashboard",
  courses: "/courses",
  tasks: "/tasks",
  analytics: "/analytics",
  profile: "/profile",
};

// Kunci localStorage dipertahankan sama dengan versi HTML agar data demo lama tetap terbaca.
export const STORAGE_KEYS = {
  auth: "getdoneAuth",
  user: "getdoneUser",
  onboarding: "getdoneOnboarding",
  sidebarHidden: "getdoneSidebarHidden",
  courses: "getdone_courses_v1",
  tasks: "getdone_tasks_v1",
  focusSettings: "getdoneFocusSettings",
  focusSettingsHidden: "getdoneFocusSettingsHidden",
  theme: "getdoneTheme",
  token: "getdoneToken",
  focusSessions: "getdoneFocusSessions",
};

export const DEFAULT_USER_NAME = "Mahasiswa GetDone";

export const DEFAULT_AVATARS = [
  { id: "avatar-1", label: "Teal Klasik", url: "/avatars/avatar-1.svg" },
  { id: "avatar-2", label: "Hijau Akademik", url: "/avatars/avatar-2.svg" },
  { id: "avatar-3", label: "Kacamata Fokus", url: "/avatars/avatar-3.svg" },
  { id: "avatar-4", label: "Toga Wisuda", url: "/avatars/avatar-4.svg" },
  { id: "avatar-5", label: "Pastel Tenang", url: "/avatars/avatar-5.svg" },
  { id: "avatar-6", label: "Done Badge", url: "/avatars/avatar-6.svg" },
];
