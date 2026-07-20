/**
 * ============================================================
 *  FixMate — שכבת Snap
 *  ניתוח תקלה מטקסט/תמונה.
 *  מקביל ל-SnapController בבאקאנד.
 * ============================================================
 */

import { apiFetch } from "./api";

/** POST /api/snap/analyze — ניתוח תיאור התקלה */
export function analyzeIssue(text) {
  return apiFetch("/api/snap/analyze", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}
