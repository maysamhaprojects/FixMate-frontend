/**
 * ============================================================
 *  FixMate — שיפור ניסוח הביקורת
 *  פונקציה טהורה: מקבלת טקסט, מחזירה גרסה מנוסחת + השפה שזוהתה.
 *  אין כאן React ואין קריאות שרת — לכן קל לבדוק אותה בנפרד.
 * ============================================================
 */
import { HE_EXPAND, EN_EXPAND } from "../data/reviewPhrases";

/* זיהוי שפת הטקסט שנכתב בפועל (לא שפת הממשק) */
export function isHebrewText(text) {
  const hebrewChars = (text.match(/[֐-׿]/g) || []).length;
  const latinChars  = (text.match(/[a-zA-Z]/g) || []).length;
  return hebrewChars > latinChars;
}

/* ניקוי סימני פיסוק כפולים */
const cleanPunctuation = (s) => s.replace(/\?\?+/g, "?").replace(/!!+/g, "!").replace(/\.\./g, ".");

/* מחפש מילת מפתח במאגר; מחזיר את הניסוח המלא או null */
const findExpansion = (text, bank, lower = false) => {
  const needle = lower ? text.toLowerCase() : text;
  const key = Object.keys(bank).find((k) => needle.includes(k));
  return key ? bank[key] : null;
};

function improveHebrew(text) {
  if (text.length < 15) {
    // טקסט קצר — מרחיבים לניסוח מלא
    return findExpansion(text, HE_EXPAND)
      || ("השירות היה " + text + ". העבודה בוצעה באופן מקצועי ואני ממליץ בהחלט.");
  }
  // טקסט ארוך — מלטשים
  let improved = text;
  if (!improved.startsWith("ה") && !improved.startsWith("אני") && !improved.startsWith("הש")) {
    improved = "השירות היה מקצועי מאוד. " + improved;
  }
  if (!improved.includes("ממליץ") && !improved.includes("תודה") && !improved.includes("!")) {
    improved = improved.replace(/[.!?\s]+$/, "") + ". ממליץ בהחלט!";
  }
  return cleanPunctuation(improved);
}

function improveEnglish(text) {
  if (text.length < 15) {
    return findExpansion(text, EN_EXPAND, true)
      || ("The service was " + text.toLowerCase() + ". The professional handled the job competently and I would consider using their services again.");
  }
  let improved = text.charAt(0).toUpperCase() + text.slice(1);
  if (!improved.includes("professional") && !improved.includes("service") && !improved.includes("recommend")) {
    improved = improved.replace(/[.!?\s]+$/, "") + ". Overall a professional experience.";
  }
  improved = cleanPunctuation(improved);
  if (!/[.!?]$/.test(improved)) improved += ".";
  return improved;
}

/**
 * מחזיר { improved, isHebrew } עבור הטקסט שהלקוח כתב.
 */
export function improveReview(rawText) {
  const text = rawText.trim();
  const hebrew = isHebrewText(text);
  return {
    improved: hebrew ? improveHebrew(text) : improveEnglish(text),
    isHebrew: hebrew,
  };
}
