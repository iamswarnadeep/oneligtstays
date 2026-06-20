import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, Linkedin, Youtube } from "lucide-react";

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
        <div className="text-center font-display text-2xl text-white mb-8">Popular Destinations To Rent A Holiday Home in India</div>
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
        </div>

        <div className="grid md:grid-cols-4 gap-8 pt-8 border-t border-stone-800">
          <div>
            <div className="font-semibold text-white mb-3">Top Locations</div>
            <ul className="space-y-1.5 text-stone-400 text-xs">
              {["Lonavala","Goa","Alibaug","Karjat","Igatpuri","Mahabaleshwar","Mumbai","Pawna","Mussoorie"].map(x => <li key={x}>{x}</li>)}
            </ul>
          </div>
          <div>
            <div className="font-semibold text-white mb-3">Top Collections</div>
            <ul className="space-y-1.5 text-stone-400 text-xs">
              {["Luxury Villas","Trending This Season","Pet Friendly Villas","Impeccable View Villas","Sea View Villas","Kid Friendly Villas","Getaway Collections"].map(x => <li key={x}>{x}</li>)}
            </ul>
          </div>
          <div>
            <div className="font-semibold text-white mb-3">About</div>
            <ul className="space-y-1.5 text-stone-400 text-xs">
              {["Our Story","Partner With Us","Offers","Corporate Offsites","Events & Experiences","All Brands","Contact Us","Cancellation & Refund Policy"].map(x => <li key={x}>{x}</li>)}
            </ul>
          </div>
          <div>
            <div className="font-semibold text-white mb-3">Travel Guide</div>
            <div className="bg-stone-900 rounded-md p-3 mb-3">
              <div className="text-[0.65rem] text-stone-500 uppercase tracking-wider mb-1">States</div>
              <select className="bg-transparent text-stone-300 text-sm w-full outline-none"><option>Maharashtra</option><option>Kerala</option><option>Karnataka</option></select>
            </div>
            <div className="bg-stone-900 rounded-md p-3">
              <div className="text-[0.65rem] text-stone-500 uppercase tracking-wider mb-1">Cities</div>
              <select className="bg-transparent text-stone-300 text-sm w-full outline-none"><option>Lonavala</option><option>Pune</option><option>Goa</option></select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-10 pt-6 border-t border-stone-800 text-xs">
          <div className="flex items-center gap-5 text-stone-400">
            <Link to="/">Privacy</Link>
            <Link to="/">Terms & Conditions</Link>
            <Link to="/">Sitemap</Link>
            <span>Call Us: +91 1800 000 000</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#" className="hover:text-white"><Instagram className="w-4 h-4" /></a>
            <a href="#" className="hover:text-white"><Facebook className="w-4 h-4" /></a>
            <a href="#" className="hover:text-white"><Twitter className="w-4 h-4" /></a>
            <a href="#" className="hover:text-white"><Linkedin className="w-4 h-4" /></a>
            <a href="#" className="hover:text-white"><Youtube className="w-4 h-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
