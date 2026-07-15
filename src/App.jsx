/**
 * FixMate - App.jsx
 * FILE: src/App.jsx
 *
 * IMPORTANT: LanguageProvider MUST wrap BrowserRouter
 * so language state persists across all route changes.
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import ProtectedRoute from "./components/ProtectedRoute";

/* Pages */
import LandingPage from "./pages/log";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ClientDashboard from "./pages/ClientDashboard";
import ClientProfile from "./pages/ClientProfile";
import BookaPro from "./pages/BookaPro";
import SnapAnIssue from "./pages/SnapAnIssue";
import MindMap from "./pages/MindMap";
import RatePro from "./pages/RatePro";
import ProDashboard from "./pages/ProDashboard";
import ProProfile from "./pages/ProProfile";
import ManageOrders from "./pages/ManageOrders";
import ProAvailability from "./pages/ProAvailability";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          {/* ── מסכים פתוחים לכולם ── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/register" element={<SignUp />} />

          {/* ── מסכי הלקוח ── (אדמין מורשה גם, לצורך בדיקה) */}
          <Route path="/client/dashboard" element={<ProtectedRoute role={["CLIENT", "ADMIN"]}><ClientDashboard /></ProtectedRoute>} />
          <Route path="/client/profile"   element={<ProtectedRoute role={["CLIENT", "ADMIN"]}><ClientProfile /></ProtectedRoute>} />
          <Route path="/client/search"    element={<ProtectedRoute role={["CLIENT", "ADMIN"]}><BookaPro /></ProtectedRoute>} />
          <Route path="/client/snap"      element={<ProtectedRoute role={["CLIENT", "ADMIN"]}><SnapAnIssue /></ProtectedRoute>} />
          <Route path="/client/mindmap"   element={<ProtectedRoute role={["CLIENT", "ADMIN"]}><MindMap /></ProtectedRoute>} />
          <Route path="/client/rate"      element={<ProtectedRoute role={["CLIENT", "ADMIN"]}><RatePro /></ProtectedRoute>} />

          {/* ── מסכי בעל המקצוע ── */}
          <Route path="/pro/dashboard"    element={<ProtectedRoute role={["PROFESSIONAL", "ADMIN"]}><ProDashboard /></ProtectedRoute>} />
          <Route path="/pro/profile"      element={<ProtectedRoute role={["PROFESSIONAL", "ADMIN"]}><ProProfile /></ProtectedRoute>} />
          <Route path="/pro/orders"       element={<ProtectedRoute role={["PROFESSIONAL", "ADMIN"]}><ManageOrders /></ProtectedRoute>} />
          <Route path="/pro/availability" element={<ProtectedRoute role={["PROFESSIONAL", "ADMIN"]}><ProAvailability /></ProtectedRoute>} />

          {/* ── מסך האדמין — לאדמין בלבד ── */}
          <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}