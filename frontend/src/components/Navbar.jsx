import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Phone, Mail, MessageCircle, ChevronDown, User, Menu, X, Heart, LogOut, LayoutDashboard, Smartphone } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { LOGO_URL, SUPPORT_PHONE, SUPPORT_PHONE_DISPLAY } from "@/lib/brand";

export default function Navbar({ onOpenAuth }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [contactOpen, setContactOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  const initials = user?.name ? user.name.split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase() : "G";

  return (
    <header className="glass-header sticky top-0 z-50" data-testid="site-navbar">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-2 flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center" data-testid="navbar-logo">
          <img src={LOGO_URL} alt="OneLightStays" className="h-12 md:h-14 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          <Link to="/search" className="text-sm font-medium hover:text-stone-600 transition flex items-center gap-1" data-testid="nav-stays">
            Our Stays <ChevronDown className="w-3.5 h-3.5" />
          </Link>
          <Link to="/search?type=villa" className="text-sm font-medium hover:text-stone-600 transition" data-testid="nav-villas">Villas</Link>
          <Link to="/search?type=resort" className="text-sm font-medium hover:text-stone-600 transition" data-testid="nav-resorts">Resorts</Link>
          <Link to="/search?type=homestay" className="text-sm font-medium hover:text-stone-600 transition" data-testid="nav-homestays">Homestays</Link>
          <Link to="/" className="text-sm font-medium hover:text-stone-600 transition flex items-center gap-1" data-testid="nav-explore">
            Explore <ChevronDown className="w-3.5 h-3.5" />
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {/* <button className="hidden lg:flex items-center gap-2 px-3 py-2 border border-stone-200 rounded-full text-xs font-medium" data-testid="download-app">
            <Smartphone className="w-4 h-4" />
            <span>Download Now</span>
            <span className="bg-rose-100 text-rose-700 px-1.5 py-0.5 text-[0.55rem] rounded">APP</span>
          </button> */}

          {user === undefined ? null : user ? (
            <div className="relative">
              <button onClick={() => setUserMenu((v) => !v)} className="w-10 h-10 rounded-full bg-rose-200 text-stone-900 font-semibold text-sm flex items-center justify-center hover:bg-rose-300 transition" data-testid="user-menu-trigger">
                {initials}
              </button>
              {userMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenu(false)} />
                  <div className="absolute right-0 top-full mt-3 w-72 bg-white border border-stone-200 rounded-xl shadow-xl z-50 p-2" data-testid="user-menu">
                    <div className="flex items-center gap-3 p-3 border-b border-stone-100">
                      <div className="w-10 h-10 rounded-full bg-stone-900 text-white font-semibold text-sm flex items-center justify-center">{initials}</div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{user.name}</div>
                        <div className="text-xs text-stone-500 truncate">{user.email}</div>
                      </div>
                    </div>
                    <Link to="/profile" onClick={() => setUserMenu(false)} className="flex items-center gap-3 p-3 hover:bg-stone-50 rounded-lg text-sm" data-testid="menu-profile">
                      <User className="w-4 h-4" /> My Profile
                    </Link>
                    <Link to="/profile?tab=bookings" onClick={() => setUserMenu(false)} className="flex items-center gap-3 p-3 hover:bg-stone-50 rounded-lg text-sm" data-testid="menu-bookings">
                      <LayoutDashboard className="w-4 h-4" /> Trips
                    </Link>
                    <Link to="/profile?tab=wishlist" onClick={() => setUserMenu(false)} className="flex items-center gap-3 p-3 hover:bg-stone-50 rounded-lg text-sm" data-testid="menu-wishlist">
                      <Heart className="w-4 h-4" /> Wishlist
                    </Link>
                    {user.role === "admin" && (
                      <Link to="/admin" onClick={() => setUserMenu(false)} className="flex items-center gap-3 p-3 hover:bg-stone-50 rounded-lg text-sm border-t border-stone-100 mt-1 pt-3" data-testid="menu-admin">
                        <LayoutDashboard className="w-4 h-4" /> Admin Panel
                      </Link>
                    )}
                    <button onClick={() => { setUserMenu(false); logout(); nav("/"); }} className="w-full flex items-center gap-3 p-3 hover:bg-stone-50 rounded-lg text-sm border-t border-stone-100 mt-1 pt-3 text-stone-700" data-testid="menu-logout">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button onClick={onOpenAuth} className="w-10 h-10 rounded-full border border-stone-300 flex items-center justify-center hover:bg-stone-50" data-testid="navbar-signin">
              <User className="w-4 h-4" />
            </button>
          )}

          {/* Get in touch */}
          <div className="relative" onMouseLeave={() => setContactOpen(false)}>
            <button onMouseEnter={() => setContactOpen(true)} onClick={() => setContactOpen((v) => !v)} className="btn-primary text-sm !px-3 md:!px-5 whitespace-nowrap" data-testid="nav-contact-trigger">
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Get in touch</span>
              <ChevronDown className="w-3.5 h-3.5 hidden sm:inline" />
            </button>
            {contactOpen && (
              <div className="absolute right-0 top-full pt-3 w-72 z-50" data-testid="contact-dropdown">
                <div className="bg-white border border-stone-200 rounded-xl shadow-xl p-2">
                  <a href={`tel:${SUPPORT_PHONE}`} className="flex items-center gap-3 p-3 hover:bg-stone-50 rounded-lg" data-testid="contact-call">
                    <div className="w-9 h-9 rounded-full bg-stone-900 text-white flex items-center justify-center"><Phone className="w-4 h-4" /></div>
                    <div><div className="text-sm font-medium">Call us</div><div className="text-xs text-stone-500">{SUPPORT_PHONE_DISPLAY}</div></div>
                  </a>
                  <a href={`https://wa.me/${SUPPORT_PHONE.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 hover:bg-stone-50 rounded-lg" data-testid="contact-whatsapp">
                    <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center"><MessageCircleMore className="w-4 h-4" /></div>
                    <div><div className="text-sm font-medium">WhatsApp</div><div className="text-xs text-stone-500">Instant inquiry</div></div>
                  </a>
                  <a href="mailto:hello@onelightstays.com" className="flex items-center gap-3 p-3 hover:bg-stone-50 rounded-lg" data-testid="contact-email">
                    <div className="w-9 h-9 rounded-full bg-stone-100 text-stone-900 flex items-center justify-center"><Mail className="w-4 h-4" /></div>
                    <div><div className="text-sm font-medium">Email</div><div className="text-xs text-stone-500">hello@onelightstays.com</div></div>
                  </a>
                </div>
              </div>
            )}
          </div>

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
              <button onClick={() => { setMobileOpen(false); logout(); }} className="block w-full text-left p-4">Logout</button>
            </>
          ) : (
            <button onClick={() => { setMobileOpen(false); onOpenAuth(); }} className="block w-full text-left p-4">Sign in</button>
          )}
        </div>
      )}
    </header>
  );
}
