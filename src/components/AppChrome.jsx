/**
 * ============================================================
 *  FixMate — AppChrome
 *  מעטפת ניווט אחידה לכל דפי הלקוח ובעל המקצוע (כולל הדשבורדים):
 *    • Navbar עליון — לוגו + כפתור הסתרת Sidebar + שפה
 *    • Sidebar צד   — אווטאר פרופיל למעלה, קישורי ניווט לפי עדיפות,
 *                     תמונות שירות מתחלפות, ויציאה
 *  קומפוננטה אחת, import אחד לכל דף. מסיטה את תוכן הדף אוטומטית.
 * ============================================================
 */
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../services/auth";
import { getLang, getDir, LangToggle } from "../context/LanguageContext";
import {
  IconSearch, IconCamera, IconMindMap, IconLogout,
  IconClock, IconHistory, IconWrench,
} from "./Icons";
import "../styles/appchrome.css";

/* קישורי הניווט לפי תפקיד — לפי סדר עדיפות (הפרופיל מוצג נפרד למעלה) */
const CLIENT_LINKS = [
  { to: "/client/dashboard", icon: <IconWrench />,  he: "ראשי",          en: "Home" },
  { to: "/client/search",    icon: <IconSearch />,  he: "הזמן בעל מקצוע", en: "Book a Pro" },
  { to: "/client/snap",      icon: <IconCamera />,  he: "צלם תקלה",       en: "Snap Issue" },
  { to: "/client/mindmap",   icon: <IconMindMap />, he: "מרכז עזרה",      en: "Self-Help" },
];
const PRO_LINKS = [
  { to: "/pro/dashboard",    icon: <IconWrench />,  he: "ראשי",   en: "Home" },
  { to: "/pro/orders",       icon: <IconHistory />, he: "הזמנות",  en: "Orders" },
  { to: "/pro/availability", icon: <IconClock />,   he: "זמינות",  en: "Availability" },
];

/* תמונות שירות מתחלפות — מכסות את כל רקע ה-Sidebar.
   תמונות קבועות ורלוונטיות של בעלי מקצוע מ-Pexels (חינמי, ללא ייחוס);
   מזהים ספציפיים ולא אקראי, חתוכות לפורמט אנכי שממלא את ה-Sidebar.
   גרדיאנט כהה מבטיח קריאוּת, ו-onError מסתיר תמונה שבורה. */
const px = (id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=500&h=1000`;
const SIDE_IMAGES = [
  { he: "חשמל",    en: "Electrical", img: px(442160) },
  { he: "שרברבות", en: "Plumbing",   img: px(29226620) },
  { he: "מזגנים",  en: "AC",         img: px(32497161) },
  { he: "נגרות",   en: "Carpentry",  img: px(18947396) },
  { he: "צביעה",   en: "Painting",   img: px(18369835) },
  { he: "ניקיון",  en: "Cleaning",   img: px(4239037) },
];

export default function AppChrome() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHe = getLang() === "he";
  const dir = getDir();

  const isPro = (localStorage.getItem("role") || "CLIENT").toUpperCase() === "PROFESSIONAL";
  const links = isPro ? PRO_LINKS : CLIENT_LINKS;
  const profilePath = isPro ? "/pro/profile" : "/client/profile";

  const name = localStorage.getItem("fullName") || (isHe ? "משתמש" : "User");
  const email = localStorage.getItem("email") || "";
  const pic = localStorage.getItem("profilePicture") || "";
  const initial = (name.trim()[0] || "U").toUpperCase();

  const [open, setOpen] = useState(       // פתוח בדסקטופ, סגור במובייל
    typeof window !== "undefined" ? window.innerWidth > 900 : true
  );
  const [imgIdx, setImgIdx] = useState(0);  // תמונת השירות הנוכחית

  /* מסיט את תוכן הדף בהתאם למצב ה-Sidebar */
  useEffect(() => {
    document.body.classList.add("has-chrome");
    document.body.classList.toggle("sb-hidden", !open);
    return () => document.body.classList.remove("has-chrome", "sb-hidden");
  }, [open]);

  /* החלפת תמונת השירות כל 4 שניות */
  useEffect(() => {
    const id = setInterval(() => setImgIdx((i) => (i + 1) % SIDE_IMAGES.length), 4000);
    return () => clearInterval(id);
  }, []);

  const go = (to) => navigate(to);
  const isActive = (to) => location.pathname === to;
  const isProfile = isActive(profilePath);
  const sideImg = SIDE_IMAGES[imgIdx];

  return (
    <div dir={dir}>
      {/* ═══ Navbar עליון ═══ */}
      <header className="ac-nav">
        <button type="button" className="ac-toggle" onClick={() => setOpen((o) => !o)} aria-label="toggle sidebar">
          <span /><span /><span />
        </button>

        <button type="button" className="ac-logo" onClick={() => go(isPro ? "/pro/dashboard" : "/client/dashboard")}>
          <span className="ac-logo-icon"><IconWrench /></span>
          <span className="ac-logo-text">Fix<span className="ac-logo-accent">Mate</span></span>
          {isPro && <span className="ac-logo-tag">PRO</span>}
        </button>

        <div className="ac-nav-right">
          <LangToggle />
        </div>
      </header>

      {/* רקע כהה למגירה במובייל */}
      {open && <div className="ac-scrim" onClick={() => setOpen(false)} />}

      {/* ═══ Sidebar צד ═══ */}
      <aside className={"ac-side" + (open ? " ac-side--open" : "")}>

        {/* רקע — תמונות שירות מתחלפות המכסות את כל ה-Sidebar */}
        <div className="ac-bg">
          {SIDE_IMAGES.map((s, i) => (
            <img
              key={s.en}
              className={"ac-bg-img" + (i === imgIdx ? " ac-bg-img--active" : "")}
              src={s.img}
              alt=""
              loading="lazy"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          ))}
          <div className="ac-bg-overlay" />
        </div>

        {/* תוכן מעל התמונות */}
        <div className="ac-side-content">

          {/* פרופיל — ראשון, בתוך עיגול */}
          <button
            type="button"
            className={"ac-profile" + (isProfile ? " ac-profile--active" : "")}
            onClick={() => go(profilePath)}
          >
            <span className="ac-profile-avatar">
              {pic ? <img src={pic} alt={name} /> : <span>{initial}</span>}
            </span>
            <span className="ac-profile-meta">
              <span className="ac-profile-name">{name}</span>
              <span className="ac-profile-link">{isHe ? "הפרופיל שלי" : "My Profile"}</span>
            </span>
          </button>

          {/* קישורי ניווט */}
          <nav className="ac-side-nav">
            {links.map((l) => (
              <button
                type="button"
                key={l.to}
                className={"ac-item" + (isActive(l.to) ? " ac-item--active" : "")}
                onClick={() => go(l.to)}
              >
                <span className="ac-item-icon">{l.icon}</span>
                <span className="ac-item-label">{isHe ? l.he : l.en}</span>
              </button>
            ))}
          </nav>

          {/* מרווח שדוחף את היציאה לתחתית */}
          <div className="ac-side-spacer" />

          {/* יציאה — מופרדת בתחתית */}
          <div className="ac-side-foot">
            <button type="button" className="ac-side-logout" onClick={() => logout(navigate)}>
              <IconLogout />
              <span className="ac-item-label">{isHe ? "התנתקות" : "Log out"}</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
