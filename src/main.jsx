import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";   // אם יש לך קובץ כזה

// ניקוי חד-פעמי: גרסאות קודמות שמרו את סיסמת המשתמש ב-localStorage
// תחת "זכור אותי". מוחקים את השארית מכל דפדפן שכבר נכנס לאתר.
localStorage.removeItem("rememberedPassword");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
