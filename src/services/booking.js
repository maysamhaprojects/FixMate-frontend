/**
 * ============================================================
 *  FixMate — שכבת Bookings
 *  כל הקריאות להזמנות מרוכזות כאן — צד הלקוח וצד בעל המקצוע.
 *  מקביל ל-BookingController בבאקאנד.
 * ============================================================
 */

import { apiFetch } from "./api";

/* ── צד הלקוח ── */

/** POST /api/client/bookings — יצירת הזמנה חדשה */
export function createBooking(body) {
  return apiFetch("/api/client/bookings", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** GET /api/client/bookings — ההזמנות של הלקוח המחובר */
export function getMyBookings() {
  return apiFetch("/api/client/bookings");
}

/** PUT /api/client/bookings/{id} — עריכת הזמנה */
export function updateBooking(id, body) {
  return apiFetch("/api/client/bookings/" + id, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/** DELETE /api/client/bookings/{id} — ביטול הזמנה (reason אופציונלי) */
export function cancelBooking(id, reason) {
  const q = reason ? "?reason=" + encodeURIComponent(reason) : "";
  return apiFetch("/api/client/bookings/" + id + q, { method: "DELETE" });
}

/* ── צד בעל המקצוע ── */

/** GET /api/pro/orders — ההזמנות שהגיעו לבעל המקצוע */
export function getProOrders() {
  return apiFetch("/api/pro/orders");
}

/** PUT /api/pro/orders/{id}/status — עדכון סטטוס הזמנה */
export function updateOrderStatus(id, body) {
  return apiFetch("/api/pro/orders/" + id + "/status", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}
