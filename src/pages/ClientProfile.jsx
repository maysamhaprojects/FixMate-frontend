/**
 * FixMate — Client Profile
 * ROUTE: /client/profile
 * API: GET /api/user/me · PUT /api/user/me
 *
 * לוגיקה → hooks/useClientProfile.js
 * עיצוב  → styles/clientProfile.css
 */
import { useNavigate } from "react-router-dom";
import { logout } from "../services/auth";
import { useLang } from "../context/LanguageContext";
import { useClientProfile } from "../hooks/useClientProfile";
import "../styles/clientProfile.css";

const IconUser  = (p) => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>);
const IconMail  = (p) => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="2" y="4" width="20" height="16" rx="3" /><path d="M22 7l-10 6L2 7" /></svg>);
const IconPhone = (p) => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>);
const IconBack  = (p) => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>);
const IconCheck = (p) => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12" /></svg>);

export default function ClientProfile() {
  const navigate = useNavigate();
  const { lang, dir } = useLang();
  const isHe = lang === "he";

  /* כל הלוגיקה מגיעה מ-hooks/useClientProfile.js */
  const {
    fullName, setFullName,
    email, setEmail,
    phone, setPhone,
    profilePicture, setProfilePicture, onPickImage,
    loading, saving, message, showSuccess, needsLogin,
    roleLabel, initial,
    handleSave,
  } = useClientProfile({ isHe, navigate });

  return (
    <div className="cp-page" dir={dir}>

      {/* Top nav */}
      <nav className="cp-nav">
        <button className="cp-back" onClick={() => navigate("/client/dashboard")}>
          <IconBack /> {isHe ? "לדשבורד" : "Dashboard"}
        </button>
        <h1 className="cp-logo">Fix<b>Mate</b></h1>
        <div className="cp-nav-spacer" />
      </nav>

      <div className="cp-wrap">

        {/* Profile header card */}
        <div className="cp-card cp-header">
          <div className="cp-avatar-wrap">
            <label className="cp-avatar-label" htmlFor="pfp-input" title={isHe ? "החלף תמונה" : "Change photo"}>
              <div className="cp-avatar">
                {profilePicture ? <img src={profilePicture} alt="profile" /> : initial}
              </div>
              <span className="cp-avatar-cam">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              </span>
            </label>
            <input id="pfp-input" type="file" accept="image/*" onChange={onPickImage} style={{ display: "none" }} />
          </div>
          <div className="cp-id">
            <h2 className="cp-name">{fullName || (isHe ? "אורח" : "Guest")}</h2>
            <div className="cp-meta">
              <span className="cp-role-pill">{roleLabel}</span>
              {email && <span className="cp-email">{email}</span>}
            </div>
            <div className="cp-actions">
              <label className="cp-link" htmlFor="pfp-input">{isHe ? "העלה תמונה" : "Upload photo"}</label>
              {profilePicture && (
                <button className="cp-link--danger" onClick={() => setProfilePicture("")}>
                  {isHe ? "הסר" : "Remove"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Personal info card */}
        <div className="cp-card cp-info">
          <h3 className="cp-info-title">{isHe ? "פרטים אישיים" : "Personal Information"}</h3>

          {message && (
            <div className={"cp-msg" + (message.type === "success" ? " cp-msg--ok" : "")}>
              <span>{message.type === "success" ? "✅" : "⚠️"}</span>{message.text}
            </div>
          )}

          {needsLogin && (
            <button className="cp-relogin" onClick={() => logout(navigate)}>
              {isHe ? "התחברות מחדש" : "Log in again"}
            </button>
          )}

          {loading ? (
            <p className="cp-loading">{isHe ? "טוען פרטים..." : "Loading..."}</p>
          ) : (
            <>
              {/* Full Name */}
              <div className="cp-field">
                <label className="cp-label">{isHe ? "שם מלא" : "Full Name"}</label>
                <div className="cp-box">
                  <span className="cp-box-ico"><IconUser /></span>
                  <input className="cp-input" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={isHe ? "השם המלא שלך" : "Your full name"} />
                </div>
              </div>

              {/* Email (editable) */}
              <div className="cp-field">
                <label className="cp-label">{isHe ? "אימייל" : "Email"}</label>
                <div className="cp-box">
                  <span className="cp-box-ico"><IconMail /></span>
                  <input className="cp-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@email.com" />
                </div>
              </div>

              {/* Phone */}
              <div className="cp-field cp-field--last">
                <label className="cp-label">{isHe ? "מספר טלפון" : "Phone Number"}</label>
                <div className="cp-box">
                  <span className="cp-box-ico"><IconPhone /></span>
                  <input className="cp-input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={isHe ? "מספר טלפון" : "Phone number"} />
                </div>
              </div>

              <button className="cp-save" onClick={handleSave} disabled={saving}>
                {saving ? (isHe ? "שומר..." : "Saving...") : (<><IconCheck /> {isHe ? "שמור שינויים" : "Save Changes"}</>)}
              </button>
            </>
          )}
        </div>
      </div>

      {/* חלונית הצלחה — מופיעה לכמה שניות ואז חוזרים לדשבורד */}
      {showSuccess && (
        <div className="cp-success-root">
          <div className="cp-success">
            <div className="cp-success-check">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="9 12 11.5 14.5 16 9.5" />
              </svg>
            </div>
            <h3 className="cp-success-title">{isHe ? "עודכן בהצלחה!" : "Updated successfully!"}</h3>
            <p className="cp-success-sub">
              {isHe ? "הפרטים שלך נשמרו. מעבירים אותך לדשבורד..." : "Your details were saved. Redirecting to dashboard..."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
