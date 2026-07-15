/**
 * ============================================================
 *  FixMate — הלוגיקה של מסך הזמינות השבועית
 *  טעינת הזמינות הקיימת, עריכה, ושמירה בשרת.
 *
 *  שימוש:  const a = useAvailability({ isHe, navigate });
 * ============================================================
 */
import { useState, useEffect } from "react";
import { apiFetch } from "../services/api";
import { DAYS } from "../data/weekDays";

export function useAvailability({ isHe, navigate }) {
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // מצב ברירת מחדל לכל 7 הימים
  const [week, setWeek] = useState(
    DAYS.map((d) => ({ day: d.key, available: false, start: "09:00", end: "17:00" }))
  );

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

  /* טעינת הזמינות הקיימת מהשרת */
  useEffect(() => {
    apiFetch("/api/pro/availability")
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => {
        if (!Array.isArray(list)) return;
        setWeek((prev) =>
          prev.map((row) => {
            const found = list.find((x) => x.dayOfWeek === row.day);
            if (!found) return row;
            return {
              day: row.day,
              available: found.available,
              start: (found.startTime || "09:00").slice(0, 5),
              end: (found.endTime || "17:00").slice(0, 5),
            };
          })
        );
      })
      .catch(() => {});
  }, []);

  const updateDay = (i, patch) =>
    setWeek((prev) => prev.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2600);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // שומרים כל יום בנפרד (הבקאנד מקבל יום בודד ומעדכן/יוצר)
      for (const row of week) {
        await apiFetch("/api/pro/availability", {
          method: "PUT",
          body: JSON.stringify({
            dayOfWeek: row.day,
            startTime: row.start + ":00",
            endTime: row.end + ":00",
            available: row.available,
          }),
        });
      }
      setShowSuccess(true);
      setTimeout(() => navigate("/pro/dashboard"), 2200);
    } catch (e) {
      showToast(isHe ? "השמירה נכשלה" : "Failed to save", false);
    } finally {
      setSaving(false);
    }
  };

  return { mounted, saving, toast, showSuccess, week, updateDay, handleSave };
}
