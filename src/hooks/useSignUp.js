/**
 * ============================================================
 *  FixMate — הלוגיקה של מסך ההרשמה
 *  ניהול השלבים, כל שדות הטופס, האימותים, והשליחה לשרת.
 *
 *  שימוש:  const s = useSignUp({ isHe, navigate });
 * ============================================================
 */
import { useState, useEffect } from "react";
import { register } from "../services/auth";
import { COUNTRIES } from "../data/countries";
import { ISRAEL_CITIES } from "../data/israelCities";

/* סיסמאות נפוצות מדי — נדחות גם אם הן עומדות בשאר התנאים */
const COMMON_PASSWORDS = ["12345678", "password", "password1", "12345678910", "qwerty123", "123456789", "1234567890"];

/* אילו תנאי חוזק הסיסמה מולאו */
export const getPasswordChecks = (pw) => ({
  length:    pw.length >= 8,
  upper:     /[A-Z]/.test(pw),
  lower:     /[a-z]/.test(pw),
  number:    /[0-9]/.test(pw),
  special:   /[!@#$%^&*]/.test(pw),
  notCommon: pw.length > 0 && !COMMON_PASSWORDS.includes(pw.toLowerCase()),
});

export function useSignUp({ isHe, navigate }) {
  const [step, setStep] = useState(1);

  /* ─── Form Data ─── */
  const [role, setRole] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneCountry, setPhoneCountry] = useState(COUNTRIES[0]); // ברירת מחדל: ישראל
  const [phoneDdOpen, setPhoneDdOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [address, setAddress] = useState("");
  const [addrOpen, setAddrOpen] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* ─── Professional-Only Fields ─── */
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [serviceRadius, setServiceRadius] = useState("10");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [bio, setBio] = useState("");
  const [yearsExp, setYearsExp] = useState("");
  const [docs, setDocs] = useState([]); // [{ name, data(base64) }]

  /* ─── UI State ─── */
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [errors, setErrors] = useState({});
  const [shakeError, setShakeError] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [legalModal, setLegalModal] = useState(null); // null | "terms" | "privacy"

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  /* Scroll to top when step changes */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  /* סינון ערי ישראל לפי מה שהוקלד (עברית או אנגלית) — מיידי, מהרשימה המקומית */
  const cityMatches = (() => {
    if (!addrOpen) return [];
    const q = address.trim().toLowerCase();
    if (!q) return [];
    return ISRAEL_CITIES.filter(
      (c) => c.he.includes(address.trim()) || c.en.toLowerCase().includes(q)
    ).slice(0, 12);
  })();

  /* קריאת מסמכים שהועלו והמרתם ל-base64 */
  const handleDocsChange = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (file.size > 3 * 1024 * 1024) {
        setErrors((p) => ({ ...p, docs: isHe ? "כל קובץ חייב להיות עד 3MB" : "Each file must be under 3MB" }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setDocs((prev) => [...prev, { name: file.name, data: reader.result }]);
      reader.readAsDataURL(file);
    });
    if (errors.docs) setErrors((p) => ({ ...p, docs: null }));
    e.target.value = "";
  };
  const removeDoc = (idx) => setDocs((prev) => prev.filter((_, i) => i !== idx));

  /* הוספה/הסרה של קטגוריה */
  const toggleCategory = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
    if (errors.categories) setErrors((prev) => ({ ...prev, categories: null }));
  };

  /* העלאת תמונת פרופיל */
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, avatar: "Image must be under 5MB" }));
        return;
      }
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
      if (errors.avatar) setErrors((prev) => ({ ...prev, avatar: null }));
    }
  };

  const removeAvatar = () => {
    setAvatar(null);
    setAvatarPreview(null);
  };

  const passwordChecks = getPasswordChecks(password);
  const isPasswordStrong = Object.values(passwordChecks).every(Boolean);

  /* אימות שלב 2 — פרטים אישיים */
  const validateStep2 = () => {
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = isHe ? "שם מלא נדרש" : "Full name is required";
    if (!email.trim()) {
      newErrors.email = isHe ? "אימייל נדרש" : "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = isHe ? "אנא הזינו אימייל תקין" : "Please enter a valid email";
    }
    if (!password) {
      newErrors.password = isHe ? "סיסמה נדרשת" : "Password is required";
    } else if (!isPasswordStrong) {
      newErrors.password = isHe
        ? "הסיסמה אינה עומדת בכל התנאים"
        : "Password does not meet all requirements";
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = isHe ? "הסיסמאות לא תואמות" : "Passwords do not match";
    }
    const localPhone = phone.replace(/^0+/, ""); // מסירים 0 מוביל אם הוזן
    if (!phone.trim()) {
      newErrors.phone = isHe ? "מספר טלפון נדרש" : "Phone number is required";
    } else if (localPhone.length !== phoneCountry.len) {
      newErrors.phone = isHe
        ? `נדרשות ${phoneCountry.len} ספרות עבור ${phoneCountry.he}`
        : `${phoneCountry.len} digits required for ${phoneCountry.en}`;
    }
    if (!address.trim()) newErrors.address = isHe ? "כתובת נדרשת" : "Address is required";
    if (!agreeTerms) newErrors.terms = isHe ? "יש לאשר את התנאים" : "You must agree to the terms";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* אימות שלב 3 — שדות בעל מקצוע בלבד */
  const validateStep3 = () => {
    const newErrors = {};
    if (selectedCategories.length === 0) newErrors.categories = isHe ? "בחרו לפחות קטגוריה אחת" : "Select at least one service category";
    if (!priceMin || !priceMax) newErrors.price = isHe ? "אנא הגדירו טווח מחירים" : "Please set your price range";
    if (!bio.trim()) newErrors.bio = isHe ? "אנא כתבו קצת על עצמכם" : "Please write a short bio";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const shake = () => {
    setShakeError(true);
    setTimeout(() => setShakeError(false), 600);
  };

  /* מעבר לשלב הבא אחרי אימות */
  const handleNext = () => {
    if (step === 1) {
      if (!role) {
        setErrors({ role: isHe ? "אנא בחרו תפקיד" : "Please choose a role" });
        shake();
        return;
      }
      setErrors({});
      setStep(2);
    } else if (step === 2) {
      if (!validateStep2()) { shake(); return; }
      if (role === "client") {
        handleSubmit();
      } else {
        setErrors({});
        setStep(3);
      }
    } else if (step === 3) {
      if (!validateStep3()) { shake(); return; }
      handleSubmit();
    }
  };

  const handleBack = () => {
    setErrors({});
    setStep((prev) => prev - 1);
  };

  /**
   * שליחת ההרשמה לשרת — POST /api/auth/register
   * לקוח נכנס מיד; בעל מקצוע מועבר למסך ההתחברות וממתין לאישור אדמין.
   */
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // מרכיבים מספר בין-לאומי מלא: קידומת + מספר מקומי (בלי 0 מוביל)
      const fullPhone = phoneCountry.dial + phone.replace(/^0+/, "");

      // גוף הבקשה — בסיס לכולם, ולבעל מקצוע מוסיפים את פרטי המקצוע שנאספו
      const body = {
        fullName,
        email,
        password,
        phone: fullPhone,
        role: role.toUpperCase(),
      };
      if (role === "professional") {
        body.specialty = selectedCategories[0] || "";              // הקטגוריה הראשית (למשל plumbing)
        body.location = address;                                    // העיר שנבחרה
        body.hourlyRate = priceMin ? parseFloat(priceMin) : null;      // תחתית הטווח
        body.hourlyRateMax = priceMax ? parseFloat(priceMax) : null;   // ראש הטווח
        body.bio = bio;
        body.yearsExperience = yearsExp !== "" ? parseInt(yearsExp) : null;
        body.documents = docs.length > 0 ? JSON.stringify(docs) : null;
      }

      const response = await register(body);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      if (role === "professional") {
        navigate("/login", { state: { notice: "נרשמת בהצלחה! החשבון שלך ממתין לאישור אדמין." } });
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("fullName", data.fullName);
        setStep(4);
      }
    } catch (error) {
      const msg = error.message || "";
      if (msg === "Your account is pending admin approval") {
        navigate("/login", { state: { notice: "נרשמת בהצלחה! החשבון שלך ממתין לאישור אדמין." } });
        return;
      }
      // הודעה מדויקת לפי סוג השגיאה
      let general = isHe ? "ההרשמה נכשלה. נסו שוב." : "Registration failed. Please try again.";
      if (msg.indexOf("Email already exists") >= 0) {
        general = isHe
          ? "האימייל הזה כבר רשום. נסו להתחבר או השתמשו באימייל אחר."
          : "This email is already registered. Try logging in or use another email.";
      }
      setErrors({ general });
      shake();
    } finally {
      setIsLoading(false);
    }
  };

  /* מחלקות ה-CSS של מיכל שדה, לפי שגיאה/פוקוס */
  const getInputClass = (fieldName) => {
    let cls = "auth-input-container";
    if (errors[fieldName]) cls += " auth-input-container--error";
    if (focusedField === fieldName) cls += " auth-input-container--focused";
    return cls;
  };

  const totalSteps = role === "professional" ? 3 : 2;

  return {
    step, setStep,
    role, setRole,
    fullName, setFullName,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    phone, setPhone,
    phoneCountry, setPhoneCountry,
    phoneDdOpen, setPhoneDdOpen,
    countrySearch, setCountrySearch,
    address, setAddress,
    addrOpen, setAddrOpen,
    cityMatches,
    avatar, avatarPreview, handleAvatarChange, removeAvatar,
    showPassword, setShowPassword,
    showConfirm, setShowConfirm,

    /* בעל מקצוע */
    selectedCategories, toggleCategory,
    serviceRadius, setServiceRadius,
    priceMin, setPriceMin,
    priceMax, setPriceMax,
    bio, setBio,
    yearsExp, setYearsExp,
    docs, handleDocsChange, removeDoc,

    /* UI */
    isLoading, mounted, errors, setErrors, shakeError,
    focusedField, setFocusedField,
    agreeTerms, setAgreeTerms,
    legalModal, setLegalModal,
    passwordChecks, isPasswordStrong,
    getInputClass, totalSteps,

    handleNext, handleBack, handleSubmit,
  };
}
