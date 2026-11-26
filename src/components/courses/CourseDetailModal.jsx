import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useEscapeKey } from "../../hooks/useEscapeKey.js";
import { taskMatchesCourse } from "../../services/academicData.js";
import { CONTRACT_ACCEPT, CONTRACT_MAX_BYTES, contractUploadAvailable, deleteContract, downloadContract, uploadContract } from "../../services/courseFileService.js";
import { STATUS, formatDeadline } from "../../services/taskService.js";

const SECTION_TITLE = "font-label-md text-label-md text-text-muted uppercase tracking-wider";
const EMPTY = <span className="text-text-muted italic">Belum diisi</span>;
const STATUS_STYLE = {
  todo: "bg-surface-container text-text-muted",
  in_progress: "bg-state-progress/15 text-state-progress",
  done: "bg-state-done/15 text-state-done",
};

const formatBytes = (bytes) => (bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

function sortTasks(list) {
  const active = list.filter((t) => t.status !== "done").sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  const done = list.filter((t) => t.status === "done").sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0));
  return [...active, ...done];
}

function ContractSection({ course, onContractChange }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const available = contractUploadAvailable(course.id);
  const contract = course.contract;

  const run = async (job) => {
    setBusy(true);
    setMessage("");
    try {
      await job();
    } catch (error) {
      setMessage(error.message || "Terjadi kesalahan.");
    } finally {
      setBusy(false);
    }
  };
  const pick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!/\.(pdf|docx?)$/i.test(file.name)) return setMessage("Format file harus PDF, DOC, atau DOCX.");
    if (file.size > CONTRACT_MAX_BYTES) return setMessage("Ukuran file maksimal 5 MB.");
    run(async () => onContractChange(await uploadContract(course.id, file)));
  };
  const remove = () => {
    if (!window.confirm("Hapus file kontrak kuliah ini?")) return;
    run(async () => {
      await deleteContract(course.id);
      onContractChange(null);
    });
  };
  const btn = "inline-flex items-center gap-1 px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <section aria-labelledby="detail-contract">
      <h3 id="detail-contract" className={SECTION_TITLE}>Kontrak Kuliah <span className="normal-case tracking-normal font-normal">(opsional)</span></h3>
      <div className="mt-space-sm p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-sm">
        {contract ? (
          <div className="flex flex-wrap items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm min-w-0">
              <span className="material-symbols-outlined text-primary-container text-[24px]">description</span>
              <div className="min-w-0">
                <div className="font-label-md text-label-md text-on-surface font-semibold truncate">{contract.name}</div>
                <div className="font-label-sm text-label-sm text-text-muted">{formatBytes(contract.size)}</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-space-xs">
              <button type="button" className={`${btn} bg-primary-container text-on-primary hover:bg-cta-hover`} disabled={busy || !available.ok} onClick={() => run(() => downloadContract(course.id, contract.name))}>
                <span className="material-symbols-outlined text-[16px]">download</span>Unduh
              </button>
              <button type="button" className={`${btn} bg-surface-container text-on-surface hover:bg-surface-container-high`} disabled={busy || !available.ok} onClick={() => inputRef.current?.click()}>
                <span className="material-symbols-outlined text-[16px]">swap_horiz</span>Ganti
              </button>
              <button type="button" className={`${btn} text-state-urgent hover:bg-error-container/30`} disabled={busy || !available.ok} onClick={remove}>
                <span className="material-symbols-outlined text-[16px]">delete</span>Hapus
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-space-sm">
            <span className="font-body-sm text-body-sm text-text-muted">Belum ada kontrak kuliah.</span>
            <button type="button" className={`${btn} bg-surface-container text-on-surface hover:bg-surface-container-high`} disabled={busy || !available.ok} onClick={() => inputRef.current?.click()}>
              <span className="material-symbols-outlined text-[16px]">upload_file</span>Unggah Kontrak
            </button>
          </div>
        )}
        <input ref={inputRef} type="file" accept={CONTRACT_ACCEPT} className="hidden" onChange={pick} aria-label="Pilih file kontrak kuliah" />
        {!available.ok && <p className="font-label-sm text-label-sm text-text-muted">{available.reason}</p>}
        {available.ok && !contract && <p className="font-label-sm text-label-sm text-text-muted">PDF, DOC, atau DOCX, maksimal 5 MB.</p>}
        {busy && <p className="font-label-sm text-label-sm text-text-muted" role="status">Memproses...</p>}
        {message && <p className="font-label-md text-label-md text-state-urgent" role="alert">{message}</p>}
      </div>
    </section>
  );
}

