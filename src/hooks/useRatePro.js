/**
 * ============================================================
 *  FixMate — הלוגיקה של מסך הדירוג
 *  ניהול הכוכבים, הביקורת, שיפור הניסוח, ושליחה לשרת.
 *
 *  שימוש:  const r = useRatePro({ isHe, bookingId, navigate });
 * ============================================================
 */
import { useState } from "react";
import { createRating } from "../services/rating";
import { improveReview } from "../utils/improveReview";

export function useRatePro({ isHe, bookingId, navigate }) {
  const [rating, setRating] = useState(0);
  const [hovering, setHovering] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [comment, setComment] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [detectedHe, setDetectedHe] = useState(false);
  const [submitErr, setSubmitErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    if (!bookingId) {
      setSubmitErr(isHe ? "לא ניתן לשלוח דירוג — חסר מזהה הזמנה." : "Cannot submit rating — missing booking reference.");
      return;
    }
    setSubmitting(true);
    setSubmitErr("");
    try {
      const r = await createRating({ bookingId: parseInt(bookingId), score: rating, comment: comment.trim() });
      if (!r.ok) {
        let body = "";
        try { body = await r.text(); } catch (e) {}
        if (body.indexOf("already rated") >= 0) throw new Error(isHe ? "כבר דירגת את ההזמנה הזו." : "You already rated this booking.");
        if (body.indexOf("completed") >= 0) throw new Error(isHe ? "אפשר לדרג רק הזמנות שהושלמו." : "You can only rate completed bookings.");
        throw new Error(isHe ? "שליחת הדירוג נכשלה." : "Failed to submit rating.");
      }
      setSubmitted(true);
      setTimeout(() => navigate("/client/dashboard"), 2500);
    } catch (e) {
      setSubmitErr(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  /* שיפור הניסוח — ההשהיה מדמה "חשיבה" של העוזר */
  const handleAiImprove = () => {
    if (!comment.trim() || comment.trim().length < 3) return;
    setAiLoading(true);
    setShowSuggestion(false);

    setTimeout(() => {
      const { improved, isHebrew } = improveReview(comment);
      setDetectedHe(isHebrew);
      setAiSuggestion(improved);
      setShowSuggestion(true);
      setAiLoading(false);
    }, 1200);
  };

  const handleAcceptAi = () => {
    setComment(aiSuggestion);
    setShowSuggestion(false);
    setAiSuggestion("");
  };

  const handleRejectAi = () => {
    setShowSuggestion(false);
    setAiSuggestion("");
  };

  /* שפת הטקסט שנכתב — לתוויות הכפתור בזמן אמת */
  const commentIsHebrew = (comment.match(/[֐-׿]/g) || []).length > (comment.match(/[a-zA-Z]/g) || []).length;

  return {
    rating, setRating,
    hovering, setHovering,
    submitted,
    comment, setComment, commentIsHebrew,
    aiLoading, aiSuggestion, showSuggestion, detectedHe,
    submitErr, submitting,
    handleSubmit, handleAiImprove, handleAcceptAi, handleRejectAi,
  };
}
