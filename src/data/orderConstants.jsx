/**
 * ============================================================
 *  FixMate — קבועים של מסך ניהול ההזמנות
 *  צבעי סטטוס, כפתורי הפעולה לכל סטטוס, וטקסטי המודלים.
 *  (סיומת .jsx כי הקבועים מכילים אייקוני JSX)
 * ============================================================
 */
import { IconCheck, IconX, IconPlay, IconFlag, IcoPending, IcoConfirmed, IcoInProgress, IcoDone, IcoCancelled } from "../components/OrderIcons";

/* ── צבע כרטיס לפי סטטוס ──
   topBar   = הפס הצבעוני בראש הכרטיס
   cardBg   = רקע עדין של הכרטיס
   tagBg    = רקע תג הסטטוס
   tagColor = טקסט תג
── */
export const STATUS_STYLE = {
  pending:     { topBar: "#F59E0B", cardBg: "#FFFBF0", tagBg: "#FEF3C7", tagColor: "#92400E", tagBorder: "#FDE68A", dot: "#F59E0B", Icon: IcoPending,    label: { en: "Pending",     he: "ממתין"  } },
  confirmed:   { topBar: "#3B82F6", cardBg: "#F0F6FF", tagBg: "#DBEAFE", tagColor: "#1E40AF", tagBorder: "#BFDBFE", dot: "#3B82F6", Icon: IcoConfirmed,  label: { en: "Confirmed",   he: "מאושר"  } },
  in_progress: { topBar: "#8B5CF6", cardBg: "#FAF5FF", tagBg: "#EDE9FE", tagColor: "#5B21B6", tagBorder: "#DDD6FE", dot: "#8B5CF6", Icon: IcoInProgress, label: { en: "In Progress", he: "בביצוע" } },
  done:        { topBar: "#10B981", cardBg: "#F0FDF8", tagBg: "#D1FAE5", tagColor: "#065F46", tagBorder: "#A7F3D0", dot: "#10B981", Icon: IcoDone,       label: { en: "Done",        he: "הושלם"  } },
  cancelled:   { topBar: "#EF4444", cardBg: "#FFF5F5", tagBg: "#FEE2E2", tagColor: "#991B1B", tagBorder: "#FECACA", dot: "#EF4444", Icon: IcoCancelled,  label: { en: "Cancelled",   he: "בוטל"   } },
};

/* ── כפתורי פעולה לפי סטטוס ── */
export const getActions = (status) => {
  if (status === "pending")     return [
    { id: "accept", label: { en: "Accept",    he: "אשר"        }, icon: <IconCheck />, bg: "#059669", color: "#FFF",    glow: "rgba(5,150,105,.25)"   },
    { id: "reject", label: { en: "Decline",   he: "דחה"        }, icon: <IconX />,     bg: "#FFF",    color: "#DC2626", border: "1.5px solid #FECACA" },
  ];
  if (status === "confirmed")   return [
    { id: "start",  label: { en: "Start Job", he: "התחל עבודה" }, icon: <IconPlay />,  bg: "#8B5CF6", color: "#FFF",    glow: "rgba(139,92,246,.25)"  },
    { id: "reject", label: { en: "Cancel",    he: "בטל"        }, icon: <IconX />,     bg: "#FFF",    color: "#DC2626", border: "1.5px solid #FECACA" },
  ];
  if (status === "in_progress") return [
    { id: "finish", label: { en: "Finish Job",he: "סיים עבודה" }, icon: <IconFlag />,  bg: "#10B981", color: "#FFF",    glow: "rgba(16,185,129,.25)"  },
  ];
  return [];
};

/* ── Modal config ── */
export const MODAL_CFG = {
  accept: { emoji: "✅", title: { en: "Accept this order?",  he: "לאשר את ההזמנה?"  }, btnBg: "#059669", glow: "rgba(5,150,105,.3)",  btn: { en: "Yes, Accept",  he: "כן, אשר"  } },
  reject: { emoji: "🚫", title: { en: "Decline this order?",he: "לדחות את ההזמנה?" }, btnBg: "#DC2626", glow: "rgba(220,38,38,.3)",  btn: { en: "Yes, Decline", he: "כן, דחה"  } },
  start:  { emoji: "🔧", title: { en: "Start the job?",     he: "להתחיל בעבודה?"   }, btnBg: "#8B5CF6", glow: "rgba(139,92,246,.3)", btn: { en: "Yes, Start",   he: "כן, התחל" } },
  finish: { emoji: "🏁", title: { en: "Mark as finished?",  he: "לסמן כהושלם?"     }, btnBg: "#10B981", glow: "rgba(16,185,129,.3)", btn: { en: "Yes, Finish",  he: "כן, סיים" } },
};

/* ── לשוניות הסינון ── */
export const FILTERS = [
  { id: "all",         label: { en: "All",         he: "הכל"    } },
  { id: "pending",     label: { en: "Pending",     he: "ממתין"  } },
  { id: "confirmed",   label: { en: "Confirmed",   he: "מאושר"  } },
  { id: "in_progress", label: { en: "In Progress", he: "בביצוע" } },
  { id: "done",        label: { en: "Done",        he: "הושלם"  } },
  { id: "cancelled",   label: { en: "Cancelled",   he: "בוטל"   } },
];
