/**
 * =============================================
 *  FixMate – Client Dashboard (Screen 4)
 * =============================================
 */

import { useNavigate } from "react-router-dom";
import { translate, getLang, getDir } from "../context/LanguageContext";
import { useClientData } from "../hooks/useClientData";
import { PREVIEW_COUNT, NOTIF_ICONS } from "../data/clientConstants";
import { IconCamera, IconSearch, IconMindMap, IconUser, IconLogout, IconStar, IconClock, IconPhone, IconArrowRight, IconWrench, IconBell, IconSettings, IconEdit, IconHistory, IconHeart } from "../components/Icons";
import EditOrderModal from "../components/client/EditOrderModal";
import TrackModal from "../components/client/TrackModal";
import CancelOrderModal from "../components/client/CancelOrderModal";
import ComplaintModal from "../components/client/ComplaintModal";
import Toast from "../components/Toast";
import "../styles/client.css";

/* אייקוני SVG מיובאים מ-components/Icons.jsx */

export default function ClientDashboard() {
  const navigate = useNavigate();
  var t = translate;
  var dir = getDir();
  var lang = getLang();
  var isHe = lang === "he";
  /* ── כל הלוגיקה מגיעה מ-hooks/useClientData.js ── */
  const {
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
    editOrder, setEditOrder, openEdit, saveEdit, editSaving,
    editDate, setEditDate, editTime, setEditTime,
    editAddr, setEditAddr, editDesc, setEditDesc,
    trackOrder, setTrackOrder, getProgressSteps,
    cancelConfirm, setCancelConfirm, cancelReason, setCancelReason,
    confirmCancel, chargesFee, CANCEL_FEE,
    showComplaint, setShowComplaint, openComplaint, submitComplaint, compSaving,
    compSubject, setCompSubject, compDesc, setCompDesc, compOrderId, setCompOrderId,
    toast,
  } = useClientData({ t, lang, isHe });

  return (
    <div className={`cd-page ${mounted ? "cd-page--vis" : ""}`} style={{ direction: dir }}>

      {/* ═══ NAV ═══ */}
      <nav className="cd-nav">
        <div className="cd-nav-inner">
          <div className="cd-logo">
            <div className="cd-logo-icon"><IconWrench /></div>
            <span className="cd-logo-text">Fix<span className="cd-logo-blue">Mate</span></span>
          </div>
          <div className="cd-nav-right" style={{ display: "flex", alignItems: "center", gap: 8 }}>

            {/* Notifications */}
            <div className="cd-notif-wrap">
              <button className="cd-nav-icon-btn" title={t("cd_notifications")} onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}>
                <IconBell />
                {unreadCount > 0 && <span className="cd-notif-dot">{unreadCount}</span>}
              </button>
              {showNotif && (
                <>
                  <div className="cd-notif-backdrop" onClick={() => setShowNotif(false)} />
                  <div className="cd-notif-dropdown">
                    <div className="cd-notif-header">
                      <h4 className="cd-notif-title">{t("cd_notifications")}</h4>
                      {unreadCount > 0 && <button className="cd-notif-mark-all" onClick={markAllRead}>{t("cd_mark_all")}</button>}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="cd-notif-empty"><IconBell /><p>{t("cd_no_notif")}</p></div>
                    ) : (
                      <div className="cd-notif-list">
                        {notifications.map((n) => {
                          const icon = NOTIF_ICONS[n.type] || NOTIF_ICONS.confirmed;
                          return (
                            <div className={`cd-notif-item ${!n.read ? "cd-notif-item--unread" : ""}`} key={n.id} onClick={() => markAsRead(n.id)}>
                              <div className="cd-notif-icon" style={{ color: icon.color, background: icon.bg }}>{icon.icon}</div>
                              <div className="cd-notif-content">
                                <p className="cd-notif-text">{n.text}</p>
                                <span className="cd-notif-time">{n.time}</span>
                              </div>
                              <button className="cd-notif-dismiss" onClick={(e) => { e.stopPropagation(); clearNotification(n.id); }} title="Dismiss">✕</button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Profile */}
            <div className="cd-profile-wrap">
              <button className="cd-nav-icon-btn" title="Profile" onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }} style={avatarPic ? { overflow: "hidden", padding: 0 } : undefined}>
                {avatarPic ? <img src={avatarPic} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} /> : <IconUser />}
              </button>
              {showProfile && (
                <>
                  <div className="cd-notif-backdrop" onClick={() => setShowProfile(false)} />
                  <div className="cd-profile-dropdown">
                    <div className="cd-profile-header">
                      <div className="cd-profile-avatar" style={{ overflow: "hidden", padding: 0 }}>
                        {avatarPic ? <img src={avatarPic} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (userName.charAt(0) || "U").toUpperCase()}
                      </div>
                      <div className="cd-profile-info">
                        <h4 className="cd-profile-name">{userName}</h4>
                        <p className="cd-profile-email">{userEmail || (isHe ? "טוען..." : "Loading...")}</p>
                      </div>
                    </div>
                    <div className="cd-profile-menu">
                      <button className="cd-profile-menu-item" onClick={() => { setShowProfile(false); navigate("/client/profile"); }}><IconEdit /><span>{t("cd_edit_profile")}</span></button>
                      <button className="cd-profile-menu-item" onClick={() => setShowProfile(false)}><IconHistory /><span>{t("cd_order_history")}</span></button>
                      <button className="cd-profile-menu-item" onClick={() => setShowProfile(false)}><IconHeart /><span>{t("cd_saved_pros")}</span></button>
                      <button className="cd-profile-menu-item" onClick={() => setShowProfile(false)}><IconSettings /><span>{t("cd_settings")}</span></button>
                      <button className="cd-profile-menu-item" onClick={() => { setShowProfile(false); openComplaint(); }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        <span>{isHe ? "הגש תלונה" : "File a complaint"}</span>
                      </button>
                    </div>
                    <div className="cd-profile-footer">
                      <button className="cd-profile-logout" onClick={() => navigate("/login")}><IconLogout /><span>{t("cd_logout")}</span></button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button className="cd-nav-icon-btn cd-logout-btn" title={t("cd_logout")} onClick={() => navigate("/login")}><IconLogout /></button>
          </div>
        </div>
      </nav>

      {/* ═══ MAIN ═══ */}
      <main className="cd-main">

        <section className="cd-greeting">
          <h1 className="cd-greeting-title">{t("cd_hello")} <span className="cd-greeting-name">{userName}</span></h1>
          <p className="cd-greeting-sub">{t("cd_sub")}</p>
        </section>

        {/* ═══ STATS SUMMARY (נתונים אמיתיים) ═══ */}
        <section className="cd-stats-grid">
          {[
            {
              label: isHe ? "הזמנות פעילות" : "Active Orders",
              value: orders.filter(o => ["pending","confirmed","in_progress"].includes(o.status)).length,
              color: "#2563EB", bg: "#EEF2FF",
              icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>,
            },
            {
              label: isHe ? "הושלמו" : "Completed",
              value: orders.filter(o => o.status === "completed").length,
              color: "#059669", bg: "#ECFDF5",
              icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
            },
            {
              label: isHe ? "סה״כ הזמנות" : "Total Orders",
              value: orders.length,
              color: "#7C3AED", bg: "#F5F3FF",
              icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
            },
          ].map((s, i) => (
            <div key={i} className="cd-stat-card">
              <div className="cd-stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <div>
                <div className="cd-stat-value">{s.value}</div>
                <div className="cd-stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </section>

        {/* ═══ ACTION CARDS ═══ */}
        <section className="cd-actions">
          <div className="cd-action-card cd-action-card--snap" onClick={() => navigate("/client/snap")}>
            <div className="cd-action-icon-wrap cd-action-icon--orange"><IconCamera /></div>
            <h3 className="cd-action-title">{t("cd_snap_title")}</h3>
            <p className="cd-action-desc">{t("cd_snap_desc")}</p>
            <div className="cd-action-arrow"><IconArrowRight /></div>
          </div>
          <div className="cd-action-card cd-action-card--book" onClick={() => navigate("/client/search")}>
            <div className="cd-action-icon-wrap cd-action-icon--blue"><IconSearch /></div>
            <h3 className="cd-action-title">{t("cd_book_title")}</h3>
            <p className="cd-action-desc">{t("cd_book_desc")}</p>
            <div className="cd-action-arrow"><IconArrowRight /></div>
          </div>

          {/* ✅ RENAMED: Mind Map → Service History */}
          <div className="cd-action-card cd-action-card--map" onClick={() => navigate("/client/mindmap")}>
            <div className="cd-action-icon-wrap cd-action-icon--purple"><IconMindMap /></div>
            <h3 className="cd-action-title">
              {lang === "he" ? "מרכז עזרה עצמית" : "Self-Help Center"}
            </h3>
            <p className="cd-action-desc">
              {lang === "he"
                ? "מדריכי פתרון תקלות — נסה לתקן בעצמך"
                : "Troubleshooting guides — try fixing it yourself"}
            </p>
            <div className="cd-action-arrow"><IconArrowRight /></div>
          </div>
        </section>

        {/* ═══ ORDERS ═══ */}
        <section className="cd-orders-section">
          <div className="cd-orders-header">
            <h2 className="cd-orders-title">{t("cd_active_orders")} <span className="cd-orders-count">{activeOrders.length}</span></h2>
          </div>

          {activeOrders.length === 0 ? (
            <div className="cd-orders-empty"><p>{t("cd_no_orders")}</p><p>{t("cd_book_to_start")}</p></div>
          ) : (
            <div className="cd-orders-list">
              {(showAllOrders ? activeOrders : activeOrders.slice(0, PREVIEW_COUNT)).map((order) => {
                const status = STATUS_MAP[order.status] || STATUS_MAP.pending;
                return (
                  <div className="cd-order-card" key={order.id}>
                    <div className="cd-order-top">
                      <div className="cd-order-avatar" style={order.proPic ? { overflow: "hidden", padding: 0 } : undefined}>{order.proPic ? <img src={order.proPic} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : order.proName.charAt(0)}</div>
                      <div className="cd-order-info">
                        <h4 className="cd-order-name">{order.proName}</h4>
                        <p className="cd-order-role">{order.proRole}</p>
                      </div>
                      <div className="cd-order-right">
                        <span className="cd-order-id">{order.id}</span>
                        <span className="cd-order-status" style={{ color: status.color, background: status.bg }}>{status.label}</span>
                      </div>
                    </div>
                    <p className="cd-order-desc">{order.description}</p>
                    <div className="cd-order-meta">
                      <span className="cd-order-meta-item"><IconStar />{order.rating}</span>
                      <span className="cd-order-meta-item"><IconClock />{order.date}, {order.time}</span>
                      <span className="cd-order-meta-item"><IconPhone />{order.phone}</span>
                    </div>
                    <div className="cd-order-actions">
                      {order.status === "pending" && (
                        <>
                          <button className="cd-order-btn cd-order-btn--cancel" onClick={() => { setCancelConfirm(order); setCancelReason(""); }}>{t("cd_cancel")}</button>
                          <button className="cd-order-btn cd-order-btn--edit" onClick={() => openEdit(order)}>{t("cd_edit")}</button>
                        </>
                      )}
                      {order.status === "confirmed" && (
                        <>
                          <button className="cd-order-btn cd-order-btn--contact" onClick={() => window.open(`tel:${order.phone}`)}><IconPhone /> {t("cd_contact_pro")}</button>
                          <button className="cd-order-btn cd-order-btn--cancel" onClick={() => { setCancelConfirm(order); setCancelReason(""); }}>{t("cd_cancel")}</button>
                        </>
                      )}
                      {order.status === "in_progress" && (
                        <button className="cd-order-btn cd-order-btn--track" onClick={() => setTrackOrder(order)}><IconArrowRight /> {t("cd_track")}</button>
                      )}
                      {order.status === "completed" && (
                        ratedIds.includes(order.bookingId) ? (
                          <span className="cd-order-btn cd-rated-badge">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg> {isHe ? "דורג ✓" : "Rated ✓"}
                          </span>
                        ) : (
                          <button className="cd-order-btn cd-order-btn--track" onClick={() => navigate(`/client/rate?bookingId=${order.bookingId}&pro=${encodeURIComponent(order.proName)}&service=${encodeURIComponent(order.proRole)}`)} style={{ display: "inline-flex", alignItems: "center", gap: 6, justifyContent: "center" }}><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg> {t("cd_rate")}</button>
                        )
                      )}
                      {/* דיווח על בעיה — פותח תלונה מקושרת להזמנה */}
                      <button onClick={() => openComplaint(order)} className="cd-report-btn">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        {isHe ? "דווח על בעיה" : "Report a problem"}
                      </button>
                    </div>
                  </div>
                );
              })}
              {activeOrders.length > PREVIEW_COUNT && (
                <button onClick={() => setShowAllOrders(v => !v)} className="cd-show-all-btn">
                  {showAllOrders ? (isHe ? "הצג פחות" : "Show less") : (isHe ? `הצג הכל (${activeOrders.length})` : `Show all (${activeOrders.length})`)}
                </button>
              )}
            </div>
          )}
        </section>
        {/* ═══ MY COMPLAINTS ═══ */}
        {myComplaints.length > 0 && (
          <section className="cd-orders-section" style={{ marginTop: 28 }}>
            <div className="cd-orders-header">
              <h2 className="cd-orders-title">
                {isHe ? "התלונות שלי" : "My Complaints"} <span className="cd-orders-count">{myComplaints.length}</span>
              </h2>
            </div>
            <div className="cd-comp-grid">
              {(showAllComplaints ? myComplaints : myComplaints.slice(0, PREVIEW_COUNT)).map((c) => {
                const resolved = c.status === "RESOLVED";
                return (
                  <div key={c.id} className="cd-comp-card">
                    <div className="cd-comp-head">
                      <h4 className="cd-comp-subject">{c.subject}</h4>
                      <span className="cd-comp-status" style={{ background: resolved ? "rgba(16,185,129,.12)" : "rgba(245,158,11,.12)", color: resolved ? "#059669" : "#B45309" }}>
                        {resolved ? (isHe ? "טופל ✓" : "Resolved ✓") : (isHe ? "פתוח" : "Open")}
                      </span>
                    </div>
                    <p className="cd-comp-desc">{c.description}</p>
                    {c.bookingId && <p className="cd-comp-meta">ORD-{c.bookingId} · {c.bookingService || ""}</p>}
                    {c.adminResponse && (
                      <div className="cd-comp-response">
                        <p className="cd-comp-response-title">{isHe ? "תגובת הצוות" : "Team response"}</p>
                        <p className="cd-comp-response-text">{c.adminResponse}</p>
                      </div>
                    )}
                    <p className="cd-comp-date">{(c.createdAt || "").slice(0, 10)}</p>
                  </div>
                );
              })}
              {myComplaints.length > PREVIEW_COUNT && (
                <button onClick={() => setShowAllComplaints(v => !v)} className="cd-show-all-btn">
                  {showAllComplaints ? (isHe ? "הצג פחות" : "Show less") : (isHe ? `הצג הכל (${myComplaints.length})` : `Show all (${myComplaints.length})`)}
                </button>
              )}
            </div>
          </section>
        )}

      </main>

      {/* ═══ MODALS (חולצו ל-components/client/ClientModals.jsx) ═══ */}
      <EditOrderModal order={editOrder} onClose={() => setEditOrder(null)}
        date={editDate} setDate={setEditDate} time={editTime} setTime={setEditTime}
        addr={editAddr} setAddr={setEditAddr} desc={editDesc} setDesc={setEditDesc}
        saving={editSaving} onSave={saveEdit} t={t} dir={dir} isHe={isHe} />

      <TrackModal order={trackOrder} onClose={() => setTrackOrder(null)}
        getSteps={getProgressSteps} t={t} dir={dir} />

      <CancelOrderModal order={cancelConfirm} onClose={() => setCancelConfirm(null)}
        reason={cancelReason} setReason={setCancelReason} chargesFee={chargesFee}
        fee={CANCEL_FEE} onConfirm={confirmCancel} t={t} dir={dir} lang={lang} isHe={isHe} />

      <ComplaintModal open={showComplaint} onClose={() => setShowComplaint(false)}
        subject={compSubject} setSubject={setCompSubject} desc={compDesc} setDesc={setCompDesc}
        orderId={compOrderId} setOrderId={setCompOrderId} orders={orders}
        saving={compSaving} onSubmit={submitComplaint} t={t} dir={dir} isHe={isHe} />

      <Toast toast={toast} dir={dir} />
    </div>
  );
}