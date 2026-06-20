import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1C1917] text-stone-300 mt-24" data-testid="site-footer">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-[var(--ols-primary)] flex items-center justify-center">
              <span className="font-serif text-white text-xl leading-none">O</span>
            </div>
            <div className="font-serif text-xl text-white">OneLightStays</div>
          </div>
          <p className="text-sm text-stone-400 leading-relaxed">Crafted stays in India's most coveted escapes. Villas, resorts, homestays and cottages — curated by OneLightStays.</p>
        </div>
        <div>
          <div className="ols-label text-stone-500 mb-4">Explore</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/search?destination=Goa" className="hover:text-white">Goa</Link></li>
            <li><Link to="/search?destination=Manali" className="hover:text-white">Manali</Link></li>
            <li><Link to="/search?destination=Udaipur" className="hover:text-white">Udaipur</Link></li>
            <li><Link to="/search?destination=Coorg" className="hover:text-white">Coorg</Link></li>
          </ul>
        </div>
        <div>
          <div className="ols-label text-stone-500 mb-4">Company</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white">About</Link></li>
            <li><Link to="/" className="hover:text-white">Contact</Link></li>
            <li><Link to="/" className="hover:text-white">Blog</Link></li>
            <li><Link to="/" className="hover:text-white">Careers</Link></li>
          </ul>
        </div>
        <div>
          <div className="ols-label text-stone-500 mb-4">Stay in the loop</div>
          <div className="flex border border-stone-700">
            <input type="email" placeholder="Email address" className="bg-transparent px-3 py-2 text-sm flex-1 outline-none" data-testid="footer-newsletter-input" />
            <button className="bg-white text-stone-900 px-4 text-sm" data-testid="footer-newsletter-submit"><Mail className="w-4 h-4" /></button>
          </div>
          <div className="flex gap-3 mt-5">
            <a href="#" className="p-2 border border-stone-700 hover:border-white"><Instagram className="w-4 h-4" /></a>
            <a href="#" className="p-2 border border-stone-700 hover:border-white"><Facebook className="w-4 h-4" /></a>
            <a href="#" className="p-2 border border-stone-700 hover:border-white"><Twitter className="w-4 h-4" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-stone-800 py-6 text-center text-xs text-stone-500">© {new Date().getFullYear()} OneLightStays. All rights reserved.</div>
    </footer>
  );
}
