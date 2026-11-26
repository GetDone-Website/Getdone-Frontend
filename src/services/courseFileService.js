import api, { API_ENABLED, getToken, unwrap } from "./api.js";
import { isUuid } from "./mappers.js";
import { flushSync, resolveServerId } from "./remoteSync.js";

/** File kontrak kuliah (opsional). Hanya tersedia bila backend aktif dan mata kuliah sudah tersimpan di server. */
export const CONTRACT_MAX_BYTES = 5 * 1024 * 1024;
export const CONTRACT_ACCEPT = ".pdf,.doc,.docx";

const toContract = (course) => (course?.contract?.name ? { name: course.contract.name, size: Number(course.contract.size) || 0 } : null);

export function contractUploadAvailable(courseId) {
  if (!API_ENABLED || !getToken()) {
    return { ok: false, reason: "Unggah kontrak kuliah membutuhkan koneksi ke server GetDone (backend belum aktif atau belum login)." };
  }
  if (!isUuid(resolveServerId(courseId))) {
    return { ok: false, reason: "Mata kuliah ini belum tersimpan di server. Tunggu sinkronisasi selesai lalu buka kembali detailnya." };
  }
  return { ok: true };
}

/** Unggah/ganti file kontrak. @returns {Promise<{name: string, size: number}|null>} info kontrak dari server */
export async function uploadContract(courseId, file) {
  await flushSync();
  const available = contractUploadAvailable(courseId);
  if (!available.ok) throw new Error(available.reason);
  const form = new FormData();
  form.append("contract", file);
  const course = unwrap(await api.post(`/courses/${resolveServerId(courseId)}/contract`, form, { headers: { "Content-Type": "multipart/form-data" } }));
  return toContract(course);
}

export async function deleteContract(courseId) {
  await flushSync();
  const available = contractUploadAvailable(courseId);
  if (!available.ok) throw new Error(available.reason);
  await api.delete(`/courses/${resolveServerId(courseId)}/contract`);
}

/** Mengunduh lewat endpoint terautentikasi (token Bearer) lalu memicu unduhan di browser. */
export async function downloadContract(courseId, name) {
  const available = contractUploadAvailable(courseId);
  if (!available.ok) throw new Error(available.reason);
  const response = await api.get(`/courses/${resolveServerId(courseId)}/contract`, { responseType: "blob" });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = name || "kontrak-kuliah";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
