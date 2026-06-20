import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Phone, Mail, MessageCircle, ChevronDown, User, Menu, X, Heart, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar({ onOpenAuth }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [contactOpen, setContactOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  return (
    <header className="glass-header sticky top-0 z-50" data-testid="site-navbar">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" data-testid="navbar-logo">
          <div className="w-9 h-9 bg-[var(--ols-primary)] flex items-center justify-center">
            <span className="font-serif text-white text-xl leading-none">O</span>
          </div>
          <div className="leading-tight">
            <div className="font-serif text-xl tracking-tight">OneLightStays</div>
            <div className="ols-label text-[0.55rem]">Crafted Stays</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm hover:text-[var(--ols-primary)] transition" data-testid="nav-home">Home</Link>
          <Link to="/search" className="text-sm hover:text-[var(--ols-primary)] transition" data-testid="nav-stays">Stays</Link>
          <Link to="/search?type=villa" className="text-sm hover:text-[var(--ols-primary)] transition" data-testid="nav-villas">Villas</Link>
          <Link to="/search?type=resort" className="text-sm hover:text-[var(--ols-primary)] transition" data-testid="nav-resorts">Resorts</Link>

          <div className="relative" onMouseLeave={() => setContactOpen(false)}>
            <button
              onMouseEnter={() => setContactOpen(true)}
              onClick={() => setContactOpen((v) => !v)}
              className="text-sm flex items-center gap-1 hover:text-[var(--ols-primary)] transition"
              data-testid="nav-contact-trigger"
            >
              Contact <ChevronDown className="w-4 h-4" />
            </button>
            {contactOpen && (
              <div className="absolute right-0 top-full pt-3 w-64" data-testid="contact-dropdown">
                <div className="bg-white border border-stone-200 shadow-lg p-2">
                  <a href="tel:+911800000000" className="flex items-center gap-3 p-3 hover:bg-stone-50 transition" data-testid="contact-call">
                    <Phone className="w-4 h-4 text-[var(--ols-primary)]" />
                    <div>
                      <div className="text-sm font-medium">Call us</div>
                      <div className="text-xs text-stone-500">+91 1800 000 000</div>
                    </div>
                  </a>
                  <a href="https://wa.me/911800000000" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 hover:bg-stone-50 transition" data-testid="contact-whatsapp">
                    <MessageCircle className="w-4 h-4 text-[var(--ols-primary)]" />
                    <div>
                      <div className="text-sm font-medium">WhatsApp</div>
                      <div className="text-xs text-stone-500">Instant inquiry</div>
                    </div>
                  </a>
                  <a href="mailto:hello@onelightstays.com" className="flex items-center gap-3 p-3 hover:bg-stone-50 transition" data-testid="contact-email">
                    <Mail className="w-4 h-4 text-[var(--ols-primary)]" />
                    <div>
                      <div className="text-sm font-medium">Email</div>
                      <div className="text-xs text-stone-500">hello@onelightstays.com</div>
                    </div>
                  </a>
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-3">
          {user === undefined ? null : user ? (
            <div className="relative">
              <button onClick={() => setUserMenu((v) => !v)} className="hidden md:flex items-center gap-2 px-3 py-2 border border-stone-300 hover:bg-stone-50 transition" data-testid="user-menu-trigger">
                <User className="w-4 h-4" />
                <span className="text-sm">{user.name?.split(" ")[0] || "Account"}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {userMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-stone-200 shadow-lg" data-testid="user-menu">
                  <Link to="/profile" onClick={() => setUserMenu(false)} className="flex items-center gap-2 p-3 hover:bg-stone-50 text-sm" data-testid="menu-profile">
                    <User className="w-4 h-4" /> My Profile
                  </Link>
                  <Link to="/profile?tab=bookings" onClick={() => setUserMenu(false)} className="flex items-center gap-2 p-3 hover:bg-stone-50 text-sm" data-testid="menu-bookings">
                    My Bookings
                  </Link>
                  <Link to="/profile?tab=wishlist" onClick={() => setUserMenu(false)} className="flex items-center gap-2 p-3 hover:bg-stone-50 text-sm" data-testid="menu-wishlist">
                    <Heart className="w-4 h-4" /> Wishlist
                  </Link>
                  {user.role === "admin" && (
                    <Link to="/admin" onClick={() => setUserMenu(false)} className="flex items-center gap-2 p-3 hover:bg-stone-50 text-sm border-t" data-testid="menu-admin">
                      <LayoutDashboard className="w-4 h-4" /> Admin Panel
                    </Link>
                  )}
                  <button onClick={() => { setUserMenu(false); logout(); nav("/"); }} className="w-full flex items-center gap-2 p-3 hover:bg-stone-50 text-sm border-t text-red-700" data-testid="menu-logout">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={onOpenAuth} className="hidden md:block btn-outline" data-testid="navbar-signin">Sign in</button>
          )}
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)} data-testid="mobile-menu-toggle">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white" data-testid="mobile-nav">
          <Link to="/" className="block p-4 border-b" onClick={() => setMobileOpen(false)}>Home</Link>
          <Link to="/search" className="block p-4 border-b" onClick={() => setMobileOpen(false)}>Stays</Link>
          <Link to="/search?type=villa" className="block p-4 border-b" onClick={() => setMobileOpen(false)}>Villas</Link>
          <Link to="/search?type=resort" className="block p-4 border-b" onClick={() => setMobileOpen(false)}>Resorts</Link>
          {user ? (
            <>
              <Link to="/profile" className="block p-4 border-b" onClick={() => setMobileOpen(false)}>Profile</Link>
              <button onClick={() => { setMobileOpen(false); logout(); }} className="block w-full text-left p-4 text-red-700">Logout</button>
            </>
          ) : (
            <button onClick={() => { setMobileOpen(false); onOpenAuth(); }} className="block w-full text-left p-4">Sign in</button>
          )}
        </div>
      )}
    </header>
  );
}
