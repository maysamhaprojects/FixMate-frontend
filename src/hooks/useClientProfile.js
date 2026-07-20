/**
 * ============================================================
 *  FixMate — הלוגיקה של מסך פרופיל הלקוח
 *  טעינת הפרטים, החלפת תמונה, ושמירה בשרת.
 *
 *  שימוש:  const p = useClientProfile({ isHe, navigate });
 * ============================================================
 */
import { useState, useEffect } from "react";
import { getMe, updateMe } from "../services/user";

export function useClientProfile({ isHe, navigate }) {
  const [fullName, setFullName] = useState(localStorage.getItem("fullName") || "");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [role, setRole] = useState(localStorage.getItem("role") || "");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type, text }
  const [showSuccess, setShowSuccess] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);

  /* טעינת הפרטים של המשתמש המחובר */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsLogin(true);
      setMessage({ type: "error", text: isHe ? "לא נמצאה התחברות. אנא התחברי מחדש." : "Not signed in. Please log in again." });
      setLoading(false);
      return;
    }
    getMe()
      .then(async (r) => {
        if (!r.ok) {
          let body = "";
          try { body = await r.text(); } catch (e) { /* ignore */ }
          throw new Error(r.status + (body ? " · " + body : ""));
        }
        return r.json();
      })
      .then((data) => {
        setFullName(data.fullName || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setRole(data.role || "");
        setProfilePicture(data.profilePicture || "");
      })
      .catch((err) => {
        const code = err.message;
        if (code.startsWith("401") || code.startsWith("403")) {
          setNeedsLogin(true);
          setMessage({ type: "error", text: isHe ? "ההרשאה פגה. אנא התחברי מחדש." : "Session expired. Please log in again." });
        } else {
          setMessage({ type: "error", text: (isHe ? "שגיאה: " : "Error: ") + code });
        }
      })
      .finally(() => setLoading(false));
  }, [isHe]);

  /* בחירת תמונה — מכווץ ל-256px ושומר כ-base64 קטן */
  const onPickImage = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: isHe ? "הקובץ חייב להיות תמונה" : "File must be an image" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const max = 256;
        let w = img.width, h = img.height;
        if (w > h) { if (w > max) { h = Math.round(h * max / w); w = max; } }
        else { if (h > max) { w = Math.round(w * max / h); h = max; } }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        setProfilePicture(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      setMessage({ type: "error", text: isHe ? "שם מלא נדרש" : "Full name is required" });
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setMessage({ type: "error", text: isHe ? "אנא הזינו אימייל תקין" : "Please enter a valid email" });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const r = await updateMe({ fullName: fullName.trim(), phone: phone.trim(), email: email.trim(), profilePicture: profilePicture || "" });
      if (!r.ok) {
        let body = "";
        try { body = await r.text(); } catch (e) { /* ignore */ }
        if (body.includes("Email already in use")) {
          throw new Error(isHe ? "האימייל כבר בשימוש על ידי משתמש אחר" : "Email is already in use by another account");
        }
        throw new Error(isHe ? "שמירת הפרטים נכשלה" : "Failed to save profile");
      }
      const data = await r.json();
      localStorage.setItem("fullName", data.fullName || fullName.trim());
      localStorage.setItem("profilePicture", data.profilePicture || ""); // לתצוגה מיידית בדשבורד
      if (data.token) localStorage.setItem("token", data.token);        // טוקן חדש אם האימייל השתנה
      setShowSuccess(true);
      // חלונית הצלחה למשך 2.2 שניות ואז חזרה לדשבורד
      setTimeout(() => navigate("/client/dashboard"), 2200);
    } catch (e) {
      setMessage({ type: "error", text: e.message });
    } finally {
      setSaving(false);
    }
  };

  const roleLabel = role === "CLIENT" ? (isHe ? "לקוח" : "Client")
    : role === "PROFESSIONAL" ? (isHe ? "בעל מקצוע" : "Professional")
    : role === "ADMIN" ? (isHe ? "מנהל מערכת" : "Admin") : (role || "—");
  const initial = (fullName || "?").charAt(0).toUpperCase();

  return {
    fullName, setFullName,
    email, setEmail,
    phone, setPhone,
    profilePicture, setProfilePicture, onPickImage,
    loading, saving, message, showSuccess, needsLogin,
    roleLabel, initial,
    handleSave,
  };
}
