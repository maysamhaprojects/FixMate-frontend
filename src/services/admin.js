/**
 * ============================================================
 *  FixMate — שכבת Admin
 *  כל הקריאות ל-/api/admin מרוכזות כאן.
 *  מקביל ל-AdminController בבאקאנד.
 * ============================================================
 */

import { apiFetch } from "./api";

/** GET /api/admin/pros/pending — בעלי מקצוע הממתינים לאישור */
export function getPendingPros() {
  return apiFetch("/api/admin/pros/pending");
}

/** PUT /api/admin/pros/{id}/approve — אישור בעל מקצוע */
export function approvePro(id) {
  return apiFetch("/api/admin/pros/" + id + "/approve", { method: "PUT" });
}

/** PUT /api/admin/pros/{id}/reject — דחיית בעל מקצוע (reason אופציונלי) */
export function rejectPro(id, reason) {
  const q = reason ? "?reason=" + encodeURIComponent(reason) : "";
  return apiFetch("/api/admin/pros/" + id + "/reject" + q, { method: "PUT" });
}

/** GET /api/admin/stats — נתוני הדשבורד */
export function getStats() {
  return apiFetch("/api/admin/stats");
}

/** GET /api/admin/users — כל המשתמשים */
export function getUsers() {
  return apiFetch("/api/admin/users");
}

/** PUT /api/admin/users/{id}/toggle-suspend — השעיה/ביטול השעיה */
export function toggleSuspend(id) {
  return apiFetch("/api/admin/users/" + id + "/toggle-suspend", { method: "PUT" });
}

/** GET /api/admin/orders — כל ההזמנות במערכת */
export function getOrders() {
  return apiFetch("/api/admin/orders");
}

/** GET /api/admin/ratings — כל הדירוגים */
export function getRatings() {
  return apiFetch("/api/admin/ratings");
}
