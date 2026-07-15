/**
 * FixMate – Admin Dashboard
 * ROUTE: /admin
 * FILE:  src/pages/AdminDashboard.jsx
 *
 * 🚩 BACKEND:
 *  GET  /api/admin/stats
 *  GET  /api/admin/pending-pros
 *  PUT  /api/admin/pros/:id/approve
 *  PUT  /api/admin/pros/:id/reject
 *  GET  /api/admin/complaints
 *  PUT  /api/admin/complaints/:id/resolve
 *  GET  /api/admin/users
 *  PUT  /api/admin/users/:id/suspend
 *  GET  /api/admin/orders
 */

import { useNavigate } from "react-router-dom";
import { getLang, getDir } from "../context/LanguageContext";
import { useAdminData } from "../hooks/useAdminData";
import { IcoGrid, IcoUsers, IcoShield, IcoAlert, IcoClip, IcoDollar, IcoCheck, IcoX, IcoEye, IcoBan, IcoSearch, IcoLogout, IcoWrench, IcoChevR, IcoBack, IcoStar, IcoStarNav, IcoMail, IcoPhone, IcoRefresh } from "../components/AdminIcons";
import AdminModals from "../components/admin/AdminModals";
import { ORDER_STATUS, COMP_PRI } from "../data/adminConstants";
import "../styles/admin.css";

const useL = () => {
  const lang = getLang();
  const isHe = lang === "he";
  return { isHe, L: (en, he) => (isHe ? he : en), dir: getDir() };
};

/* אייקונים מיובאים מ-components/AdminIcons.jsx */

/* קבועים מיובאים מ-data/adminConstants.js */

