/*
  FixMate - Pro Profile (Editable)
  ROUTE: /pro/profile
  FILE:  src/pages/ProProfile.jsx

  אייקונים → components/ProIcons.jsx
  לוגיקה   → hooks/useProProfile.js
  קבועים   → data/serviceAreas.js
  עיצוב    → styles/proProfile.css
*/

import { useNavigate } from "react-router-dom";
import { getLang, getDir } from "../context/LanguageContext";
import { useProProfile } from "../hooks/useProProfile";
import ServiceMap from "../components/ServiceMap";
import { IconBack, IconForward, IconStar, IconMapPin, IconPhone, IconMail, IconUser, IconEdit, IconSave, IconX, IconPlus, IconCamera, IconChevron } from "../components/ProIcons";
import { SHEKEL, ALL_AREAS } from "../data/serviceAreas";
import "../styles/proProfile.css";

export default function ProProfile() {
  const navigate = useNavigate();
  const dir = getDir();
  const lang = getLang();
  const isHe = lang === "he";
  const isRTL = dir === "rtl";
  const L = (obj) => (obj && typeof obj === "object" && obj[lang]) ? obj[lang] : (typeof obj === "string" ? obj : obj?.en || "");

  /* כל הלוגיקה מגיעה מ-hooks/useProProfile.js */
  const {
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
    specialty,
    rating, reviewCount, reviews, visibleReviews,
    profilePicture, fileRef, pickFile, onPickImage, removePhoto,
    handleSave,
  } = useProProfile({ isHe });

  const goBack = () => navigate("/pro/dashboard");

  /* מחלקת שדה — משתנה לפי מצב עריכה */
  const fieldCls = (extra = "") => "pp-input" + (editing ? " pp-input--active" : "") + (extra ? " " + extra : "");

  return (
    <div className="pp-page" style={{
      fontFamily: isHe ? "'Heebo',sans-serif" : "'DM Sans',sans-serif",
      direction: dir,
      textAlign: isRTL ? "right" : "left",
      opacity: mounted ? 1 : 0,
    }}>

      {/* ── NAV ── */}
      <nav className="pp-nav">
        <div className="pp-nav-inner">
          <button className="pp-back-btn" onClick={goBack}>
            {isRTL ? <IconForward /> : <IconBack />}
          </button>
          <span className="pp-nav-title">{isHe ? "הפרופיל שלי" : "My Profile"}</span>
          {!editing ? (
            <button className="hb pp-btn-edit" onClick={() => setEditing(true)}>
              <IconEdit /> {isHe ? "עריכה" : "Edit"}
            </button>
          ) : (
            <div className="pp-btn-row">
              <button className="hb pp-btn-cancel" onClick={() => setEditing(false)}>
                {isHe ? "ביטול" : "Cancel"}
              </button>
              <button className="hb pp-btn-save" onClick={handleSave}>
                <IconSave /> {isHe ? "שמור" : "Save"}
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ── TOAST ── */}
      {saved && (
        <div className="pp-toast">
          {isHe ? "הפרופיל עודכן בהצלחה!" : "Profile saved!"}
        </div>
      )}

      <div className="pp-wrap">

        {/* ── HERO ── */}
        <div className="pp-card pp-hero">
          <div className="pp-hero-flex">
            <div className="pp-hero-avatar" onClick={pickFile} title={isHe ? "החלף תמונה" : "Change photo"}>
              <div className="pp-avatar-box">
                {profilePicture
                  ? <img src={profilePicture} alt="" />
                  : (fullName || "?").split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
              </div>
              <span className="pp-avatar-cam" style={{ [isRTL ? "left" : "right"]: -3 }}>
                <IconCamera />
              </span>
              <input ref={fileRef} type="file" accept="image/*" onChange={onPickImage} style={{ display: "none" }} />
            </div>
            <div className="pp-hero-info">
              <h1 className="pp-hero-name">{fullName}</h1>
              <p className="pp-hero-spec">{specialty || (isHe ? "בעל מקצוע" : "Professional")}</p>
              <div className="pp-hero-rating">
                <IconStar filled size={15} />
                <span className="pp-rating-val">{reviewCount > 0 ? Number(rating).toFixed(2) : (isHe ? "חדש" : "New")}</span>
                <span className="pp-rating-count">({reviewCount} {isHe ? "ביקורות" : "reviews"})</span>
              </div>
              <div className="pp-hero-actions">
                <button className="pp-link-btn" onClick={pickFile}>{isHe ? "העלה תמונה" : "Upload photo"}</button>
                {profilePicture && (
                  <button className="pp-link-btn pp-link-btn--danger" onClick={removePhoto}>{isHe ? "הסר" : "Remove"}</button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── TWO COLUMNS ── */}
        <div className="pp-grid">

          {/* LEFT — Personal Details */}
          <div className="pp-card pp-fade-1">
            <h2 className="pp-sec-title">
              <span className="pp-sec-ico pp-sec-ico--blue"><IconUser /></span>
              {isHe ? "פרטים אישיים" : "Personal Details"}
            </h2>
            <div className="pp-fields">
              <div>
                <div className="pp-field-label"><IconUser /> {isHe ? "שם מלא" : "Full Name"}</div>
                <input className={fieldCls()} value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={!editing} />
              </div>
              <div>
                <div className="pp-field-label"><IconPhone size={15} /> {isHe ? "טלפון" : "Phone"}</div>
                <input className={fieldCls("pp-input--ltr")} value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!editing} />
              </div>
              <div>
                <div className="pp-field-label"><IconMail /> {isHe ? "אימייל" : "Email"}</div>
                <input className={fieldCls("pp-input--ltr")} value={email} onChange={(e) => setEmail(e.target.value)} disabled={!editing} />
              </div>
              <div>
                <div className="pp-field-label"><IconEdit /> {isHe ? "תיאור" : "Description"}</div>
                <textarea className={fieldCls("pp-textarea")} value={bio} onChange={(e) => setBio(e.target.value)} disabled={!editing} rows={3} />
              </div>
            </div>
          </div>

          {/* RIGHT — Pricing + Rating */}
          <div className="pp-col">

            {/* Price Range */}
            <div className="pp-card pp-fade-2">
              <h2 className="pp-sec-title pp-sec-title--tight">
                <span className="pp-sec-ico pp-sec-ico--amber">{SHEKEL}</span>
                {isHe ? "טווח מחירים" : "Price Range"}
              </h2>
              <div className="pp-price-row">
                <div className="pp-price-col">
                  <div className="pp-field-label">{isHe ? "מחיר מינימלי" : "Minimum"} ({SHEKEL})</div>
                  <input className={fieldCls("pp-input--num")} type="number" value={minPrice} onChange={(e) => setMinPrice(Number(e.target.value))} disabled={!editing} />
                </div>
                <div className="pp-price-col">
                  <div className="pp-field-label">{isHe ? "מחיר מקסימלי" : "Maximum"} ({SHEKEL})</div>
                  <input className={fieldCls("pp-input--num")} type="number" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} disabled={!editing} />
                </div>
              </div>
              <div className="pp-price-summary">
                <span className="pp-price-summary-label">{isHe ? "טווח מחירים שלך" : "Your Price Range"}</span>
                <span className="pp-price-summary-val">{SHEKEL}{minPrice} - {SHEKEL}{maxPrice}</span>
              </div>
            </div>

            {/* Rating + Reviews */}
            <div className="pp-card pp-fade-3">
              <h2 className="pp-sec-title pp-sec-title--tighter">
                <span className="pp-sec-ico pp-sec-ico--star">⭐</span>
                {isHe ? "דירוג ממוצע" : "Average Rating"}
              </h2>
              <div className="pp-rating-block">
                <div style={{ textAlign: "center" }}>
                  <p className="pp-rating-big">{reviewCount > 0 ? Number(rating).toFixed(1) : "—"}</p>
                  <div className="pp-rating-stars">
                    {[1, 2, 3, 4, 5].map((s) => <IconStar key={s} filled size={15} />)}
                  </div>
                </div>
                <div className="pp-rating-side">
                  <p className="pp-rating-count-line">{reviewCount} {isHe ? "ביקורות מאומתות" : "Verified Reviews"}</p>
                  <p className="pp-rating-sub">{isHe ? "מבוסס על משוב לקוחות מאומתים" : "Based on verified client feedback"}</p>
                </div>
              </div>

              {/* Reviews */}
              <div className="pp-reviews">
                {reviews.length === 0 && (
                  <div className="pp-review-empty">{isHe ? "עדיין אין ביקורות" : "No reviews yet"}</div>
                )}
                {visibleReviews.map((rev, i) => (
                  <div key={i} className="pp-review">
                    <div className="pp-review-head">
                      {/* צבע האווטאר נגזר מהמיקום ברשימה — לכן נשאר inline */}
                      <div className="pp-review-avatar" style={{ background: `hsl(${i * 70 + 210},55%,92%)`, color: `hsl(${i * 70 + 210},55%,40%)` }}>
                        {L(rev.name).charAt(0)}
                      </div>
                      <div className="pp-review-body">
                        <div className="pp-review-line">
                          <span className="pp-review-name">{L(rev.name)}</span>
                          <span className="pp-review-date">{L(rev.date)}</span>
                        </div>
                        <div className="pp-review-stars">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <svg key={s} width="11" height="11" viewBox="0 0 24 24" fill={s <= rev.rating ? "#FBBF24" : "none"} stroke={s <= rev.rating ? "#FBBF24" : "#D1D5DB"} strokeWidth="1.5">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="pp-review-text">{L(rev.text)}</p>
                  </div>
                ))}

                {/* Show More / Less */}
                {reviews.length > 2 && (
                  <button className="hb pp-showmore" onClick={() => setShowAllReviews(!showAllReviews)}>
                    {showAllReviews
                      ? (isHe ? "הצג פחות" : "Show Less")
                      : (isHe ? "הצג עוד ביקורות" : "Show More Reviews")}
                    <IconChevron up={showAllReviews} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── SERVICE AREAS ── */}
        <div className="pp-card pp-areas-card">
          <h2 className="pp-sec-title pp-sec-title--tight">
            <span className="pp-sec-ico pp-sec-ico--green"><IconMapPin /></span>
            {isHe ? "אזורי שירות" : "Service Areas"}
          </h2>

          <div className="pp-areas">
            {areas.map((area, i) => (
              <span key={i} className="area-chip">
                <IconMapPin /> {L(area)}
                {editing && (
                  <button className="pp-chip-x" onClick={() => removeArea(i)}>
                    <IconX />
                  </button>
                )}
              </span>
            ))}
            {editing && (
              <button className="pp-add-area" onClick={() => setShowAreaPicker(!showAreaPicker)}>
                <IconPlus /> {isHe ? "הוסף אזור" : "Add Area"}
              </button>
            )}
          </div>

          {showAreaPicker && (
            <div className="pp-picker">
              {ALL_AREAS.filter((a) => !areas.find((x) => x.en === a.en)).map((area, i) => (
                <button key={i} className="pp-picker-item" onClick={() => addArea(area)}>
                  <IconMapPin /> {L(area)}
                </button>
              ))}
              {ALL_AREAS.filter((a) => !areas.find((x) => x.en === a.en)).length === 0 && (
                <p className="pp-picker-empty">{isHe ? "כל האזורים נבחרו" : "All areas selected"}</p>
              )}
            </div>
          )}

          {/* מפת אזורי השירות — OpenStreetMap חינמית עם סימון לכל עיר */}
          {areas.length > 0 ? (
            <ServiceMap areas={areas} isHe={isHe} />
          ) : (
            <div className="pp-map">
              <div className="pp-map-ico">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              </div>
              <p className="pp-map-title">{isHe ? "אין אזורי שירות עדיין" : "No service areas yet"}</p>
              <p className="pp-map-sub">{isHe ? "הוסיפו אזור כדי לראות אותו על המפה" : "Add an area to see it on the map"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
