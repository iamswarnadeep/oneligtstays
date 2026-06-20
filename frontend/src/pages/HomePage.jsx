import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronLeft, Quote, Sparkles, ShieldCheck, Heart, Wifi, Award, Tag, Mountain, Sun, Trees, Palmtree, Building2, TreePine, Tent, Castle, Waves } from "lucide-react";
import api from "@/lib/api";
import SearchWidget from "@/components/SearchWidget";
import PropertyCard from "@/components/PropertyCard";

const HEROES = [
  { url: "https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?w=2000&q=85", title: "Sunday Getaway Sale", subtitle: "20% Off On All Sunday Stays" },
  { url: "https://images.pexels.com/photos/28054849/pexels-photo-28054849.jpeg?w=2000", title: "Mountain Magic Awaits", subtitle: "Crafted retreats from ₹4,999 per night" },
  { url: "https://images.unsplash.com/photo-1544984243-ec57ea16fe25?w=2000&q=85", title: "Stay Magnificently", subtitle: "Hand-picked villas. Endless memories." },
];

const DEST_ICONS = {
  Goa: Palmtree, Manali: Mountain, Udaipur: Castle, Coorg: TreePine,
  Munnar: Trees, Lonavala: Sun, Default: Building2,
};

const COLLECTIONS = [
  { title: "Newly Launched", img: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=900&q=80", tag: "Top Stays" },
  { title: "Pet Friendly Villas", img: "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=900&q=80" },
  { title: "Private Pool Villas", img: "https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?w=900&q=80" },
  { title: "Romantic Getaways", img: "https://images.unsplash.com/photo-1615039666131-964929ad0f1e?w=900&q=80" },
  { title: "Pure Veg Stays", img: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900&q=80" },
];

export default function HomePage({ onAuth }) {
  const [hero, setHero] = useState(0);
  const [properties, setProperties] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [filterTag, setFilterTag] = useState("All");

  useEffect(() => {
    const t = setInterval(() => setHero((i) => (i + 1) % HEROES.length), 6000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    api.get("/properties?featured=true").then((r) => setProperties(r.data)).catch(() => {});
    api.get("/destinations").then((r) => setDestinations(r.data)).catch(() => {});
  }, []);

  const filteredProps = filterTag === "All" ? properties : properties.filter(p => p.destination === filterTag);

  return (
    <div data-testid="home-page" className="bg-white">
      {/* HERO BANNER */}
      <section className="relative h-[60vh] min-h-[480px] overflow-hidden">
        {HEROES.map((h, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-[1500ms] ${i === hero ? "opacity-100" : "opacity-0"}`}>
            <img src={h.url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/35" />
          </div>
        ))}
        <div className="relative h-full max-w-7xl mx-auto px-6 lg:px-10 flex flex-col items-center justify-center text-center">
          <button onClick={() => setHero((hero - 1 + HEROES.length) % HEROES.length)} className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white" data-testid="hero-prev"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={() => setHero((hero + 1) % HEROES.length)} className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white" data-testid="hero-next"><ChevronRight className="w-5 h-5" /></button>
          <h1 className="font-display text-4xl md:text-6xl text-white reveal" key={`h-${hero}`}>{HEROES[hero].title}</h1>
          <p className="text-white/90 text-base md:text-lg mt-3 reveal" key={`p-${hero}`}>{HEROES[hero].subtitle}</p>
          <div className="flex gap-1.5 mt-6">
            {HEROES.map((_, i) => (
              <button key={i} onClick={() => setHero(i)} className={`h-1.5 rounded-full transition-all ${i === hero ? "w-8 bg-white" : "w-4 bg-white/50"}`} data-testid={`hero-dot-${i}`} />
            ))}
          </div>
        </div>
        {/* SEARCH PILL */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 w-full max-w-6xl px-6 lg:px-10 z-10">
          <SearchWidget />
        </div>
      </section>

      <div className="h-20" />

      {/* PICK A DESTINATION */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 my-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display text-3xl md:text-4xl">Pick a Destination</h2>
          <Link to="/search" className="text-sm font-medium text-stone-600 hover:text-stone-900">Show nearby locations →</Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3 md:gap-4" data-testid="destinations-grid">
          {destinations.concat([
            { id: "more1", name: "Pondicherry", image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&q=80", slug: "pondicherry", property_count: 8 },
            { id: "more2", name: "Bhimtal", image: "https://images.unsplash.com/photo-1597211833712-5e41faa202ea?w=400&q=80", slug: "bhimtal", property_count: 6 },
            { id: "more3", name: "Nainital", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&q=80", slug: "nainital", property_count: 9 },
          ]).map((d) => {
            const Icon = DEST_ICONS[d.name] || DEST_ICONS.Default;
            return (
              <Link key={d.id} to={`/search?destination=${encodeURIComponent(d.name)}`} className="group flex flex-col items-center text-center p-3 rounded-xl hover:bg-stone-50 transition" data-testid={`destination-${d.slug}`}>
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-stone-100 mb-2 group-hover:scale-105 transition-transform">
                  <img src={d.image} alt={d.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="text-sm font-semibold">{d.name}</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* OFFERS */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 my-16">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-display text-3xl md:text-4xl">Offers for You</h2>
          <div className="flex gap-2 text-xs">
            {["All", "Bank Offers", "OLS Offers"].map(t => (
              <button key={t} className="px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 font-medium" data-testid={`offer-tag-${t}`}>{t}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="offers-grid">
          {[
            { bank: "HSBC", title: "Get 11% off, upto ₹5000", sub: "On select HSBC Premier Cards", code: "OLSTRAV11", color: "from-red-50 to-orange-50" },
            { bank: "HDFC BANK", title: "Get 5% off, upto ₹2500", sub: "On select HDFC Credit Cards", code: "HDFCOLS5", color: "from-blue-50 to-indigo-50" },
            { bank: "ICICI", title: "Flat ₹3000 off", sub: "On stays above ₹15,000", code: "ICICIOLS", color: "from-amber-50 to-yellow-50" },
          ].map((o, i) => (
            <div key={i} className={`relative bg-gradient-to-br ${o.color} border border-stone-200 rounded-xl p-5 overflow-hidden`} data-testid={`offer-card-${i}`}>
              <div className="badge badge-pink mb-2"><Tag className="w-3 h-3" /> {o.bank}</div>
              <div className="font-display text-xl mt-2">{o.title}</div>
              <div className="text-xs text-stone-600 mt-1">{o.sub}</div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-dashed border-stone-300">
                <div>
                  <div className="text-[0.6rem] text-stone-500 uppercase tracking-wider">Code</div>
                  <div className="font-mono font-semibold text-sm">{o.code}</div>
                </div>
                <button className="btn-ghost text-sm">Copy</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BEST RATED VILLAS */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 my-16">
        <h2 className="font-display text-3xl md:text-4xl mb-6">Best Rated Villas</h2>
        <div className="flex flex-wrap gap-2 mb-6">
          {["All", ...new Set(properties.map(p => p.destination))].slice(0, 7).map((t) => (
            <button key={t} onClick={() => setFilterTag(t)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${filterTag === t ? "bg-stone-900 text-white" : "bg-white border border-stone-300 hover:bg-stone-50"}`} data-testid={`filter-tag-${t}`}>{t}</button>
          ))}
          <Link to="/search" className="px-4 py-1.5 rounded-full text-sm font-medium bg-white border border-stone-300 hover:bg-stone-50">Explore more →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5" data-testid="featured-grid">
          {filteredProps.slice(0, 8).map((p) => <PropertyCard key={p.id} property={p} onAuth={onAuth} />)}
        </div>
      </section>

      {/* THE STANDARD */}
      <section className="bg-stone-50 py-16 my-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <h2 className="font-display text-3xl md:text-4xl mb-2">The OneLightStays Standard</h2>
          <p className="text-stone-600 mb-10">Enjoy our signature features that make every stay effortless and enjoyable.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="rounded-2xl overflow-hidden h-64 md:h-72"><img src="https://images.unsplash.com/photo-1544984243-ec57ea16fe25?w=900&q=80" alt="" className="w-full h-full object-cover" /></div>
            <div className="rounded-2xl overflow-hidden h-64 md:h-72"><img src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=900&q=80" alt="" className="w-full h-full object-cover" /></div>
            <div className="rounded-2xl overflow-hidden h-64 md:h-72 col-span-2"><img src="https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=1400&q=80" alt="" className="w-full h-full object-cover" /></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6" data-testid="standard-features">
            {[
              { icon: Heart, t: "Personalised Celebrations" },
              { icon: Award, t: "Sundowner Decks" },
              { icon: Sparkles, t: "In-house Chef" },
              { icon: Mountain, t: "Local Experiences" },
              { icon: Waves, t: "Private Pool" },
              { icon: ShieldCheck, t: "Butler Service" },
              { icon: Tent, t: "Games & Recreation" },
              { icon: Trees, t: "Green Open Spaces" },
            ].map((x, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-white border border-stone-200 flex items-center justify-center mb-2"><x.icon className="w-5 h-5 text-stone-700" strokeWidth={1.5} /></div>
                <div className="text-xs font-semibold">{x.t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHOOSE A COLLECTION */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 my-16">
        <h2 className="font-display text-3xl md:text-4xl mb-6">Choose a Collection</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4" data-testid="collections-grid">
          {COLLECTIONS.map((c, i) => (
            <Link key={i} to="/search" className="relative aspect-[3/4] rounded-2xl overflow-hidden group" data-testid={`collection-${i}`}>
              <img src={c.img} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              {c.tag && <div className="absolute top-3 left-3 badge badge-pink text-[0.6rem]">{c.tag}</div>}
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="font-display text-lg">{c.title}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* TRUST */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 my-20">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl">Your Trusted Getaway Partner <Sparkles className="inline w-6 h-6 text-rose-500" /></h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {[
            { icon: Award, t: "Curated Stays", d: "Only the best villas, hand-picked for you." },
            { icon: ShieldCheck, t: "Unmatched Service", d: "Dedicated concierge & travel breakdown." },
            { icon: Heart, t: "Impeccable Villas", d: "Clean, safe, and quality-checked stays." },
          ].map((x, i) => (
            <div key={i}>
              <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-3"><x.icon className="w-6 h-6 text-stone-700" strokeWidth={1.5} /></div>
              <div className="font-display text-xl">{x.t}</div>
              <div className="text-sm text-stone-600 mt-1">{x.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* STAY LIKE STARS */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 my-16">
        <h2 className="font-display text-3xl md:text-4xl mb-6">Stay like the stars</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4" data-testid="testimonials">
          {[
            { n: "KL Rahul", t: "Magnolia Villa, Alibaug", img: "https://images.unsplash.com/photo-1615039666131-964929ad0f1e?w=600&q=85" },
            { n: "Vijay Deverakonda", t: "The End House, New Delhi", img: "https://images.pexels.com/photos/4172886/pexels-photo-4172886.jpeg?w=600" },
            { n: "Soha Ali Khan", t: "Ekarya Boutique Resort", img: "https://images.unsplash.com/photo-1750420556288-d0e32a6f517b?w=600&q=85" },
            { n: "Johnny Lever", t: "Casa Serein, Goa", img: "https://images.pexels.com/photos/28054849/pexels-photo-28054849.jpeg?w=600" },
            { n: "Suryakumar Yadav", t: "The Bun Bunglow", img: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=85" },
          ].map((s, i) => (
            <div key={i} className="bg-white">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-stone-100 mb-3">
                <img src={s.img} alt={s.n} className="w-full h-full object-cover" />
              </div>
              <div className="font-display text-base">{s.n}</div>
              <div className="text-xs text-stone-500 mb-2">Stayed at {s.t}</div>
              <button className="btn-outline text-xs py-1.5 px-3 w-full">View</button>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="bg-stone-50 py-12 my-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { t: "1 in 100", s: "Homes accepted" },
            { t: "1600+", s: "Handpicked Villas" },
            { t: "8L+", s: "Happy guests hosted" },
          ].map((x, i) => (
            <div key={i}>
              <div className="font-display text-4xl">{x.t}</div>
              <div className="text-sm text-stone-500 mt-1">{x.s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="my-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="font-display text-2xl">List your property with us</div>
              <div className="text-sm text-stone-600 mt-1">Join our network of 1600+ happy owners and turn your property into a high-revenue holiday destination.</div>
            </div>
            <button className="btn-primary" data-testid="list-property-cta">List Now</button>
          </div>
        </div>
      </section>
    </div>
  );
}
