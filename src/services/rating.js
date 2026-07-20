/**
 * ============================================================
 *  FixMate — שכבת Ratings
 *  כל הקריאות לדירוגים מרוכזות כאן.
 *  מקביל ל-RatingController בבאקאנד.
 * ============================================================
 */

import { apiFetch } from "./api";

/** POST /api/client/ratings — שליחת דירוג לבעל מקצוע */
export function createRating(body) {
  return apiFetch("/api/client/ratings", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** GET /api/client/rated-bookings — מזהי ההזמנות שכבר דורגו */
export function getRatedBookings() {
  return apiFetch("/api/client/rated-bookings");
}
