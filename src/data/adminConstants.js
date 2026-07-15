/**
 * ============================================================
 *  FixMate — קבועים של דשבורד האדמין
 *  צבעים/תוויות קבועים שחוזרים בכמה מקומות.
 * ============================================================
 */

/* צבעי סטטוס של הזמנה */
export const ORDER_STATUS = {
  pending:     { bg: "#FEF3C7", color: "#92400E" },
  in_progress: { bg: "#EDE9FE", color: "#5B21B6" },
  done:        { bg: "#D1FAE5", color: "#065F46" },
  cancelled:   { bg: "#FEE2E2", color: "#991B1B" },
};

/* צבעי עדיפות של תלונה */
export const COMP_PRI = {
  high:   { bg: "#FEE2E2", color: "#991B1B" },
  medium: { bg: "#FEF3C7", color: "#92400E" },
  low:    { bg: "#D1FAE5", color: "#065F46" },
};
