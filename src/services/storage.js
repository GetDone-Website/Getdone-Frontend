// Pembungkus localStorage yang aman (tidak melempar error saat storage diblokir).
export function readJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.warn(`Tidak dapat membaca ${key} dari localStorage.`, error);
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Tidak dapat menyimpan ${key} ke localStorage.`, error);
    return false;
  }
}

export function removeKey(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Tidak dapat menghapus ${key} dari localStorage.`, error);
  }
}

// Flag boolean sederhana (disimpan sebagai "true"/"false", sama seperti versi HTML).
export function readFlag(key, fallback = false) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : raw === "true";
  } catch (error) {
    return fallback;
  }
}

export function writeFlag(key, value) {
  try {
    localStorage.setItem(key, String(Boolean(value)));
  } catch (error) {
    /* mode sementara */
  }
}
