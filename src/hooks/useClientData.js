/**
 * ============================================================
 *  FixMate — הלוגיקה של דשבורד הלקוח
 *  כל ה-state, קריאות השרת והפעולות — מופרדים מהתצוגה.
 *
 *  שימוש:  const c = useClientData({ t, lang, isHe });
 * ============================================================
 */
import { useState, useEffect } from "react";
import { getMe } from "../services/user";
import { getNotifications } from "../services/client";
import { getMyBookings, updateBooking, cancelBooking } from "../services/booking";
import { getRatedBookings } from "../services/rating";
import { createComplaint, getMyComplaints } from "../services/complaint";
import { CANCEL_FEE, GRACE_MINUTES } from "../data/clientConstants";
import { apiFetch } from "../services/api";

/* שמות ימי השבוע (בסדר שבועי) — לסיכום שעות העבודה של בעל המקצוע */
const DAY_ORDER = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const DAY_HE = { SUNDAY: "ראשון", MONDAY: "שני", TUESDAY: "שלישי", WEDNESDAY: "רביעי", THURSDAY: "חמישי", FRIDAY: "שישי", SATURDAY: "שבת" };
const DAY_EN = { SUNDAY: "Sun", MONDAY: "Mon", TUESDAY: "Tue", WEDNESDAY: "Wed", THURSDAY: "Thu", FRIDAY: "Fri", SATURDAY: "Sat" };

/* מכווץ ימים רצופים לטווח: [ראשון..חמישי] → "ראשון–חמישי" */
function collapseDays(days, names) {
  const idxs = [...new Set(days.map((d) => DAY_ORDER.indexOf(d)))].filter((i) => i >= 0).sort((a, b) => a - b);
  if (!idxs.length) return "";
  const runs = [];
  let start = idxs[0], prev = idxs[0];
  for (let i = 1; i < idxs.length; i++) {
    if (idxs[i] === prev + 1) prev = idxs[i];
    else { runs.push([start, prev]); start = idxs[i]; prev = idxs[i]; }
  }
  runs.push([start, prev]);
  return runs
    .map(([a, b]) => (a === b ? names[DAY_ORDER[a]] : names[DAY_ORDER[a]] + "–" + names[DAY_ORDER[b]]))
    .join(", ");
}

/* הופך רשימת זמינות לטקסט קריא: "ראשון–חמישי 08:00–18:00" */
function summarizeHours(slots, isHe) {
  const names = isHe ? DAY_HE : DAY_EN;
  const valid = (slots || []).filter((s) => s.available && s.startTime && s.endTime);
  if (!valid.length) return null;
  const groups = {};
  for (const s of valid) {
    const range = s.startTime.slice(0, 5) + "–" + s.endTime.slice(0, 5);
    (groups[range] = groups[range] || []).push(s.dayOfWeek);
  }
  return Object.entries(groups)
    .map(([range, days]) => collapseDays(days, names) + " " + range)
    .join(" · ");
}

