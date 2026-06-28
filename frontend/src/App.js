import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import HomePage from "@/pages/HomePage";
import SearchResultsPage from "@/pages/SearchResultsPage";
import PropertyDetailsPage from "@/pages/PropertyDetailsPage";
import ProfilePage from "@/pages/ProfilePage";
import AdminLayout from "@/pages/AdminLayout";
import CheckoutPage from "@/pages/CheckoutPage";
import OrderConfirmationPage from "@/pages/OrderConfirmationPage";
import ContactUsPage from "@/pages/ContactUsPage";
import CancellationPolicyPage from "@/pages/CancellationPolicyPage";
import RefundPolicyPage from "@/pages/RefundPolicyPage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import TermsPage from "@/pages/TermsPage";
import AboutUsPage from "@/pages/AboutUsPage";
import BecomePartnerPage from "@/pages/BecomePartnerPage";
import "@/App.css";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function Shell() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const open = (mode = "login") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/admin/*" element={<AdminLayout />} />
        <Route
          path="*"
          element={
            <>
              <Navbar onOpenAuth={() => open("login")} />
              <Routes>
                <Route
                  path="/"
                  element={<HomePage onAuth={() => open("login")} />}
                />
                <Route
                  path="/search"
                  element={<SearchResultsPage onAuth={() => open("login")} />}
                />
                <Route
                  path="/property/:slug"
                  element={<PropertyDetailsPage onAuth={() => open("login")} />}
                />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route
                  path="/booking/:id/confirmation"
                  element={<OrderConfirmationPage />}
                />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/contact" element={<ContactUsPage />} />
                <Route path="/about-us" element={<AboutUsPage />} />
                <Route path="/cancellation-policy" element={<CancellationPolicyPage />} />
                <Route path="/refund-policy" element={<RefundPolicyPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms-and-conditions" element={<TermsPage />} />
                <Route path="/become-a-partner" element={<BecomePartnerPage />} />
              </Routes>
              <Footer />
            </>
          }
        />
      </Routes>
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
      />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </AuthProvider>
  );
}
