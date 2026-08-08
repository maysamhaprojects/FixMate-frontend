/**
 * ============================================================
 *  FixMate — שכבת Client
 *  כל הקריאות ל-/api/client (למעט הזמנות ודירוגים) מרוכזות כאן.
 *  מקביל ל-ClientController בבאקאנד.
 * ============================================================
 */

import { apiFetch } from "./api";

/** GET /api/client/pros — רשימת בעלי המקצוע להזמנה.
 *  אם מועבר scheduledAt (ISO "2026-08-05T10:00:00") — השרת מסנן למקצוענים
 *  שפנויים אז, כך שלא מוצגים מי שממילא ייחסמו ביצירת ההזמנה. */
export function getPros(scheduledAt) {
  const q = scheduledAt ? "?at=" + encodeURIComponent(scheduledAt) : "";
  return apiFetch("/api/client/pros" + q);
}

/** GET /api/client/notifications — התראות הלקוח */
export function getNotifications() {
  return apiFetch("/api/client/notifications");
}
