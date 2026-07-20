/**
 * ============================================================
 *  FixMate — שכבת ה-Auth
 *  כל הקריאות ל-/api/auth מרוכזות כאן, וגם הטיפול בסשן,
 *  כדי שכל מסך יתנהג אותו דבר ולא יפנה לשרת ישירות.
 *  מקביל ל-AuthController בבאקאנד.
 * ============================================================
 */

import { apiFetch } from "./api";

/* מפתחות הסשן — נמחקים ביציאה */
const SESSION_KEYS = ["token", "role", "fullName", "profilePicture", "email"];

/* ── קריאות לשרת ── */

/** POST /api/auth/login — מחזיר את ה-Response כמו fetch */
export function login(email, password) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/** POST /api/auth/register — body נבנה במסך ההרשמה */
export function register(body) {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * יציאה מהמערכת — מוחק את הסשן ומחזיר למסך ההתחברות.
 * "זכור אותי" (rememberedEmail/Password) לא נמחק בכוונה —
 * המשתמש ביקש שנזכור אותו גם אחרי יציאה.
 */
export function logout(navigate) {
  SESSION_KEYS.forEach((k) => localStorage.removeItem(k));
  navigate("/login", { replace: true });
}

/* האם יש סשן פעיל */
export const isLoggedIn = () => !!localStorage.getItem("token");

/* התפקיד של המשתמש המחובר */
export const currentRole = () => localStorage.getItem("role");
