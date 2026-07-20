/**
 * ============================================================
 *  FixMate — שכבת Complaints
 *  כל הקריאות לתלונות מרוכזות כאן — של הלקוח ושל האדמין.
 *  מקביל ל-ComplaintController בבאקאנד.
 * ============================================================
 */

import { apiFetch } from "./api";

/** POST /api/complaints — הגשת תלונה חדשה */
export function createComplaint(body) {
  return apiFetch("/api/complaints", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** GET /api/complaints/mine — התלונות של הלקוח המחובר */
export function getMyComplaints() {
  return apiFetch("/api/complaints/mine");
}

/** GET /api/admin/complaints — כל התלונות (אדמין) */
export function getAllComplaints() {
  return apiFetch("/api/admin/complaints");
}

/** PUT /api/admin/complaints/{id}/status — סגירת תלונה עם תגובה (אדמין) */
export function resolveComplaint(id, response) {
  return apiFetch("/api/admin/complaints/" + id + "/status", {
    method: "PUT",
    body: JSON.stringify({ status: "RESOLVED", response: response || "" }),
  });
}