/* ════════════════════════════════════
   Component
════════════════════════════════════ */
export default function AdminDashboard() {
  const navigate         = useNavigate();
  const { isHe, L, dir } = useL();

  /* ── כל הלוגיקה מגיעה מ-hooks/useAdminData.js ── */
  const {
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
  } = useAdminData(L);

  /* nav */
  const NAV = [
    { id: "overview",   label: L("Overview",   "סקירה"),       Icon: IcoGrid,  badge: null },
    { id: "approvals",  label: L("Approvals",  "אישורים"),     Icon: IcoShield,badge: pros.length || null },
    { id: "complaints", label: L("Complaints", "תלונות"),      Icon: IcoAlert, badge: comps.filter(c => c.status === "open").length || null },
    { id: "ratings",    label: L("Ratings",    "דירוגים"),     Icon: IcoStarNav, badge: null },
    { id: "users",      label: L("Users",      "משתמשים"),     Icon: IcoUsers, badge: null },
    { id: "orders",     label: L("Orders",     "הזמנות"),      Icon: IcoClip,  badge: null },
  ];

  /* back button */
  const BackBtn = () => (
    <button className="admin-back-btn" onClick={() => setSection("overview")}>
      <IcoBack /> {L("Back", "חזרה")}
    </button>
  );

  return (
    <div className={`admin-page ${mounted ? "admin-page--vis" : ""}`}
      style={{ fontFamily: isHe ? "'Heebo',sans-serif" : "'DM Sans',sans-serif", direction: dir }}>

      {/* ══ SIDEBAR ══ */}
      <aside className="admin-sidebar">

        {/* Logo */}
        <div className="admin-logo-box">
          <div className="admin-logo-row">
            <div className="admin-logo-icon"><IcoWrench /></div>
            <div className="logo-text">
              <p className="admin-logo-title">FixMate</p>
              <p className="admin-logo-sub">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="admin-nav">
          {NAV.map(item => (
            <div key={item.id} className={`nav-item admin-nav-item ${section === item.id ? "active" : ""}`}
              onClick={() => setSection(item.id)}>
              <span className="admin-nav-icon"><item.Icon /></span>
              <span className="nav-label admin-nav-text">{item.label}</span>
              {item.badge && <span className="admin-nav-badge">{item.badge}</span>}
              {section === item.id && <span className="admin-nav-mark" />}
            </div>
          ))}
        </nav>

        {/* Admin info + logout */}
        <div className="admin-user-box">
          <div className="admin-user-row">
            <label htmlFor="admin-pfp-input" title={L("Change photo", "החלף תמונה")} className="admin-avatar">
              {me.profilePicture ? <img src={me.profilePicture} alt="" /> : (me.name || "A").charAt(0).toUpperCase()}
            </label>
            <input id="admin-pfp-input" type="file" accept="image/*" onChange={uploadAdminPhoto} style={{ display: "none" }} />
            <div className="logo-text">
              <p className="admin-user-name">{me.name}</p>
              <p className="admin-user-email">{me.email}</p>
            </div>
          </div>
          <button onClick={() => navigate("/login")} className="hb admin-logout">
            <IcoLogout /><span className="nav-label">{L("Sign Out", "יציאה")}</span>
          </button>
        </div>
      </aside>

      {/* ══ CONTENT ══ */}
      <div className="admin-content">

        {/* ─── OVERVIEW ─── */}
        {section === "overview" && (
          <div className="admin-section">
            <SectionHeader
              title={L("Platform Overview", "סקירת מערכת")}
              sub={new Date().toLocaleDateString(isHe ? "he-IL" : "en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              action={
                <button className="admin-refresh-btn" onClick={() => {}}>
                  <IcoRefresh /> {L("Refresh", "רענן")}
                </button>
              }
            />

            {/* Hero welcome banner */}
            <div className="admin-hero">
              <div className="admin-hero-circle" />
              <div className="admin-hero-body">
                <p className="admin-hero-eyebrow">{L("Admin Panel", "פאנל ניהול")} · FixMate</p>
                <h2 className="admin-hero-title">
                  {L("Welcome back", "ברוך שובך")}, {localStorage.getItem("fullName") || (isHe ? "מנהל" : "Admin")}
                </h2>
                <p className="admin-hero-sub">
                  {stats.pendingApprovals > 0
                    ? L(`${stats.pendingApprovals} professionals are waiting for your approval`, `${stats.pendingApprovals} בעלי מקצוע ממתינים לאישורך`)
                    : L("Everything is up to date — no pending actions", "הכל מעודכן — אין פעולות ממתינות")}
                </p>
              </div>
              {stats.pendingApprovals > 0 && (
                <button onClick={() => setSection("approvals")} className="hb admin-hero-btn">
                  {L("Review approvals", "לאישורים")} →
                </button>
              )}
            </div>

            {/* KPI cards */}
            <div className="admin-kpi-grid">
              {[
                { Icon: IcoUsers,  n: stats.totalUsers,     label: L("Total Users",     "סה״כ משתמשים"),   sub: L(`${stats.totalClients || 0} clients · ${stats.totalPros || 0} pros`, `${stats.totalClients || 0} לקוחות · ${stats.totalPros || 0} בעלי מקצוע`), color: "#2563EB", bg: "#EFF6FF" },
                { Icon: IcoWrench, n: stats.totalPros,      label: L("Professionals",   "בעלי מקצוע"),     sub: L("registered on platform", "רשומים בפלטפורמה"),  color: "#8B5CF6", bg: "#F5F3FF" },
                { Icon: IcoClip,   n: stats.totalOrders,    label: L("Total Orders",    "סה״כ הזמנות"),    sub: L("across all pros", "מכל בעלי המקצוע"),   color: "#10B981", bg: "#ECFDF5" },
                { Icon: IcoDollar, n: `₪${(Number(stats.revenue) / 1000).toFixed(1)}K`, label: L("Revenue", "הכנסה"), sub: L("from completed jobs", "מעבודות שהושלמו"), color: "#F59E0B", bg: "#FFFBEB" },
                { Icon: IcoShield, n: stats.pendingApprovals, label: L("Pending Approvals","ממתינים לאישור"), sub: stats.pendingApprovals > 0 ? L("needs your attention", "דורש טיפול") : L("all clear", "הכל מטופל"), color: "#F97316", bg: "#FFF7ED" },
              ].map((c, i) => (
                <div key={i} className="stat-card admin-kpi-card" style={{ animation: `fadeUp ${.35 + i * .04}s both` }}>
                  <div className="admin-kpi-head">
                    <div className="admin-kpi-icon" style={{ background: c.bg, color: c.color }}><c.Icon /></div>
                  </div>
                  <p className="admin-kpi-num">{c.n}</p>
                  <p className="admin-kpi-label">{c.label}</p>
                  <p className="admin-kpi-sub">{c.sub}</p>
                </div>
              ))}
            </div>

            {/* Two columns */}
            <div className="admin-two-col">

              {/* Recent Orders */}
              <div className="admin-panel">
                <div className="admin-panel-head">
                  <h3 className="admin-panel-title">{L("Recent Orders", "הזמנות אחרונות")}</h3>
                  <button onClick={() => setSection("orders")} className="hb admin-link-btn">
                    {L("See all", "כל ההזמנות")} <IcoChevR />
                  </button>
                </div>
                {orders.length === 0 && (
                  <div className="admin-empty-row">{L("No orders yet", "אין הזמנות עדיין")}</div>
                )}
                {orders.slice(0, 4).map((o, i) => {
                  const st = ORDER_STATUS[o.status] || ORDER_STATUS.pending;
                  return (
                    <div key={o.id} className={`trow admin-mini-row ${i < 3 ? "admin-mini-row--sep" : ""}`}>
                      <div className="admin-mini-main">
                        <p className="admin-mini-title">
                          {isHe ? o.clientHe : o.client} <span className="admin-mini-muted">→ {isHe ? o.proHe : o.pro}</span>
                        </p>
                        <p className="admin-mini-sub">{isHe ? o.serviceHe : o.service} · {o.id}</p>
                      </div>
                      <div style={{ textAlign: "end" }}>
                        <span className="admin-pill" style={{ background: st.bg, color: st.color }}>{L(o.status.replace("_", " "), o.status)}</span>
                        <p className="admin-mini-price">₪{o.price}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Activity Feed */}
              <div className="admin-panel">
                <div className="admin-panel-head">
                  <h3 className="admin-panel-title">{L("Live Activity", "פעילות אחרונה")}</h3>
                </div>
                {(() => {
                  const activity = [
                    ...pros.slice(0, 3).map((p) => ({
                      id: "act-p-" + p.id, Icon: IcoWrench, color: "#F59E0B", bg: "#FFFBEB",
                      text: { en: p.name + " is awaiting approval", he: p.nameHe + " ממתין לאישור" },
                      time: { en: "pending", he: "ממתין" },
                    })),
                    ...orders.slice(0, 4).map((o) => ({
                      id: "act-o-" + o.id, Icon: IcoClip, color: "#10B981", bg: "#ECFDF5",
                      text: { en: "Order " + o.id + ": " + o.client + " → " + o.pro, he: "הזמנה " + o.id + ": " + o.clientHe + " → " + o.proHe },
                      time: { en: o.date, he: o.date },
                    })),
                  ];
                  if (activity.length === 0) return <div className="admin-empty-mini">{L("No recent activity", "אין פעילות אחרונה")}</div>;
                  return activity.map((a, i) => (
                    <div key={a.id} className={`admin-act-row ${i < activity.length - 1 ? "admin-act-row--sep" : ""}`}>
                      <div className="admin-act-icon" style={{ background: a.bg, color: a.color }}>
                        <a.Icon />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p className="admin-act-text">{isHe ? a.text.he : a.text.en}</p>
                        <p className="admin-act-time">{isHe ? a.time.he : a.time.en}</p>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        )}

        {/* ─── APPROVALS ─── */}
        {section === "approvals" && (
          <div className="admin-section">
            <SectionHeader
              title={L("Pro Approvals", "אישור בעלי מקצוע")}
              sub={L(`${pros.length} pending`, `${pros.length} ממתינים לאישור`)}
              action={<BackBtn />}
            />

            {proError && (
              <div className="admin-error-box">
                <strong>⚠️ בעיה במשיכת הרשימה מהשרת:</strong>
                <div className="admin-error-detail">{proError}</div>
                <button className="admin-error-btn" onClick={loadPendingPros}>נסה שוב</button>
              </div>
            )}

            {pros.length === 0 ? (
              <EmptyState emoji="✅" title={L("All caught up!", "הכל מאושר!")} sub={L("No pending pro approvals", "אין בקשות ממתינות")} />
            ) : (
              <div className="admin-card-list">
                {pros.map((pro, i) => (
                  <div key={pro.id} className="admin-pro-card" style={{ animation: `fadeUp ${.3 + i * .06}s both` }}>
                    <div className="admin-pro-stripe" />
                    <div className="admin-pro-body">
                      <div className="admin-pro-row">
                        <div className="admin-pro-avatar">{pro.avatar}</div>
                        <div className="admin-pro-main">
                          <div className="admin-pro-head">
                            <p className="admin-pro-name">{isHe ? pro.nameHe : pro.name}</p>
                            <span className="admin-pro-trade">{isHe ? pro.tradeHe : pro.trade}</span>
                            <span className="admin-pro-city">📍 {isHe ? pro.cityHe : pro.city}</span>
                          </div>
                          <div className="admin-pro-meta">
                            <span className="admin-pro-meta-item"><IcoMail />{pro.email}</span>
                            <span className="admin-pro-meta-item"><IcoPhone />{pro.phone}</span>
                            {pro.hourlyRate != null && <span>₪{pro.hourlyRate} / {isHe ? "שעה" : "hr"}</span>}
                            <span>{isHe ? "הגיש: " : "Applied: "}{pro.joined}</span>
                          </div>
                        </div>
                        <div className="admin-pro-actions">
                          <button onClick={() => setModal({ type: "view_pro", data: pro })} className="hb admin-btn-view">
                            <IcoEye />{L("View", "הצג")}
                          </button>
                          <button onClick={() => { setModal({ type: "reject_pro", data: pro }); setRejectReason(""); }} className="hb admin-btn-reject">
                            <IcoX />{L("Reject", "דחה")}
                          </button>
                          <button onClick={() => setModal({ type: "approve_pro", data: pro })} className="hb admin-btn-approve">
                            <IcoCheck />{L("Approve", "אשר")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── COMPLAINTS ─── */}
        {section === "complaints" && (
          <div className="admin-section">
            <SectionHeader
              title={L("Complaints", "תלונות")}
              sub={L(`${comps.filter(c => c.status === "open").length} open`, `${comps.filter(c => c.status === "open").length} פתוחות`)}
              action={
                <div className="admin-filters">
                  {["all", "open", "resolved"].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`hb admin-filter-btn ${filter === f ? "active" : ""}`}>
                      {f === "all" ? L("All", "הכל") : f === "open" ? L("Open", "פתוח") : L("Resolved", "טופל")}
                    </button>
                  ))}
                  <BackBtn />
                </div>
              }
            />

            <div className="admin-table">
              {comps.filter(c => filter === "all" || c.status === filter).map((c, i, arr) => {
                const pri = COMP_PRI[c.priority];
                return (
                  <div key={c.id} className={`trow admin-row ${i < arr.length - 1 ? "admin-row--sep" : ""}`}>
                    <div className="admin-dot" style={{ background: c.priority === "high" ? "#EF4444" : c.priority === "medium" ? "#F59E0B" : "#10B981" }} />
                    <div className="admin-row-main">
                      <div className="admin-row-head">
                        <p className="admin-row-title">{isHe ? c.subjectHe : c.subject}</p>
                        <span className="admin-tag" style={{ background: pri.bg, color: pri.color }}>{L(c.priority, c.priority)}</span>
                      </div>
                      <p className="admin-row-sub">
                        {L("From", "מ")} <strong>{isHe ? c.fromHe : c.from}</strong> ({isHe ? c.roleHe : c.role}) · {c.orderId} · {c.date}
                      </p>
                      {c.assignedTo && <p className="admin-row-note">👤 {L("Assigned to", "משוייך ל")} {c.assignedTo}</p>}
                    </div>
                    <span className="admin-status-pill" style={{ background: c.status === "open" ? "#FEF3C7" : "#D1FAE5", color: c.status === "open" ? "#92400E" : "#065F46" }}>
                      {c.status === "open" ? L("Open", "פתוח") : L("Resolved", "טופל")}
                    </span>
                    <div className="admin-row-actions">
                      <button onClick={() => { setCompResponse(c.adminResponse || ""); setModal({ type: "view_complaint", data: c }); }} className="hb admin-btn-sm admin-btn-sm--view">
                        <IcoEye />{L("View", "הצג")}
                      </button>
                      {c.status === "open" && (
                        <button onClick={() => resolveComp(c.id)} className="hb admin-btn-sm admin-btn-sm--resolve">
                          <IcoCheck />{L("Resolve", "סגור")}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── RATINGS ─── */}
        {section === "ratings" && (
          <div className="admin-section">
            <SectionHeader
              title={L("Ratings & Reviews", "דירוגים וביקורות")}
              sub={L(`${ratings.length} reviews`, `${ratings.length} ביקורות`)}
              action={<BackBtn />}
            />
            <div className="admin-table">
              {ratings.length === 0 && (
                <div className="admin-empty-row">{L("No reviews yet", "אין ביקורות עדיין")}</div>
              )}
              {ratings.map((r, i, arr) => (
                <div key={r.id} className={`trow admin-row ${i < arr.length - 1 ? "admin-row--sep" : ""}`}>
                  <div className="admin-row-main--wide">
                    <div className="admin-row-head">
                      <p className="admin-row-title">{r.pro}</p>
                      <span className="admin-stars">
                        {[1, 2, 3, 4, 5].map(n => (
                          <svg key={n} width="14" height="14" viewBox="0 0 24 24" fill={n <= r.score ? "#FBBF24" : "#E2E8F0"} stroke={n <= r.score ? "#FBBF24" : "#E2E8F0"} strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                        ))}
                      </span>
                      <span className="admin-score">{r.score}/5</span>
                    </div>
                    {r.comment && <p className="admin-quote">“{r.comment}”</p>}
                    <p className="admin-user-meta">
                      {L("By", "מאת")} <strong>{r.client}</strong> · {r.service} · {r.orderId} · {r.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── USERS ─── */}
        {section === "users" && (
          <div className="admin-section">
            <SectionHeader
              title={L("User Management", "ניהול משתמשים")}
              sub={L(`${users.length} total users`, `${users.length} משתמשים`)}
              action={
                <div className="admin-filters">
                  <div className="admin-search-wrap">
                    <span className="admin-search-icon"><IcoSearch /></span>
                    <input className="admin-search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder={L("Search...", "חיפוש...")} />
                  </div>
                  <BackBtn />
                </div>
              }
            />

            <div className="admin-table">
              {users.length === 0 && (
                <div className="admin-empty-row">{L("No users yet", "אין משתמשים עדיין")}</div>
              )}
              {users.filter(u => {
                const q = search.toLowerCase();
                return !q || (isHe ? u.nameHe : u.name).toLowerCase().includes(q) || u.email.includes(q);
              }).map((u, i, arr) => (
                <div key={u.id} className={`trow admin-row admin-row--user ${i < arr.length - 1 ? "admin-row--sep" : ""}`}>
                  <div className={`admin-user-avatar ${u.role === "pro" ? "admin-user-avatar--pro" : "admin-user-avatar--client"}`}>
                    {u.avatar}
                  </div>
                  <div className="admin-row-main--user">
                    <div className="admin-user-head">
                      <p className="admin-row-title">{isHe ? u.nameHe : u.name}</p>
                      <span className={`admin-role-tag ${u.role === "pro" ? "admin-role-tag--pro" : "admin-role-tag--client"}`}>
                        {isHe ? u.roleHe : (u.roleEnLabel || u.role)}
                      </span>
                      {u.rating && <span className="admin-user-rating"><IcoStar />{u.rating}</span>}
                    </div>
                    <p className="admin-user-meta">{u.email} · {isHe ? u.cityHe : u.city} · {u.orders} {L("orders", "הזמנות")} · {L("Since", "מ")} {u.joined}</p>
                  </div>
                  <span className="admin-status-pill" style={{ background: u.status === "active" ? "#D1FAE5" : "#FEE2E2", color: u.status === "active" ? "#065F46" : "#991B1B" }}>
                    {u.status === "active" ? L("Active", "פעיל") : L("Suspended", "מושעה")}
                  </span>
                  <div className="admin-row-actions">
                    <button onClick={() => setModal({ type: "view_user", data: u })} className="hb admin-btn-sm admin-btn-sm--view">
                      <IcoEye />{L("View", "הצג")}
                    </button>
                    <button onClick={() => toggleUser(u.id)} className={`hb admin-btn-sm ${u.status === "active" ? "admin-btn-sm--suspend" : "admin-btn-sm--restore"}`}>
                      {u.status === "active" ? <><IcoBan />{L("Suspend", "השעה")}</> : <><IcoCheck />{L("Restore", "שחזר")}</>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── ORDERS ─── */}
        {section === "orders" && (
          <div className="admin-section">
            <SectionHeader
              title={L("All Orders", "כל ההזמנות")}
              sub={L(`${orders.length} orders shown`, `${orders.length} הזמנות`)}
              action={<BackBtn />}
            />
            <div className="admin-table">
              {orders.length === 0 && (
                <div className="admin-empty-row">{L("No orders yet", "אין הזמנות עדיין")}</div>
              )}
              {orders.map((o, i, arr) => {
                const st = ORDER_STATUS[o.status] || ORDER_STATUS.pending;
                return (
                  <div key={o.id} className={`trow admin-row admin-row--order ${i < arr.length - 1 ? "admin-row--sep" : ""}`}>
                    <div className="admin-order-id-box">
                      <p className="admin-order-id">{o.id}</p>
                      <p className="admin-order-date">{o.date}</p>
                    </div>
                    <div className="admin-order-main">
                      <p className="admin-order-service">{isHe ? o.serviceHe : o.service}</p>
                      <p className="admin-order-people">{isHe ? o.clientHe : o.client} → {isHe ? o.proHe : o.pro}</p>
                    </div>
                    <span className="admin-order-price">₪{o.price}</span>
                    <span className="admin-status-pill" style={{ background: st.bg, color: st.color }}>
                      {L(o.status.replace("_", " "), o.status)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* ════ MODALS ════ */}

      {/* מודלים + Toast — חולצו ל-components/admin/AdminModals.jsx */}
      <AdminModals
        modal={modal} setModal={setModal} L={L} isHe={isHe} dir={dir}
        rejectReason={rejectReason} setRejectReason={setRejectReason}
        compResponse={compResponse} setCompResponse={setCompResponse}
        approvePro={approvePro} rejectPro={rejectPro} resolveComp={resolveComp} toggleUser={toggleUser}
        toast={toast} />
    </div>
  );
}

/* ─── Sub-components ─── */
function SectionHeader({ title, sub, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
      <div>
        <h2 style={{ fontFamily: "'Outfit'", fontSize: 23, fontWeight: 800, color: "#1A2B4A", marginBottom: 3 }}>{title}</h2>
        {sub && <p style={{ fontSize: 13, color: "#94A3B8" }}>{sub}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

function EmptyState({ emoji, title, sub }) {
  return (
    <div style={{ background: "#FFF", borderRadius: 18, border: "1.5px dashed #D1D9E8", padding: "60px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 14 }}>{emoji}</div>
      <p style={{ fontSize: 17, fontWeight: 700, color: "#1A2B4A", marginBottom: 6 }}>{title}</p>
      <p style={{ fontSize: 13, color: "#94A3B8" }}>{sub}</p>
    </div>
  );
}

/* Overlay ו-MBtn עברו ל-components/admin/AdminModals.jsx */