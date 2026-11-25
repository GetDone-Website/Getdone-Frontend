/** "Senin, 24 Oktober 2024" */
export function formatLongDate(date = new Date()) {
  return new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date);
}

/** Nama ringkas untuk header: dua kata pertama dari nama lengkap. */
export function shortName(fullName = "") {
  return fullName.trim().split(/\s+/).slice(0, 2).join(" ");
}
