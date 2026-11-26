import { useCallback, useState } from "react";
import { getOnboarding } from "../services/academicData.js";
import { applyCourseEdit, buildCourseFromForm, loadCourses, saveCourses } from "../services/courseService.js";

/** State mata kuliah + persistensi ke Laravel melalui service syncCollection. */
export function useCourses() {
  const [courses, setCourses] = useState(loadCourses);

  const commit = useCallback((updater) => {
    setCourses((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (!saveCourses(next)) console.warn("Mata kuliah tidak dapat disimpan.");
      return next;
    });
  }, []);

  const removeCourse = useCallback((id) => commit((list) => list.filter((c) => String(c.id) !== String(id))), [commit]);

  const setSemesterStatus = useCallback(
    (id, status) => {
      const activeSemester = Number(getOnboarding().activeSemester) || 1;
      commit((list) =>
        list.map((c) =>
          String(c.id) === String(id)
            ? {
                ...c,
                semesterStatus: status,
                resultStatus: status === "current" ? "" : status,
                semesterNumber: status === "current" ? activeSemester : Math.max(1, activeSemester - 1),
              }
            : c,
        ),
      );
    },
    [commit],
  );

  /** @returns {string|null} pesan error, atau null bila berhasil */
  const addCourse = useCallback(
    (form) => {
      const result = buildCourseFromForm(form, courses);
      if (result.error) return result.error;
      commit((list) => [...list, result.course]);
      return null;
    },
    [courses, commit],
  );

  /** @returns {string|null} pesan error, atau null bila berhasil */
  const updateCourse = useCallback(
    (id, form) => {
      const current = courses.find((c) => String(c.id) === String(id));
      if (!current) return "Mata kuliah tidak ditemukan.";
      const result = applyCourseEdit(form, current, courses);
      if (result.error) return result.error;
      commit((list) => list.map((c) => (String(c.id) === String(id) ? result.course : c)));
      return null;
    },
    [courses, commit],
  );

  /** Memperbarui info kontrak (hasil unggah/hapus di server) pada state lokal. Tidak ikut dikirim sebagai PUT. */
  const setContract = useCallback(
    (id, contract) => commit((list) => list.map((c) => (String(c.id) === String(id) ? { ...c, contract: contract || null } : c))),
    [commit],
  );

  return { courses, addCourse, updateCourse, removeCourse, setSemesterStatus, setContract };
}
