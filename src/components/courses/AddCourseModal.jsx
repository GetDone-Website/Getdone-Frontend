import { useState } from "react";
import { useEscapeKey } from "../../hooks/useEscapeKey.js";

const FIELD = "w-full px-space-md py-2.5 bg-surface-container-low rounded-xl text-on-surface font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary-container/20 transition-all";
const LABEL = "font-label-md text-label-md font-semibold text-on-surface";
const EMPTY = { name: "", code: "", sks: "1", lecturer: "", day: "Senin", time: "", room: "" };

export default function AddCourseModal({ onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  useEscapeKey(true, onClose);

  const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    const message = onSubmit(form);
    if (message) setError(message);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-sm p-4"
      id="add-course-modal" role="dialog" aria-modal="true" aria-labelledby="add-course-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface-clean rounded-xl shadow-xl max-w-lg w-full overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="p-space-lg flex items-center justify-between border-b border-border-subtle/50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-[24px]">school</span>
            <h3 id="add-course-title" className="font-headline-sm text-headline-sm font-bold text-on-surface">Tambah Mata Kuliah Baru</h3>
          </div>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-on-surface hover:bg-surface-container transition-colors" type="button" aria-label="Tutup" onClick={onClose}>
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <form className="p-space-lg flex flex-col gap-space-md" onSubmit={submit}>
          <div className="flex flex-col gap-1">
            <label className={LABEL} htmlFor="c-name">Nama Mata Kuliah</label>
            <input className={FIELD} id="c-name" maxLength={80} placeholder="Contoh: Pengolahan Citra Digital" required type="text" autoFocus value={form.name} onChange={set("name")} />
          </div>
          <div className="grid grid-cols-2 gap-space-md">
            <div className="flex flex-col gap-1">
              <label className={LABEL} htmlFor="c-code">Kode Mata Kuliah</label>
              <input className={FIELD} id="c-code" maxLength={10} placeholder="CS405" type="text" value={form.code} onChange={set("code")} />
            </div>
            <div className="flex flex-col gap-1">
              <label className={LABEL} htmlFor="c-sks">Beban SKS</label>
              <select className={FIELD} id="c-sks" value={form.sks} onChange={set("sks")}>
                {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n} SKS</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className={LABEL} htmlFor="c-lecturer">Dosen Pengampu</label>
            <input className={FIELD} id="c-lecturer" maxLength={80} placeholder="Gelar & Nama Lengkap Dosen" type="text" value={form.lecturer} onChange={set("lecturer")} />
          </div>
          <div className="grid grid-cols-2 gap-space-md">
            <div className="flex flex-col gap-1">
              <label className={LABEL} htmlFor="c-day">Hari Kuliah</label>
              <select className={FIELD} id="c-day" value={form.day} onChange={set("day")}>
                {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className={LABEL} htmlFor="c-time">Waktu Sesi</label>
              <input className={FIELD} id="c-time" maxLength={30} placeholder="08:00 - 10:30 WITA" type="text" value={form.time} onChange={set("time")} />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className={LABEL} htmlFor="c-room">Ruangan Kelas / Lab</label>
            <input className={FIELD} id="c-room" maxLength={60} placeholder="Contoh: R. Teori 301 / Zoom Meeting" type="text" value={form.room} onChange={set("room")} />
          </div>
          <p className="text-state-urgent font-label-md text-label-md" id="c-error" role="alert">{error}</p>
          <div className="flex items-center justify-end gap-space-sm pt-space-md border-t border-border-subtle/50 mt-space-xs">
            <button className="px-space-md py-2 rounded-xl text-on-surface font-label-md text-label-md hover:bg-surface-container transition-colors" type="button" onClick={onClose}>Batal</button>
            <button className="px-space-lg py-2 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md hover:bg-cta-hover transition-all shadow-sm" type="submit">Simpan Mata Kuliah</button>
          </div>
        </form>
      </div>
    </div>
  );
}
