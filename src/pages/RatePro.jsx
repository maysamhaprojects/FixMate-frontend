import { useNavigate, useSearchParams } from "react-router-dom";
import { getLang, getDir } from "../context/LanguageContext";
import { useRatePro } from "../hooks/useRatePro";
import { RATING_LABELS_HE, RATING_LABELS_EN, RATING_EMOJIS, RATING_COLORS } from "../data/reviewPhrases";
import "../styles/ratePro.css";

/*
  FixMate - Rate a Pro
  ROUTE: /client/rate

  ניסוחים → data/reviewPhrases.js
  שכתוב   → utils/improveReview.js
  לוגיקה  → hooks/useRatePro.js
  עיצוב   → styles/ratePro.css
*/

/* אייקון "שיפור עם AI" */
const IconSparkle = ({ stroke = "currentColor" }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v4m0 14v-4m-9-5h4m14 0h-4m-1.5-6.5L13 7m-2 10l-2.5 2.5M19.5 7.5L17 10M7 14l-2.5 2.5" />
  </svg>
);

export default function RatePro() {
  const navigate = useNavigate();
  const sp = useSearchParams()[0];
  const proName = sp.get("pro") || "Your Professional";
  const service = sp.get("service") || "Service";
  const bookingId = sp.get("bookingId");
  const lang = getLang();
  const dir = getDir();
  const isHe = lang === "he";

  /* כל הלוגיקה מגיעה מ-hooks/useRatePro.js */
  const {
    rating, setRating,
    hovering, setHovering,
    submitted,
    comment, setComment, commentIsHebrew,
    aiLoading, aiSuggestion, showSuggestion, detectedHe,
    submitErr, submitting,
    handleSubmit, handleAiImprove, handleAcceptAi, handleRejectAi,
  } = useRatePro({ isHe, bookingId, navigate });

  const labels = isHe ? RATING_LABELS_HE : RATING_LABELS_EN;
  const shown = hovering || rating;

  return (
    <div className="rp-page" dir={dir}>

      {submitted && (
        <div className="rp-done">
          <div className="rp-done-check">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h2 className="rp-done-title">{isHe ? "תודה רבה! 🎉" : "Thank You! 🎉"}</h2>
          <p className="rp-done-sub">
            {isHe ? `הדירוג של ${rating} כוכבים נשלח.` : `Your ${rating}-star rating has been submitted.`}
            {comment.trim() && (<><br />{isHe ? "המשוב שלך נרשם בהצלחה ✅" : "Your review has been recorded ✅"}</>)}
            <br />
            {isHe ? "מעביר לדשבורד..." : "Redirecting to dashboard..."}
          </p>
        </div>
      )}

      {!submitted && (
        <div className="rp-card">
          <div className="rp-avatar">
            {proName.split(" ").map((w) => w[0]).join("").slice(0, 2)}
          </div>
          <h2 className="rp-title">{isHe ? "איך הייתה החוויה?" : "How was your experience?"}</h2>
          <p className="rp-sub">
            {isHe ? "דרגו את " : "Rate "}<strong>{proName}</strong>
          </p>
          <p className="rp-service">{service}</p>

          {/* ── כוכבים ── */}
          <div className="rp-stars">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = star <= shown;
              const activeColor = RATING_COLORS[shown] || "#E2E8F0";
              return (
                <button
                  key={star}
                  className={"starBtn" + (active ? " starBtn--active" : "")}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovering(star)}
                  onMouseLeave={() => setHovering(0)}
                >
                  {/* צבע הכוכב נגזר מהציון — לכן inline */}
                  <svg width="44" height="44" viewBox="0 0 24 24" fill={active ? activeColor : "none"} stroke={active ? activeColor : "#D1D5DB"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
              );
            })}
          </div>

          <div className="rp-label-row">
            {shown > 0 && (
              <div className="rp-label">
                <span className="rp-label-emoji">{RATING_EMOJIS[shown]}</span>
                <span className="rp-label-text" style={{ color: RATING_COLORS[shown] }}>{labels[shown]}</span>
              </div>
            )}
          </div>

          {/* ── Comment Box ── */}
          {rating > 0 && (
            <div className="rp-comment" style={{ textAlign: isHe ? "right" : "left" }}>
              <label className="rp-comment-label">
                {isHe ? "ספרו לנו עוד (אופציונלי)" : "Tell us more (optional)"}
              </label>
              <textarea
                className="rp-textarea"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={isHe ? "מה היה טוב? מה אפשר לשפר? ספרו לנו..." : "What went well? What could improve? Share your thoughts..."}
                rows={3}
                maxLength={500}
              />
              <div className="rp-counter-row">
                <span className="rp-hint">
                  {rating <= 2
                    ? (isHe ? "💡 המשוב שלך עוזר לנו להשתפר" : "💡 Your feedback helps us improve")
                    : (isHe ? "✨ נשמח לשמוע עוד" : "✨ We’d love to hear more")}
                </span>
                <span className={"rp-counter" + (comment.length > 450 ? " rp-counter--warn" : "")}>{comment.length}/500</span>
              </div>

              {/* ── AI Improve Button ── */}
              {comment.trim().length >= 3 && !showSuggestion && (
                <button className="rp-ai-btn" onClick={handleAiImprove} disabled={aiLoading}>
                  {aiLoading ? (
                    <>
                      <span className="rp-spinner" />
                      {commentIsHebrew ? "משפר את הטקסט..." : "Improving your text..."}
                    </>
                  ) : (
                    <>
                      <IconSparkle />
                      {commentIsHebrew ? "✨ שפרו טקסט עם AI" : "✨ Improve with AI"}
                    </>
                  )}
                </button>
              )}

              {/* ── AI Suggestion Panel ── */}
              {showSuggestion && (
                <div className="rp-suggestion">
                  <div className="rp-suggestion-head">
                    <IconSparkle stroke="#4F46E5" />
                    <span className="rp-suggestion-title">
                      {detectedHe ? "גרסה משופרת:" : "Improved version:"}
                    </span>
                  </div>
                  <p className={"rp-suggestion-text " + (detectedHe ? "rp-suggestion-text--he" : "rp-suggestion-text--en")}>
                    {aiSuggestion}
                  </p>
                  <div className="rp-suggestion-btns">
                    <button className="rp-accept" onClick={handleAcceptAi}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      {detectedHe ? "אשרו גרסה" : "Accept"}
                    </button>
                    <button className="rp-reject" onClick={handleRejectAi}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      {detectedHe ? "השארו מקורי" : "Keep original"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {submitErr && <p className="rp-err">{submitErr}</p>}
          <button
            className={"rp-submit" + (rating > 0 ? " rp-submit--on" : "")}
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
          >
            {submitting
              ? (isHe ? "שולח..." : "Submitting...")
              : isHe
                ? (comment.trim() ? "⭐ שלחו דירוג ומשוב" : "⭐ שלחו דירוג")
                : (comment.trim() ? "⭐ Submit Rating & Review" : "⭐ Submit Rating")}
          </button>

          <button className="rp-skip" onClick={() => navigate("/client/dashboard")}>
            {isHe ? "דלגו לעת עתה" : "Skip for now"}
          </button>
        </div>
      )}
    </div>
  );
}
