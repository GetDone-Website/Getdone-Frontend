import { useEffect, useState } from "react";

/** Untuk modal dengan transisi: `mounted` = ada di DOM, `shown` = sudah masuk keadaan tampil (opacity/scale). */
export function useAnimatedPresence(open, ms = 200) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    let timer;
    if (open) {
      setMounted(true);
      timer = setTimeout(() => setShown(true), 10);
    } else {
      setShown(false);
      timer = setTimeout(() => setMounted(false), ms);
    }
    return () => clearTimeout(timer);
  }, [open, ms]);
  return { mounted, shown };
}
