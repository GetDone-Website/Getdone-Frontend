import { useEffect, useState } from "react";
import { useAnimatedPresence } from "../../hooks/useAnimatedPresence.js";
import { useEscapeKey } from "../../hooks/useEscapeKey.js";
import { PRIORITY, STATUS, STATUS_KEYS } from "../../services/taskService.js";

const BACKDROP = "fixed inset-0 bg-[#212F45]/45 backdrop-blur-[4px] z-50 transition-opacity duration-200 items-center justify-center p-gutter";
const PANEL = "bg-surface-clean w-full max-w-lg rounded-xl shadow-2xl p-space-xl flex flex-col gap-space-lg transform transition-transform duration-200";
const LABEL = "font-label-md text-label-md text-tertiary";
const INPUT = "w-full bg-surface-clean px-space-md py-space-sm rounded-xl text-tertiary text-body-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-container";

/** Pembungkus modal dengan animasi masuk/keluar yang sama dengan versi HTML. */
function ModalShell({ open, onClose, id, containerId, title, children }) {
  const { mounted, shown } = useAnimatedPresence(open);
  useEscapeKey(open, onClose);
  if (!mounted) return null;
  return (
    <div
      className={`${BACKDROP} flex ${shown ? "opacity-100" : "opacity-0"}`} id={id}
      role="dialog" aria-modal="true" aria-label={title}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`${PANEL} ${shown ? "scale-100" : "scale-95"}`} id={containerId}>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider">Pusat Tugas</span>
            <h3 className="font-headline-sm text-headline-sm text-tertiary">{title}</h3>
          </div>
          <button className="text-text-muted hover:text-state-urgent p-space-xs rounded-lg transition-colors" type="button" aria-label="Tutup" onClick={onClose}>
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const emptyForm = (course) => ({ title: "", course, priority: "high", date: "", time: "23:59" });

export function CreateTaskModal({ open, onClose, onCreate, courseOptions, defaultCourse }) {
  const [form, setForm] = useState(() => emptyForm(defaultCourse));
  const [error, setError] = useState("");
  const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  // Pesan error lama dihapus setiap modal dibuka.
  useEffect(() => {
    if (open) setError("");
  }, [open]);

  const close = onClose;
  const submit = (e) => {
    e.preventDefault();
    const title = form.title.trim();
    const time = form.time || "23:59";
    if (title.length < 3) return setError("Judul tugas minimal 3 karakter.");
    if (!courseOptions.some((o) => o.value === form.course) || !PRIORITY[form.priority]) return setError("Mata kuliah atau prioritas tidak valid.");
    if (!form.date) return setError("Batas waktu wajib diisi.");
    const deadline = `${form.date}T${time}`;
    if (new Date(deadline) < new Date()) return setError("Batas waktu tidak boleh di masa lalu.");
    onCreate({ id: String(Date.now()), title, course: form.course, priority: form.priority, deadline, desc: "", status: "todo" });
    setForm(emptyForm(courseOptions[0]?.value ?? ""));
    setError("");
  };

  return (
    <ModalShell open={open} onClose={close} id="modal-backdrop" containerId="modal-container" title="Tambah Tugas Akademik">
      <form className="flex flex-col gap-space-md" id="create-task-form" onSubmit={submit}>
        <div className="flex flex-col gap-space-xs">
          <label className={LABEL} htmlFor="f-title">Judul Tugas</label>
          <input className={`${INPUT} placeholder-text-muted`} id="f-title" maxLength={120} placeholder="Contoh: Analisis Kebutuhan Sistem E-Commerce" required type="text" autoFocus value={form.title} onChange={set("title")} />
        </div>
        <div className="grid grid-cols-2 gap-space-md">
          <div className="flex flex-col gap-space-xs">
            <label className={LABEL} htmlFor="f-matkul">Mata Kuliah</label>
            <select className={INPUT} id="f-matkul" value={form.course} onChange={set("course")}>
              {courseOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-space-xs">
            <label className={LABEL} htmlFor="f-priority">Prioritas</label>
            <select className={INPUT} id="f-priority" value={form.priority} onChange={set("priority")}>
              <option value="high">High (Mendesak)</option>
              <option value="medium">Medium (Moderat)</option>
              <option value="low">Low (Santai)</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-space-md">
          <div className="flex flex-col gap-space-xs">
            <label className={LABEL} htmlFor="f-date">Batas Waktu (Deadline)</label>
            <input className={INPUT} id="f-date" required type="date" value={form.date} onChange={set("date")} />
          </div>
          <div className="flex flex-col gap-space-xs">
            <label className={LABEL} htmlFor="f-time">Jam</label>
            <input className={INPUT} id="f-time" type="time" value={form.time} onChange={set("time")} />
          </div>
        </div>
        <p className="text-state-urgent font-label-md text-label-md" id="f-error" role="alert">{error}</p>
        <div className="flex items-center justify-end gap-space-md pt-space-sm">
          <button className="px-space-md py-space-sm rounded-xl font-label-lg text-label-lg text-tertiary hover:bg-surface-muted transition-colors" type="button" onClick={close}>Batal</button>
          <button className="bg-primary-container hover:bg-cta-hover text-on-primary font-label-lg text-label-lg px-space-lg py-space-sm rounded-xl shadow-sm transition-all duration-150 flex items-center gap-space-xs" type="submit">
            <span className="material-symbols-outlined text-[18px]">add_task</span>
            Simpan Tugas
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

/** `task` = tugas yang sedang diedit, atau null bila modal tertutup. */
export function EditTaskModal({ task, courseName, onClose, onSave }) {
  // Simpan salinan terakhir supaya isi tidak hilang saat animasi keluar berjalan.
  const [last, setLast] = useState(task);
  if (task && task !== last) setLast(task);
  const current = task || last;
  return (
    <ModalShell open={Boolean(task)} onClose={onClose} id="edit-backdrop" containerId="edit-container" title="Edit Tugas">
      {current && <EditForm key={current.id} task={current} courseName={courseName} onClose={onClose} onSave={onSave} />}
    </ModalShell>
  );
}

function EditForm({ task, courseName, onClose, onSave }) {
  const [desc, setDesc] = useState(task.desc || "");
  const [status, setStatus] = useState(task.status);
  const [error, setError] = useState("");
  const disabledInput = `${INPUT} placeholder-text-muted opacity-60 cursor-not-allowed`;

  const submit = (e) => {
    e.preventDefault();
    if (!STATUS_KEYS.includes(status)) return setError("Perubahan status tidak diizinkan.");
    // Judul & mata kuliah tidak diubah.
    onSave(task.id, { desc: desc.trim().slice(0, 500), status });
  };

  return (
    <form className="flex flex-col gap-space-md" id="edit-form" noValidate onSubmit={submit}>
      <div className="flex flex-col gap-space-xs">
        <label className={LABEL} htmlFor="e-title">Judul Tugas (tidak dapat diubah)</label>
        <input className={disabledInput} disabled id="e-title" type="text" value={task.title} readOnly />
      </div>
      <div className="flex flex-col gap-space-xs">
        <label className={LABEL} htmlFor="e-matkul">Mata Kuliah (tidak dapat diubah)</label>
        <input className={disabledInput} disabled id="e-matkul" type="text" value={courseName} readOnly />
      </div>
      <div className="flex flex-col gap-space-xs">
        <label className={LABEL} htmlFor="e-desc">Deskripsi</label>
        <textarea className={`${INPUT} placeholder-text-muted`} id="e-desc" maxLength={500} placeholder="Tambahkan catatan atau detail tugas..." rows={3} value={desc} onChange={(e) => setDesc(e.target.value)}></textarea>
      </div>
      <div className="flex flex-col gap-space-xs">
        <label className={LABEL} htmlFor="e-status">Status</label>
        <select className={INPUT} id="e-status" value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_KEYS.map((key) => <option key={key} value={key}>{STATUS[key]}</option>)}
        </select>
      </div>
      <p className="text-text-muted font-label-sm text-label-sm" id="e-hint">Status dapat diperbarui langsung melalui pilihan status pada kartu atau tabel.</p>
      <p className="text-state-urgent font-label-md text-label-md" id="e-error" role="alert">{error}</p>
      <div className="flex items-center justify-end gap-space-md pt-space-sm">
        <button className="px-space-md py-space-sm rounded-xl font-label-lg text-label-lg text-tertiary hover:bg-surface-muted transition-colors" type="button" onClick={onClose}>Batal</button>
        <button className="bg-primary-container hover:bg-cta-hover text-on-primary font-label-lg text-label-lg px-space-lg py-space-sm rounded-xl shadow-sm transition-all duration-150 flex items-center gap-space-xs" type="submit">
          <span className="material-symbols-outlined text-[18px]">save</span>
          Simpan Perubahan
        </button>
      </div>
    </form>
  );
}
