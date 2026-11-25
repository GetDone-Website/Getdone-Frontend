import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { changeEmail, loadProfile, saveProfile, uploadProfileAvatar } from "../services/userService.js";
import { DEFAULT_AVATARS, ROUTES } from "../utils/constants.js";

const dateFmt = (value, opts) => new Date(value).toLocaleDateString("id-ID", opts);

function Info({ label, value, id }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd id={id}>{value}</dd>
    </div>
  );
}

export default function ProfilePage() {
  usePageMeta({
    title: "Profil Mahasiswa | GetDone",
    bodyClass: "bg-background font-body-md text-body-md text-on-surface antialiased min-h-screen",
  });

  const { updateSessionUser } = useAuth();
  const [p, setP] = useState(() => loadProfile());
  const fileInputRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName: p.fullName, nim: p.nim, university: p.university });
  const [savingProfile, setSavingProfile] = useState(false);

  const [emailModal, setEmailModal] = useState(false);
  const [emailForm, setEmailForm] = useState({ email: p.email, currentPassword: "" });
  const [savingEmail, setSavingEmail] = useState(false);

  const [savingAvatar, setSavingAvatar] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  const refreshProfile = (updatedApiUser) => {
    if (updatedApiUser) updateSessionUser(updatedApiUser);
    const next = loadProfile();
    setP(next);
    setForm({ fullName: next.fullName, nim: next.nim, university: next.university });
    setEmailForm((prev) => ({ ...prev, email: next.email }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (savingProfile) return;
    setSavingProfile(true);
    setFeedback({ type: "", text: "" });
    try {
      const updated = await saveProfile({
        fullName: form.fullName,
        nim: form.nim,
        university: form.university,
      });
      refreshProfile(updated);
      setEditing(false);
      setFeedback({ type: "success", text: "Data diri berhasil diperbarui." });
    } catch (error) {
      setFeedback({ type: "error", text: error.message });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSelectAvatar = async (url) => {
    if (savingAvatar) return;
    setSavingAvatar(true);
    setFeedback({ type: "", text: "" });
    try {
      const updated = await saveProfile({
        fullName: p.fullName,
        nim: p.nim,
        university: p.university,
        avatarUrl: url,
      });
      refreshProfile(updated);
      setFeedback({ type: "success", text: url ? "Foto profil berhasil diperbarui." : "Foto profil dikembalikan ke inisial." });
    } catch (error) {
      setFeedback({ type: "error", text: error.message });
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleUploadAvatar = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || savingAvatar) return;
    setSavingAvatar(true);
    setFeedback({ type: "", text: "" });
    try {
      const updated = await uploadProfileAvatar(file);
      refreshProfile(updated);
      setFeedback({ type: "success", text: "Foto profil berhasil diunggah." });
    } catch (error) {
      setFeedback({ type: "error", text: error.message });
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    if (savingEmail) return;
    setSavingEmail(true);
    setFeedback({ type: "", text: "" });
    try {
      const updated = await changeEmail({
        email: emailForm.email,
        currentPassword: emailForm.currentPassword,
      });
      refreshProfile(updated);
      setEmailModal(false);
      setEmailForm((prev) => ({ ...prev, currentPassword: "" }));
      setFeedback({ type: "success", text: "Email akun berhasil diperbarui." });
    } catch (error) {
      setFeedback({ type: "error", text: error.message });
    } finally {
      setSavingEmail(false);
    }
  };

  return (
    <main className="relative w-full pt-16 bg-background px-margin py-gutter min-h-screen">
      <div className="gd-profile-content">
        <div className="gd-profile-heading">
          <div>
            <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-primary uppercase tracking-widest font-semibold">
              <span className="inline-block w-2 h-2 rounded-full bg-primary-container"></span>Area Personal
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-space-xs">Profil Mahasiswa</h1>
            <p className="font-body-md text-body-md text-text-muted mt-space-xs">Kelola ringkasan akun, foto profil, data diri, dan riwayat semester dalam satu tempat.</p>
          </div>
          <Link to={ROUTES.onboarding} className="inline-flex items-center gap-space-xs px-space-md py-space-sm rounded-xl bg-primary-container text-on-primary font-label-md text-label-md hover:bg-cta-hover transition-colors">
            <span className="material-symbols-outlined text-[18px]">edit_note</span>Ubah Rencana Akademik
          </Link>
        </div>

        {feedback.text && (
          <div
            role="status"
            className={`p-3.5 rounded-xl font-label-md text-label-md flex items-center justify-between gap-3 ${
              feedback.type === "error"
                ? "bg-error-container text-on-error-container"
                : "bg-surface-container-high text-state-done border border-state-done/30"
            }`}
          >
            <span>{feedback.text}</span>
            <button type="button" className="underline text-xs" onClick={() => setFeedback({ type: "", text: "" })}>Tutup</button>
          </div>
        )}

        <section className="gd-profile-metrics" aria-label="Ringkasan akademik">
          <div className="gd-profile-metric">
            <span>SKS Semester Berjalan</span><strong id="profile-total-sks">{p.currentSks} SKS</strong>
            <p className="gd-profile-note" id="profile-target-sks">{p.targetSks ? `Target semester: ${p.targetSks} SKS` : "Target SKS belum diatur"}</p>
          </div>
          <div className="gd-profile-metric">
            <span>Mata Kuliah Semester Ini</span><strong id="profile-course-count">{p.currentCourseCount}</strong>
            <p className="gd-profile-note" id="profile-course-detail">{p.failedCount} mata kuliah berstatus tidak lulus di catatan riwayat</p>
          </div>
          <div className="gd-profile-metric">
            <span>Tugas Selesai</span><strong id="profile-done-tasks">{p.completedTasks.length}</strong>
            <p className="gd-profile-note" id="profile-task-detail">{p.taskCount} tugas tercatat seluruh status</p>
          </div>
        </section>

        <div className="gd-profile-grid">
          <section className="gd-profile-panel" aria-labelledby="profile-account-heading">
            <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
              <h2 id="profile-account-heading" className="!mb-0">Informasi Akun &amp; Data Diri</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setEditing((v) => !v); setFeedback({ type: "", text: "" }); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-muted text-on-surface font-label-md text-label-md transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">{editing ? "close" : "edit"}</span>
                  {editing ? "Batal" : "Edit Data"}
                </button>
                <button
                  type="button"
                  onClick={() => { setEmailModal((v) => !v); setFeedback({ type: "", text: "" }); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-muted text-primary font-label-md text-label-md transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">mail</span>
                  Ubah Email
                </button>
              </div>
            </div>

            <div className="gd-profile-avatar">
              {p.avatarUrl ? (
                <img src={p.avatarUrl} alt={p.fullName} className="w-16 h-16 rounded-2xl object-cover shadow-sm shrink-0" />
              ) : (
                <div id="profile-avatar-mark" className="gd-profile-avatar-mark">{p.initials}</div>
              )}
              <div className="min-w-0 flex-1">
                <strong id="profile-full-name" className="font-headline-sm text-headline-sm block truncate">{p.fullName}</strong>
                <p id="profile-account-role">Mahasiswa GetDone</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleUploadAvatar}
                  />
                  <button
                    type="button"
                    disabled={savingAvatar}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-container hover:bg-cta-hover disabled:opacity-60 text-on-primary font-label-sm text-label-sm transition-colors"
                  >
                    <span className="material-symbols-outlined text-[15px]">upload</span>
                    {savingAvatar ? "Menyimpan..." : "Upload Foto"}
                  </button>
                  {p.avatarUrl && (
                    <button
                      type="button"
                      disabled={savingAvatar}
                      onClick={() => handleSelectAvatar("")}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-surface-muted text-text-muted font-label-sm text-label-sm transition-colors"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-3 mb-4">
              <span className="block font-label-sm text-label-sm text-text-muted mb-2">Atau pilih foto profil default:</span>
              <div className="flex flex-wrap items-center gap-2.5">
                {DEFAULT_AVATARS.map((av) => {
                  const selected = p.avatarUrl === av.url;
                  return (
                    <button
                      key={av.id}
                      type="button"
                      disabled={savingAvatar}
                      title={av.label}
                      onClick={() => handleSelectAvatar(av.url)}
                      className={`w-10 h-10 rounded-full overflow-hidden transition-all ${
                        selected ? "ring-2 ring-primary-container ring-offset-2 ring-offset-surface scale-105" : "opacity-80 hover:opacity-100"
                      }`}
                    >
                      <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            </div>

            {emailModal && (
              <form onSubmit={handleChangeEmail} className="mb-4 p-4 rounded-xl bg-surface-container space-y-3 border border-border-subtle">
                <div className="font-label-md text-label-md text-on-surface font-semibold">Konfirmasi Perubahan Email</div>
                <p className="font-body-sm text-body-sm text-text-muted">Masukkan email baru serta kata sandi akun Anda saat ini untuk verifikasi.</p>
                <div className="space-y-1">
                  <label className="block font-label-sm text-label-sm text-on-surface" htmlFor="edit-email-new">Email Baru</label>
                  <input
                    id="edit-email-new"
                    type="email"
                    required
                    value={emailForm.email}
                    onChange={(e) => setEmailForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-label-sm text-label-sm text-on-surface" htmlFor="edit-email-password">Kata Sandi Saat Ini</label>
                  <input
                    id="edit-email-password"
                    type="password"
                    required
                    placeholder="Masukkan kata sandi Anda"
                    value={emailForm.currentPassword}
                    onChange={(e) => setEmailForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button type="submit" disabled={savingEmail} className="px-4 py-2 rounded-lg bg-primary-container hover:bg-cta-hover disabled:opacity-60 text-on-primary font-label-md text-label-md">
                    {savingEmail ? "Menyimpan..." : "Simpan Email"}
                  </button>
                  <button type="button" onClick={() => setEmailModal(false)} className="px-3 py-2 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md">
                    Batal
                  </button>
                </div>
              </form>
            )}

            {editing ? (
              <form onSubmit={handleSaveProfile} className="space-y-3 mt-2">
                <div className="space-y-1">
                  <label className="block font-label-sm text-label-sm text-on-surface" htmlFor="edit-fullname">Nama Lengkap</label>
                  <input
                    id="edit-fullname"
                    type="text"
                    required
                    minLength={2}
                    maxLength={160}
                    value={form.fullName}
                    onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-label-sm text-label-sm text-on-surface" htmlFor="edit-nim">NIM</label>
                  <input
                    id="edit-nim"
                    type="text"
                    minLength={4}
                    maxLength={32}
                    placeholder="Contoh: 2505551009"
                    value={form.nim}
                    onChange={(e) => setForm((prev) => ({ ...prev, nim: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-label-sm text-label-sm text-on-surface" htmlFor="edit-university">Perguruan Tinggi / Universitas</label>
                  <input
                    id="edit-university"
                    type="text"
                    maxLength={200}
                    placeholder="Contoh: Universitas Udayana"
                    value={form.university}
                    onChange={(e) => setForm((prev) => ({ ...prev, university: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-container-lowest text-on-surface font-body-md text-body-md border border-border-subtle focus:outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button type="submit" disabled={savingProfile} className="px-4 py-2.5 rounded-xl bg-primary-container hover:bg-cta-hover disabled:opacity-60 text-on-primary font-label-md text-label-md font-semibold">
                    {savingProfile ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                  <button type="button" onClick={() => setEditing(false)} className="px-4 py-2.5 rounded-xl bg-surface-container-high text-on-surface font-label-md text-label-md">
                    Batal
                  </button>
                </div>
              </form>
            ) : (
              <dl className="gd-profile-info">
                <Info id="profile-info-name" label="Nama lengkap" value={p.fullName} />
                <Info id="profile-info-nim" label="NIM" value={p.nim || "Belum diisi"} />
                <Info id="profile-info-email" label="Email" value={p.email} />
                <Info id="profile-info-university" label="Universitas" value={p.university || "Belum diisi"} />
                <Info id="profile-info-entry-year" label="Tahun masuk" value={p.entryYear ? String(p.entryYear) : "Belum diatur"} />
                <Info id="profile-info-semester" label="Semester aktif" value={p.activeSemester ? p.activeSemesterLabel : "Belum diatur"} />
                <Info id="profile-info-created" label="Akun dibuat" value={p.createdAt ? dateFmt(p.createdAt, { day: "numeric", month: "long", year: "numeric" }) : "Tidak tersedia"} />
              </dl>
            )}
          </section>

          <section className="gd-profile-panel" aria-labelledby="profile-academic-heading">
            <h2 id="profile-academic-heading">Ringkasan Akademik</h2>
            <dl className="gd-profile-info">
              <Info id="profile-total-sks-all" label="Total SKS seluruh catatan" value={`${p.allSks} SKS`} />
              <Info id="profile-failed-courses" label="Mata kuliah tanggungan" value={`${p.failedCount} mata kuliah`} />
              <Info id="profile-target-sks-detail" label="Target SKS semester ini" value={p.targetSks ? `${p.targetSks} SKS` : "Belum diatur"} />
              <Info id="profile-planned-sks" label="Rencana SKS terpakai" value={`${p.plannedSks} SKS`} />
            </dl>
            <p className="gd-profile-note mt-space-md">Ringkasan dihitung dari data lokal demo. Data ini belum diverifikasi oleh sistem akademik kampus.</p>
          </section>
        </div>

        <section className="gd-profile-panel" aria-labelledby="profile-history-heading">
          <div className="flex items-start justify-between gap-space-md flex-wrap mb-space-md">
            <div>
              <h2 id="profile-history-heading">Riwayat Semester</h2>
              <p className="gd-profile-note">Dari semester pertama sampai semester aktif yang dihitung dari tahun masuk.</p>
            </div>
            <span id="profile-history-count" className="gd-session-badge">{p.semesters.length ? `${p.activeSemester} semester` : "Belum tersedia"}</span>
          </div>
          <div id="profile-semester-list" className="gd-semester-list">
            {p.semesters.length === 0 ? (
              <p className="gd-profile-note">Lengkapi tahun masuk melalui onboarding untuk menampilkan riwayat semester.</p>
            ) : (
              p.semesters.map((s) => (
                <div key={s.number} className="gd-semester-item">
                  <span className="gd-semester-number">{s.number}</span>
                  <div><strong>Semester {s.number} — {s.label}</strong><small>{s.detail}</small></div>
                  <span className={`gd-semester-state${s.isCurrent ? " is-current" : ""}`}>{s.isCurrent ? "Aktif" : "Riwayat"}</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="gd-profile-panel" aria-labelledby="profile-task-history-heading">
          <h2 id="profile-task-history-heading">Riwayat Tugas yang Selesai</h2>
          <div id="profile-completed-list" className="gd-semester-list">
            {p.completedTasks.length === 0 ? (
              <p className="gd-profile-note">Belum ada tugas berstatus Done. Perbarui status tugas pada halaman Pusat Tugas untuk mengisi riwayat ini.</p>
            ) : (
              p.completedTasks.slice(0, 8).map((t) => (
                <div key={t.id} className="gd-semester-item">
                  <span className="gd-semester-number"><span className="material-symbols-outlined">task_alt</span></span>
                  <div>
                    <strong>{t.title}</strong>
                    <small>{t.courseName} · {t.doneAt ? dateFmt(t.doneAt, { day: "numeric", month: "short", year: "numeric" }) : "Tanggal selesai tidak tercatat"}</small>
                  </div>
                  <span className="gd-semester-state is-current">Selesai</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
