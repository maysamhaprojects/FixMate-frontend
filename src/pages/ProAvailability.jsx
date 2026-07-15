/**
 * FixMate — Pro Weekly Availability
 * ROUTE: /pro/availability
 * API: GET /api/pro/availability · PUT /api/pro/availability (per day)
 *
 * ימי השבוע → data/weekDays.js
 * לוגיקה    → hooks/useAvailability.js
 * עיצוב     → styles/availability.css
 */
import { useNavigate } from "react-router-dom";
import { getLang, getDir } from "../context/LanguageContext";
import { useAvailability } from "../hooks/useAvailability";
import { DAYS } from "../data/weekDays";
import "../styles/availability.css";

const IconBack  = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>);
const IconClock = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>);

export default function ProAvailability() {
  const navigate = useNavigate();
  const lang = getLang();
  const dir = getDir();
  const isHe = lang === "he";

  /* כל הלוגיקה מגיעה מ-hooks/useAvailability.js */
  const { mounted, saving, toast, showSuccess, week, updateDay, handleSave } =
    useAvailability({ isHe, navigate });

  return (
    <div className="av-page" dir={dir} style={{ opacity: mounted ? 1 : 0 }}>

      {/* Top nav */}
      <nav className="av-nav">
        <button className="av-back" onClick={() => navigate("/pro/dashboard")}>
          <IconBack /> {isHe ? "לדשבורד" : "Dashboard"}
        </button>
        <h1 className="av-logo">Fix<b>Mate</b></h1>
        <div className="av-nav-spacer" />
      </nav>

      <div className="av-wrap">
        <div className="av-head">
          <h2 className="av-title">{isHe ? "זמינות שבועית" : "Weekly Availability"}</h2>
          <p className="av-sub">
            {isHe ? "הגדירו באילו ימים ושעות אתם זמינים לעבודה" : "Set the days and hours you're available for work"}
          </p>
        </div>

        {/* Day rows */}
        <div className="av-card">
          {week.map((row, i) => {
            const d = DAYS[i];
            return (
              <div key={row.day} className="av-row">
                {/* Toggle + day name */}
                <div className="av-day">
                  <button
                    className={"av-toggle" + (row.available ? " av-toggle--on" : "")}
                    onClick={() => updateDay(i, { available: !row.available })}
                  >
                    <span />
                  </button>
                  <span className={"av-day-name" + (row.available ? " av-day-name--on" : "")}>
                    {isHe ? d.he : d.en}
                  </span>
                </div>

                {/* Time range */}
                {row.available ? (
                  <div className="av-times">
                    <IconClock />
                    <input className="av-time-input" type="time" value={row.start} onChange={(e) => updateDay(i, { start: e.target.value })} />
                    <span className="av-dash">–</span>
                    <input className="av-time-input" type="time" value={row.end} onChange={(e) => updateDay(i, { end: e.target.value })} />
                  </div>
                ) : (
                  <span className="av-off">{isHe ? "לא זמין" : "Unavailable"}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Save */}
        <button className="av-save" onClick={handleSave} disabled={saving}>
          {saving ? (isHe ? "שומר..." : "Saving...") : (isHe ? "שמור זמינות" : "Save Availability")}
        </button>
      </div>

      {/* Success modal — קופץ ואז חוזרים לדשבורד */}
      {showSuccess && (
        <div className="av-success-root">
          <div className="av-success">
            <div className="av-success-check">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="9 12 11.5 14.5 16 9.5" />
              </svg>
            </div>
            <h3 className="av-success-title">{isHe ? "הזמינות נשמרה!" : "Availability saved!"}</h3>
            <p className="av-success-sub">{isHe ? "מעבירים אותך לדשבורד..." : "Redirecting to dashboard..."}</p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={"av-toast" + (toast.ok ? "" : " av-toast--err")}>
          {toast.ok ? "✅ " : "⚠️ "}{toast.msg}
        </div>
      )}
    </div>
  );
}
