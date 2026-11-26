import { useState } from "react";
import { useEscapeKey } from "../../hooks/useEscapeKey.js";
import { missionToText } from "../../services/courseForm.js";

const FIELD = "w-full px-space-md py-2.5 bg-surface-container-low rounded-xl text-on-surface font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary-container/20 transition-all";
const LABEL = "font-label-md text-label-md font-semibold text-on-surface";
const HINT = "font-label-sm text-label-sm text-text-muted";
const EMPTY = { name: "", code: "", sks: "1", lecturer: "", day: "Senin", time: "", room: "", desc: "", vision: "", missionText: "" };

const formFromCourse = (c) => ({
  name: c.name || "", code: c.code || "", sks: String(c.sks || 1), lecturer: c.lecturer || "", day: c.day || "Senin",
  time: c.time || "", room: c.room || "", desc: c.desc || "", vision: c.vision || "", missionText: missionToText(c.mission),
});

/** Formulir mata kuliah: tambah (tanpa `initial`) atau edit (`initial` = mata kuliah yang diedit). */
export default function AddCourseModal({ onClose, onSubmit, initial }) {
  const editing = Boolean(initial);
  const [form, setForm] = useState(() => (initial ? formFromCourse(initial) : EMPTY));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEscapeKey(true, onClose);

  const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const message = await onSubmit(form);
      if (message) setError(message);
    } finally {
      setSaving(false);
    }
  };
  const sksOptions = [...new Set([1, 2, 3, 4, Number(form.sks)])].filter(Number.isFinite).sort((a, b) => a - b);
  const title = editing ? "Edit Mata Kuliah" : "Tambah Mata Kuliah Baru";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-sm p-4"
      id="add-course-modal" role="dialog" aria-modal="true" aria-labelledby="add-course-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface-clean rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="p-space-lg flex items-center justify-between border-b border-border-subtle/50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-[24px]">{editing ? "edit" : "school"}</span>
            <h3 id="add-course-title" className="font-headline-sm text-headline-sm font-bold text-on-surface">{title}</h3>
          </div>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-on-surface hover:bg-surface-container transition-colors" type="button" aria-label="Tutup" onClick={onClose}>
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <form className="p-space-lg flex flex-col gap-space-md overflow-y-auto" onSubmit={submit}>
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
                {sksOptions.map((n) => <option key={n} value={n}>{n} SKS</option>)}
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
          <div className="flex flex-col gap-1">
            <label className={LABEL} htmlFor="c-desc">Deskripsi <span className="font-normal text-text-muted">(opsional)</span></label>
            <textarea className={`${FIELD} resize-y`} id="c-desc" rows={3} maxLength={2000} placeholder="Gambaran singkat isi mata kuliah" value={form.desc} onChange={set("desc")} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={LABEL} htmlFor="c-vision">Visi <span className="font-normal text-text-muted">(opsional)</span></label>
            <textarea className={`${FIELD} resize-y`} id="c-vision" rows={2} maxLength={2000} placeholder="Satu paragraf visi mata kuliah" value={form.vision} onChange={set("vision")} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={LABEL} htmlFor="c-mission">Misi <span className="font-normal text-text-muted">(opsional)</span></label>
            <textarea className={`${FIELD} resize-y`} id="c-mission" rows={4} placeholder={"Satu baris = satu poin misi\nMaksimal 10 poin"} value={form.missionText} onChange={set("missionText")} />
            <span className={HINT}>Satu baris = satu poin. Baris kosong diabaikan.</span>
          </div>
          <p className="text-state-urgent font-label-md text-label-md" id="c-error" role="alert">{error}</p>
          <div className="flex items-center justify-end gap-space-sm pt-space-md border-t border-border-subtle/50 mt-space-xs">
            <button className="px-space-md py-2 rounded-xl text-on-surface font-label-md text-label-md hover:bg-surface-container transition-colors" type="button" onClick={onClose}>Batal</button>
            <button className="px-space-lg py-2 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md hover:bg-cta-hover transition-all shadow-sm disabled:opacity-60" type="submit" disabled={saving}>
              {editing ? "Simpan Perubahan" : "Simpan Mata Kuliah"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
