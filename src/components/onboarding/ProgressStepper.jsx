const STEPS = [
  { label: "Tahun Masuk", icon: "calendar_month" },
  { label: "Target SKS", icon: "tune" },
  { label: "Tanggungan", icon: "assignment_late" },
  { label: "Mata Kuliah", icon: "menu_book" },
];
const FILL = ["0%", "33.333%", "66.666%", "100%"];

/** Indikator 4 langkah. Warna aktif/selesai diatur CSS (.gd-progress-active / .gd-progress-complete di features.css). */
export default function ProgressStepper({ step }) {
  return (
    <div className="w-full max-w-2xl bg-surface-clean rounded-2xl shadow-sm px-6 py-4">
      <div className="relative flex items-center justify-between">
        <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-1 bg-surface-muted -z-0">
          <div className="h-full bg-primary-container transition-all duration-500" style={{ width: FILL[step - 1] }}></div>
        </div>
        {STEPS.map((item, index) => {
          const number = index + 1;
          const active = number === step;
          const complete = number < step;
          const cls = ["relative z-10 flex flex-col items-center gap-2 gd-progress-node"];
          if (active) cls.push("gd-progress-active");
          if (complete) cls.push("gd-progress-complete");
          if (number > step) cls.push("opacity-60");
          return (
            <div key={item.label} className={cls.join(" ")} aria-current={active ? "step" : "false"}>
              <div className="w-10 h-10 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-body-lg">{item.icon}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-label-md text-label-md text-text-muted gd-progress-step-label">Langkah {number}</span>
                <span className="font-body-sm text-body-sm text-text-muted hidden sm:inline">{item.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
