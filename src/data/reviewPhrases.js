/**
 * ============================================================
 *  FixMate — מאגר הניסוחים של מסך הדירוג
 *  מילת מפתח קצרה שהלקוח כתב → ניסוח מלא ומקצועי.
 *  הועבר מ-RatePro.jsx ללא שינוי בתוכן.
 * ============================================================
 */

/* תוויות, סמלים וצבעים לכל ציון (1–5) */
export const RATING_LABELS_HE = ["", "גרוע", "סביר", "טוב", "טוב מאוד", "מעולה"];
export const RATING_LABELS_EN = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];
export const RATING_EMOJIS    = ["", "😞", "😐", "🙂", "😊", "🤩"];
export const RATING_COLORS    = ["", "#EF4444", "#F97316", "#F59E0B", "#10B981", "#2563EB"];

/* הרחבת ביקורת קצרה בעברית */
export const HE_EXPAND = {
  "מעולה": "שירות מעולה! בעל המקצוע היה מקצועי, הגיע בזמן ועשה עבודה מצוינת. ממליץ בהחלט!",
  "מדהים": "חוויה מדהימה! בעל המקצוע הפגין מקצועיות ותשומת לב לפרטים. העבודה בוצעה ברמה גבוהה ואני ממליץ בחום!",
  "טוב": "שירות טוב ואמין. העבודה בוצעה ברמה מקצועית והתוצאה הייתה משביעה.",
  "גרוע": "השירות לא עמד בציפיות שלי. היה פרק משמעותי בין מה שהובטח לבין מה שבוצע.",
  "סביר": "השירות היה סביר. העבודה הושלמה, אך יש מקום לשיפור בתקשורת ובדייקנות.",
  "מומלץ": "ממליץ בחום! בעל המקצוע היה אדיב ומקצועי. העבודה בוצעה ברמה הגבוהה ביותר.",
};

/* הרחבת ביקורת קצרה באנגלית */
export const EN_EXPAND = {
  "great": "Great service! The professional was skilled, arrived on time, and completed the job efficiently. Highly recommended.",
  "good": "Good experience overall. The work was done professionally and the results met my expectations.",
  "bad": "The service did not meet my expectations. There was a noticeable gap between what was promised and what was delivered.",
  "terrible": "Very disappointing experience. The quality of work was below acceptable standards and did not match the agreed scope.",
  "ok": "The service was acceptable. The job was completed, though there is room for improvement in communication and timeliness.",
  "excellent": "Excellent service from start to finish! The professional was knowledgeable, punctual, and delivered outstanding results. Highly recommended!",
  "amazing": "Amazing experience! The professional exceeded my expectations with their expertise and attention to detail. Would definitely hire again.",
  "awful": "The service was very poor. The work quality was unacceptable and communication throughout the process was lacking.",
  "perfect": "Perfect service! Everything was handled with care and professionalism. The results exceeded my expectations. Highly recommended!",
  "slow": "The service took longer than expected. While the final result was adequate, the timeline could have been better communicated.",
  "fast": "Impressively fast service! The professional completed the job quickly without compromising on quality. Very satisfied.",
  "recommend": "I highly recommend this professional. The service was excellent, the work was thorough, and the pricing was fair.",
};
