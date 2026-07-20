/**
 * ============================================================
 *  FixMate — שכבת Pro
 *  כל הקריאות ל-/api/pro מרוכזות כאן, כולל זמינות.
 *  מקביל ל-ProController ו-AvailabilityController בבאקאנד.
 * ============================================================
 */

import { apiFetch } from "./api";

/** GET /api/pro/profile — פרופיל בעל המקצוע המחובר */
export function getProfile() {
  return apiFetch("/api/pro/profile");
}

/** PUT /api/pro/profile — עדכון פרופיל בעל המקצוע */
export function updateProfile(body) {
  return apiFetch("/api/pro/profile", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/** GET /api/pro/stats — נתוני הדשבורד של בעל המקצוע */
export function getStats() {
  return apiFetch("/api/pro/stats");
}

/** GET /api/pro/reviews — הביקורות על בעל המקצוע */
export function getReviews() {
  return apiFetch("/api/pro/reviews");
}

/** GET /api/pro/notifications — התראות בעל המקצוע */
export function getNotifications() {
  return apiFetch("/api/pro/notifications");
}

/** GET /api/pro/schedule/today — הפגישות של היום */
export function getTodaySchedule() {
  return apiFetch("/api/pro/schedule/today");
}

/* ── זמינות ── */

/** GET /api/pro/availability — שעות הזמינות השבועיות */
export function getAvailability() {
  return apiFetch("/api/pro/availability");
}

/** PUT /api/pro/availability — עדכון שורת זמינות */
export function updateAvailability(body) {
  return apiFetch("/api/pro/availability", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}
