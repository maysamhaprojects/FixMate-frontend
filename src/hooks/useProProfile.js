/**
 * ============================================================
 *  FixMate — הלוגיקה של מסך הפרופיל של בעל המקצוע
 *  טעינת הפרופיל והביקורות, עריכה, שמירה, ותמונת פרופיל.
 *
 *  שימוש:  const p = useProProfile({ isHe });
 * ============================================================
 */
import { useState, useEffect, useRef } from "react";
import { apiFetch } from "../services/api";

export function useProProfile({ isHe }) {
  const [mounted, setMounted] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAreaPicker, setShowAreaPicker] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [areas, setAreas] = useState([]);
  const [specialty, setSpecialty] = useState("");
  const [yearsExp, setYearsExp] = useState("");
  const [rating, setRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [profilePicture, setProfilePicture] = useState("");

  const fileRef = useRef(null);
  const pickFile = () => { if (fileRef.current) fileRef.current.click(); };

  /* אנימציית כניסה */
  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  /* טעינת הביקורות האמיתיות */
  useEffect(() => {
    apiFetch("/api/pro/reviews")
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => {
        if (!Array.isArray(list)) return;
        setReviews(list.map((r) => ({
          name: r.clientName || "",
          rating: r.score || 0,
          date: (r.date || "").slice(0, 10),
          text: r.comment || "",
        })));
      })
      .catch(() => {});
  }, []);

  /* טעינת הפרופיל האמיתי מהשרת */
  useEffect(() => {
    apiFetch("/api/pro/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => {
        if (!p) return;
        const u = p.user || {};
        setFullName(u.fullName || "");
        setPhone(u.phone || "");
        setEmail(u.email || "");
        setProfilePicture(u.profilePicture || "");
        setBio(p.bio || "");
        setSpecialty(p.specialty || "");
        setMinPrice(p.hourlyRate != null ? p.hourlyRate : "");
        setMaxPrice(p.hourlyRate != null ? p.hourlyRate : "");
        setYearsExp(p.yearsExperience != null ? p.yearsExperience : "");
        setRating(p.averageRating || 0);
        setReviewCount(p.totalRatings || 0);
        // מיקום יחיד בשרת → מפוצל לאזורים בתצוגה
        const locs = (p.location || "").split(",").map((s) => s.trim()).filter(Boolean);
        setAreas(locs.map((name) => ({ en: name, he: name })));
      })
      .catch(() => {});
  }, []);

  /* שומר תמונה מיד לשרת (כמו אצל הלקוח — לחיצה ומיד נשמר) */
  const savePhoto = (dataUrl) => {
    setProfilePicture(dataUrl);
    apiFetch("/api/user/me", {
      method: "PUT",
      body: JSON.stringify({ fullName: fullName || "", profilePicture: dataUrl }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          localStorage.setItem("profilePicture", d.profilePicture || "");
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        }
      })
      .catch(() => {});
  };

  /* בחירת תמונה — מכווץ ל-256px ושומר מיד */
  const onPickImage = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;
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
        savePhoto(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => savePhoto("");

  const handleSave = async () => {
    try {
      // 1) פרטי המקצוע (מקצוע, תיאור, עיר, מחיר) — /api/pro/profile
      await apiFetch("/api/pro/profile", {
        method: "PUT",
        body: JSON.stringify({
          specialty: specialty || null,
          bio: bio || null,
          location: areas.map((a) => (isHe ? a.he : a.en)).join(", ") || null,
          hourlyRate: minPrice !== "" ? parseFloat(minPrice) : null,
          yearsExperience: yearsExp !== "" ? parseInt(yearsExp) : null,
        }),
      });
      // 2) שם וטלפון — /api/user/me
      const r2 = await apiFetch("/api/user/me", {
        method: "PUT",
        body: JSON.stringify({ fullName: fullName.trim(), phone: phone.trim(), profilePicture: profilePicture || "" }),
      });
      if (r2.ok) {
        const d = await r2.json();
        localStorage.setItem("fullName", d.fullName || fullName.trim());
        localStorage.setItem("profilePicture", d.profilePicture || "");
      }
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const removeArea = (idx) => setAreas((prev) => prev.filter((_, i) => i !== idx));
  const addArea = (area) => {
    if (!areas.find((a) => a.en === area.en)) setAreas((prev) => [...prev, area]);
    setShowAreaPicker(false);
  };

  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 2);

  return {
    mounted,
    editing, setEditing,
    saved,
    showAreaPicker, setShowAreaPicker,
    showAllReviews, setShowAllReviews,

    fullName, setFullName,
    phone, setPhone,
    email, setEmail,
    bio, setBio,
    minPrice, setMinPrice,
    maxPrice, setMaxPrice,
    areas, addArea, removeArea,
    specialty, setSpecialty,
    yearsExp, setYearsExp,
    rating, reviewCount, reviews, visibleReviews,

    profilePicture, fileRef, pickFile, onPickImage, removePhoto,
    handleSave,
  };
}
