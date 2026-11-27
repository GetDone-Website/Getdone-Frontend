import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/common/ThemeToggle.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { usePageMeta } from "../hooks/usePageMeta.js";

const TAB_BASE = "w-1/2 py-2.5 rounded-lg font-label-lg text-label-lg transition-all duration-200 text-center";
const TAB_ACTIVE = "bg-surface-clean text-primary shadow-sm font-semibold";
const TAB_INACTIVE = "text-text-muted font-medium hover:text-on-surface";

export default function LoginPage() {
  usePageMeta({
    title: "Masuk | GetDone",
    bodyClass: "auth-page bg-background font-body-md text-body-md text-on-surface antialiased min-h-screen",
  });

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  const onChange = (e) => {
    const { id, value } = e.target;
    setErrorMessage("");
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setErrorMessage("");
    try {
      await login({ email: form.email, password: form.password });
      navigate(location.state?.from || "/dashboard");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
          <main className="w-full bg-background min-h-screen">
            <div className="flex flex-col w-full">
              <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 lg:py-16 flex items-center justify-center min-h-[calc(100vh-2rem)]">
                <div className="absolute top-4 left-4 sm:left-6 lg:left-8 z-10">
                  <Link to="/" className="inline-flex items-center gap-1.5 text-body-sm font-label-md text-text-muted hover:text-on-surface transition-colors py-1.5 px-3 rounded-lg hover:bg-surface-container"><span className="material-symbols-outlined text-lg">arrow_back</span><span className="">Kembali ke Beranda</span></Link>
                </div>
                <div className="absolute top-4 right-4 sm:right-6 lg:right-8 z-10">
                  <ThemeToggle />
                </div>
                <div className="absolute -top-12 -left-12 w-96 h-96 bg-primary-fixed-dim/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-16 -right-12 w-80 h-80 bg-state-progress/15 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative w-full grid grid-cols-1 lg:grid-cols-12 rounded-xl overflow-hidden shadow-xl bg-surface-clean">
                  <div className="lg:col-span-5 bg-surface-container p-6 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none text-primary">
                      <span className="material-symbols-outlined text-[280px]">school</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-on-primary shadow-sm">
                          <span className="material-symbols-outlined text-2xl">verified</span>
                        </div>
                        <div>
                          <span className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold">GetDone</span>
                          <span className="block font-label-sm text-label-sm text-text-muted uppercase tracking-wider">Academic Clarity System</span>
                        </div>
                      </div>
                      <div className="mt-8">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-primary font-label-md text-label-md">
                          <span className="w-2 h-2 rounded-full bg-state-done"></span>
                          Portal Terpadu Mahasiswa
                        </span>
                        <h1 className="mt-4 font-headline-lg text-headline-lg text-on-surface leading-tight font-extrabold">
                          Fokus terarah, tugas tuntas tanpa beban.
                        </h1>
                        <p className="mt-3 font-body-md text-body-md text-text-muted leading-relaxed">
                          Ruang kerja akademik yang menyelaraskan kalender
                          perkuliahan, penugasan terstruktur, dan teknik fokus
                          deliberatif dalam satu ekosistem tenang.
                        </p>
                      </div>
                      <div className="mt-8 space-y-4">
                        <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-surface/80 shadow-sm backdrop-blur-sm">
                          <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                            <span className="material-symbols-outlined text-lg">calendar_month</span>
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-label-lg text-label-lg text-on-surface">
                              Sinkronisasi Jadwal Kampus
                            </h4>
                            <p className="font-body-sm text-body-sm text-text-muted">
                              Integrasi silabus, tenggat pengumpulan LMS, dan agenda
                              kuliah secara presisi.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-surface/80 shadow-sm backdrop-blur-sm">
                          <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                            <span className="material-symbols-outlined text-lg">lock</span>
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-label-lg text-label-lg text-on-surface">
                              Penyimpanan Terenkripsi
                            </h4>
                            <p className="font-body-sm text-body-sm text-text-muted">
                              Draft skripsi, artefak tugas, dan repositori riset aman
                              dengan standar enkripsi end-to-end.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-8 pt-6">
                      <div className="p-4 rounded-xl bg-surface-clean shadow-md">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-base">donut_large</span>
                            <span className="font-label-md text-label-md text-on-surface uppercase tracking-wide">Capaian Pekanan</span>
                          </div>
                          <span className="font-label-md text-label-md text-state-done font-bold bg-surface-container-low px-2 py-0.5 rounded-md">86% Tuntas</span>
                        </div>
                        <div className="w-full bg-surface-muted h-2 rounded-full overflow-hidden mb-3">
                          <div className="bg-primary-container h-full rounded-full transition-all duration-500" style={{"width": "86%"}}></div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center pt-2">
                          <div className="bg-surface-container-low p-2 rounded-lg">
                            <span className="block font-headline-sm text-headline-sm text-primary font-bold">18</span>
                            <span className="block font-label-sm text-label-sm text-text-muted">Tugas Selesai</span>
                          </div>
                          <div className="bg-surface-container-low p-2 rounded-lg">
                            <span className="block font-headline-sm text-headline-sm text-state-done font-bold">14.5j</span>
                            <span className="block font-label-sm text-label-sm text-text-muted">Jam Fokus</span>
                          </div>
                          <div className="bg-surface-container-low p-2 rounded-lg">
                            <span className="block font-headline-sm text-headline-sm text-on-surface font-bold">3.94</span>
                            <span className="block font-label-sm text-label-sm text-text-muted">Target IPK</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-center bg-surface-clean">
                    <div className="max-w-md w-full mx-auto">
                      <div className="flex p-1 bg-surface-muted rounded-xl mb-8">
                        <button className={`${TAB_BASE} ${TAB_ACTIVE}`} id="tab-login" type="button">
                          Masuk ke Akun
                        </button>
                        <Link className={`${TAB_BASE} ${TAB_INACTIVE}`} id="tab-register" to="/register">
                          Daftar Akun Baru
                        </Link>
                      </div>
                      <div className="mb-6">
                        <h2 className="font-headline-md text-headline-md text-on-surface font-bold" id="form-heading">Selamat datang kembali</h2>
                        <p className="mt-1 font-body-sm text-body-sm text-text-muted" id="form-subheading">Gunakan kredensial kampus untuk mengakses dasbor akademik Anda.</p>
                      </div>
                      {errorMessage && (
                        <div className="mb-4 p-3 rounded-xl bg-error-container/20 text-error font-body-sm text-body-sm border border-error/30" role="alert">
                          {errorMessage}
                        </div>
                      )}
                      <form className="space-y-4" id="auth-form" onSubmit={handleSubmit}>
                        <div className="space-y-1.5">
                          <label className="block font-label-md text-label-md text-on-surface" htmlFor="email">
                            Email Institusi (.ac.id / .edu)
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted pointer-events-none">
                              <span className="material-symbols-outlined text-xl">alternate_email</span>
                            </span>
                            <input className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-container-lowest text-on-surface placeholder:text-text-muted font-body-md text-body-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-container" id="email" value={form.email} onChange={onChange} placeholder="mahasiswa@itb.ac.id" required type="email" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="block font-label-md text-label-md text-on-surface" htmlFor="password">
                            Kata Sandi
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted pointer-events-none">
                              <span className="material-symbols-outlined text-xl">key</span>
                            </span>
                            <input className="w-full pl-10 pr-11 py-3 rounded-xl bg-surface-container-lowest text-on-surface placeholder:text-text-muted font-body-md text-body-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-container" id="password" value={form.password} onChange={onChange} placeholder="••••••••••••" required type={showPassword ? "text" : "password"} />
                            <button aria-label="Lihat kata sandi" className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-text-muted hover:text-on-surface transition-colors" id="toggle-password" type="button" onClick={() => setShowPassword((v) => !v)}>
                              <span className="material-symbols-outlined text-xl" id="pwd-icon">{showPassword ? "visibility_off" : "visibility"}</span>
                            </button>
                          </div>
                        </div>
                        <button className="w-full mt-4 py-3.5 px-6 rounded-xl bg-primary-container hover:bg-cta-hover disabled:opacity-60 text-on-primary font-label-lg text-label-lg font-semibold flex items-center justify-center gap-2 shadow-md transition-all" disabled={submitting} id="btn-submit" type="submit">
                          <span>{submitting ? "Memproses..." : "Masuk Sekarang"}</span>
                          <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>

    
    
  
    </>
  );
}
