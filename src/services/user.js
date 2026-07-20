/**
 * ============================================================
 *  FixMate — שכבת User
 *  כל הקריאות ל-/api/user מרוכזות כאן.
 *  מקביל ל-UserController בבאקאנד.
 * ============================================================
 */

import { apiFetch } from "./api";

/** GET /api/user/me — פרטי המשתמש המחובר */
export function getMe() {
  return apiFetch("/api/user/me");
}

/** PUT /api/user/me — עדכון פרטי המשתמש המחובר */
export function updateMe(body) {
  return apiFetch("/api/user/me", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}