/** Detail mata kuliah: info dasar, deskripsi, visi, misi, kontrak (opsional), dan tugas terkait. */
export default function CourseDetailModal({ course, tasks, courses, onClose, onEdit, onContractChange }) {
  useEscapeKey(true, onClose);
  const linked = useMemo(() => sortTasks(tasks.filter((t) => taskMatchesCourse(t.course, course.id, courses))), [tasks, course.id, courses]);
  const activeCount = linked.filter((t) => t.status !== "done").length;
  const progress = linked.length ? Math.round(((linked.length - activeCount) / linked.length) * 100) : 0;
  const mission = Array.isArray(course.mission) ? course.mission : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-sm p-4"
      id="course-detail-modal" role="dialog" aria-modal="true" aria-labelledby="course-detail-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface-clean rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-space-lg flex items-start justify-between gap-space-md border-b border-border-subtle/50">
          <div className="min-w-0">
            <div className="flex items-center gap-space-xs mb-space-xs">
              <span className="px-2.5 py-1 rounded-full bg-primary-fixed/40 text-on-primary-fixed-variant font-label-sm text-label-sm font-semibold">{course.code}</span>
              <span className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">{course.sks} SKS</span>
            </div>
            <h2 id="course-detail-title" className="font-headline-sm text-headline-sm text-on-surface font-bold leading-snug">{course.name}</h2>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <button type="button" className="inline-flex items-center gap-1 px-space-md py-1.5 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors" onClick={onEdit}>
              <span className="material-symbols-outlined text-[16px]">edit</span>Edit
            </button>
            <button type="button" className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-on-surface hover:bg-surface-container transition-colors" aria-label="Tutup" onClick={onClose}>
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        <div className="p-space-lg flex flex-col gap-space-lg overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
            {[
              { icon: "person", label: "Dosen Pengampu", value: course.lecturer },
              { icon: "schedule", label: "Hari & Jam", value: `${course.day}, ${course.time}` },
              { icon: "room", label: "Ruangan", value: course.room || "-" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-2 p-space-sm rounded-xl bg-surface-container-low">
                <span className="material-symbols-outlined text-[18px] text-text-muted mt-0.5">{item.icon}</span>
                <div className="min-w-0">
                  <div className="font-label-sm text-label-sm text-text-muted">{item.label}</div>
                  <div className="font-label-md text-label-md text-on-surface font-semibold break-words">{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          <section aria-labelledby="detail-desc">
            <h3 id="detail-desc" className={SECTION_TITLE}>Deskripsi</h3>
            <p className="mt-space-xs font-body-md text-body-md text-on-surface whitespace-pre-line">{course.desc ? course.desc : EMPTY}</p>
          </section>
          <section aria-labelledby="detail-vision">
            <h3 id="detail-vision" className={SECTION_TITLE}>Visi</h3>
            <p className="mt-space-xs font-body-md text-body-md text-on-surface whitespace-pre-line">{course.vision ? course.vision : EMPTY}</p>
          </section>
          <section aria-labelledby="detail-mission">
            <h3 id="detail-mission" className={SECTION_TITLE}>Misi</h3>
            {mission.length ? (
              <ol className="mt-space-xs list-decimal pl-5 flex flex-col gap-1 font-body-md text-body-md text-on-surface">
                {mission.map((item, i) => <li key={i}>{item}</li>)}
              </ol>
            ) : <p className="mt-space-xs font-body-md text-body-md">{EMPTY}</p>}
          </section>

          <ContractSection course={course} onContractChange={onContractChange} />

          <section aria-labelledby="detail-tasks">
            <div className="flex items-center justify-between gap-space-sm">
              <h3 id="detail-tasks" className={SECTION_TITLE}>Tugas Terkait</h3>
              {linked.length > 0 && <span className="font-label-sm text-label-sm text-text-muted">{activeCount} aktif · progres {progress}%</span>}
            </div>
            {linked.length === 0 ? (
              <p className="mt-space-sm p-space-md rounded-xl bg-surface-container-low font-body-sm text-body-sm text-text-muted">Belum ada tugas untuk mata kuliah ini.</p>
            ) : (
              <ul className="mt-space-sm flex flex-col gap-space-xs">
                {linked.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-space-sm p-space-sm rounded-xl bg-surface-container-low">
                    <div className="min-w-0">
                      <div className={`font-label-md text-label-md font-semibold truncate ${t.status === "done" ? "text-text-muted line-through" : "text-on-surface"}`}>{t.title}</div>
                      <div className="font-label-sm text-label-sm text-text-muted">{t.deadline ? formatDeadline(t.deadline) : "Tanpa tenggat"}</div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold whitespace-nowrap ${STATUS_STYLE[t.status] || STATUS_STYLE.todo}`}>{STATUS[t.status] || t.status}</span>
                  </li>
                ))}
              </ul>
            )}
            <Link className="mt-space-sm inline-flex items-center justify-center gap-space-xs w-full py-2 px-space-md rounded-xl bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors" to={`/tasks?course=${encodeURIComponent(course.id)}`}>
              <span>Buka di Pusat Tugas</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
