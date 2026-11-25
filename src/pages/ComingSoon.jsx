import { Link } from "react-router-dom";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { useAuth } from "../hooks/useAuth.js";

/** Placeholder sementara untuk halaman yang akan dimigrasi di fase berikutnya. */
export default function ComingSoon({ title }) {
  const { logout } = useAuth();
  usePageMeta({ title: `${title} | GetDone` });
  return (
    <main className="min-h-screen pt-16 bg-background flex flex-col items-center justify-center gap-4 text-center px-4">
      <span className="material-symbols-outlined text-5xl text-primary">construction</span>
      <h1 className="font-headline-md text-headline-md font-bold">{title}</h1>
      <p className="font-body-md text-body-md text-text-muted">Halaman ini akan dimigrasi ke React di fase berikutnya.</p>
      <div className="flex gap-3">
        <Link to="/" className="py-2 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high">Beranda</Link>
        <button type="button" onClick={logout} className="py-2 px-4 rounded-xl bg-primary-container text-on-primary">Keluar</button>
      </div>
    </main>
  );
}
