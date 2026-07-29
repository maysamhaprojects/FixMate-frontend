import AppChrome from "../components/AppChrome";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLang, getDir } from "../context/LanguageContext";
import { IconBack } from "../components/GuideIcons";
import StepGuide from "../components/StepGuide";
import { GUIDES_EN, GUIDES_HE, EXCERPT } from "../data/selfHelpGuides";
import "../styles/mindMap.css";

/*
  FixMate — Self-Help Center (מרכז עזרה עצמית)
  ROUTE: /client/mindmap
  הלקוח בוחר את סוג התקלה ומקבל מדריך שלב-אחר-שלב לפתרון עצמי.
  אם לא הצליח — כפתור להזמנת בעל מקצוע.

  אייקונים → components/GuideIcons.jsx
  אקורדיון → components/StepGuide.jsx
  מדריכים  → data/selfHelpGuides.js
  עיצוב    → styles/mindMap.css
*/

export default function MindMap() {
  const navigate = useNavigate();
  const lang = getLang();
  const dir = getDir();
  const isHe = lang === "he";
  const [selectedId, setSelectedId] = useState(null);

  const GUIDES = isHe ? GUIDES_HE : GUIDES_EN;
  const guide = GUIDES.find((g) => g.id === selectedId);

  return (
    <div className="mm-page" dir={dir} style={{ fontFamily: isHe ? "'Heebo',sans-serif" : "'DM Sans',sans-serif" }}>

      {/* NAV */}
      <AppChrome />

      {/* שורת כותרת + חזרה לרשימה בעת צפייה במדריך */}
      <div className="mm-actionbar">
        <div className="mm-nav-inner">
          <div className="mm-nav-mid">
            <span className="mm-nav-title">
              {guide ? guide.title : (isHe ? "מרכז עזרה עצמית" : "Self-Help Center")}
            </span>
            <span className="mm-nav-sub">
              {guide
                ? (isHe ? "לחצו על שלב לפרטים" : "Tap a step for details")
                : (isHe ? "פתרו תקלות נפוצות בעצמכם" : "Fix common problems yourself")}
            </span>
          </div>
          {selectedId && (
            <button className="mm-back-btn" onClick={() => setSelectedId(null)}>
              <IconBack /> {isHe ? "לרשימה" : "Back"}
            </button>
          )}
        </div>
      </div>

      {guide ? (
        <StepGuide guide={guide} isHe={isHe} navigate={navigate} />
      ) : (
        <div className="mm-wrap">
          {/* כותרת עם קו תחתון */}
          <div className="mm-head">
            <h1 className="mm-h1">{isHe ? "תקלות נפוצות" : "Common Problems"}</h1>
            <svg className="mm-underline" width="150" height="14" viewBox="0 0 150 14">
              <path d="M3 8 Q75 16 147 6" stroke="#2563EB" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            </svg>
            <p className="mm-head-sub">
              {isHe ? "מדריכים לפתרון עצמי — נסו לתקן לבד לפני שמזמינים בעל מקצוע" : "Self-help guides — try fixing it yourself before booking a pro"}
            </p>
          </div>

          {/* כרטיסי מאמרים */}
          <div className="mm-grid">
            {GUIDES.map((g) => (
              <div key={g.id} className="helpCard" onClick={() => setSelectedId(g.id)}>
                {/* כותרת הכרטיס — גרדיאנט צבעוני + אימוג'י גדול (עיצוב אחיד, ללא תלות בתמונה חיצונית) */}
                <div className="mm-cover" style={{ background: `linear-gradient(135deg,${g.color},${g.color}bb)` }}>
                  <span className="mm-cover-icon">{g.icon}</span>
                </div>
                {/* גוף הכרטיס */}
                <div className="mm-card-body">
                  <div className="mm-card-head">
                    <span className="mm-card-icon">{g.icon}</span>
                    <h3 className="mm-card-title">{g.title}</h3>
                  </div>
                  <p className="mm-card-excerpt">
                    {(EXCERPT[isHe ? "he" : "en"] || {})[g.id] || g.desc}
                  </p>
                  <div className="mm-card-foot">
                    <span className="mm-card-steps">{g.steps.length} {isHe ? "שלבים" : "steps"}</span>
                    <span className="mm-card-more">{isHe ? "קרא עוד ←" : "Read more →"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
