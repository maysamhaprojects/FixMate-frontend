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
import "../styles/pro.css";

/* אייקונים מיובאים מ-components/ProIcons.jsx | העיצוב ב-styles/pro.css */

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
    notifications, unreadCount, markAllRead, markRead,
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
    <div className="pro-stars">
      {[1, 2, 3, 4, 5].map(i => (
        <IconStar key={i} filled={i <= rating} />
      ))}
    </div>
  );

  return (
    <div className="pro-page" style={{
      fontFamily: isHe ? "'Heebo','DM Sans','Inter',sans-serif" : "'DM Sans','Inter',sans-serif",
      direction:  dir,
      textAlign:  dir === "rtl" ? "right" : "left",
      opacity:    mounted ? 1 : 0,
    }}>

      {/* ══════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════ */}
      <nav className="pro-nav">
        <div className="dash-nav-inner">

          {/* לוגו */}
          <div className="pro-logo">
            <div className="pro-logo-badge"><IconWrench /></div>
            <span className="pro-logo-text">
              Fix<b>Mate</b> <span className="pro-logo-tag">Pro</span>
            </span>
          </div>

          {/* לשוניות */}
          <div className="pro-tabs">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={"tab-btn" + (activeTab === tab.id ? " active" : "")}
                onClick={() => {
                  if      (tab.id === "profile")      navigate("/pro/profile");
                  else if (tab.id === "orders")       navigate("/pro/orders");
                  else if (tab.id === "availability") navigate("/pro/availability");
                  else setActiveTab(tab.id);
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* צד ימין: התראות + אווטאר + יציאה */}
          <div className="pro-nav-right">

            {/* פעמון התראות */}
            <div className="pro-bell-wrap">
              <button className="pro-icon-btn pro-bell-btn" onClick={() => setShowNotif(!showNotif)}>
                <IconBell />
                {unreadCount > 0 && <span className="pro-badge">{unreadCount}</span>}
              </button>

              {/* Dropdown התראות */}
              {showNotif && (
                <>
                  <div className="pro-notif-backdrop" onClick={() => setShowNotif(false)} />
                  <div className="pro-notif-panel" style={{ direction: dir, textAlign: dir === "rtl" ? "right" : "left" }}>
                    <div className="pro-notif-head">
                      <span className="pro-notif-title">{t("pro_notifications")}</span>
                      {unreadCount > 0 && (
                        <button className="pro-notif-markall" onClick={markAllRead}>{t("pro_mark_all")}</button>
                      )}
                    </div>
                    <div className="pro-notif-list">
                      {notifications.length === 0 && (
                        <div className="pro-notif-empty">
                          {isHe ? "אין התראות חדשות" : "No new notifications"}
                        </div>
                      )}
                      {notifications.map(n => (
                        <div
                          key={n.id}
                          className={"pro-notif-item" + (n.read ? "" : " unread")}
                          onClick={() => markRead(n.id)}
                        >
                          <div className="pro-notif-ico" style={{ background: n.bg, color: n.color }}>
                            {n.iconType === "rating" ? (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                            ) : n.iconType === "cancelled" ? (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                            ) : (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="15" x2="15" y2="15" /></svg>
                            )}
                          </div>
                          <div className="pro-notif-body">
                            <p className={"pro-notif-text" + (n.read ? "" : " unread")}>{L(n.text)}</p>
                            <span className="pro-notif-time">{L(n.time)}</span>
                          </div>
                          {!n.read && <div className="pro-notif-dot" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* אווטאר */}
            <div className="pro-avatar">
              {me.profilePicture ? <img src={me.profilePicture} alt="" /> : (me.avatar || PRO_INFO.avatar)}
            </div>

            {/* יציאה */}
            <button className="pro-icon-btn" onClick={() => navigate("/login")}>
              <IconLogout />
            </button>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════ */}
      <main className="dash-main">

        {/* כותרת */}
        <div className="pro-head">
          <h1 className="pro-h1">{t("pro_greeting")} {me.name || L(PRO_INFO.name)}</h1>
          <p className="pro-sub">{t("pro_overview")}</p>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="dash-stats">

          {/* הזמנות חדשות */}
          <div className="stat-card" onClick={() => navigate("/pro/orders")}>
            <div className="stat-top">
              <div className="stat-ico stat-ico--blue"><IconInbox /></div>
              {stats.newOrders > 0 && (
                <span className="stat-new-tag">{isHe ? "חדש" : "new"}</span>
              )}
            </div>
            <p className="stat-num">{stats.newOrders}</p>
            <p className="stat-label">{t("pro_new_orders")}</p>
          </div>

          {/* הזמנות היום */}
          <div className="stat-card" onClick={() => scrollTo("today-schedule")}>
            <div className="stat-top">
              <div className="stat-ico stat-ico--green"><IconCalendar /></div>
            </div>
            <p className="stat-num">{stats.todayOrders}</p>
            <p className="stat-label">{t("pro_today_orders")}</p>
          </div>

          {/* הכנסה שבועית */}
          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-ico stat-ico--amber"><IconDollar /></div>
            </div>
            <p className="stat-num">₪{Number(stats.weeklyIncome).toLocaleString()}</p>
            <p className="stat-label">{t("pro_weekly_income")}</p>
          </div>

          {/* דירוג ממוצע */}
          <div className="stat-card" onClick={() => scrollTo("latest-reviews")}>
            <div className="stat-top">
              <div className="stat-ico stat-ico--orange"><IconStar filled={true} /></div>
            </div>
            <div className="stat-rating-row">
              <p className="stat-num">{stats.totalRatings > 0 ? Number(stats.rating).toFixed(1) : "—"}</p>
              <span className="stat-of">/ 5.0</span>
            </div>
            <p className="stat-label">{t("pro_avg_rating")}</p>
          </div>
        </div>

        {/* ── ALERT BANNER ── */}
        <div className="dash-alert">
          <div className="alert-left">
            <div className="alert-ico">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
            </div>
            <div>
              <p className="alert-title">{stats.newOrders} {t("pro_alert_title")}</p>
              <p className="alert-sub">{t("pro_alert_sub")}</p>
            </div>
          </div>
          {/* 🚩 BACKEND: כפתור זה מנווט למסך ניהול הזמנות /pro/orders — ודאי שה-route מוגדר ב-App.jsx */}
          <button className="hb alert-btn" onClick={() => navigate("/pro/orders")}>
            {t("pro_view_orders")}
          </button>
        </div>

        {/* ── TWO COLUMNS ── */}
        <div className="dash-cols">

          {/* ════════════════════════════════
              עמודה שמאל: ביקורות אחרונות
              🚩 BACKEND: GET /api/pro/reviews?limit=5
          ════════════════════════════════ */}
          <div id="latest-reviews">

            {/* כותרת הסקשן */}
            <div className="pro-sec-head">
              <h2 className="pro-sec-title">
                {isHe ? "ביקורות אחרונות" : "Latest Reviews"}
              </h2>
              {/* סיכום ציון — מוצג רק כשיש ביקורות */}
              {stats.totalRatings > 0 ? (
                <div className="pro-rating-pill">
                  <IconStar filled={true} />
                  <span className="pro-rating-val">{Number(stats.rating).toFixed(1)}</span>
                  <span className="pro-rating-count">({reviews.length} {isHe ? "ביקורות" : "reviews"})</span>
                </div>
              ) : (
                <span className="pro-noreviews-pill">
                  {isHe ? "אין ביקורות עדיין" : "No reviews yet"}
                </span>
              )}
            </div>

            {/* רשימת ביקורות */}
            <div className="pro-review-list">
              {reviews.length === 0 && (
                <div className="pro-empty-card">
                  {isHe ? "עדיין אין ביקורות" : "No reviews yet"}
                </div>
              )}
              {reviews.map((review) => {
                const isExpanded = expandedReview === review.id;
                const comment    = L(review.comment);
                const shortComment = comment.length > 100 ? comment.slice(0, 100) + "..." : comment;

                return (
                  <div key={review.id} className="review-card">
                    {/* שורת פרופיל + דירוג */}
                    <div className="rev-head">
                      <div className="rev-who">
                        {/* אווטאר ראשית שם */}
                        <div className="rev-avatar">{L(review.clientName).charAt(0)}</div>
                        <div>
                          <p className="rev-name">{L(review.clientName)}</p>
                          <p className="rev-service">{L(review.service)}</p>
                        </div>
                      </div>
                      {/* כוכבים + תאריך */}
                      <div style={{ textAlign: dir === "rtl" ? "left" : "right" }}>
                        <StarRating rating={review.rating} />
                        <p className="rev-date">{L(review.date)}</p>
                      </div>
                    </div>

                    {/* גרשיים דקורטיביות */}
                    <div className="rev-quote"><IconQuote /></div>

                    {/* טקסט הביקורת */}
                    <p className="rev-text">{isExpanded ? comment : shortComment}</p>

                    {/* כפתור הצג עוד / פחות (רק אם הטקסט ארוך) */}
                    {comment.length > 100 && (
                      <button className="rev-more" onClick={() => setExpandedReview(isExpanded ? null : review.id)}>
                        {isExpanded
                          ? (isHe ? "הצג פחות ↑" : "Show less ↑")
                          : (isHe ? "קרא עוד ↓"  : "Read more ↓")}
                      </button>
                    )}

                    {/* מזהה הזמנה */}
                    <div className="rev-foot">
                      <span className="rev-id">{review.orderId}</span>
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
            <div className="pro-sec-head">
              <h2 className="pro-sec-title">{t("pro_today_schedule")}</h2>
              <span className="pro-sec-date">
                {new Date().toLocaleDateString(isHe ? "he-IL" : "en-US", { weekday: "long", month: "short", day: "numeric" })}
              </span>
            </div>

            {/* שורות לוח זמנים */}
            <div className="pro-sch-card">
              {schedule.length === 0 && (
                <div className="pro-empty-row">
                  {isHe ? "אין הזמנות מתוזמנות להיום" : "No appointments scheduled for today"}
                </div>
              )}
              {schedule.map((item, i) => {
                const st = statusColors[item.status];
                return (
                  <div key={i} className="sch-row">
                    {/* שעה */}
                    <div className="sch-time"><span>{item.time}</span></div>

                    {/* קו צבעוני */}
                    <div className="sch-bar" style={{ background: st.color }} />

                    {/* פרטים */}
                    <div className="sch-body">
                      <div className="sch-line1">
                        <p className="sch-client">{L(item.client)}</p>
                        <span className="sch-pill" style={{ color: st.color, background: st.bg }}>{st.label}</span>
                      </div>
                      <p className="sch-service">{L(item.service)}</p>
                      <div className="sch-meta">
                        <span className="sch-loc"><IconMapPin /> {L(item.location)}</span>
                      </div>
                    </div>

                    {/* כפתור חיוג */}
                    <button className="sch-call" onClick={() => window.open(`tel:${item.phone}`)}>
                      <IconPhone />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* סיכום סטטוסים */}
            <div className="pro-sum-card">
              <div className="pro-sum-col">
                <p className="pro-sum-num pro-sum-num--green">
                  {schedule.filter(s => s.status === "completed").length}
                </p>
                <p className="pro-sum-label">{t("pro_completed")}</p>
              </div>
              <div className="pro-sum-div" />
              <div className="pro-sum-col">
                <p className="pro-sum-num pro-sum-num--amber">
                  {schedule.filter(s => s.status === "in_progress").length}
                </p>
                <p className="pro-sum-label">{t("pro_in_progress")}</p>
              </div>
              <div className="pro-sum-div" />
              <div className="pro-sum-col">
                <p className="pro-sum-num pro-sum-num--blue">
                  {schedule.filter(s => s.status === "upcoming").length}
                </p>
                <p className="pro-sum-label">{t("pro_upcoming")}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}