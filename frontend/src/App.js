import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import HomePage from "@/pages/HomePage";
import SearchResultsPage from "@/pages/SearchResultsPage";
import PropertyDetailsPage from "@/pages/PropertyDetailsPage";
import ProfilePage from "@/pages/ProfilePage";
import AdminLayout from "@/pages/AdminLayout";
import "@/App.css";

function Shell() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const open = (mode = "login") => { setAuthMode(mode); setAuthOpen(true); };
  return (
    <>
      <Routes>
        <Route path="/admin/*" element={<AdminLayout />} />
        <Route path="*" element={
          <>
            <Navbar onOpenAuth={() => open("login")} />
            <Routes>
              <Route path="/" element={<HomePage onAuth={() => open("login")} />} />
              <Route path="/search" element={<SearchResultsPage onAuth={() => open("login")} />} />
              <Route path="/property/:slug" element={<PropertyDetailsPage onAuth={() => open("login")} />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
            <Footer />
          </>
        } />
      </Routes>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} initialMode={authMode} />
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
