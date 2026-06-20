import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MapPin, Star, Users, Bed, Bath, Heart, Share2, Maximize2, Calendar, ChevronDown, ChevronUp, Check, ShieldCheck, ArrowRight, ImageIcon, Wifi, Flame, Car, Coffee, Tv, Sparkles, UtensilsCrossed, PawPrint, Phone } from "lucide-react";
import api, { formatError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "highlights", label: "Highlights" },
  { id: "refund", label: "Refund Policy" },
  { id: "spaces", label: "Spaces" },
  { id: "reviews", label: "Reviews" },
  { id: "amenities", label: "Amenities" },
  { id: "location", label: "Location" },
  { id: "experiences", label: "Experiences" },
  { id: "faqs", label: "FAQ's" },
];

const AMENITY_ICONS = {
  "Wi-Fi": Wifi, "WiFi": Wifi, "Fireplace": Flame, "Bonfire": Flame, "Parking": Car,
  "Breakfast": Coffee, "Smart TV": Tv, "TV": Tv, "Spa": Sparkles, "Chef on Request": UtensilsCrossed,
  "Pet Friendly": PawPrint, "Default": Check,
};

export default function PropertyDetailsPage({ onAuth }) {
  const { slug } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [prop, setProp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 864e5).toISOString().split("T")[0];
  const [checkin, setCheckin] = useState(today);
  const [checkout, setCheckout] = useState(tomorrow);
  const [guests, setGuests] = useState(2);
  const [booking, setBooking] = useState(false);
  const [bookErr, setBookErr] = useState("");
  const [bookOk, setBookOk] = useState(null);
  const [activeSection, setActiveSection] = useState("overview");
  const [faqOpen, setFaqOpen] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, review: "" });
  const [showAllImages, setShowAllImages] = useState(false);
  const sectionRefs = useRef({});

  useEffect(() => {
    setLoading(true);
    api.get(`/properties/${slug}`).then((r) => {
      setProp(r.data);
      if (r.data.rooms?.length) setSelectedRoom(r.data.rooms[0]);
    }).finally(() => setLoading(false));
  }, [slug]);

  const nights = useMemo(() => {
    if (!checkin || !checkout) return 0;
    return Math.max(0, Math.round((new Date(checkout) - new Date(checkin)) / 864e5));
  }, [checkin, checkout]);

  const subtotal = selectedRoom ? nights * selectedRoom.price_per_night : 0;
  const taxes = +(subtotal * 0.12).toFixed(2);
  const total = +(subtotal + taxes).toFixed(2);

  const book = async () => {
    setBookErr(""); setBookOk(null);
    if (!user) { onAuth?.(); return; }
    if (!selectedRoom || nights <= 0) { setBookErr("Choose dates & a room"); return; }
    setBooking(true);
    try {
      const { data } = await api.post("/bookings", { property_id: prop.id, room_id: selectedRoom.id, checkin, checkout, guests });
      setBookOk(data);
      setTimeout(() => nav("/profile?tab=bookings"), 1500);
    } catch (e) { setBookErr(formatError(e)); }
    finally { setBooking(false); }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) { onAuth?.(); return; }
    try {
      await api.post("/reviews", { property_id: prop.id, ...reviewForm });
      const { data } = await api.get(`/properties/${slug}`);
      setProp(data);
      setReviewForm({ rating: 5, review: "" });
    } catch (e) { alert(formatError(e)); }
  };

  const scrollTo = (id) => {
    const el = sectionRefs.current[id];
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 140;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  if (loading) return <div className="max-w-7xl mx-auto px-6 py-20 text-stone-500">Loading...</div>;
  if (!prop) return <div className="max-w-7xl mx-auto px-6 py-20">Property not found</div>;

  const images = prop.images || [];

  return (
    <div className="bg-white" data-testid="property-page">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-6">
        {/* Breadcrumb */}
        <div className="text-xs text-stone-500 mb-4">
          <Link to="/" className="hover:underline">Home</Link> &gt;{" "}
          <Link to={`/search?destination=${prop.destination}`} className="hover:underline">Villas in {prop.destination}</Link> &gt;{" "}
          <span className="text-stone-900">{prop.title}</span>
        </div>
      </div>

      {/* GALLERY */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 mb-8">
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[60vh] rounded-2xl overflow-hidden" data-testid="property-gallery">
          <div className="col-span-4 md:col-span-2 row-span-2 relative overflow-hidden bg-stone-100">
            <img src={images[0]} alt={prop.title} className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4 badge badge-light"><Star className="w-3 h-3 fill-stone-900 text-stone-900" /> Best Rated</div>
          </div>
          {images.slice(1, 4).map((img, i) => (
            <div key={i} className="hidden md:block relative overflow-hidden bg-stone-100">
              <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
          ))}
          <div className="hidden md:block relative overflow-hidden bg-stone-100">
            {images[4] && <img src={images[4]} alt="" className="w-full h-full object-cover" />}
            <button onClick={() => setShowAllImages(true)} className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center hover:bg-black/50" data-testid="see-more-photos">
              <ImageIcon className="w-6 h-6 mb-1" />
              <div className="font-semibold">+{Math.max(images.length - 5, 0)} More</div>
            </button>
          </div>
        </div>
      </div>

      {/* TAB NAV */}
      <div className="sticky top-[73px] z-30 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="section-tabs no-scrollbar" data-testid="section-tabs">
            {SECTIONS.map((s) => (
              <button key={s.id} onClick={() => { setActiveSection(s.id); scrollTo(s.id); }} className={`section-tab ${activeSection === s.id ? "active" : ""}`} data-testid={`tab-${s.id}`}>{s.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8 grid lg:grid-cols-[1fr_380px] gap-10">
        {/* MAIN */}
        <div className="space-y-10">
          {/* HEADER */}
          <section ref={(el) => sectionRefs.current.overview = el}>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl md:text-4xl">{prop.title}</h1>
                <div className="text-sm text-stone-500 mt-1.5">{prop.location}</div>
                <div className="flex items-center gap-4 mt-3">
                  <div className="logo-mark text-sm" style={{padding: "0.25rem 0.45rem"}}>OLS</div>
                  <span className="badge badge-pink"><Star className="w-3 h-3 fill-current" /> Guest Favourite</span>
                  <span className="flex items-center gap-1 text-sm font-semibold"><Star className="w-4 h-4 fill-stone-900 text-stone-900" /> {prop.avg_rating?.toFixed(1) || "4.8"}</span>
                  <Link to="#reviews" className="text-sm text-blue-600 underline">{prop.review_count || 0} Reviews</Link>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-10 h-10 rounded-full border border-stone-300 flex items-center justify-center hover:bg-stone-50"><Share2 className="w-4 h-4" /></button>
                <button className="w-10 h-10 rounded-full border border-stone-300 flex items-center justify-center hover:bg-stone-50"><Heart className="w-4 h-4" /></button>
                <button className="btn-outline text-sm">View Brochure</button>
              </div>
            </div>

            {/* QUICK INFO */}
            <div className="flex flex-wrap gap-x-6 gap-y-3 mt-6 text-sm">
              <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Upto 10 Guests</span>
              <span className="flex items-center gap-2"><Bed className="w-4 h-4" /> {prop.rooms?.length || 3} Rooms</span>
              <span className="flex items-center gap-2"><Bath className="w-4 h-4" /> {prop.rooms?.length || 3} Baths</span>
              <span className="flex items-center gap-2"><UtensilsCrossed className="w-4 h-4" /> Meals Available</span>
              <button className="text-blue-600 underline">View Brochure</button>
            </div>

            <div className="flex flex-wrap gap-2 mt-5">
              <span className="text-xs text-stone-500">Great for:</span>
              <span className="badge badge-light text-xs">Food</span>
              <span className="badge badge-light text-xs">Senior Citizens</span>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {(prop.amenities || []).slice(0, 4).map((a) => {
                const Icon = AMENITY_ICONS[a] || AMENITY_ICONS.Default;
                return (
                  <span key={a} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 text-xs"><Icon className="w-3.5 h-3.5" /> {a}</span>
                );
              })}
              <Link to="#amenities" className="px-3 py-1.5 rounded-full border border-stone-300 text-xs hover:bg-stone-50">+{Math.max((prop.amenities?.length || 0) - 4, 0)} Amenities</Link>
            </div>

            <div className="flex items-center justify-between mt-5 p-4 border border-stone-200 rounded-xl">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5" />
                <div className="text-sm font-semibold">Connect with Host</div>
              </div>
              <button className="btn-outline text-xs py-2">Request Callback</button>
            </div>
          </section>

          {/* HIGHLIGHTS */}
          <section ref={(el) => sectionRefs.current.highlights = el}>
            <h2 className="font-display text-2xl mb-4"><span className="text-rose-500">|</span> The OLS Experience</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { title: "WELL-SERVICED", img: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=80" },
                { title: "TASTEFUL INTERIORS", img: "https://images.unsplash.com/photo-1750420556288-d0e32a6f517b?w=600&q=80" },
                { title: "CURATED EXPERIENCES", img: "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=600&q=80" },
                { title: "SUMPTUOUS FOOD", img: "https://images.pexels.com/photos/4172886/pexels-photo-4172886.jpeg?w=600" },
              ].map((h, i) => (
                <div key={i} className="relative aspect-[3/2] rounded-xl overflow-hidden">
                  <img src={h.img} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                    <div className="text-white font-display text-sm text-center px-2">{h.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* DESCRIPTION */}
          <section>
            <h2 className="font-display text-2xl mb-3">{prop.title} — Villa in {prop.destination}</h2>
            <p className="text-sm text-stone-700 leading-relaxed">{prop.description}</p>
            <div className="flex gap-2 mt-4">
              <button className="btn-outline text-xs py-2">Explore Your Stay</button>
              <button className="btn-outline text-xs py-2">FAQ's</button>
            </div>
          </section>

          {/* REFUND POLICY */}
          <section ref={(el) => sectionRefs.current.refund = el}>
            <h2 className="font-display text-2xl mb-4"><span className="text-rose-500">|</span> Rules and Refund Policy</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              {[
                { color: "bg-emerald-500", title: "100% Refund Subject to", sub: "Initial deposit\nBefore 15 days" },
                { color: "bg-amber-500", title: "50% Refund Subject to", sub: "Initial deposit\n5 to 15 days" },
                { color: "bg-red-500", title: "No Refund", sub: "Less than 5 days" },
              ].map((r, i) => (
                <div key={i} className="border border-stone-200 rounded-xl p-4">
                  <div className={`w-3 h-3 rounded-full ${r.color} mb-2`} />
                  <div className="font-semibold text-sm">{r.title}</div>
                  <div className="text-xs text-stone-500 whitespace-pre-line mt-1">{r.sub}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mb-4 flex-wrap">
              <button className="px-3 py-1.5 rounded-full bg-stone-100 text-xs font-semibold">Refund Policy</button>
              <button className="px-3 py-1.5 rounded-full bg-stone-100 text-xs font-semibold">House Rules</button>
              <button className="px-3 py-1.5 rounded-full bg-stone-100 text-xs font-semibold">Stay Information</button>
            </div>
            <ul className="space-y-2 text-sm text-stone-700">
              {(prop.policies || ["Check-in time 2 PM, Check-out 11 AM"]).map((p, i) => (
                <li key={i} className="flex items-start gap-2"><ShieldCheck className="w-4 h-4 text-stone-700 mt-0.5" /> {p}</li>
              ))}
            </ul>
          </section>

          {/* SPACES (Rooms) */}
          <section ref={(el) => sectionRefs.current.spaces = el}>
            <h2 className="font-display text-2xl mb-4"><span className="text-rose-500">|</span> Spaces</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="rooms-list">
              {prop.rooms?.map((r) => (
                <button key={r.id} onClick={() => setSelectedRoom(r)} className={`text-left border-2 ${selectedRoom?.id === r.id ? "border-stone-900" : "border-transparent"} rounded-xl overflow-hidden bg-white hover:shadow-lg transition`} data-testid={`room-${r.id}`}>
                  <div className="aspect-[4/3] overflow-hidden bg-stone-100">
                    <img src={r.images?.[0]} alt={r.room_name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <div className="font-semibold">{r.room_name}</div>
                    <ul className="text-xs text-stone-600 mt-2 space-y-1">
                      <li className="flex items-start gap-1.5"><Check className="w-3 h-3 mt-0.5 text-emerald-600" /> Spacious, well-furnished</li>
                      <li className="flex items-start gap-1.5"><Check className="w-3 h-3 mt-0.5 text-emerald-600" /> Equipped with {r.amenities?.slice(0, 2).join(", ") || "modern amenities"}</li>
                    </ul>
                    <div className="font-display text-lg mt-3">${r.price_per_night}<span className="text-xs text-stone-500 font-medium">/night</span></div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* REVIEWS */}
          <section ref={(el) => sectionRefs.current.reviews = el}>
            <h2 className="font-display text-2xl mb-4"><span className="text-rose-500">|</span> Guest Reviews</h2>
            <div className="bg-stone-50 rounded-2xl p-6 mb-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="font-display text-5xl flex items-baseline">{prop.avg_rating?.toFixed(1) || "4.9"}<span className="text-base text-stone-500 font-medium">/5</span></div>
                    <div>
                      <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-stone-900 text-stone-900" />)}</div>
                      <div className="text-xs text-stone-500">({prop.review_count || 0} Reviews)</div>
                    </div>
                  </div>
                  <p className="text-sm text-stone-600">Guests especially enjoyed their stays at this villa, praising the exceptional service, outstanding amenities, and attentive hosts.</p>
                </div>
                <div>
                  <div className="text-xs font-semibold mb-2">Guest Photos</div>
                  <div className="grid grid-cols-3 gap-2">
                    {images.slice(1, 4).map((img, i) => (
                      <div key={i} className="aspect-square rounded-lg overflow-hidden"><img src={img} alt="" className="w-full h-full object-cover" /></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {prop.reviews?.length === 0 && <div className="text-stone-500 text-sm">No reviews yet. Be the first!</div>}
            <div className="grid md:grid-cols-2 gap-5" data-testid="reviews-list">
              {prop.reviews?.slice(0, 4).map((r) => (
                <div key={r.id} className="border border-stone-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center font-semibold text-sm">{r.user_name?.[0]}</div>
                    <div>
                      <div className="font-semibold text-sm">{r.user_name}</div>
                      <div className="text-xs text-stone-500">Verified guest</div>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-2">{[...Array(r.rating)].map((_,i)=><Star key={i} className="w-3 h-3 fill-stone-900 text-stone-900" />)}</div>
                  <p className="text-sm text-stone-700">{r.review}</p>
                </div>
              ))}
            </div>
            {user && (
              <form onSubmit={submitReview} className="mt-6 border border-stone-200 rounded-xl p-5" data-testid="review-form">
                <div className="font-display text-lg mb-3">Write a review</div>
                <div className="flex gap-1 mb-3">
                  {[1,2,3,4,5].map((n) => (
                    <button key={n} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: n })} data-testid={`rate-${n}`}>
                      <Star className={`w-6 h-6 ${n <= reviewForm.rating ? "fill-stone-900 text-stone-900" : "text-stone-300"}`} />
                    </button>
                  ))}
                </div>
                <textarea value={reviewForm.review} onChange={(e) => setReviewForm({ ...reviewForm, review: e.target.value })} rows={3} className="w-full border border-stone-300 p-3 text-sm rounded-lg outline-none" placeholder="Share your experience..." required data-testid="review-text" />
                <button className="btn-primary mt-3" data-testid="review-submit">Submit review</button>
              </form>
            )}
          </section>

          {/* AMENITIES */}
          <section ref={(el) => sectionRefs.current.amenities = el}>
            <h2 className="font-display text-2xl mb-4"><span className="text-rose-500">|</span> Villa Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3" data-testid="amenities-list">
              {prop.amenities?.map((a, i) => {
                const Icon = AMENITY_ICONS[a] || AMENITY_ICONS.Default;
                return (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center"><Icon className="w-4 h-4" /></div>
                    {a}
                  </div>
                );
              })}
            </div>
          </section>

          {/* LOCATION */}
          <section ref={(el) => sectionRefs.current.location = el}>
            <h2 className="font-display text-2xl mb-4"><span className="text-rose-500">|</span> Villa Location</h2>
            <div className="aspect-[16/9] border border-stone-200 rounded-2xl overflow-hidden" data-testid="map-container">
              <iframe
                title="map"
                width="100%" height="100%"
                style={{ border: 0 }}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${prop.longitude-0.05}%2C${prop.latitude-0.03}%2C${prop.longitude+0.05}%2C${prop.latitude+0.03}&layer=mapnik&marker=${prop.latitude}%2C${prop.longitude}`}
              />
            </div>
            <p className="text-sm text-stone-600 mt-4">Surrounded by lush green vistas and waterfalls, {prop.destination} is the best place to escape to if you wish to catch a break from the hubbub of city life.</p>
          </section>

          {/* EXPERIENCES */}
          <section ref={(el) => sectionRefs.current.experiences = el}>
            <h2 className="font-display text-2xl mb-4"><span className="text-rose-500">|</span> Experiences</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=900&q=80",
                "https://images.pexels.com/photos/4172886/pexels-photo-4172886.jpeg?w=900",
                "https://images.unsplash.com/photo-1750420556288-d0e32a6f517b?w=900&q=80",
              ].map((img, i) => (
                <div key={i} className="aspect-[3/2] rounded-xl overflow-hidden bg-stone-100"><img src={img} alt="" className="w-full h-full object-cover" /></div>
              ))}
            </div>
            <p className="text-sm text-stone-600 mt-4">Whether you're seeking relaxation, adventure, or simply a break from the ordinary, OneLightStays' immersive experiences tailored meet your preferences.</p>
          </section>

          {/* FAQs */}
          <section ref={(el) => sectionRefs.current.faqs = el}>
            <h2 className="font-display text-2xl mb-4"><span className="text-rose-500">|</span> FAQ's related to {prop.title}</h2>
            <div className="space-y-2" data-testid="faqs">
              {(prop.faqs || []).map((f, i) => (
                <div key={i} className="border border-stone-200 rounded-xl">
                  <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left text-sm font-semibold" data-testid={`faq-${i}`}>
                    {f.q} {faqOpen === i ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {faqOpen === i && <div className="p-4 pt-0 text-sm text-stone-600">{f.a}</div>}
                </div>
              ))}
              {(prop.faqs || []).length === 0 && <div className="text-sm text-stone-500">No FAQs available.</div>}
            </div>
          </section>
        </div>

        {/* BOOKING WIDGET */}
        <aside>
          <div className="sticky top-[160px] bg-white border border-stone-200 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-5" data-testid="booking-widget">
            <div className="flex items-baseline gap-2">
              <div className="font-display text-3xl">${selectedRoom?.price_per_night || prop.starting_price}</div>
              <div className="text-xs text-stone-500">for {guests} guests per night + taxes</div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="border border-stone-300 rounded-lg p-2.5">
                <div className="text-[0.6rem] text-stone-500 uppercase tracking-wider">Check-in</div>
                <input type="date" value={checkin} min={today} onChange={(e) => setCheckin(e.target.value)} className="w-full text-sm outline-none mt-0.5" data-testid="booking-checkin" />
              </div>
              <div className="border border-stone-300 rounded-lg p-2.5">
                <div className="text-[0.6rem] text-stone-500 uppercase tracking-wider">Check-out</div>
                <input type="date" value={checkout} min={checkin} onChange={(e) => setCheckout(e.target.value)} className="w-full text-sm outline-none mt-0.5" data-testid="booking-checkout" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="border border-stone-300 rounded-lg p-2.5">
                <div className="text-[0.6rem] text-stone-500 uppercase tracking-wider">Guests</div>
                <input type="number" min={1} value={guests} onChange={(e) => setGuests(+e.target.value)} className="w-full text-sm outline-none mt-0.5" data-testid="booking-guests" />
              </div>
              <div className="border border-stone-300 rounded-lg p-2.5">
                <div className="text-[0.6rem] text-stone-500 uppercase tracking-wider">No. of Rooms</div>
                <div className="text-sm">1 Room</div>
              </div>
            </div>
            {nights > 0 && selectedRoom && (
              <div className="mt-4 pt-3 border-t border-stone-200 space-y-1.5 text-sm">
                <div className="flex justify-between text-stone-600"><span>${selectedRoom.price_per_night} × {nights} nights</span><span>${subtotal}</span></div>
                <div className="flex justify-between text-stone-600"><span>Taxes (12%)</span><span>${taxes}</span></div>
                <div className="flex justify-between font-semibold pt-1.5 border-t border-stone-100"><span>Total</span><span>${total}</span></div>
              </div>
            )}
            <button onClick={book} disabled={booking} className="btn-primary w-full mt-4" data-testid="booking-confirm">{booking ? "Reserving..." : "Reserve"}</button>
            <div className="text-xs text-emerald-700 text-center mt-2 flex items-center justify-center gap-1"><Check className="w-3 h-3" /> Unlock 5% coming offer for this property</div>
            <div className="text-xs text-stone-500 text-center mt-1">Free cancellation up to 48h. Pay at reception.</div>
            {bookErr && <div className="text-red-700 text-sm mt-3 p-2 bg-red-50 rounded-lg" data-testid="booking-error">{bookErr}</div>}
            {bookOk && <div className="bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800 mt-3 rounded-lg" data-testid="booking-success">Booking <b>{bookOk.booking_number}</b> confirmed! Redirecting…</div>}

            <div className="mt-4 pt-4 border-t border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4" /> Connect with Host</div>
              <button className="text-xs text-stone-900 underline font-semibold">Request Callback</button>
            </div>
          </div>
        </aside>
      </div>

      {/* IMAGE LIGHTBOX */}
      {showAllImages && (
        <div className="fixed inset-0 z-[200] bg-black/95 p-6 overflow-y-auto" onClick={() => setShowAllImages(false)}>
          <button className="fixed top-4 right-4 text-white text-sm" onClick={() => setShowAllImages(false)}>Close ✕</button>
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-3">
            {images.map((img, i) => <img key={i} src={img} alt="" className="w-full rounded-xl" />)}
          </div>
        </div>
      )}
    </div>
  );
}
