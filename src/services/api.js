import axios from "axios";
import { STORAGE_KEYS } from "../utils/constants.js";

/**
 * Klien HTTP ke backend Laravel (Sanctum, token Bearer).
 * Mode default: API Laravel aktif di http://127.0.0.1:4000/api.
 * Hanya mode demo offline yang mengisi VITE_API_URL= (kosong).
 */
export const API_URL = (import.meta.env.VITE_API_URL ?? "http://127.0.0.1:4000/api").trim().replace(/\/$/, "");
export const API_ENABLED = Boolean(API_URL);

export const getToken = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.token);
  } catch (error) {
    return null;
  }
};
export const setToken = (token) => {
  try {
    if (token) localStorage.setItem(STORAGE_KEYS.token, token);
    else localStorage.removeItem(STORAGE_KEYS.token);
  } catch (error) {
    /* mode sementara */
  }
};

const api = axios.create({ baseURL: API_URL || undefined, timeout: 15000 });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token kedaluwarsa/dicabut/tidak valid (401 dari Sanctum): bersihkan sesi dan minta login ulang.
    if (error.response?.status === 401 && getToken()) {
      setToken(null);
      window.dispatchEvent(new CustomEvent("getdone:unauthorized"));
    }
    const fieldErrors = error.response?.data?.errors;
    const firstFieldError = fieldErrors && Object.values(fieldErrors).flat()[0];
    const message = firstFieldError || error.response?.data?.message || (error.request ? "Server tidak dapat dihubungi. Periksa Laravel dan koneksi database." : error.message);
    return Promise.reject(Object.assign(new Error(message), { status: error.response?.status }));
  },
);

/** Backend membalas { success, data, message }; ambil isi `data`-nya. */
export const unwrap = (response) => response.data?.data;

export default api;
