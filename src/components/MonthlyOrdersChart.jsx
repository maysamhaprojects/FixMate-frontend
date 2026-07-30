/**
 * FixMate — גרף עמודות: מספר הזמנות לפי חודש.
 * סדרה אחת (מספר הזמנות) → צבע כחול יחיד של המותג, בלי מקרא.
 * מציג את 6 החודשים האחרונים (כולל חודשים ריקים כ-0), עם תווית מספר מעל כל עמודה.
 *
 * props:
 *   orders    — מערך הזמנות; לכל אחת שדה תאריך "YYYY-MM-DD..." (או ISO מלא)
 *   dateField — שם שדה התאריך (ברירת מחדל "date")
 *   isHe, monthsBack (ברירת מחדל 6)
 */
const HE_MONTHS = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
const EN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function MonthlyOrdersChart({ orders = [], dateField = "date", isHe = true, monthsBack = 6 }) {
  // בונים את רשימת החודשים האחרונים (מהחודש הנוכחי אחורה)
  const now = new Date();
  const buckets = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; // "2026-07"
    buckets.push({ key, mIdx: d.getMonth(), year: d.getFullYear(), count: 0 });
  }
  const idxByKey = Object.fromEntries(buckets.map((b, i) => [b.key, i]));

  // סופרים הזמנות לכל חודש
  for (const o of orders) {
    const raw = String(o?.[dateField] || "");
    const key = raw.slice(0, 7); // "YYYY-MM"
    if (key in idxByKey) buckets[idxByKey[key]].count++;
  }

  const total = buckets.reduce((s, b) => s + b.count, 0);
  const maxCount = Math.max(1, ...buckets.map((b) => b.count));

  // מידות הגרף (viewBox — רספונסיבי)
  const W = 640, H = 240, padL = 28, padR = 16, padT = 26, padB = 34;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const baseY = padT + plotH;
  const slot = plotW / buckets.length;
  const barW = Math.min(46, slot * 0.5);
  const BLUE = "#2563EB";

  const months = isHe ? HE_MONTHS : EN_MONTHS;

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", maxWidth: "100%", fontFamily: "'Heebo','DM Sans',sans-serif" }} role="img"
           aria-label={isHe ? "מספר הזמנות לפי חודש" : "Orders per month"}>
        {/* קו בסיס */}
        <line x1={padL} y1={baseY} x2={W - padR} y2={baseY} stroke="#E2E8F0" strokeWidth="1.5" />

        {buckets.map((b, i) => {
          const cx = padL + slot * i + slot / 2;
          const barH = b.count === 0 ? 0 : Math.max(3, (b.count / maxCount) * plotH);
          const x = cx - barW / 2;
          const y = baseY - barH;
          return (
            <g key={b.key}>
              {/* עמודה — קצה עליון מעוגל */}
              {b.count > 0 && (
                <rect x={x} y={y} width={barW} height={barH} rx="4" fill={BLUE}>
                  <title>{`${months[b.mIdx]} ${b.year}: ${b.count} ${isHe ? "הזמנות" : "orders"}`}</title>
                </rect>
              )}
              {/* תווית מספר מעל העמודה */}
              <text x={cx} y={b.count === 0 ? baseY - 6 : y - 7} textAnchor="middle"
                    fontSize="13" fontWeight="700" fill={b.count === 0 ? "#CBD5E1" : "#1E3A8A"}>
                {b.count}
              </text>
              {/* תווית חודש */}
              <text x={cx} y={baseY + 20} textAnchor="middle" fontSize="12" fontWeight="600" fill="#64748B">
                {months[b.mIdx]}
              </text>
            </g>
          );
        })}
      </svg>
      {total === 0 && (
        <p style={{ textAlign: "center", color: "#94A3B8", fontSize: 13, marginTop: 4 }}>
          {isHe ? "אין הזמנות ב-6 החודשים האחרונים" : "No orders in the last 6 months"}
        </p>
      )}
    </div>
  );
}
