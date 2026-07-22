/**
 * ============================================================
 *  FixMate — שכבת Snap
 *  ניתוח תקלה מטקסט/תמונה.
 *  מקביל ל-SnapController בבאקאנד.
 * ============================================================
 */

import { apiFetch } from "./api";

/**
 * POST /api/snap/analyze — ניתוח תקלה מטקסט, מתמונה, או משניהם.
 * imageBase64 הוא data URI מלא ("data:image/jpeg;base64,...").
 */
export function analyzeIssue(text, imageBase64) {
  return apiFetch("/api/snap/analyze", {
    method: "POST",
    body: JSON.stringify({ text: text || "", imageBase64: imageBase64 || null }),
  });
}

/**
 * POST /api/snap/chat — שיחה עם הסוכן.
 * שולחים את כל ההיסטוריה בכל פעם; השרת לא שומר מצב.
 *
 * @param messages [{ role: "user" | "assistant", content: string }, ...]
 * @returns { reply, actions } — actions מפרט אילו פעולות הסוכן ביצע
 */
export function chatWithAgent(messages, imageBase64) {
  return apiFetch("/api/snap/chat", {
    method: "POST",
    body: JSON.stringify({ messages, imageBase64: imageBase64 || null }),
  });
}
