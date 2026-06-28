import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, Linkedin, Youtube } from "lucide-react";
import { LOGO_URL, SUPPORT_PHONE, SUPPORT_PHONE_DISPLAY, SUPPORT_PHONE_2, SUPPORT_PHONE_DISPLAY_2, SUPPORT_EMAIL, SUPPORT_EMAIL_2 } from "@/lib/brand";

export default function Footer() {
  const villas = ["Goa","Karjat","Pune","Panvel","Khandala","Lonavala","Dehradun","Pali","Lakhampur","Manori","Murud Hills","Malad"];
  const homestays = ["South Goa","Igatpuri","Panchgani","Ujjain","Devagiri","Pali","Lonavala","Thondiagaji","Konkan","Loonja"];
  const cottages = ["North Goa","Mahabaleshwar","Pawana","Kashid","Bambolim","Kurla","Pavna","Kareri","Vagator","Jog Falls","Mavalee"];
  const luxury = ["Lonavala","Mumbai","Wada","Nainital","Murud","Khopoli","Loverre","Bagalkot","Mussoorie","Karnal","Manipal","Mysore"];
  const pool = ["Alibaug","Nashik","Mulshi","Khopoli","Lavasa","Bangalore","Vansagar","Kishaur","Karwar"];
  const bunglows = ["Sangam","Trinity","Mahabaleshwar","Kerala","Sankhu","Periyar","Mumbai","Igatpuri"];
  return (
    <footer className="bg-[#0A0A0A] text-stone-300 mt-24" data-testid="site-footer">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
        {/* <div className="text-center font-display text-2xl text-white mb-8">Popular Destinations To Rent A Holiday Home in India</div>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-6 text-xs mb-10 text-center md:text-left">
          {[
            { t: "Villas", l: villas },
            { t: "Homestays", l: homestays },
            { t: "Cottages", l: cottages },
            { t: "Luxury Villas", l: luxury },
            { t: "Pool Villas", l: pool },
            { t: "Bunglows", l: bunglows },
            { t: "Places To Visit", l: ["Allbaug","Nashik","Murud","Vagator","Lavasa","Bangalore","Vansagar","Kishaur","Karwar"] },
          ].map((g, i) => (
            <div key={i}>
              <div className="font-semibold text-white mb-3">{g.t}</div>
              <ul className="space-y-1.5">
                {g.l.map((x) => <li key={x}><Link to={`/search?destination=${x}`} className="hover:text-white text-stone-400">Villas in {x}</Link></li>)}
              </ul>
            </div>
          ))}
        </div> */}

        <div className="grid md:grid-cols-4 gap-8 pt-8 border-stone-800">
          <div>
            <div className="font-semibold text-white mb-3">Top Locations</div>
            <ul className="space-y-1.5 text-stone-400 text-xs">
              {["Goa","Rishikesh","Ukhimath","Arambol"].map(x => <li key={x}>{x}</li>)}
            </ul>
          </div>
          <div>
            <div className="font-semibold text-white mb-3">Top Collections</div>
            <ul className="space-y-1.5 text-stone-400 text-xs">
              {["Rudram Aura","The Long Stay Goa","Weekend GetAway Camps","Great Hill view","Mermaid"].map(x => <li key={x}>{x}</li>)}
            </ul>
          </div>
          <div>
            <div className="font-semibold text-white mb-3">About</div>
            <ul className="space-y-1.5 text-stone-400 text-xs">
              <li><Link to="/about-us" className="hover:text-white">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
              <li><Link to="/cancellation-policy" className="hover:text-white">Cancellation Policy</Link></li>
              <li><Link to="/refund-policy" className="hover:text-white">Refund Policy</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-white mb-3">Support</div>
            <p className="text-stone-400 text-xs">
              <span className="font-semibold">Call:</span> <Link to={`tel:${SUPPORT_PHONE}`} className="hover:text-white">{SUPPORT_PHONE_DISPLAY}</Link> / <Link to={`tel:${SUPPORT_PHONE_2}`} className="hover:text-white">{SUPPORT_PHONE_DISPLAY_2}</Link><br />
              <span className="font-semibold">Email:</span> <Link to={`mailto:${SUPPORT_EMAIL}`} className="hover:text-white">{SUPPORT_EMAIL}</Link> / <Link to={`mailto:${SUPPORT_EMAIL_2}`} className="hover:text-white">{SUPPORT_EMAIL_2}</Link>
             <span className="block mt-2">
              <button className="px-2 py-1 font-semibold bg-white border border-white text-black rounded-full text-xs hover:bg-black hover:text-white"><a href="/become-a-partner" target="_blank" rel="noopener noreferrer">Become a Partner</a>  </button>   
             </span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between flex-col md:flex-row gap-6 mt-10 pt-6 border-t border-stone-800 text-xs">
          <div className="flex items-center gap-5 text-stone-400">
            <Link to="/privacy-policy">Privacy</Link>
            <Link to="/terms-and-conditions">Terms & Conditions</Link>
            <Link to={`tel:${SUPPORT_PHONE}`}>Call Us</Link>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://www.instagram.com/onelightstays?igsh=dG1wb2YwNnYzbnV6" target="_blank" className="hover:text-white"><Instagram className="w-4 h-4" /></a>
            <a href="https://www.linkedin.com/company/one-light-stays/" target="_blank" className="hover:text-white"><Linkedin className="w-4 h-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
