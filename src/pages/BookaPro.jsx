import { useNavigate } from "react-router-dom";
import { useLang, LangToggle } from "../context/LanguageContext";
import { useBooking } from "../hooks/useBooking";
import { IconBack, IconForward, IconCheck, IconLocation, IconClock, IconX, IconSearch, IconPin, IconCalendar, IconClockLg, IconCamera, IconSend } from "../components/BookIcons";
import { catIcons, CAT_LABEL_KEYS, TIME_OPTIONS } from "../data/bookingCatalog";
import "../styles/bookaPro.css";

/*
  FixMate - Book a Pro (with AI Chatbot Step 1)
  Step 1: Photo upload + AI chatbot identifies issue
  Step 2: Fill location + date + time
  Step 3: Show professionals → book

  אייקונים → components/BookIcons.jsx
  קטלוג    → data/bookingCatalog.js
  לוגיקה   → hooks/useBooking.js
  עיצוב    → styles/bookaPro.css
*/

export default function BookaPro() {
  const navigate = useNavigate();
  const { t, dir, lang } = useLang();
  const isRTL = dir === "rtl";
  const isHe = lang === "he";

  /* כל הלוגיקה מגיעה מ-hooks/useBooking.js */
  const {
    step,
    cat, catLabel, issueLabel, timeLabel,
    msgs, chatInput, setChatInput, analyzing, diagnosis,
    fileRef, chatEndRef, handlePhoto, handleTextSend, confirmDiagnosis,
    cityQ, setCityQ, city, setCity, dd, setDd,
    date, setDate, time, setTime,
    filtered, ready, today, fmtDate,
    iRef, dRef,
    results, setResults, visiblePros, prosLoading,
    modal, setModal, ok, booking, bookErr,
    desc, setDesc, confirmBooking,
    goBack,
  } = useBooking({ t, lang, isHe, navigate });

  const BackIcon = isRTL ? IconForward : IconBack;

  const renderBotText = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) =>
      p.startsWith("**") && p.endsWith("**")
        ? <strong key={i} className="bp-bot-strong">{p.slice(2, -2)}</strong>
        : p.includes("\n\n") ? <span key={i}>{p.split("\n\n").map((s, j) => <span key={j}>{j > 0 && <><br /><br /></>}{s}</span>)}</span> : p
    );
  };

  /* מחלקת שדה — נצבע בכחול כשיש ערך */
  const fldCls = (filled, extra = "") => "bp-fld" + (filled ? " bp-fld--filled" : "") + (extra ? " " + extra : "");

  return (
    <div className="bp-page" dir={dir} style={{ textAlign: isRTL ? "right" : "left" }}>

      {/* NAV */}
      <nav className="bp-nav">
        <div className="bp-nav-inner">
          <button className="bp-back-btn" onClick={goBack}><BackIcon /></button>
          <span className="bp-nav-title">{t("bp_title")}</span>
          <LangToggle />
        </div>
      </nav>

      {/* STEPPER */}
      <div className="bp-stepper-wrap">
        <div className="bp-stepper">
          {[1, 2, 3].map((s, i) => {
            const done = step >= s || (s === 3 && results);
            const now  = step === s || (s === 3 && results && step === 2);
            return (
              <div key={s} className="bp-step">
                <div className={"bp-step-circle" + (done ? " bp-step-circle--done" : "") + (now ? " bp-step-circle--now" : "")}>
                  {(step > s || (s <= 2 && results)) ? <IconCheck /> : s === 1 ? "📷" : s === 2 ? "📍" : "👷"}
                </div>
                {i < 2 && (
                  <div className={"bp-step-line" + ((step > s || (s === 1 && step >= 2) || (s === 2 && results)) ? " bp-step-line--done" : "")} />
                )}
              </div>
            );
          })}
        </div>
        <div className="bp-step-labels">
          {[isHe ? "צלם תקלה" : "Snap Issue", isHe ? "מיקום וזמן" : "When & Where", isHe ? "בחר מקצוען" : "Choose Pro"].map((l, i) => (
            <span key={i} className={"bp-step-label" + (step >= i + 1 ? " bp-step-label--active" : "")}>{l}</span>
          ))}
        </div>
      </div>

      <div className="bp-body">

        {/* ==================== STEP 1: CHATBOT ==================== */}
        {step === 1 && (
          <div className="bp-chat">
            {/* Chat header */}
            <div className="bp-chat-head">
              <div className="bp-bot-avatar">🤖</div>
              <div>
                <div className="bp-bot-name">{isHe ? "עוזר חכם" : "Smart Assistant"}</div>
                <div className="bp-bot-status">
                  <span className="bp-bot-dot" />
                  {isHe ? "מוכן לניתוח" : "Ready to analyze"}
                </div>
              </div>
            </div>

            {/* Chat messages */}
            <div className="bp-msgs">
              {msgs.map((m, i) => (
                <div key={i} className={"bp-msg-row" + (m.role === "user" ? " bp-msg-row--user" : "")}>
                  <div className={"bp-bubble" + (m.role === "user" ? " bp-bubble--user" : "") + (m.image ? " bp-bubble--img" : "")}>
                    {m.image ? <img src={m.image} alt="Issue" /> : renderBotText(m.text)}
                  </div>
                </div>
              ))}

              {/* Analyzing dots */}
              {analyzing && (
                <div className="bp-msg-row">
                  <div className="bp-typing">
                    {[0, 1, 2].map(d => (
                      /* ההשהיה שונה לכל נקודה כדי ליצור גל — לכן inline */
                      <span key={d} className="bp-typing-dot" style={{ animation: `pulse 1.2s ease-in-out ${d * 0.2}s infinite` }} />
                    ))}
                    <span className="bp-typing-text">{isHe ? "מנתח..." : "Analyzing..."}</span>
                  </div>
                </div>
              )}

              {/* Confirm button after diagnosis */}
              {diagnosis && !analyzing && (
                <div className="bp-confirm-row">
                  <button className="hb bp-confirm-btn" onClick={confirmDiagnosis}>
                    <IconCheck />
                    {isHe ? `אשר! תמצא לי ${t(CAT_LABEL_KEYS[diagnosis.cat])}` : `Got it! Find me a ${t(CAT_LABEL_KEYS[diagnosis.cat])}`}
                  </button>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input bar */}
            <div className="bp-inputbar">
              <div className="bp-inputbar-row">
                {/* Camera button */}
                <button className="bp-cam-btn" onClick={() => fileRef.current?.click()} title={isHe ? "צלם תמונה" : "Upload photo"}>
                  <IconCamera />
                </button>
                <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: "none" }} />

                {/* Text input */}
                <div className="bp-text-wrap">
                  <input
                    className="bp-text-input"
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleTextSend()}
                    placeholder={isHe ? "תאר את התקלה או צלם..." : "Describe the issue or snap a photo..."}
                    disabled={analyzing}
                  />
                </div>

                {/* Send button */}
                <button
                  className={"bp-send-btn" + (chatInput.trim() && !analyzing ? " bp-send-btn--on" : "")}
                  onClick={handleTextSend}
                  disabled={!chatInput.trim() || analyzing}
                >
                  <IconSend />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== STEP 2: WHEN & WHERE + RESULTS ==================== */}
        {step === 2 && (
          <div className="bp-step2">
            {/* Summary chips */}
            <div className="bp-chips">
              <span className="bp-chip">{catIcons[cat]} {catLabel}</span>
              <span className="bp-chip">🔧 {issueLabel}</span>
              {city && <span className="bp-chip bp-chip--city">📍 {city}</span>}
              {date && <span className="bp-chip bp-chip--date">📅 {fmtDate(date)}</span>}
              {time && <span className="bp-chip bp-chip--time">🕐 {timeLabel}</span>}
            </div>

            {/* FORM */}
            {results === false && (
              <div className="bp-card bp-card--form">
                <h2 className="bp-card-title">{t("bp_when_where")}</h2>
                <p className="bp-card-sub">{t("bp_when_where_sub")}</p>

                {/* Location */}
                <div className="bp-field">
                  <label className="bp-label">
                    <span className="bp-label-ico bp-label-ico--blue"><IconPin /></span>{t("bp_location")}
                  </label>
                  <div className="bp-city-wrap">
                    <div className={"bp-city-box" + (dd ? " bp-city-box--open" : "")}>
                      <span className="bp-city-ico"><IconSearch /></span>
                      <input
                        className="bp-city-input"
                        ref={iRef}
                        type="text"
                        placeholder={t("bp_search_city")}
                        value={cityQ}
                        onChange={e => { setCityQ(e.target.value); setDd(true); if (city) setCity(null); }}
                        onFocus={() => setDd(true)}
                      />
                      {cityQ && (
                        <button className="bp-city-clear" onClick={() => { setCity(null); setCityQ(""); iRef.current?.focus(); }}>
                          <IconX />
                        </button>
                      )}
                    </div>
                    {dd && (
                      <div className="bp-dd" ref={dRef}>
                        {filtered.length > 0 ? filtered.map(c => {
                          const mi = c.toLowerCase().indexOf(cityQ.toLowerCase());
                          return (
                            <div
                              key={c}
                              className={"hdd bp-dd-item" + (city === c ? " bp-dd-item--sel" : "")}
                              onClick={() => { setCity(c); setCityQ(c); setDd(false); }}
                            >
                              <span className="bp-dd-pin"><IconPin /></span>
                              <span className="bp-dd-text">
                                {cityQ && mi >= 0
                                  ? <>{c.slice(0, mi)}<strong>{c.slice(mi, mi + cityQ.length)}</strong>{c.slice(mi + cityQ.length)}</>
                                  : c}
                              </span>
                            </div>
                          );
                        }) : <div className="bp-dd-empty">{t("bp_no_cities")}</div>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Date + Time */}
                <div className="bp-datetime">
                  <div>
                    <label className="bp-label">
                      <span className="bp-label-ico bp-label-ico--orange"><IconCalendar /></span>{t("bp_date")}
                    </label>
                    <input className={fldCls(!!date)} type="date" value={date} min={today} onChange={e => setDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="bp-label">
                      <span className="bp-label-ico bp-label-ico--purple"><IconClockLg /></span>{t("bp_time")}
                    </label>
                    <select className={fldCls(!!time, "bp-select")} value={time} onChange={e => setTime(e.target.value)}>
                      <option value="" disabled>{t("bp_select_time")}</option>
                      <optgroup label={t("bp_morning")}>
                        {TIME_OPTIONS.filter(ti => parseInt(ti.value) < 12).map(ti => <option key={ti.value} value={ti.value}>{ti.label}</option>)}
                      </optgroup>
                      <optgroup label={t("bp_afternoon")}>
                        {TIME_OPTIONS.filter(ti => parseInt(ti.value) >= 12 && parseInt(ti.value) < 16).map(ti => <option key={ti.value} value={ti.value}>{ti.label}</option>)}
                      </optgroup>
                      <optgroup label={t("bp_evening")}>
                        {TIME_OPTIONS.filter(ti => parseInt(ti.value) >= 16).map(ti => <option key={ti.value} value={ti.value}>{ti.label}</option>)}
                      </optgroup>
                    </select>
                  </div>
                </div>

                <button className={"hb bp-search-btn" + (ready ? " bp-search-btn--on" : "")} disabled={!ready} onClick={() => setResults(true)}>
                  {t("bp_search_btn")}
                </button>
              </div>
            )}

            {/* RESULTS */}
            {results === true && city && (
              <div className="bp-card bp-card--results">
                <h2 className="bp-card-title">{t("bp_available_in")} {city}</h2>
                <p className="bp-card-sub bp-card-sub--tight">
                  {t("bp_found")} <strong>{visiblePros.length}</strong> {visiblePros.length > 1 ? t("bp_professionals") : t("bp_professional")} {catLabel ? "· " + catLabel : ""} {t("bp_for")} <strong>{fmtDate(date)}</strong> {t("bp_at")} <strong>{timeLabel}</strong>
                </p>

                {prosLoading && (
                  <div className="bp-loading">{isHe ? "טוען בעלי מקצוע..." : "Loading professionals..."}</div>
                )}
                {!prosLoading && visiblePros.length === 0 && (
                  <div className="bp-none">
                    <div className="bp-none-ico">
                      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    </div>
                    <p className="bp-none-title">{isHe ? `אין בעלי מקצוע זמינים ל${catLabel}` : `No professionals available for ${catLabel}`}</p>
                    <p className="bp-none-sub">{isHe ? "נסו קטגוריה אחרת, או שבעלי מקצוע יתווספו בקרוב" : "Try another category, or check back soon"}</p>
                  </div>
                )}

                <div className="bp-pros">
                  {visiblePros.map(p => {
                    const specLabel = p.specialty
                      ? (CAT_LABEL_KEYS[p.specialty] ? t(CAT_LABEL_KEYS[p.specialty]) : p.specialty)
                      : catLabel;
                    return (
                      <div key={p.id} className="hp bp-pro">
                        {/* Header strip */}
                        <div className="bp-pro-strip" />
                        <div className="bp-pro-body">
                          {/* Top: avatar + name + verified */}
                          <div className="bp-pro-top">
                            <div className="bp-pro-avatar">
                              {p.profilePicture ? <img src={p.profilePicture} alt="" /> : p.avatar}
                            </div>
                            <div className="bp-pro-idcol">
                              <div className="bp-pro-nameline">
                                <span className="bp-pro-name">{p.name}</span>
                                {/* Verified badge */}
                                <svg className="bp-pro-verified" width="17" height="17" viewBox="0 0 24 24" fill="#2563EB"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" fill="none" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              </div>
                              <span className="bp-pro-spec">{catIcons[p.specialty] || catIcons[cat] || "🛠️"} {specLabel}</span>
                            </div>
                          </div>

                          {/* Rating */}
                          <div className="bp-pro-rating">
                            <div className="bp-pro-stars">
                              {[1, 2, 3, 4, 5].map(s => (
                                /* הכוכב מתמלא לפי הציון — לכן inline */
                                <svg key={s} width="15" height="15" viewBox="0 0 24 24" fill={p.reviews > 0 && s <= Math.round(Number(p.rating)) ? "#F59E0B" : "#E2E8F0"}><polygon points="12 2 15 8.5 22 9.3 17 14 18.2 21 12 17.5 5.8 21 7 14 2 9.3 9 8.5"/></svg>
                              ))}
                            </div>
                            <span className="bp-pro-score">{p.rating}</span>
                            <span className="bp-pro-reviews">({p.reviews} {t("bp_reviews")})</span>
                          </div>

                          {/* Info rows */}
                          <div className="bp-pro-info">
                            <div className="bp-pro-info-row"><IconLocation />{p.city}</div>
                            <div className="bp-pro-info-row"><IconClock />{p.expYears} {t("bp_yrs_exp")}</div>
                            <div className="bp-pro-priceline">
                              <span className="bp-pro-price">₪{p.price}<span className="bp-pro-price-unit"> / {isHe ? "שעה" : "hr"}</span></span>
                              <span className="bp-pro-avail"><span className="bp-pro-avail-dot" />{isHe ? "זמין" : "Available"}</span>
                            </div>
                          </div>

                          <button className="hb bp-book-btn" onClick={() => setModal(p)}>{t("bp_book_now")}</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL */}
      {modal && (
        <div className="bp-modal-root">
          <div className="bp-modal-backdrop" onClick={() => setModal(null)} />
          <div className="bp-modal" dir={dir} style={{ textAlign: isRTL ? "right" : "left" }}>
            <div className="bp-modal-head">
              <div>
                <h3 className="bp-modal-title">{t("bp_confirm_title")}</h3>
                <p className="bp-modal-sub">{modal.name} — {catLabel}</p>
              </div>
              <button className="bp-modal-x" onClick={() => setModal(null)}><IconX /></button>
            </div>
            <div className="bp-summary">
              {[
                { icon: <IconPin />, color: "#2563EB", text: city },
                { icon: <IconCalendar />, color: "#C2410C", text: fmtDate(date) },
                { icon: <IconClockLg />, color: "#7C3AED", text: timeLabel },
                { icon: <span style={{ fontSize: 16 }}>{catIcons[cat]}</span>, color: null, text: `${catLabel} — ${issueLabel}` },
              ].map((r, i) => (
                <div key={i} className="bp-summary-row">
                  {/* צבע האייקון שונה לכל שורה */}
                  <span className="bp-summary-ico" style={{ color: r.color }}>{r.icon}</span>
                  <span className="bp-summary-text"><strong>{r.text}</strong></span>
                </div>
              ))}
            </div>
            <div className="bp-notes-field">
              <label className="bp-notes-label">{t("bp_notes")}</label>
              <textarea className="bp-notes" value={desc} onChange={e => setDesc(e.target.value)} placeholder={t("bp_notes_placeholder")} />
            </div>

            {/* Cancellation Policy */}
            <div className="bp-policy">
              <div className="bp-policy-head">
                <span className="bp-policy-emoji">⚠️</span>
                <span className="bp-policy-title">{t("bp_cancel_policy")}</span>
              </div>
              <div className="bp-policy-list">
                <div className="bp-policy-row">
                  <span className="bp-policy-badge bp-policy-badge--free">✅</span>
                  <span className="bp-policy-text">
                    {isHe ? "ביטול" : "Cancel"} <strong className="free">{t("bp_cancel_free")}</strong> {t("bp_cancel_before")} — <strong className="free">{t("bp_cancel_free_label")}</strong>
                  </span>
                </div>
                <div className="bp-policy-row">
                  <span className="bp-policy-badge bp-policy-badge--paid">💰</span>
                  <span className="bp-policy-text">
                    {isHe ? "ביטול" : "Cancel"} <strong className="paid">{t("bp_cancel_paid")}</strong> {t("bp_cancel_before")} — <strong className="paid">{t("bp_cancel_paid_label")}</strong>
                  </span>
                </div>
              </div>
            </div>

            {bookErr && <p className="bp-book-err">{bookErr}</p>}
            <button className="bp-modal-ok" disabled={booking} onClick={confirmBooking}>
              {booking ? (isHe ? "יוצר הזמנה..." : "Creating...") : t("bp_confirm_btn")}
            </button>
          </div>
        </div>
      )}

      {/* SUCCESS */}
      {ok && (
        <div className="bp-success-root">
          <div className="bp-success" dir={dir}>
            <div className="bp-success-check">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h3 className="bp-success-title">{t("bp_success")}</h3>
            <p className="bp-success-sub">{t("bp_success_sub")}<br />{t("bp_redirect")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
