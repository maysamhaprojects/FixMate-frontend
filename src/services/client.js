/**
 * ============================================================
 *  FixMate — שכבת Client
 *  כל הקריאות ל-/api/client (למעט הזמנות ודירוגים) מרוכזות כאן.
 *  מקביל ל-ClientController בבאקאנד.
 * ============================================================
 */

import { apiFetch } from "./api";

/** GET /api/client/pros — רשימת בעלי המקצוע להזמנה */
export function getPros() {
  return apiFetch("/api/client/pros");
}

/** GET /api/client/notifications — התראות הלקוח */
export function getNotifications() {
  return apiFetch("/api/client/notifications");
}
