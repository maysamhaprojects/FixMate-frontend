/**
 * =============================================
 *  FixMate – Professional Dashboard
 * =============================================
 *  ROUTE: /pro/dashboard
 *  FILE:  src/pages/ProDashboard.jsx
 *
 *  מה יש כאן:
 *  - Navbar עם לשוניות ניווט + התראות + יציאה
 *  - 4 כרטיסי סטטיסטיקה (הזמנות חדשות, היום, הכנסה שבועית, דירוג)
 *  - Alert Banner כשיש הזמנות ממתינות
 *  - עמודה שמאל: ביקורות אחרונות (במקום New Orders)
 *  - עמודה ימין: לוח זמנים היומי
 *
 *  🚩 BACKEND NOTE:
 *     - כרטיסי סטטיסטיקה ← GET /api/pro/stats
 *     - ביקורות אחרונות   ← GET /api/pro/reviews?limit=5
 *     - לוח זמנים         ← GET /api/pro/schedule?date=today
 *     - התראות            ← GET /api/pro/notifications
 * =============================================
 */

import { useNavigate } from "react-router-dom";
import { translate, getLang, getDir } from "../context/LanguageContext";
import { useProData } from "../hooks/useProData";
import { IconBell, IconLogout, IconWrench, IconStar, IconPhone, IconCalendar, IconDollar, IconInbox, IconMapPin, IconQuote } from "../components/ProIcons";

/* אייקונים מיובאים מ-components/ProIcons.jsx */

/* ─────────────────────────────────────────
   Mock Data
   🚩 BACKEND: להחליף עם קריאות API אמיתיות
───────────────────────────────────────── */
const PRO_INFO = {
  name:   { en: "David Mizrahi", he: "דוד מזרחי" },
  role:   { en: "Electrician",   he: "חשמלאי"    },
  avatar: "D",
  rating: 4.8,
};

