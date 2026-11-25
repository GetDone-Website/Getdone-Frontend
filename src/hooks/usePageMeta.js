import { useLayoutEffect } from "react";

/**
 * Mengatur <title> dan menambah class ke <body> selama halaman/layout aktif.
 * Memakai classList (bukan className) supaya layout dan halaman bisa menambah class masing-masing
 * tanpa saling menimpa (mis. "app-page" dari DashboardLayout + "gd-sidebar-collapsed").
 */
export function usePageMeta({ title, bodyClass = "" } = {}) {
  useLayoutEffect(() => {
    const prevTitle = document.title;
    if (title) document.title = title;
    const tokens = bodyClass.split(/\s+/).filter(Boolean);
    if (tokens.length) document.body.classList.add(...tokens);
    return () => {
      document.title = prevTitle;
      if (tokens.length) document.body.classList.remove(...tokens);
    };
  }, [title, bodyClass]);
}
