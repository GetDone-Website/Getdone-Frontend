import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

/** Layout untuk Landing, Login, Register, Onboarding. Halaman menentukan title/body-class sendiri via usePageMeta. */
export default function AuthLayout() {
  const { pathname, hash } = useLocation();

  // Pindah halaman -> scroll ke atas; link anchor (#fitur) tetap ditangani browser.
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);

  return <Outlet />;
}
