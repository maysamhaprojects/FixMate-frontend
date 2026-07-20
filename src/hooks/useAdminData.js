/**
 * ============================================================
 *  FixMate — הלוגיקה של דשבורד האדמין
 *  כל ה-state, קריאות השרת והפונקציות — מופרדים מהתצוגה.
 *  הקומפוננטה AdminDashboard נשארת עם המבנה (JSX) בלבד.
 *
 *  שימוש:  const admin = useAdminData(L);
 * ============================================================
 */
import { useState, useEffect, useRef } from "react";
import { getMe, updateMe } from "../services/user";
import * as adminApi from "../services/admin";
import { getAllComplaints, resolveComplaint } from "../services/complaint";

export function useAdminData(L) {
  /* ── state ── */
  const [mounted, setMounted] = useState(false);
  const [section, setSection] = useState("overview");
  const [pros, setPros] = useState([]);
  const [proError, setProError] = useState("");
  const [comps, setComps] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalPros: 0, totalOrders: 0, revenue: 0, openComplaints: 0, pendingApprovals: 0 });
  const [me, setMe] = useState({ name: localStorage.getItem("fullName") || "Admin", email: "", profilePicture: localStorage.getItem("profilePicture") || "" });
  const [rejectReason, setRejectReason] = useState("");
  const [compResponse, setCompResponse] = useState("");
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState(null);
  const toastRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

  /* רענון אוטומטי — כל 20 שניות + כשחוזרים ללשונית */
  const [refreshTick, setRefreshTick] = useState(0);
  useEffect(() => {
    const bump = () => setRefreshTick((t) => t + 1);
    const iv = setInterval(bump, 20000);
    window.addEventListener("focus", bump);
    return () => { clearInterval(iv); window.removeEventListener("focus", bump); };
  }, []);

  /* ── ממיר ProProfile מהשרת למבנה שהתצוגה מצפה לו ── */
  const normalizePro = (p) => {
    const u = p.user || {};
    const name = u.fullName || u.name || u.email || "—";
    const trade = p.specialty || "בעל מקצוע";
    const city = p.location || "—";
    const exp = (p.yearsExperience != null ? p.yearsExperience + " שנים" : "—");
    let docFiles = [];
    try { docFiles = p.documents ? JSON.parse(p.documents) : []; } catch (e) { docFiles = []; }
    return {
      id: p.id,
      name, nameHe: name,
      trade, tradeHe: trade,
      city, cityHe: city,
      email: u.email || "—",
      phone: u.phone || "—",
      docFiles,
      docs: docFiles.length,
      exp, expHe: exp,
      bio: p.bio || "",
      hourlyRate: p.hourlyRate,
      joined: u.createdAt ? String(u.createdAt).slice(0, 10) : "—",
      avatar: (name[0] || "?").toUpperCase(),
    };
  };

  /* ── בעלי מקצוע ממתינים לאישור ── */
  const loadPendingPros = async () => {
    setProError("");
    try {
      const r = await adminApi.getPendingPros();
      const raw = await r.text();
      if (!r.ok) {
        setProError("סטטוס " + r.status + " — " + raw.slice(0, 300));
        return;
      }
      let data;
      try { data = JSON.parse(raw); } catch (e) {
        setProError("התשובה אינה JSON תקין: " + raw.slice(0, 300));
        return;
      }
      const list = Array.isArray(data) ? data : (data.pros || data.content || data.data || []);
      // רשימה ריקה = אין ממתינים (תקין) — לא שגיאה
      setPros(list.map(normalizePro));
    } catch (e) {
      setProError("שגיאת חיבור לשרת: " + e.message + " (האם השרת רץ על localhost:8080?)");
    }
  };

  useEffect(() => { loadPendingPros(); }, [refreshTick]);

  /* ── משיכת כל הנתונים האמיתיים ── */
  useEffect(() => {
    getMe()
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => { if (u) { setMe({ name: u.fullName || "Admin", email: u.email || "", profilePicture: u.profilePicture || "" }); localStorage.setItem("profilePicture", u.profilePicture || ""); } })
      .catch(() => {});

    adminApi.getStats()
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => { if (s) setStats(s); })
      .catch(() => {});

    adminApi.getUsers()
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => {
        if (!Array.isArray(list)) return;
        setUsers(list.map((u) => {
          const name = u.fullName || u.email || "—";
          const role = u.role === "PROFESSIONAL" ? "pro" : u.role === "ADMIN" ? "admin" : "client";
          const roleHe = role === "pro" ? "בעל מקצוע" : role === "admin" ? "מנהל" : "לקוח";
          const roleEn = role === "pro" ? "Professional" : role === "admin" ? "Admin" : "Client";
          return {
            id: u.id, name, nameHe: name, role, roleHe, roleEnLabel: roleEn,
            email: u.email || "—", city: "—", cityHe: "—", orders: 0, rating: null,
            joined: u.joined || "—", status: u.suspended ? "suspended" : "active",
            avatar: (name[0] || "?").toUpperCase(),
          };
        }));
      })
      .catch(() => {});

    adminApi.getOrders()
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => {
        if (!Array.isArray(list)) return;
        const mapSt = (s) => s === "COMPLETED" ? "done" : s === "IN_PROGRESS" ? "in_progress" : s === "CANCELLED" ? "cancelled" : "pending";
        setOrders(list.map((o) => ({
          id: "ORD-" + o.id,
          date: (o.date || "").slice(0, 10),
          service: o.serviceType || "", serviceHe: o.serviceType || "",
          client: o.client || "", clientHe: o.client || "",
          pro: o.pro || "", proHe: o.pro || "",
          price: o.price != null ? o.price : null,  // null = טרם נקבע (מוצג רק בהזמנה שהושלמה)
          status: mapSt(o.status),
        })));
      })
      .catch(() => {});

    /* תלונות */
    getAllComplaints()
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => {
        if (!Array.isArray(list)) return;
        setComps(list.map((c) => {
          const roleEn = c.complainantRole === "PROFESSIONAL" ? "Professional" : c.complainantRole === "ADMIN" ? "Admin" : "Client";
          const roleHe = c.complainantRole === "PROFESSIONAL" ? "בעל מקצוע" : c.complainantRole === "ADMIN" ? "מנהל" : "לקוח";
          return {
            id: c.id,
            subject: c.subject || "—", subjectHe: c.subject || "—",
            description: c.description || "",
            priority: "medium",
            from: c.complainantName || "—", fromHe: c.complainantName || "—",
            email: c.complainantEmail || "",
            role: roleEn, roleHe,
            orderId: c.bookingId ? ("ORD-" + c.bookingId) : "—",
            date: (c.createdAt || "").slice(0, 10),
            adminResponse: c.adminResponse || "",
            assignedTo: null,
            status: c.status === "RESOLVED" ? "resolved" : "open",
          };
        }));
      })
      .catch(() => {});

    /* דירוגים */
    adminApi.getRatings()
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => {
        if (!Array.isArray(list)) return;
        setRatings(list.map((r) => ({
          id: r.id,
          client: r.client || "—",
          pro: r.pro || "—",
          score: r.score || 0,
          comment: r.comment || "",
          service: r.service || "",
          orderId: r.bookingId ? ("ORD-" + r.bookingId) : "—",
          date: (r.date || "").slice(0, 10),
        })));
      })
      .catch(() => {});
  }, [refreshTick]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 2800);
  };

  /* ── פעולות ── */
  const approvePro = (id) => {
    adminApi.approvePro(id)
      .then((r) => {
        if (!r.ok) throw new Error("failed");
        setPros(p => p.filter(x => x.id !== id));
        showToast(L("Pro approved ✓", "בעל מקצוע אושר ✓"));
      })
      .catch(() => showToast(L("Approval failed", "האישור נכשל"), "warning"))
      .finally(() => setModal(null));
  };

  const rejectPro = (id, reason) => {
    adminApi.rejectPro(id, reason && reason.trim() ? reason.trim() : null)
      .then((r) => {
        if (!r.ok) throw new Error("failed");
        setPros(p => p.filter(x => x.id !== id));
        showToast(L("Pro rejected", "בעל מקצוע נדחה"), "warning");
      })
      .catch(() => showToast(L("Reject failed", "הדחייה נכשלה"), "warning"))
      .finally(() => { setModal(null); setRejectReason(""); });
  };

  const resolveComp = (id, response) => {
    resolveComplaint(id, response)
      .then((r) => {
        if (!r.ok) throw new Error("failed");
        setComps(p => p.map(x => x.id === id ? { ...x, status: "resolved", adminResponse: response || x.adminResponse } : x));
        showToast(L("Complaint resolved ✓", "תלונה טופלה ✓"));
      })
      .catch(() => showToast(L("Update failed", "העדכון נכשל"), "warning"))
      .finally(() => { setModal(null); setCompResponse(""); });
  };

  const toggleUser = (id) => {
    adminApi.toggleSuspend(id)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) { showToast(L("Update failed", "העדכון נכשל"), "warning"); return; }
        setUsers(p => p.map(x => x.id === id ? { ...x, status: data.suspended ? "suspended" : "active" } : x));
        showToast(data.suspended ? L("User suspended", "המשתמש הושעה") : L("User restored", "המשתמש שוחזר"), "info");
      })
      .catch(() => showToast(L("Update failed", "העדכון נכשל"), "warning"))
      .finally(() => setModal(null));
  };

  /* העלאת תמונת פרופיל — מכווץ ל-256px ושומר מיד */
  const uploadAdminPhoto = (e) => {
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
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        updateMe({ fullName: me.name, profilePicture: dataUrl })
          .then((r) => (r.ok ? r.json() : null))
          .then((u) => {
            if (u) { setMe((m) => ({ ...m, profilePicture: u.profilePicture || "" })); localStorage.setItem("profilePicture", u.profilePicture || ""); showToast(L("Photo updated ✓", "התמונה עודכנה ✓")); }
            else showToast(L("Update failed", "העדכון נכשל"), "warning");
          })
          .catch(() => showToast(L("Update failed", "העדכון נכשל"), "warning"));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  return {
    mounted, section, setSection,
    pros, proError, loadPendingPros,
    comps, ratings, users, orders, stats, me,
    rejectReason, setRejectReason,
    compResponse, setCompResponse,
    modal, setModal,
    search, setSearch,
    filter, setFilter,
    toast,
    approvePro, rejectPro, resolveComp, toggleUser, uploadAdminPhoto,
  };
}
