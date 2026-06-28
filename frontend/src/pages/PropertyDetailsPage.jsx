import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MapPin, Star, Users, Bed, Bath, Heart, Share2, Check, ShieldCheck, ImageIcon, Wifi, Flame, Car, Coffee, Tv, Sparkles, UtensilsCrossed, PawPrint, Phone, FileDown, ChevronDown, ChevronUp, Minus, Plus, X } from "lucide-react";
import api, { formatError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { inr, inrDec, SUPPORT_PHONE, SUPPORT_PHONE_DISPLAY } from "@/lib/brand";
import DatePicker from "@/components/DatePicker";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

const SECTIONS = [
  { id: "overview", label: "Overview" }, { id: "highlights", label: "Highlights" },
  { id: "refund", label: "Refund Policy" }, { id: "spaces", label: "Spaces" },
  { id: "reviews", label: "Reviews" }, { id: "amenities", label: "Amenities" },
  { id: "location", label: "Location" }, { id: "experiences", label: "Experiences" }, { id: "faqs", label: "FAQ's" },
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
  const [roomsCount, setRoomsCount] = useState(1);
  const [activeSection, setActiveSection] = useState("overview");
  const [faqOpen, setFaqOpen] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, review: "" });
  const [lightbox, setLightbox] = useState(null); // index or null
  const [wishlisted, setWishlisted] = useState(false);
  const sectionRefs = useRef({});
  const tabsRef = useRef(null);
  const tabRefs = useRef({});

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

  const gstPercent = prop?.gst_percent ?? 12;
  const subtotal = selectedRoom ? nights * selectedRoom.price_per_night * roomsCount : 0;
  const taxes = +(subtotal * (gstPercent / 100)).toFixed(2);
  const total = +(subtotal + taxes).toFixed(2);

  const proceedToCheckout = () => {
    if (!user) { onAuth?.(); return; }
    if (!selectedRoom || nights <= 0) { alert("Please choose dates and a room first"); return; }
    sessionStorage.setItem("ols_checkout", JSON.stringify({
      property_id: prop.id, property_title: prop.title, property_image: prop.images?.[0],
      property_location: prop.location,
      room_id: selectedRoom.id, room_name: selectedRoom.room_name,
      checkin, checkout, nights, guests, rooms_count: roomsCount,
      price_per_night: selectedRoom.price_per_night,
      gst_percent: gstPercent, subtotal, taxes, total,
    }));
    nav("/checkout");
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
    if (el) { window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 140, behavior: "smooth" }); }
  };

  useEffect(() => {
    const handleScroll = () => {
      const offset = 140;
      const currentScroll = window.scrollY + offset + 10;
      let currentSection = SECTIONS[0].id;

      for (const section of SECTIONS) {
        const el = sectionRefs.current[section.id];
        if (!el) continue;
        if (el.offsetTop <= currentScroll) {
          currentSection = section.id;
        } else {
          break;
        }
      }

      setActiveSection((prev) => (prev === currentSection ? prev : currentSection));
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [prop]);

  useEffect(() => {
    const activeTab = tabRefs.current[activeSection];
    if (!activeTab || !tabsRef.current) return;
    activeTab.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeSection]);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: prop.title, text: prop.description?.slice(0, 100), url }); return; } catch {}
    }
    try { await navigator.clipboard.writeText(url); alert("Link copied to clipboard"); } catch { alert(url); }
  };

  const toggleWishlist = async () => {
    if (!user) { onAuth?.(); return; }
    try {
      const { data } = await api.post("/wishlist/toggle", { property_id: prop.id });
      setWishlisted(data.action === "added");
    } catch (e) { alert(formatError(e)); }
  };

  const viewBrochure = () => {
    // Open a brochure: print-friendly view of the property
    window.print();
  };

  if (loading) return <div className="max-w-7xl mx-auto px-6 py-20 text-stone-500">Loading...</div>;
  if (!prop) return <div className="max-w-7xl mx-auto px-6 py-20">Property not found</div>;

  const images = prop.images || [];

  return (
    <div className="bg-white" data-testid="property-page">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-6">
        <div className="text-xs text-stone-500 mb-4">
          <Link to="/" className="hover:underline">Home</Link> &gt;{" "}
          <Link to={`/search?destination=${prop.destination}`} className="hover:underline">Villas in {prop.destination}</Link> &gt;{" "}
          <span className="text-stone-900">{prop.title}</span>
        </div>
      </div>

      {/* GALLERY WITH LIGHTBOX */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 mb-8">
        <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[60vh] rounded-2xl overflow-hidden" data-testid="property-gallery">
          <button onClick={() => setLightbox(0)} className="col-span-4 md:col-span-2 row-span-2 relative overflow-hidden bg-stone-100">
            {images[0] && <img src={images[0]} alt={prop.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />}
            <div className="absolute top-4 left-4 badge badge-light"><Star className="w-3 h-3 fill-stone-900 text-stone-900" /> Best Rated</div>
          </button>
          {images.slice(1, 4).map((img, i) => (
            <button key={i} onClick={() => setLightbox(i + 1)} className="hidden md:block relative overflow-hidden bg-stone-100">
              <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </button>
          ))}
          <button onClick={() => setLightbox(4)} className="hidden md:block relative overflow-hidden bg-stone-100">
            {images[4] && <img src={images[4]} alt="" className="w-full h-full object-cover" />}
            <div className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center hover:bg-black/50">
              <ImageIcon className="w-6 h-6 mb-1" />
              <div className="font-semibold">+{Math.max(images.length - 5, 0)} More</div>
            </div>
          </button>
        </div>
        <div className="block md:hidden">
          <Carousel opts={{ align: "center", containScroll: "trimSnaps", dragFree: false }} className=" overflow-hidden">
            <CarouselContent className="touch-pan-y w-[93%]">
              {images.map((img, i) => (
                <CarouselItem key={i}>
                  <button onClick={() => setLightbox(i)} className="relative overflow-hidden bg-stone-100 rounded-2xl h-[60vw] max-h-[60vh] w-full">
                    <img src={img} alt={prop.title} className="w-full h-full object-cover" />
                    {i === 0 && (
                      <div className="absolute top-4 left-4 badge badge-light"><Star className="w-3 h-3 fill-stone-900 text-stone-900" /> Best Rated</div>
                    )}
                  </button>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>

      {/* TAB NAV */}
      <div className="sticky top-[62px] md:top-[73px] z-30 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div ref={tabsRef} className="section-tabs no-scrollbar" data-testid="section-tabs">
            {SECTIONS.map((s) => (
              <button
                ref={(el) => {
                  if (el) tabRefs.current[s.id] = el;
                  else delete tabRefs.current[s.id];
                }}
                key={s.id}
                onClick={() => { setActiveSection(s.id); scrollTo(s.id); }}
                className={`section-tab ${activeSection === s.id ? "active" : ""}`}
                data-testid={`tab-${s.id}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8 grid lg:grid-cols-[1fr_380px] gap-10">
        <div className="space-y-10">
          {/* HEADER */}
          <section ref={(el) => sectionRefs.current.overview = el}>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl md:text-4xl">{prop.title}</h1>
                <div className="text-sm text-stone-500 mt-1.5">{prop.location}</div>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className="badge badge-pink"><Star className="w-3 h-3 fill-current" /> Guest Favourite</span>
                  <span className="flex items-center gap-1 text-sm font-semibold"><Star className="w-4 h-4 fill-stone-900 text-stone-900" /> {prop.avg_rating?.toFixed(1) || "4.8"}</span>
                  <button onClick={() => scrollTo("reviews")} className="text-sm text-blue-600 underline">{prop.review_count || 0} Reviews</button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={share} className="w-10 h-10 rounded-full border border-stone-300 flex items-center justify-center hover:bg-stone-50" data-testid="share-btn" title="Share"><Share2 className="w-4 h-4" /></button>
                <button onClick={toggleWishlist} className="w-10 h-10 rounded-full border border-stone-300 flex items-center justify-center hover:bg-stone-50" data-testid="wishlist-btn" title="Wishlist">
                  <Heart className={`w-4 h-4 ${wishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
                </button>
                <button onClick={viewBrochure} className="btn-outline text-sm" data-testid="brochure-btn"><FileDown className="w-4 h-4" /> View Brochure</button>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-3 mt-6 text-sm">
              <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Upto 10 Guests</span>
              <span className="flex items-center gap-2"><Bed className="w-4 h-4" /> {prop.rooms?.length || 3} Rooms</span>
              <span className="flex items-center gap-2"><Bath className="w-4 h-4" /> {prop.rooms?.length || 3} Baths</span>
              <span className="flex items-center gap-2"><UtensilsCrossed className="w-4 h-4" /> Meals Available</span>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {(prop.amenities || []).slice(0, 4).map((a) => {
                const Icon = AMENITY_ICONS[a] || AMENITY_ICONS.Default;
                return <span key={a} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 text-xs"><Icon className="w-3.5 h-3.5" /> {a}</span>;
              })}
              <button onClick={() => scrollTo("amenities")} className="px-3 py-1.5 rounded-full border border-stone-300 text-xs hover:bg-stone-50">+{Math.max((prop.amenities?.length || 0) - 4, 0)} Amenities</button>
            </div>

            <a href={`tel:${SUPPORT_PHONE}`} className="flex items-center justify-between mt-5 p-4 border border-stone-200 rounded-xl hover:bg-stone-50 transition" data-testid="call-us-bar">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5" />
                <div><div className="text-sm font-semibold">Connect with us</div><div className="text-xs text-stone-500">{SUPPORT_PHONE_DISPLAY}</div></div>
              </div>
              <span className="btn-outline text-xs py-2">Call Us</span>
            </a>
          </section>

          {/* HIGHLIGHTS */}
          <section ref={(el) => sectionRefs.current.highlights = el}>
            <h2 className="font-display text-2xl mb-4"><span className="text-rose-500">|</span> The OLS Experience</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["WELL-SERVICED", "TASTEFUL INTERIORS", "CURATED EXPERIENCES", "SUMPTUOUS FOOD"].map((title, i) => (
                <div key={i} className="relative aspect-[3/2] rounded-xl overflow-hidden">
                  <img src={images[i % Math.max(images.length, 1)] || images[0]} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="text-white font-display text-sm text-center px-2">{title}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* DESCRIPTION */}
          <section>
            <h2 className="font-display text-2xl mb-3">{prop.title} — Villa in {prop.destination}</h2>
            <p className="text-sm text-stone-700 leading-relaxed">{prop.description}</p>
          </section>

          {/* REFUND POLICY */}
          <section ref={(el) => sectionRefs.current.refund = el}>
            <h2 className="font-display text-2xl mb-4"><span className="text-rose-500">|</span> Rules and Refund Policy</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              {[
                { color: "bg-emerald-500", title: "100% Refund Subject to", sub: "Before 15 days" },
                { color: "bg-amber-500", title: "50% Refund Subject to", sub: "5 to 15 days" },
                { color: "bg-red-500", title: "No Refund", sub: "Less than 5 days" },
              ].map((r, i) => (
                <div key={i} className="border border-stone-200 rounded-xl p-4">
                  <div className={`w-3 h-3 rounded-full ${r.color} mb-2`} />
                  <div className="font-semibold text-sm">{r.title}</div>
                  <div className="text-xs text-stone-500 whitespace-pre-line mt-1">{r.sub}</div>
                </div>
              ))}
            </div>
            <ul className="space-y-2 text-sm text-stone-700">
              {(prop.policies || []).map((p, i) => (
                <li key={i} className="flex items-start gap-2"><ShieldCheck className="w-4 h-4 mt-0.5" /> {p}</li>
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
                    <div className="text-xs text-stone-500 mt-1">{r.room_size} • {r.max_adults} adults, {r.max_children} kids</div>
                    <div className="font-display text-lg mt-3">{inr(r.price_per_night)}<span className="text-xs text-stone-500 font-medium">/night</span></div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* REVIEWS WITH PROPERTY PHOTOS */}
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
                  <p className="text-sm text-stone-600">Guests especially enjoyed their stays at this villa, praising the service, amenities, and hosts.</p>
                </div>
                <div>
                  <div className="text-xs font-semibold mb-2">Photos uploaded by owner</div>
                  <div className="grid grid-cols-3 gap-2">
                    {images.slice(0, 3).map((img, i) => (
                      <button key={i} onClick={() => setLightbox(i)} className="aspect-square rounded-lg overflow-hidden">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {prop.reviews?.length === 0 ? <div className="text-stone-500 text-sm">No reviews yet. Be the first!</div> : (
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
                    <div className="flex gap-0.5 mb-2">{[...Array(r.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-stone-900 text-stone-900" />)}</div>
                    <p className="text-sm text-stone-700">{r.review}</p>
                  </div>
                ))}
              </div>
            )}
            {user && (
              <form onSubmit={submitReview} className="mt-6 border border-stone-200 rounded-xl p-5" data-testid="review-form">
                <div className="font-display text-lg mb-3">Write a review</div>
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: n })}>
                      <Star className={`w-6 h-6 ${n <= reviewForm.rating ? "fill-stone-900 text-stone-900" : "text-stone-300"}`} />
                    </button>
                  ))}
                </div>
                <textarea value={reviewForm.review} onChange={(e) => setReviewForm({ ...reviewForm, review: e.target.value })} rows={3} className="w-full border border-stone-300 p-3 text-sm rounded-lg outline-none" placeholder="Share your experience..." required />
                <button className="btn-primary mt-3">Submit review</button>
              </form>
            )}
          </section>

          {/* AMENITIES */}
          <section ref={(el) => sectionRefs.current.amenities = el}>
            <h2 className="font-display text-2xl mb-4"><span className="text-rose-500">|</span> Villa Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3" data-testid="amenities-list">
              {prop.amenities?.map((a, i) => {
                const Icon = AMENITY_ICONS[a] || AMENITY_ICONS.Default;
                return <div key={i} className="flex items-center gap-3 text-sm"><div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center"><Icon className="w-4 h-4" /></div>{a}</div>;
              })}
            </div>
          </section>

          {/* LOCATION */}
          <section ref={(el) => sectionRefs.current.location = el}>
            <h2 className="font-display text-2xl mb-4"><span className="text-rose-500">|</span> Villa Location</h2>
            <div className="aspect-[16/9] border border-stone-200 rounded-2xl overflow-hidden">
              <iframe title="map" width="100%" height="100%" style={{ border: 0 }}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${prop.longitude - 0.05}%2C${prop.latitude - 0.03}%2C${prop.longitude + 0.05}%2C${prop.latitude + 0.03}&layer=mapnik&marker=${prop.latitude}%2C${prop.longitude}`} />
            </div>
            <p className="text-sm text-stone-600 mt-4">Surrounded by lush green vistas, {prop.destination} is perfect to escape city life.</p>
          </section>

          {/* EXPERIENCES — using property's own photos */}
          <section ref={(el) => sectionRefs.current.experiences = el}>
            <h2 className="font-display text-2xl mb-4"><span className="text-rose-500">|</span> Experiences</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {images.slice(0, 3).map((img, i) => (
                <button key={i} onClick={() => setLightbox(i)} className="aspect-[3/2] rounded-xl overflow-hidden bg-stone-100">
                  <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </button>
              ))}
            </div>
            <p className="text-sm text-stone-600 mt-4">Whether seeking relaxation, adventure or a break from the ordinary — OneLightStays curates immersive experiences for every guest.</p>
          </section>

          {/* FAQs — dynamic per property */}
          <section ref={(el) => sectionRefs.current.faqs = el}>
            <h2 className="font-display text-2xl mb-4"><span className="text-rose-500">|</span> FAQ's related to {prop.title}</h2>
            <div className="space-y-2" data-testid="faqs">
              {(prop.faqs || []).map((f, i) => (
                <div key={i} className="border border-stone-200 rounded-xl">
                  <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left text-sm font-semibold">
                    {f.q} {faqOpen === i ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {faqOpen === i && <div className="p-4 pt-0 text-sm text-stone-600">{f.a}</div>}
                </div>
              ))}
              {(prop.faqs || []).length === 0 && <div className="text-sm text-stone-500">No FAQs available for this property.</div>}
            </div>
          </section>
        </div>

        {/* BOOKING WIDGET */}
        <aside>
          <div className="sticky top-[160px] bg-white border border-stone-200 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-5" data-testid="booking-widget">
            <div className="flex items-baseline gap-2">
              <div className="font-display text-3xl">{inr(selectedRoom?.price_per_night || prop.starting_price)}</div>
              <div className="text-xs text-stone-500">per room per night + GST</div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="border border-stone-300 rounded-lg p-2.5">
                <div className="text-[0.6rem] text-stone-500 uppercase tracking-wider">Check-in</div>
                <DatePicker value={checkin} onChange={setCheckin} minDate={today} placeholder="Add date" testid="booking-checkin" className="mt-0.5" />
              </div>
              <div className="border border-stone-300 rounded-lg p-2.5">
                <div className="text-[0.6rem] text-stone-500 uppercase tracking-wider">Check-out</div>
                <DatePicker value={checkout} onChange={setCheckout} minDate={checkin || today} placeholder="Add date" testid="booking-checkout" className="mt-0.5" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="border border-stone-300 rounded-lg p-2.5">
                <div className="text-[0.6rem] text-stone-500 uppercase tracking-wider">Guests</div>
                <input type="number" min={1} value={guests} onChange={(e) => setGuests(Math.max(1, +e.target.value))} className="w-full text-sm outline-none mt-0.5" data-testid="booking-guests" />
              </div>
              <div className="border border-stone-300 rounded-lg p-2.5">
                <div className="text-[0.6rem] text-stone-500 uppercase tracking-wider">No. of Rooms</div>
                <div className="flex items-center justify-between mt-1">
                  <button type="button" onClick={() => setRoomsCount(c => Math.max(1, c - 1))} className="w-6 h-6 rounded-full border border-stone-300 flex items-center justify-center" data-testid="rooms-decrement"><Minus className="w-3 h-3" /></button>
                  <div className="text-sm font-semibold" data-testid="rooms-count">{roomsCount}</div>
                  <button type="button" onClick={() => setRoomsCount(c => Math.min(10, c + 1))} className="w-6 h-6 rounded-full border border-stone-300 flex items-center justify-center" data-testid="rooms-increment"><Plus className="w-3 h-3" /></button>
                </div>
              </div>
            </div>
            {nights > 0 && selectedRoom && (
              <div className="mt-4 pt-3 border-t border-stone-200 space-y-1.5 text-sm">
                <div className="flex justify-between text-stone-600"><span>{inr(selectedRoom.price_per_night)} × {nights} × {roomsCount} {roomsCount > 1 ? "rooms" : "room"}</span><span>{inr(subtotal)}</span></div>
                <div className="flex justify-between text-stone-600"><span>GST ({gstPercent}%)</span><span>{inr(taxes)}</span></div>
                <div className="flex justify-between font-semibold pt-1.5 border-t border-stone-100"><span>Total</span><span>{inr(total)}</span></div>
              </div>
            )}
            <button onClick={proceedToCheckout} className="btn-primary w-full mt-4" data-testid="booking-confirm">Reserve</button>
            <div className="text-xs text-stone-500 text-center mt-2">Free cancellation up to 48h.</div>

            <a href={`tel:${SUPPORT_PHONE}`} className="mt-4 pt-4 border-t border-stone-200 flex items-center justify-between hover:bg-stone-50 -mx-5 px-5 -mb-5 pb-5 rounded-b-2xl transition">
              <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4" /> Connect with us</div>
              <span className="text-xs text-stone-900 underline font-semibold">Call Us</span>
            </a>
          </div>
        </aside>
      </div>

      {/* LIGHTBOX */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4" data-testid="image-lightbox">
          <button className="absolute top-4 right-4 text-white w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center" onClick={() => setLightbox(null)}><X className="w-5 h-5" /></button>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center" onClick={() => setLightbox((lightbox - 1 + images.length) % images.length)}>‹</button>
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center" onClick={() => setLightbox((lightbox + 1) % images.length)}>›</button>
          <img src={images[lightbox]} alt="" className="max-h-[88vh] max-w-[92vw] object-contain rounded-lg" />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm bg-black/40 px-3 py-1 rounded-full">{lightbox + 1} / {images.length}</div>
        </div>
      )}
    </div>
  );
}