/* ─────────────────────────────────────────
   Component
───────────────────────────────────────── */
export default function ProDashboard() {
  const navigate = useNavigate();

  /* helpers לדו-לשוניות */
  const t    = translate;
  const dir  = getDir();
  const lang = getLang();
  const isHe = lang === "he";

  /* מחזיר את הטקסט בשפה הנכונה */
  const L = (obj) =>
    obj && typeof obj === "object" && obj[lang]
      ? obj[lang]
      : typeof obj === "string"
      ? obj
      : obj?.en ?? "";

  /* ── כל הלוגיקה מגיעה מ-hooks/useProData.js ── */
  const {
    mounted,
    activeTab, setActiveTab,
    showNotif, setShowNotif,
    notifications, unreadCount, markAllRead,
    expandedReview, setExpandedReview,
    me, stats, reviews, schedule,
    scrollTo,
  } = useProData();

  /* לשוניות ניווט */
  const TABS = [
    { id: "dashboard",    label: t("pro_tab_dashboard")    },
    { id: "orders",       label: t("pro_tab_orders")       },
    { id: "availability", label: isHe ? "ניהול זמינות" : "Availability" },
    { id: "profile",      label: t("pro_tab_profile")      },
  ];

  /* צבעי סטטוס ללוח זמנים */
  const statusColors = {
    completed:   { label: t("pro_completed"),   color: "#6B7280", bg: "#F3F4F6" },
    in_progress: { label: t("pro_in_progress"), color: "#10B981", bg: "#ECFDF5" },
    upcoming:    { label: t("pro_upcoming"),     color: "#3B82F6", bg: "#EFF6FF" },
  };

  /* רכיב כוכבי דירוג */
  const StarRating = ({ rating }) => (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <IconStar key={i} filled={i <= rating} />
      ))}
    </div>
  );

  return (
    <div style={{
      fontFamily:  isHe ? "'Heebo','DM Sans','Inter',sans-serif" : "'DM Sans','Inter',sans-serif",
      background:  "#F5F7FB",
      minHeight:   "100vh",
      direction:   dir,
      textAlign:   dir === "rtl" ? "right" : "left",
      opacity:     mounted ? 1 : 0,
      transition:  "opacity .4s",
    }}>

      {/* ── Global Styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800&family=Heebo:wght@400;500;600;700;800&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        /* כרטיסי סטטיסטיקה */
        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,.08) !important; }

        /* כרטיסי ביקורת */
        .review-card { transition: all .25s ease; }
        .review-card:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,.08) !important; }

        /* לשוניות */
        .tab-btn:hover { background: rgba(37,99,235,.06) !important; }

        /* שורות לוח זמנים */
        .sch-row:hover { background: #F8FAFF !important; }

        /* כפתורים */
        .hb:hover:not(:disabled) { filter: brightness(1.06); transform: translateY(-1px); }

        * { box-sizing: border-box; margin: 0; }

        /* Responsive */
        @media (max-width: 768px) {
          .dash-nav-inner { flex-wrap: wrap; gap: 10px; padding: 10px 16px !important; }
          .dash-nav-inner > div:nth-child(2) { order: 3; width: 100%; justify-content: center; }
          .dash-main  { padding: 20px 16px 40px !important; }
          .dash-stats { grid-template-columns: 1fr 1fr !important; }
          .dash-cols  { grid-template-columns: 1fr !important; }
          .dash-alert { flex-direction: column; text-align: center; }
        }
        @media (max-width: 480px) {
          .dash-stats { grid-template-columns: 1fr !important; }
        }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 3px; }
      `}</style>

      {/* ══════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════ */}
      <nav style={{
        background:    "#FFF",
        borderBottom:  "1px solid #E5E7EB",
        boxShadow:     "0 1px 8px rgba(0,0,0,.04)",
        position:      "sticky",
        top:           0,
        zIndex:        100,
      }}>
        <div className="dash-nav-inner" style={{
          maxWidth:       1200,
          margin:         "0 auto",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          padding:        "12px 24px",
          direction:      "ltr", /* הניווט תמיד LTR */
        }}>

          {/* לוגו */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#2563EB,#1D4ED8)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF" }}>
              <IconWrench />
            </div>
            <span style={{ fontFamily: "'Outfit'", fontSize: 20, fontWeight: 800, color: "#1A2B4A" }}>
              Fix<span style={{ color: "#2563EB" }}>Mate</span>{" "}
              <span style={{ fontSize: 13, fontWeight: 500, color: "#94A3B8" }}>Pro</span>
            </span>
          </div>

          {/* לשוניות */}
          <div style={{ display: "flex", gap: 4 }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                className="tab-btn"
                onClick={() => {
                  if      (tab.id === "profile")      navigate("/pro/profile");
                  else if (tab.id === "orders")       navigate("/pro/orders");
                  else if (tab.id === "availability") navigate("/pro/availability");
                  else setActiveTab(tab.id);
                }}
                style={{
                  padding:     "10px 18px",
                  borderRadius: 10,
                  border:      "none",
                  background:  activeTab === tab.id ? "#2563EB" : "transparent",
                  color:       activeTab === tab.id ? "#FFF"    : "#64748B",
                  fontSize:    14,
                  fontWeight:  600,
                  cursor:      "pointer",
                  transition:  "all .2s",
                  fontFamily:  "'DM Sans'",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* צד ימין: התראות + אווטאר + יציאה */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, direction: "ltr" }}>

            {/* פעמון התראות */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowNotif(!showNotif)}
                style={{ position: "relative", width: 40, height: 40, borderRadius: 10, border: "1px solid #E5E7EB", background: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748B" }}
              >
                <IconBell />
                {unreadCount > 0 && (
                  <span style={{ position: "absolute", top: 4, right: 4, minWidth: 18, height: 18, borderRadius: 9, background: "#EF4444", color: "#FFF", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown התראות */}
              {showNotif && (
                <>
                  <div onClick={() => setShowNotif(false)} style={{ position: "fixed", inset: 0, zIndex: 150 }} />
                  <div style={{ position: "absolute", top: 48, right: 0, width: 360, background: "#FFF", borderRadius: 18, border: "1px solid #E8ECF4", boxShadow: "0 12px 40px rgba(0,0,0,.12)", zIndex: 200, overflow: "hidden", animation: "slideDown .2s", direction: dir, textAlign: dir === "rtl" ? "right" : "left" }}>
                    <div style={{ padding: "16px 20px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 700, fontSize: 16, color: "#1A2B4A", fontFamily: "'Outfit'" }}>{t("pro_notifications")}</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} style={{ border: "none", background: "none", color: "#2563EB", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                          {t("pro_mark_all")}
                        </button>
                      )}
                    </div>
                    <div style={{ maxHeight: 360, overflowY: "auto" }}>
                      {notifications.length === 0 && (
                        <div style={{ padding: "32px 20px", textAlign: "center", color: "#94A3B8", fontSize: 14 }}>
                          {isHe ? "אין התראות חדשות" : "No new notifications"}
                        </div>
                      )}
                      {notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                          style={{ padding: "14px 20px", borderBottom: "1px solid #F8FAFC", background: n.read ? "#FFF" : "#F0F4FF", cursor: "pointer", display: "flex", gap: 12, alignItems: "flex-start", transition: "background .2s" }}
                        >
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: n.bg, color: n.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {n.iconType === "rating" ? (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                            ) : n.iconType === "cancelled" ? (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                            ) : (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="15" x2="15" y2="15" /></svg>
                            )}
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 13, color: "#1A2B4A", lineHeight: 1.5, marginBottom: 4, fontWeight: n.read ? 400 : 600 }}>{L(n.text)}</p>
                            <span style={{ fontSize: 11, color: "#94A3B8" }}>{L(n.time)}</span>
                          </div>
                          {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2563EB", flexShrink: 0, marginTop: 6 }} />}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* אווטאר */}
            <div style={{ width: 40, height: 40, borderRadius: 12, overflow: "hidden", background: "linear-gradient(135deg,#2563EB,#1D4ED8)", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16 }}>
              {me.profilePicture ? <img src={me.profilePicture} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (me.avatar || PRO_INFO.avatar)}
            </div>

            {/* יציאה */}
            <button onClick={() => navigate("/login")} style={{ width: 40, height: 40, borderRadius: 10, border: "1px solid #E5E7EB", background: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748B" }}>
              <IconLogout />
            </button>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════ */}
      <main className="dash-main" style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px 60px" }}>

        {/* כותרת */}
        <div style={{ marginBottom: 28, animation: "fadeUp .4s" }}>
          <h1 style={{ fontFamily: "'Outfit'", fontSize: 28, fontWeight: 800, color: "#1A2B4A", marginBottom: 4 }}>
            {t("pro_greeting")} {me.name || L(PRO_INFO.name)}
          </h1>
          <p style={{ fontSize: 15, color: "#94A3B8" }}>{t("pro_overview")}</p>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="dash-stats" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 28 }}>

          {/* הזמנות חדשות */}
          <div className="stat-card" onClick={() => navigate("/pro/orders")} style={{ background: "#FFF", borderRadius: 18, padding: "24px 20px", border: "1px solid #E8ECF4", boxShadow: "0 2px 12px rgba(0,0,0,.03)", transition: "all .3s", animation: "fadeUp .4s", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563EB" }}><IconInbox /></div>
              {stats.newOrders > 0 && (
                <span style={{ fontSize: 12, fontWeight: 600, color: "#10B981", background: "#ECFDF5", padding: "4px 10px", borderRadius: 20 }}>{isHe ? "חדש" : "new"}</span>
              )}
            </div>
            <p style={{ fontSize: 32, fontWeight: 800, fontFamily: "'Outfit'", color: "#1A2B4A", marginBottom: 4 }}>{stats.newOrders}</p>
            <p style={{ fontSize: 13, color: "#94A3B8", fontWeight: 500 }}>{t("pro_new_orders")}</p>
          </div>

          {/* הזמנות היום */}
          <div className="stat-card" onClick={() => scrollTo("today-schedule")} style={{ background: "#FFF", borderRadius: 18, padding: "24px 20px", border: "1px solid #E8ECF4", boxShadow: "0 2px 12px rgba(0,0,0,.03)", transition: "all .3s", animation: "fadeUp .45s", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", color: "#10B981" }}><IconCalendar /></div>
            </div>
            <p style={{ fontSize: 32, fontWeight: 800, fontFamily: "'Outfit'", color: "#1A2B4A", marginBottom: 4 }}>{stats.todayOrders}</p>
            <p style={{ fontSize: 13, color: "#94A3B8", fontWeight: 500 }}>{t("pro_today_orders")}</p>
          </div>

          {/* הכנסה שבועית */}
          <div className="stat-card" style={{ background: "#FFF", borderRadius: 18, padding: "24px 20px", border: "1px solid #E8ECF4", boxShadow: "0 2px 12px rgba(0,0,0,.03)", transition: "all .3s", animation: "fadeUp .5s", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", color: "#F59E0B" }}><IconDollar /></div>
            </div>
            <p style={{ fontSize: 32, fontWeight: 800, fontFamily: "'Outfit'", color: "#1A2B4A", marginBottom: 4 }}>₪{Number(stats.weeklyIncome).toLocaleString()}</p>
            <p style={{ fontSize: 13, color: "#94A3B8", fontWeight: 500 }}>{t("pro_weekly_income")}</p>
          </div>

          {/* דירוג ממוצע */}
          <div className="stat-card" onClick={() => scrollTo("latest-reviews")} style={{ background: "#FFF", borderRadius: 18, padding: "24px 20px", border: "1px solid #E8ECF4", boxShadow: "0 2px 12px rgba(0,0,0,.03)", transition: "all .3s", animation: "fadeUp .55s", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#FFF7ED", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <IconStar filled={true} />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <p style={{ fontSize: 32, fontWeight: 800, fontFamily: "'Outfit'", color: "#1A2B4A" }}>{stats.totalRatings > 0 ? Number(stats.rating).toFixed(1) : (isHe ? "—" : "—")}</p>
              <span style={{ fontSize: 14, color: "#94A3B8" }}>/ 5.0</span>
            </div>
            <p style={{ fontSize: 13, color: "#94A3B8", fontWeight: 500 }}>{t("pro_avg_rating")}</p>
          </div>
        </div>

        {/* ── ALERT BANNER ── */}
        <div className="dash-alert" style={{ background: "linear-gradient(135deg,#2563EB 0%,#1D4ED8 100%)", borderRadius: 18, padding: "22px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, animation: "fadeUp .5s", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
            </div>
            <div>
              <p style={{ fontSize: 17, fontWeight: 700, color: "#FFF", marginBottom: 4 }}>{stats.newOrders} {t("pro_alert_title")}</p>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,.75)" }}>{t("pro_alert_sub")}</p>
            </div>
          </div>
          {/* 🚩 BACKEND: כפתור זה מנווט למסך ניהול הזמנות /pro/orders — ודאי שה-route מוגדר ב-App.jsx */}
          <button className="hb" onClick={() => navigate("/pro/orders")} style={{ padding: "12px 24px", borderRadius: 12, border: "2px solid rgba(255,255,255,.3)", background: "rgba(255,255,255,.15)", color: "#FFF", fontSize: 14, fontWeight: 700, cursor: "pointer", backdropFilter: "blur(4px)", transition: "all .2s" }}>
            {t("pro_view_orders")}
          </button>
        </div>

        {/* ── TWO COLUMNS ── */}
        <div className="dash-cols" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, animation: "fadeUp .55s" }}>

          {/* ════════════════════════════════
              עמודה שמאל: ביקורות אחרונות
              🚩 BACKEND: GET /api/pro/reviews?limit=5
          ════════════════════════════════ */}
          <div id="latest-reviews">

            {/* כותרת הסקשן */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontFamily: "'Outfit'", fontSize: 20, fontWeight: 700, color: "#1A2B4A" }}>
                {isHe ? "ביקורות אחרונות" : "Latest Reviews"}
              </h2>
              {/* סיכום ציון — מוצג רק כשיש ביקורות */}
              {stats.totalRatings > 0 ? (
                <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#FFF7ED", border: "1px solid #FDE68A", borderRadius: 20, padding: "6px 14px" }}>
                  <IconStar filled={true} />
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#92400E" }}>{Number(stats.rating).toFixed(1)}</span>
                  <span style={{ fontSize: 12, color: "#B45309" }}>({reviews.length} {isHe ? "ביקורות" : "reviews"})</span>
                </div>
              ) : (
                <span style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", background: "#F1F5F9", borderRadius: 20, padding: "6px 14px" }}>
                  {isHe ? "אין ביקורות עדיין" : "No reviews yet"}
                </span>
              )}
            </div>

            {/* רשימת ביקורות */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {reviews.length === 0 && (
                <div style={{ background: "#FFF", borderRadius: 18, padding: "32px 20px", border: "1px dashed #E8ECF4", textAlign: "center", color: "#94A3B8", fontSize: 14 }}>
                  {isHe ? "עדיין אין ביקורות" : "No reviews yet"}
                </div>
              )}
              {reviews.map((review) => {
                const isExpanded = expandedReview === review.id;
                const comment    = L(review.comment);
                const shortComment = comment.length > 100 ? comment.slice(0, 100) + "..." : comment;

                return (
                  <div
                    key={review.id}
                    className="review-card"
                    style={{ background: "#FFF", borderRadius: 18, padding: "20px", border: "1px solid #E8ECF4", boxShadow: "0 2px 12px rgba(0,0,0,.03)" }}
                  >
                    {/* שורת פרופיל + דירוג */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {/* אווטאר ראשית שם */}
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#EEF2FF,#DBEAFE)", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                          {L(review.clientName).charAt(0)}
                        </div>
                        <div>
                          <p style={{ fontSize: 15, fontWeight: 700, color: "#1A2B4A", marginBottom: 2 }}>{L(review.clientName)}</p>
                          <p style={{ fontSize: 12, color: "#94A3B8" }}>{L(review.service)}</p>
                        </div>
                      </div>
                      {/* כוכבים + תאריך */}
                      <div style={{ textAlign: dir === "rtl" ? "left" : "right" }}>
                        <StarRating rating={review.rating} />
                        <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>{L(review.date)}</p>
                      </div>
                    </div>

                    {/* גרשיים דקורטיביות */}
                    <div style={{ color: "#DBEAFE", marginBottom: 6 }}>
                      <IconQuote />
                    </div>

                    {/* טקסט הביקורת */}
                    <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6, marginBottom: 10 }}>
                      {isExpanded ? comment : shortComment}
                    </p>

                    {/* כפתור הצג עוד / פחות (רק אם הטקסט ארוך) */}
                    {comment.length > 100 && (
                      <button
                        onClick={() => setExpandedReview(isExpanded ? null : review.id)}
                        style={{ border: "none", background: "none", color: "#2563EB", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0, marginBottom: 10 }}
                      >
                        {isExpanded
                          ? (isHe ? "הצג פחות ↑" : "Show less ↑")
                          : (isHe ? "קרא עוד ↓"  : "Read more ↓")}
                      </button>
                    )}

                    {/* מזהה הזמנה */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                      <span style={{ fontSize: 11, color: "#CBD5E1", background: "#F8FAFC", border: "1px solid #E8ECF4", borderRadius: 8, padding: "3px 10px" }}>
                        {review.orderId}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ════════════════════════════════
              עמודה ימין: לוח זמנים היומי
              🚩 BACKEND: GET /api/pro/schedule?date=today
          ════════════════════════════════ */}
          <div id="today-schedule">

            {/* כותרת */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontFamily: "'Outfit'", fontSize: 20, fontWeight: 700, color: "#1A2B4A" }}>
                {t("pro_today_schedule")}
              </h2>
              <span style={{ fontSize: 13, color: "#94A3B8" }}>
                {new Date().toLocaleDateString(isHe ? "he-IL" : "en-US", { weekday: "long", month: "short", day: "numeric" })}
              </span>
            </div>

            {/* שורות לוח זמנים */}
            <div style={{ background: "#FFF", borderRadius: 18, border: "1px solid #E8ECF4", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,.03)" }}>
              {schedule.length === 0 && (
                <div style={{ padding: "32px 20px", textAlign: "center", color: "#94A3B8", fontSize: 14 }}>
                  {isHe ? "אין הזמנות מתוזמנות להיום" : "No appointments scheduled for today"}
                </div>
              )}
              {schedule.map((item, i) => {
                const st = statusColors[item.status];
                return (
                  <div
                    key={i}
                    className="sch-row"
                    style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", borderBottom: i < schedule.length - 1 ? "1px solid #F1F5F9" : "none", transition: "background .2s" }}
                  >
                    {/* שעה */}
                    <div style={{ minWidth: 56, textAlign: "center" }}>
                      <span style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Outfit'", color: "#1A2B4A" }}>{item.time}</span>
                    </div>

                    {/* קו צבעוני */}
                    <div style={{ width: 3, height: 48, borderRadius: 2, background: st.color, opacity: 0.5 }} />

                    {/* פרטים */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <p style={{ fontSize: 15, fontWeight: 700, color: "#1A2B4A" }}>{L(item.client)}</p>
                        <span style={{ fontSize: 11, fontWeight: 600, color: st.color, background: st.bg, padding: "3px 10px", borderRadius: 20 }}>{st.label}</span>
                      </div>
                      <p style={{ fontSize: 13, color: "#7C8DB5" }}>{L(item.service)}</p>
                      <div style={{ display: "flex", gap: 10, marginTop: 4, fontSize: 12, color: "#94A3B8" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 3 }}><IconMapPin /> {L(item.location)}</span>
                      </div>
                    </div>

                    {/* כפתור חיוג */}
                    <button
                      onClick={() => window.open(`tel:${item.phone}`)}
                      style={{ width: 38, height: 38, borderRadius: 10, border: "1px solid #E5E7EB", background: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#2563EB", flexShrink: 0 }}
                    >
                      <IconPhone />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* סיכום סטטוסים */}
            <div style={{ marginTop: 16, background: "#FFF", borderRadius: 18, border: "1px solid #E8ECF4", padding: "20px", display: "flex", gap: 16, boxShadow: "0 2px 12px rgba(0,0,0,.03)" }}>
              <div style={{ flex: 1, textAlign: "center" }}>
                <p style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Outfit'", color: "#059669" }}>
                  {schedule.filter(s => s.status === "completed").length}
                </p>
                <p style={{ fontSize: 12, color: "#94A3B8" }}>{t("pro_completed")}</p>
              </div>
              <div style={{ width: 1, background: "#E8ECF4" }} />
              <div style={{ flex: 1, textAlign: "center" }}>
                <p style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Outfit'", color: "#F59E0B" }}>
                  {schedule.filter(s => s.status === "in_progress").length}
                </p>
                <p style={{ fontSize: 12, color: "#94A3B8" }}>{t("pro_in_progress")}</p>
              </div>
              <div style={{ width: 1, background: "#E8ECF4" }} />
              <div style={{ flex: 1, textAlign: "center" }}>
                <p style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Outfit'", color: "#3B82F6" }}>
                  {schedule.filter(s => s.status === "upcoming").length}
                </p>
                <p style={{ fontSize: 12, color: "#94A3B8" }}>{t("pro_upcoming")}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}