export function useClientData({ t, lang, isHe }) {
  const [mounted, setMounted] = useState(false);
  const [userName] = useState(localStorage.getItem("fullName") || (lang === "he" ? "אורח" : "Guest"));
  const [avatarPic, setAvatarPic] = useState(localStorage.getItem("profilePicture") || "");
  const [userEmail, setUserEmail] = useState(localStorage.getItem("email") || "");
  const [orders, setOrders] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [ratedIds, setRatedIds] = useState([]);
  const [myComplaints, setMyComplaints] = useState([]);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [showAllComplaints, setShowAllComplaints] = useState(false);

  /* עריכת הזמנה */
  const [editOrder, setEditOrder] = useState(null);
  const [trackOrder, setTrackOrder] = useState(null);
  const [cancelConfirm, setCancelConfirm] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editAddr, setEditAddr] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editProHours, setEditProHours] = useState(null);  // שעות העבודה של בעל המקצוע, להצגה בטופס

  /* תלונה */
  const [showComplaint, setShowComplaint] = useState(false);
  const [compSubject, setCompSubject] = useState("");
  const [compDesc, setCompDesc] = useState("");
  const [compOrderId, setCompOrderId] = useState("");
  const [compSaving, setCompSaving] = useState(false);

  /* הודעת toast פנימית (במקום alert של הדפדפן) */
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  /* אנימציית כניסה */
  useEffect(() => {
    const tm = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(tm);
  }, []);

  /* רענון אוטומטי — כל 20 שניות + כשחוזרים ללשונית */
  const [refreshTick, setRefreshTick] = useState(0);
  useEffect(() => {
    const bump = () => setRefreshTick((x) => x + 1);
    const iv = setInterval(bump, 20000);
    window.addEventListener("focus", bump);
    return () => { clearInterval(iv); window.removeEventListener("focus", bump); };
  }, []);

  /* משיכת ההזמנות האמיתיות של הלקוח המחובר */
  useEffect(() => {
    getMyBookings()
      .then((r) => (r.ok ? r.json() : null))
      .then((list) => {
        if (!Array.isArray(list)) return;
        // מסתירים הזמנות מבוטלות מ"הזמנות פעילות"
        setOrders(list.filter((b) => (b.status || "").toUpperCase() !== "CANCELLED").map((b) => {
          const sched = b.scheduledAt || "";
          const proName = (b.pro && b.pro.fullName) || (lang === "he" ? "בעל מקצוע" : "Professional");
          return {
            id: "ORD-" + b.id,
            bookingId: b.id,
            proId: (b.pro && b.pro.id) || null,
            createdAt: b.createdAt || null,
            proName,
            proRole: b.serviceType || "",
            proAvatar: null,
            proPic: (b.pro && b.pro.profilePicture) || "",
            rating: null,
            status: (b.status || "PENDING").toLowerCase(),
            price: b.totalPrice != null ? b.totalPrice : null,  // המחיר הסופי — null עד שבעל המקצוע קובע אותו
            date: sched.slice(0, 10),
            time: sched.slice(11, 16),
            phone: (b.pro && b.pro.phone) || "",
            address: b.address || "",
            description: b.notes || b.serviceType || "",
          };
        }));
      })
      .catch(() => { /* אם נכשל — נשארים עם רשימה ריקה */ });
  }, [lang, refreshTick]);

  /* משיכת התראות אמיתיות לפי סטטוס ההזמנות */
  useEffect(() => {
    getNotifications()
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => {
        if (!Array.isArray(list)) return;
        const he = lang === "he";
        const textFor = (n) => {
          const pro = n.proName || (he ? "בעל המקצוע" : "the professional");
          switch (n.type) {
            case "confirmed":   return he ? `ההזמנה שלך עם ${pro} אושרה` : `Your order with ${pro} was confirmed`;
            case "in_progress": return he ? `${pro} התחיל לטפל בהזמנה שלך` : `${pro} started working on your order`;
            case "completed":   return he ? `העבודה עם ${pro} הושלמה — אפשר לדרג!` : `Job with ${pro} completed — you can rate now!`;
            case "cancelled":   return he ? `ההזמנה עם ${pro} בוטלה` : `Order with ${pro} was cancelled`;
            default:            return he ? "עדכון בהזמנה" : "Order update";
          }
        };
        setNotifications(list.map((n) => ({
          id: n.id,
          type: n.type,
          text: textFor(n),
          time: (n.date || "").slice(0, 10),
          read: false,
        })));
      })
      .catch(() => { /* אם נכשל — נשארים ריקים */ });
  }, [lang, refreshTick]);

  /* אילו הזמנות כבר דורגו — כדי להסתיר את כפתור "דרג" */
  useEffect(() => {
    getRatedBookings()
      .then((r) => (r.ok ? r.json() : []))
      .then((ids) => { if (Array.isArray(ids)) setRatedIds(ids); })
      .catch(() => {});
  }, [refreshTick]);

  /* תמונת פרופיל של המשתמש המחובר */
  useEffect(() => {
    getMe()
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => {
        if (u) {
          setAvatarPic(u.profilePicture || "");
          localStorage.setItem("profilePicture", u.profilePicture || "");
          if (u.email) { setUserEmail(u.email); localStorage.setItem("email", u.email); }
        }
      })
      .catch(() => {});
  }, [refreshTick]);

  /* התלונות של הלקוח + הסטטוס שלהן (מתעדכן אוטומטית) */
  useEffect(() => {
    getMyComplaints()
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => { if (Array.isArray(list)) setMyComplaints(list); })
      .catch(() => {});
  }, [refreshTick]);

  const activeOrders = orders;

  const STATUS_MAP = {
    pending:     { label: t("cd_pending"),     color: "#F59E0B", bg: "rgba(245,158,11,0.1)"  },
    confirmed:   { label: t("cd_confirmed"),   color: "#3B82F6", bg: "rgba(59,130,246,0.1)"  },
    in_progress: { label: t("cd_in_progress"), color: "#10B981", bg: "rgba(16,185,129,0.1)"  },
    completed:   { label: t("cd_completed"),   color: "#6B7280", bg: "rgba(107,114,128,0.1)" },
  };

  /* ── עריכת הזמנה ── */
  const openEdit = (order) => {
    setEditOrder(order);
    setEditDate(order.date);
    setEditTime(order.time);
    setEditAddr(order.address || "");
    setEditDesc(order.description);

    // שולפים את שעות העבודה של בעל המקצוע כדי להציג ללקוח מה זמין
    setEditProHours(null);
    if (order.proId) {
      apiFetch("/api/pros/" + order.proId + "/availability")
        .then((r) => (r.ok ? r.json() : null))
        .then((slots) => setEditProHours(summarizeHours(slots, isHe)))
        .catch(() => setEditProHours(null));
    }
  };

  const saveEdit = () => {
    const order = editOrder;
    if (!order.bookingId) {
      showToast(isHe ? "שגיאה: חסר מזהה הזמנה. רענני את הדף ונסי שוב." : "Error: missing booking id. Hard-refresh and try again.", "error");
      return;
    }
    // מאחדים תאריך + שעה ל-LocalDateTime בפורמט ISO
    const scheduledAt = editDate ? (editDate + "T" + (editTime || "00:00") + ":00") : null;
    setEditSaving(true);
    updateBooking(order.bookingId, { scheduledAt, address: editAddr.trim(), notes: editDesc })
      .then((r) => {
        if (r.ok) {
          setOrders(prev => prev.map(o => o.id === order.id
            ? { ...o, date: editDate, time: editTime, address: editAddr.trim(), description: editDesc }
            : o));
          setEditOrder(null);
          showToast(isHe ? "ההזמנה עודכנה בהצלחה" : "Order updated successfully", "success");
        } else {
          // השרת מחזיר JSON עם שדה error (למשל "בעל המקצוע לא עובד במועד שבחרת")
          r.json()
            .then((data) => showToast(data.error || (isHe ? "העדכון נכשל" : "Update failed"), "error"))
            .catch(() => showToast((isHe ? "העדכון נכשל (קוד " : "Update failed (code ") + r.status + ")", "error"));
        }
      })
      .catch((e) => showToast((isHe ? "שגיאת רשת: " : "Network error: ") + e.message, "error"))
      .finally(() => setEditSaving(false));
  };

  /* ── תלונה ── */
  const openComplaint = (order) => {
    setCompSubject("");
    setCompDesc("");
    setCompOrderId(order && order.bookingId ? String(order.bookingId) : "");
    setShowComplaint(true);
  };

  const submitComplaint = () => {
    if (!compSubject.trim() || !compDesc.trim()) {
      showToast(isHe ? "יש למלא נושא ותיאור" : "Please fill subject and description", "error");
      return;
    }
    const body = { subject: compSubject.trim(), description: compDesc.trim() };
    if (compOrderId) body.bookingId = Number(compOrderId);
    setCompSaving(true);
    createComplaint(body)
      .then((r) => {
        if (r.ok) {
          setShowComplaint(false);
          showToast(isHe ? "התלונה נשלחה בהצלחה. הצוות יטפל בה." : "Complaint submitted. Our team will handle it.", "success");
        } else {
          r.text().then((msg) => showToast((isHe ? "שליחה נכשלה: " : "Submit failed: ") + (msg || ("קוד " + r.status)), "error"));
        }
      })
      .catch((e) => showToast((isHe ? "שגיאת רשת: " : "Network error: ") + e.message, "error"))
      .finally(() => setCompSaving(false));
  };

  /* ── ביטול הזמנה ומדיניות הקנס ── */
  const getHoursUntilOrder = (order) => {
    const d = new Date(`${order.date} ${order.time}`);
    return Math.max(0, Math.round((d - new Date()) / 36e5));
  };
  const isWithin48Hours = (order) => getHoursUntilOrder(order) < 48;
  const isGracePeriod = (order) => {
    if (!order.createdAt) return false;
    return (Date.now() - new Date(order.createdAt).getTime()) < GRACE_MINUTES * 60 * 1000;
  };
  // קנס נגבה רק אם הפגישה בתוך 48 שעות וגם עברה תקופת החסד מההזמנה
  const chargesFee = (order) => isWithin48Hours(order) && !isGracePeriod(order);

  const confirmCancel = () => {
    const order = cancelConfirm;
    if (!order.bookingId) {
      showToast(isHe ? "שגיאה: חסר מזהה הזמנה. רענני את הדף ונסי שוב." : "Error: missing booking id. Hard-refresh and try again.", "error");
      return;
    }
    cancelBooking(order.bookingId, cancelReason.trim() || null)
      .then((r) => {
        if (r.ok) {
          setOrders(prev => prev.filter(o => o.id !== order.id)); // הוסר מהתצוגה רק אם השרת אישר
          setCancelConfirm(null); setCancelReason("");
          showToast(isHe ? "ההזמנה בוטלה" : "Order cancelled", "success");
        } else {
          showToast((isHe ? "ביטול נכשל (קוד " : "Cancel failed (code ") + r.status + ")", "error");
        }
      })
      .catch((e) => { showToast((isHe ? "שגיאת רשת: " : "Network error: ") + e.message, "error"); });
  };

  /* ── התראות ── */
  const unreadCount = notifications.filter(n => !n.read).length;
  const markAsRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const clearNotification = (id) => setNotifications(prev => prev.filter(n => n.id !== id));

  /* ── שלבי מעקב אחר הזמנה ── */
  const getProgressSteps = (order) => [
    { label: t("cd_order_placed"), done: true,                           time: "Feb 17, 10:30 AM" },
    { label: t("cd_pro_assigned"), done: true,                           time: "Feb 17, 11:00 AM" },
    { label: t("cd_pro_on_way"),   done: order.status === "in_progress", time: order.status === "in_progress" ? "Feb 18, 1:45 PM" : "" },
    { label: t("cd_work_started"), done: false,                          time: "" },
    { label: t("cd_job_completed"),done: false,                          time: "" },
  ];

  return {
    mounted,
    userName, avatarPic, userEmail,
    orders, activeOrders,
    showNotif, setShowNotif,
    showProfile, setShowProfile,
    notifications, unreadCount, markAsRead, markAllRead, clearNotification,
    ratedIds, myComplaints,
    showAllOrders, setShowAllOrders,
    showAllComplaints, setShowAllComplaints,
    STATUS_MAP,

    /* עריכה */
    editOrder, setEditOrder, openEdit, saveEdit, editSaving, editProHours,
    editDate, setEditDate, editTime, setEditTime,
    editAddr, setEditAddr, editDesc, setEditDesc,

    /* מעקב */
    trackOrder, setTrackOrder, getProgressSteps,

    /* ביטול */
    cancelConfirm, setCancelConfirm, cancelReason, setCancelReason,
    confirmCancel, chargesFee, getHoursUntilOrder, CANCEL_FEE,

    /* תלונה */
    showComplaint, setShowComplaint, openComplaint, submitComplaint, compSaving,
    compSubject, setCompSubject, compDesc, setCompDesc, compOrderId, setCompOrderId,

    /* toast */
    toast, showToast,
  };
}
