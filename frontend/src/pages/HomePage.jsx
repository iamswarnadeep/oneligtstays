import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Quote, Sparkles, ShieldCheck, Heart, Wifi } from "lucide-react";
import api from "@/lib/api";
import SearchWidget from "@/components/SearchWidget";
import PropertyCard from "@/components/PropertyCard";

const HEROES = [
  { url: "https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?w=2000&q=85", title: "Crafted villas, curated escapes", subtitle: "Discover OneLightStays — extraordinary private retreats across India." },
  { url: "https://images.pexels.com/photos/28054849/pexels-photo-28054849.jpeg?w=2000", title: "Where stories find a home", subtitle: "From mountain cottages to seaside villas, every stay is curated." },
  { url: "https://images.unsplash.com/photo-1544984243-ec57ea16fe25?w=2000&q=85", title: "Stay magnificently", subtitle: "Hand-picked properties, intimate spaces, unforgettable moments." },
];

export default function HomePage({ onAuth }) {
  const [hero, setHero] = useState(0);
  const [properties, setProperties] = useState([]);
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    const t = setInterval(() => setHero((i) => (i + 1) % HEROES.length), 6000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    api.get("/properties?featured=true").then((r) => setProperties(r.data)).catch(() => {});
    api.get("/destinations").then((r) => setDestinations(r.data)).catch(() => {});
  }, []);

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
        {HEROES.map((h, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-[1500ms] ${i === hero ? "opacity-100" : "opacity-0"}`}>
            <img src={h.url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 hero-overlay" />
          </div>
        ))}
        <div className="relative h-full max-w-7xl mx-auto px-6 lg:px-10 flex flex-col justify-end pb-32">
          <div className="ols-label text-stone-200 mb-4 reveal" key={`l-${hero}`}>OneLightStays Collection</div>
          <h1 className="font-serif text-5xl md:text-7xl text-white tracking-tight max-w-3xl leading-[1.05] reveal" key={`h-${hero}`}>{HEROES[hero].title}</h1>
          <p className="text-stone-200 text-lg mt-5 max-w-xl reveal" key={`p-${hero}`}>{HEROES[hero].subtitle}</p>
          <div className="flex gap-2 mt-8">
            {HEROES.map((_, i) => (
              <button key={i} onClick={() => setHero(i)} className={`h-[2px] transition-all ${i === hero ? "w-12 bg-white" : "w-6 bg-white/40"}`} data-testid={`hero-dot-${i}`} />
            ))}
          </div>
        </div>
        <div className="absolute left-0 right-0 -bottom-12 md:bottom-0 md:-translate-y-12 z-10 px-6 lg:px-10">
          <div className="max-w-6xl mx-auto"><SearchWidget /></div>
        </div>
      </section>

      <div className="h-24" />

      {/* DESTINATIONS */}
      <Section label="Where to next" title="Popular destinations" subtitle="From snow peaks to sun-soaked sands.">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6" data-testid="destinations-grid">
          {destinations.map((d) => (
            <Link key={d.id} to={`/search?destination=${encodeURIComponent(d.name)}`} className="group relative aspect-[3/4] overflow-hidden bg-stone-100" data-testid={`destination-${d.slug}`}>
              <img src={d.image} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="font-serif text-xl">{d.name}</div>
                <div className="text-[0.65rem] text-stone-200 mt-1">{d.property_count}+ stays</div>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* SPECIAL OFFER */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 my-24 grid md:grid-cols-2 gap-10 items-center">
        <div className="relative aspect-[4/5] md:aspect-square">
          <img src="https://images.pexels.com/photos/4172886/pexels-photo-4172886.jpeg?w=1200" alt="Special Offer" className="w-full h-full object-cover" />
          <div className="absolute top-6 left-6 bg-[var(--ols-accent)] text-white px-4 py-2 font-serif text-2xl">25% OFF</div>
        </div>
        <div>
          <div className="ols-label mb-3">Limited offer</div>
          <h2 className="font-serif text-4xl md:text-5xl tracking-tight">Monsoon escape sale.</h2>
          <p className="text-stone-600 mt-4 leading-relaxed max-w-md">Up to 25% off on select hill-station villas and tea-estate homestays. Stay between June and September — pay at reception, cancel up to 48 hours before.</p>
          <Link to="/search" className="btn-primary inline-flex items-center gap-2 mt-8" data-testid="offer-cta">Explore offer <ChevronRight className="w-4 h-4" /></Link>
        </div>
      </section>

      {/* FEATURED */}
      <Section label="Hand-picked" title="Featured properties" subtitle="Curated stays loved by our guests.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10" data-testid="featured-grid">
          {properties.slice(0, 6).map((p) => <PropertyCard key={p.id} property={p} onAuth={onAuth} />)}
        </div>
      </Section>

      {/* WHY */}
      <section className="bg-[var(--ols-secondary)] py-24 mt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="max-w-2xl mb-12">
            <div className="ols-label mb-3">The OneLightStays promise</div>
            <h2 className="font-serif text-4xl md:text-5xl tracking-tight">Why choose us</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8" data-testid="why-grid">
            {[
              { icon: Sparkles, t: "Curated stays", d: "Every property is hand-selected for character, comfort & craft." },
              { icon: ShieldCheck, t: "Verified hospitality", d: "Owned & operated by OneLightStays — assured standards." },
              { icon: Heart, t: "Crafted experiences", d: "From in-villa chefs to estate walks — we make it memorable." },
              { icon: Wifi, t: "Modern essentials", d: "Wi-Fi, AC, parking & support 24/7 — without compromise." },
            ].map((x, i) => (
              <div key={i} className="bg-white p-6">
                <x.icon className="w-6 h-6 text-[var(--ols-primary)] mb-4" strokeWidth={1.5} />
                <div className="font-serif text-xl mb-2">{x.t}</div>
                <div className="text-sm text-stone-600 leading-relaxed">{x.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <Section label="Loved by travellers" title="What guests say">
        <div className="grid md:grid-cols-3 gap-6 md:gap-10" data-testid="testimonials">
          {[
            { n: "Aarav & Meera", t: "A stay we'll remember forever — the villa felt like a private world.", img: "https://images.unsplash.com/photo-1615039666131-964929ad0f1e?w=600&q=85" },
            { n: "Ishaan Kapoor", t: "Service that anticipates. Easily the best curated stay I've booked.", img: "https://images.pexels.com/photos/4172886/pexels-photo-4172886.jpeg?w=600" },
            { n: "Priya Nair", t: "Beautiful interiors, attentive staff, and an estate that's pure magic.", img: "https://images.unsplash.com/photo-1750420556288-d0e32a6f517b?w=600&q=85" },
          ].map((t, i) => (
            <div key={i} className="border border-stone-200 p-8 bg-white">
              <Quote className="w-7 h-7 text-[var(--ols-accent)] mb-4" strokeWidth={1.5} />
              <p className="font-serif text-2xl leading-snug text-stone-800">"{t.t}"</p>
              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-stone-100">
                <img src={t.img} alt={t.n} className="w-10 h-10 object-cover rounded-full" />
                <div className="text-sm font-medium">{t.n}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* NEWSLETTER */}
      <section className="my-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center">
          <div className="ols-label mb-3">Stay in the know</div>
          <h2 className="font-serif text-4xl md:text-5xl tracking-tight">Crafted stays, in your inbox.</h2>
          <p className="text-stone-600 mt-4 max-w-xl mx-auto">Get first access to new properties, hidden gems and seasonal offers.</p>
          <form className="mt-8 flex max-w-lg mx-auto border border-stone-300" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="your@email.com" className="flex-1 px-4 py-3 outline-none text-sm" data-testid="newsletter-input" />
            <button className="btn-primary" data-testid="newsletter-submit">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  );
}

function Section({ label, title, subtitle, children }) {
  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-10 my-20">
      <div className="flex items-end justify-between mb-10 gap-6">
        <div className="max-w-2xl">
          <div className="ols-label mb-3">{label}</div>
          <h2 className="font-serif text-4xl md:text-5xl tracking-tight leading-tight">{title}</h2>
          {subtitle && <p className="text-stone-600 mt-3">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}
