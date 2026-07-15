/**
 * ============================================================
 *  FixMate — פעולות התחברות/יציאה
 *  מרכז את הטיפול בסשן כדי שכל מסך יתנהג אותו דבר.
 * ============================================================
 */

/* מפתחות הסשן — נמחקים ביציאה */
const SESSION_KEYS = ["token", "role", "fullName", "profilePicture", "email"];

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
