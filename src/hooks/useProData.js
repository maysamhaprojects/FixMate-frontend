/**
 * ============================================================
 *  FixMate — הלוגיקה של דשבורד בעל המקצוע
 *  כל ה-state, קריאות השרת והחישובים — מופרדים מהתצוגה.
 *
 *  שימוש:  const pro = useProData();
 * ============================================================
 */
import { useState, useEffect } from "react";
import { apiFetch } from "../services/api";

/* המרת תאריך ל"לפני X" */
const timeAgo = (iso) => {
  if (!iso) return { en: "", he: "" };
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return { en: "just now",       he: "עכשיו" };
  if (mins < 60) return { en: mins + " min ago", he: "לפני " + mins + " דקות" };
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return { en: hrs + " hr ago",   he: "לפני " + hrs + " שעות" };
  const days = Math.floor(hrs / 24);
  return { en: days + " d ago", he: "לפני " + days + " ימים" };
};

/* מיפוי סטטוס מהשרת לתצוגה */
const mapStatus = (s) => {
  if (s === "COMPLETED") return "completed";
  if (s === "IN_PROGRESS") return "in_progress";
  return "upcoming"; // PENDING / CONFIRMED
};

export function useProData() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [expandedReview, setExpandedReview] = useState(null);

  /* פרטי בעל המקצוע המחובר */
  const [me, setMe] = useState({
    name: localStorage.getItem("fullName") || "",
    specialty: "",
    rating: null,
    avatar: (localStorage.getItem("fullName") || "?").charAt(0).toUpperCase(),
    profilePicture: localStorage.getItem("profilePicture") || "",
  });

  const [stats, setStats] = useState({
    newOrders: 0, todayOrders: 0, weeklyIncome: 0, rating: 0, totalRatings: 0,
  });

  const [reviews, setReviews] = useState([]);
  const [schedule, setSchedule] = useState([]);

  /* אנימציית כניסה */
  useEffect(() => {
    const tm = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(tm);
  }, []);

  /* רענון אוטומטי — כל 20 שניות + כשחוזרים ללשונית */
  const [refreshTick, setRefreshTick] = useState(0);
  useEffect(() => {
    const bump = () => setRefreshTick((t) => t + 1);
    const iv = setInterval(bump, 20000);
    window.addEventListener("focus", bump);
    return () => { clearInterval(iv); window.removeEventListener("focus", bump); };
  }, []);

  /* פרופיל */
  useEffect(() => {
    apiFetch("/api/pro/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => {
        if (!p) return;
        const u = p.user || {};
        const name = u.fullName || localStorage.getItem("fullName") || "";
        setMe({
          name,
          specialty: p.specialty || "",
          rating: p.averageRating != null ? p.averageRating : null,
          avatar: (name || "?").charAt(0).toUpperCase(),
          profilePicture: u.profilePicture || "",
        });
        localStorage.setItem("profilePicture", u.profilePicture || "");
      })
      .catch(() => {});
  }, []);

  /* סטטיסטיקות */
  useEffect(() => {
    apiFetch("/api/pro/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => {
        if (!s) return;
        setStats({
          newOrders:    s.newOrders    || 0,
          todayOrders:  s.todayOrders  || 0,
          weeklyIncome: s.weeklyIncome || 0,
          rating:       s.rating       || 0,
          totalRatings: s.totalRatings || 0,
        });
      })
      .catch(() => {});
  }, [refreshTick]);

  /* ביקורות */
  useEffect(() => {
    apiFetch("/api/pro/reviews")
      .then((r) => (r.ok ? r.json() : null))
      .then((list) => {
        if (!Array.isArray(list)) return;
        setReviews(list.map((r) => ({
          id: r.id,
          clientName: { en: r.clientName || "", he: r.clientName || "" },
          service:    { en: r.serviceType || "", he: r.serviceType || "" },
          rating:     r.score || 0,
          date:       { en: (r.date || "").slice(0, 10), he: (r.date || "").slice(0, 10) },
          comment:    { en: r.comment || "", he: r.comment || "" },
          orderId:    r.bookingId ? "ORD-" + r.bookingId : "",
        })));
      })
      .catch(() => {});
  }, []);

  /* התראות */
  useEffect(() => {
    apiFetch("/api/pro/notifications")
      .then((r) => (r.ok ? r.json() : null))
      .then((list) => {
        if (!Array.isArray(list)) return;
        setNotifications(list.map((n) => {
          const name = n.clientName || "";
          if (n.type === "RATING") {
            return {
              id: n.id, iconType: "rating", color: "#F59E0B", bg: "#FFF7ED",
              text: { en: name + " rated you " + n.detail + " stars!", he: name + " דירג אותך " + n.detail + " כוכבים!" },
              time: timeAgo(n.date), read: false,
            };
          }
          if (n.type === "CANCELLED") {
            return {
              id: n.id, iconType: "cancelled", color: "#DC2626", bg: "#FEF2F2",
              text: { en: name + " cancelled their order — " + n.detail, he: name + " ביטל/ה את ההזמנה — " + n.detail },
              time: timeAgo(n.date), read: false,
            };
          }
          return {
            id: n.id, iconType: "order", color: "#2563EB", bg: "#EEF2FF",
            text: { en: "New order from " + name + " — " + n.detail, he: "הזמנה חדשה מ" + name + " — " + n.detail },
            time: timeAgo(n.date), read: false,
          };
        }));
      })
      .catch(() => {});
  }, [refreshTick]);

  /* לוח זמנים של היום */
  useEffect(() => {
    apiFetch("/api/pro/schedule/today")
      .then((r) => (r.ok ? r.json() : null))
      .then((list) => {
        if (!Array.isArray(list)) return;
        // מסננים הזמנות מבוטלות — הן לא פגישות פעילות בלוח
        setSchedule(list.filter((b) => (b.status || "").toUpperCase() !== "CANCELLED").map((b) => ({
          status:   mapStatus(b.status),
          time:     (b.scheduledAt || "").slice(11, 16),
          client:   { en: b.clientName || "", he: b.clientName || "" },
          service:  { en: b.serviceType || "", he: b.serviceType || "" },
          location: { en: b.address || "", he: b.address || "" },
          phone:    b.clientPhone || "",
        })));
      })
      .catch(() => {});
  }, [refreshTick]);

  /* חישובים ופעולות */
  const unreadCount = notifications.filter(n => !n.read).length;
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead    = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return {
    mounted,
    activeTab, setActiveTab,
    showNotif, setShowNotif,
    notifications, unreadCount, markAllRead, markRead,
    expandedReview, setExpandedReview,
    me, stats, reviews, schedule,
    scrollTo,
  };
}
