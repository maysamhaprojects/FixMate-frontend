/**
 * ============================================================
 *  FixMate — שמירה על המסכים לפי התחברות ותפקיד
 *
 *  שכבת הגנה ראשונה בלבד — ההגנה האמיתית היא בשרת
 *  (JWT + SecurityConfig). כאן רק מונעים פתיחת מסך
 *  שאין למשתמש מה לעשות בו, ומפנים אותו למקום הנכון.
 *
 *  שימוש:
 *    <Route path="/admin" element={
 *      <ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>
 *    } />
 * ============================================================
 */
import { Navigate, useLocation } from "react-router-dom";

/* לאן שולחים כל תפקיד כשהוא מגיע למקום הלא נכון */
const HOME_BY_ROLE = {
  ADMIN: "/admin",
  CLIENT: "/client/dashboard",
  PROFESSIONAL: "/pro/dashboard",
};

export default function ProtectedRoute({ children, role }) {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const myRole = localStorage.getItem("role");

  // לא מחובר → למסך ההתחברות, וזוכרים לאן רצה להגיע
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // מחובר אבל בתפקיד אחר → לדשבורד שלו
  // role יכול להיות מחרוזת אחת או מערך (מסך שפתוח לכמה תפקידים)
  if (role) {
    const allowed = Array.isArray(role) ? role : [role];
    if (!allowed.includes(myRole)) {
      return <Navigate to={HOME_BY_ROLE[myRole] || "/login"} replace />;
    }
  }

  return children;
}
