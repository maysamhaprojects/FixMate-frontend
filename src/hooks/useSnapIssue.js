/**
 * ============================================================
 *  FixMate — הלוגיקה של מסך "צלם תקלה"
 *  הצ'אט, העלאת תמונה, ההתאמה לפי מילות מפתח, והפנייה לשרת.
 *
 *  שימוש:  const s = useSnapIssue({ isHe, L });
 * ============================================================
 */
import { useState, useRef, useEffect } from "react";
import { chatWithAgent } from "../services/snap";
import { ISSUE_CATEGORIES } from "../data/diyGuides";

export function useSnapIssue({ isHe, L }) {
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: isHe
        ? "שלום! 👋 אני עוזר ה-AI של FixMate. העלו תמונה של התקלה או תארו אותה, ואנסה לעזור לכם לתקן בעצמכם!"
        : "Hi! 👋 I'm FixMate AI Assistant. Upload a photo of your issue, or select a common problem below, and I'll try to help you fix it yourself!",
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [diagnosed, setDiagnosed] = useState(null);
  const fileRef = useRef(null);
  const chatRef = useRef(null);
  const inputRef = useRef(null);

  /* היסטוריית השיחה בפורמט שהסוכן מבין — נשלחת במלואה בכל פנייה,
     כי השרת לא שומר מצב בין בקשות */
  const agentHistory = useRef([]);

  /* גלילה אוטומטית לתחתית הצ'אט */
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, analyzing]);

  const addBotMessage = (text, delay = 800) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setMessages((prev) => [...prev, { from: "bot", text, time: new Date() }]);
        resolve();
      }, delay);
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSendImage = async () => {
    if (!imagePreview) return;

    const photo = imagePreview;   // נשמר לפני הניקוי כדי שנוכל לשלוח אותו
    const caption = input.trim(); // אפשר לצרף תיאור יחד עם התמונה

    setImage(null);
    setImagePreview(null);
    setInput("");

    await sendToAgent(
      caption || (isHe ? "צירפתי תמונה של התקלה." : "I've attached a photo of the problem."),
      caption || "📷",
      photo
    );
  };

  const handleQuickSelect = async (issueId) => {
    const issue = ISSUE_CATEGORIES.find((c) => c.id === issueId);
    if (!issue) return;

    // בחירה מהירה היא רק דרך נוחה להתחיל — משם זו שיחה רגילה עם הסוכן
    await sendToAgent(isHe ? issue.labelHe : issue.label, `${issue.icon} ${issue.label}`);
  };

  const handleSendText = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    await sendToAgent(text);
  };

  /**
   * שולח הודעה לסוכן ומציג את תשובתו.
   *
   * @param text        מה שנשלח לסוכן
   * @param displayText מה שמוצג בבועה של המשתמש, אם שונה מ-text
   * @param imageBase64 תמונה מצורפת, אם יש
   */
  const sendToAgent = async (text, displayText, imageBase64) => {
    setMessages((prev) => [
      ...prev,
      { from: "user", text: displayText || text, image: imageBase64 || undefined, time: new Date() },
    ]);
    agentHistory.current = [...agentHistory.current, { role: "user", content: text }];
    setAnalyzing(true);

    try {
      const res = await chatWithAgent(agentHistory.current, imageBase64);
      const data = await res.json();
      setAnalyzing(false);

      if (!data.reply) {
        await addBotMessage(agentErrorText(data.error), 300);
        return;
      }

      agentHistory.current = [...agentHistory.current, { role: "assistant", content: data.reply }];
      await addBotMessage(data.reply, 300);

      // הסוכן כבר מודיע על ההזמנה בשפת המשתמש, לכן לא מוסיפים כאן הודעה
      // כפולה. משאירים רק את הרינדור של אישור ההזמנה (סימון ✅) אם רוצים
      // בעתיד — כרגע התשובה של הסוכן מספיקה.
    } catch (e) {
      setAnalyzing(false);
      await addBotMessage(agentErrorText(), 300);
    }
  };

  const agentErrorText = (code) => {
    if (code === "openai_not_configured") {
      return isHe
        ? "שירות ה-AI לא מוגדר כרגע. פנו למנהל המערכת."
        : "The AI service isn't configured right now. Please contact the administrator.";
    }
    return isHe
      ? "לא הצלחתי לענות כרגע. נסו שוב בעוד רגע. 🙏"
      : "I couldn't answer just now. Please try again in a moment. 🙏";
  };

  const formatTime = (d) => d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  return {
    messages,
    input, setInput,
    image, imagePreview, setImagePreview, setImage,
    analyzing, diagnosed,
    fileRef, chatRef, inputRef,
    handleImageUpload, handleSendImage, handleQuickSelect, handleSendText,
    formatTime,
  };
}
