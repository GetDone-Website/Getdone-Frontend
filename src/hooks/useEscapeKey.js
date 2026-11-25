import { useEffect } from "react";

export function useEscapeKey(active, handler) {
  useEffect(() => {
    if (!active) return undefined;
    const onKey = (e) => e.key === "Escape" && handler();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, handler]);
}
