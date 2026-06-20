import { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MapPin, Star, Wifi, Users, Calendar, ShieldCheck, Heart, Check, ChevronDown, ChevronUp } from "lucide-react";
import api, { formatError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function PropertyDetailsPage({ onAuth }) {
  const { slug } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [prop, setProp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 864e5).toISOString().split("T")[0];
  const [checkin, setCheckin] = useState(today);
  const [checkout, setCheckout] = useState(tomorrow);
  const [guests, setGuests] = useState(2);
  const [booking, setBooking] = useState(false);
  const [bookErr, setBookErr] = useState("");
  const [bookOk, setBookOk] = useState(null);
  const [faqOpen, setFaqOpen] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, review: "" });

  useEffect(() => {
    setLoading(true);
    api.get(`/properties/${slug}`).then((r) => {
      setProp(r.data);
      if (r.data.rooms?.length) setSelectedRoom(r.data.rooms[0]);
    }).finally(() => setLoading(false));
  }, [slug]);

  const nights = useMemo(() => {
    if (!checkin || !checkout) return 0;
    const d = (new Date(checkout) - new Date(checkin)) / 864e5;
    return Math.max(0, Math.round(d));
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
      const { data } = await api.post("/bookings", {
        property_id: prop.id, room_id: selectedRoom.id,
        checkin, checkout, guests,
      });
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

  if (loading) return <div className="max-w-7xl mx-auto px-6 py-20 text-stone-500">Loading...</div>;
  if (!prop) return <div className="max-w-7xl mx-auto px-6 py-20">Not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10" data-testid="property-page">
      {/* Header */}
      <div className="mb-6">
        <div className="ols-label mb-2">{prop.property_type}</div>
        <h1 className="font-serif text-4xl md:text-5xl tracking-tight">{prop.title}</h1>
        <div className="flex flex-wrap items-center gap-5 mt-3 text-sm text-stone-600">
          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {prop.location}</span>
          <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-[var(--ols-accent)] text-[var(--ols-accent)]" /> {prop.avg_rating?.toFixed(1) || "4.8"} ({prop.review_count || 0} reviews)</span>
        </div>
      </div>

      {/* Gallery */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[60vh] mb-12" data-testid="property-gallery">
        <div className="col-span-4 md:col-span-2 row-span-2 overflow-hidden">
          <img src={prop.images?.[activeImg] || prop.images?.[0]} alt={prop.title} className="w-full h-full object-cover" />
        </div>
        {prop.images?.slice(1, 5).map((img, i) => (
          <button key={i} onClick={() => setActiveImg(i + 1)} className="hidden md:block overflow-hidden bg-stone-100" data-testid={`gallery-thumb-${i}`}>
            <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-12">
        <div className="space-y-12">
          {/* About */}
          <section>
            <h2 className="font-serif text-3xl mb-4">About this stay</h2>
            <p className="text-stone-700 leading-relaxed">{prop.description}</p>
            {prop.highlights?.length > 0 && (
              <div className="mt-6 grid sm:grid-cols-2 gap-3">
                {prop.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm"><Check className="w-4 h-4 text-[var(--ols-primary)] mt-0.5" /> {h}</div>
                ))}
              </div>
            )}
          </section>

          {/* Rooms */}
          <section>
            <h2 className="font-serif text-3xl mb-6">Room categories</h2>
            <div className="grid md:grid-cols-2 gap-6" data-testid="rooms-list">
              {prop.rooms?.map((r) => (
                <button key={r.id} onClick={() => setSelectedRoom(r)} className={`text-left border ${selectedRoom?.id === r.id ? "border-[var(--ols-primary)] ring-1 ring-[var(--ols-primary)]" : "border-stone-200"} bg-white overflow-hidden hover:border-stone-400 transition`} data-testid={`room-${r.id}`}>
                  <div className="aspect-[4/3] overflow-hidden bg-stone-100">
                    <img src={r.images?.[0]} alt={r.room_name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5">
                    <div className="font-serif text-xl">{r.room_name}</div>
                    <div className="text-sm text-stone-500 mt-1">{r.room_size} • Up to {r.max_adults} adults, {r.max_children} kids</div>
                    <p className="text-sm text-stone-600 mt-2 line-clamp-2">{r.description}</p>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-100">
                      <div className="text-xs text-stone-500">From</div>
                      <div className="font-serif text-2xl">${r.price_per_night}<span className="text-xs text-stone-500 font-sans">/night</span></div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Amenities */}
          <section>
            <h2 className="font-serif text-3xl mb-6">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3" data-testid="amenities-list">
              {prop.amenities?.map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-sm"><Wifi className="w-4 h-4 text-[var(--ols-primary)]" /> {a}</div>
              ))}
            </div>
          </section>

          {/* Policies */}
          {prop.policies?.length > 0 && (
            <section>
              <h2 className="font-serif text-3xl mb-6">Property policies</h2>
              <ul className="space-y-2 text-sm text-stone-700">
                {prop.policies.map((p, i) => <li key={i} className="flex items-start gap-2"><ShieldCheck className="w-4 h-4 text-[var(--ols-primary)] mt-0.5" /> {p}</li>)}
              </ul>
            </section>
          )}

          {/* House rules */}
          {prop.house_rules?.length > 0 && (
            <section>
              <h2 className="font-serif text-3xl mb-6">House rules</h2>
              <ul className="space-y-2 text-sm text-stone-700">
                {prop.house_rules.map((p, i) => <li key={i} className="flex items-start gap-2"><Check className="w-4 h-4 text-[var(--ols-primary)] mt-0.5" /> {p}</li>)}
              </ul>
            </section>
          )}

          {/* FAQs */}
          {prop.faqs?.length > 0 && (
            <section>
              <h2 className="font-serif text-3xl mb-6">FAQs</h2>
              <div className="space-y-2" data-testid="faqs">
                {prop.faqs.map((f, i) => (
                  <div key={i} className="border border-stone-200">
                    <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left text-sm font-medium" data-testid={`faq-${i}`}>
                      {f.q} {faqOpen === i ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {faqOpen === i && <div className="p-4 pt-0 text-sm text-stone-600">{f.a}</div>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Map */}
          <section>
            <h2 className="font-serif text-3xl mb-6">Location</h2>
            <div className="aspect-[16/9] border border-stone-200" data-testid="map-container">
              <iframe
                title="map"
                width="100%" height="100%"
                style={{ border: 0 }}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${prop.longitude-0.05}%2C${prop.latitude-0.03}%2C${prop.longitude+0.05}%2C${prop.latitude+0.03}&layer=mapnik&marker=${prop.latitude}%2C${prop.longitude}`}
              />
            </div>
            <div className="text-xs text-stone-500 mt-2">{prop.location}</div>
          </section>

          {/* Reviews */}
          <section>
            <h2 className="font-serif text-3xl mb-6">Guest reviews</h2>
            {prop.reviews?.length === 0 && <div className="text-stone-500 text-sm">No reviews yet. Be the first!</div>}
            <div className="space-y-5" data-testid="reviews-list">
              {prop.reviews?.map((r) => (
                <div key={r.id} className="border-b border-stone-200 pb-5">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{r.user_name}</div>
                    <div className="flex items-center gap-1 text-sm">{[...Array(r.rating)].map((_,i)=><Star key={i} className="w-3 h-3 fill-[var(--ols-accent)] text-[var(--ols-accent)]" />)}</div>
                  </div>
                  <p className="text-sm text-stone-700 mt-2">{r.review}</p>
                </div>
              ))}
            </div>
            {user && (
              <form onSubmit={submitReview} className="mt-8 border border-stone-200 p-5 bg-white" data-testid="review-form">
                <div className="font-serif text-xl mb-3">Write a review</div>
                <div className="flex gap-1 mb-3">
                  {[1,2,3,4,5].map((n) => (
                    <button key={n} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: n })} data-testid={`rate-${n}`}>
                      <Star className={`w-6 h-6 ${n <= reviewForm.rating ? "fill-[var(--ols-accent)] text-[var(--ols-accent)]" : "text-stone-300"}`} />
                    </button>
                  ))}
                </div>
                <textarea value={reviewForm.review} onChange={(e) => setReviewForm({ ...reviewForm, review: e.target.value })} rows={3} className="w-full border border-stone-300 p-3 text-sm outline-none" placeholder="Share your experience..." required data-testid="review-text" />
                <button className="btn-primary mt-3" data-testid="review-submit">Submit review</button>
              </form>
            )}
          </section>
        </div>

        {/* BOOKING WIDGET */}
        <aside>
          <div className="sticky top-24 bg-white border border-stone-200 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.06)]" data-testid="booking-widget">
            <div className="flex items-baseline justify-between mb-1">
              <div className="font-serif text-3xl">${selectedRoom?.price_per_night || prop.starting_price}</div>
              <div className="text-xs text-stone-500">per night</div>
            </div>
            <div className="text-xs text-stone-500 mb-5">{selectedRoom?.room_name || "Select a room"}</div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="border border-stone-300 p-2">
                <div className="ols-label text-[0.55rem] mb-1">Check-in</div>
                <input type="date" value={checkin} min={today} onChange={(e) => setCheckin(e.target.value)} className="w-full text-sm outline-none" data-testid="booking-checkin" />
              </div>
              <div className="border border-stone-300 p-2">
                <div className="ols-label text-[0.55rem] mb-1">Check-out</div>
                <input type="date" value={checkout} min={checkin} onChange={(e) => setCheckout(e.target.value)} className="w-full text-sm outline-none" data-testid="booking-checkout" />
              </div>
            </div>
            <div className="border border-stone-300 p-2 mb-4">
              <div className="ols-label text-[0.55rem] mb-1">Guests</div>
              <input type="number" min={1} value={guests} onChange={(e) => setGuests(+e.target.value)} className="w-full text-sm outline-none" data-testid="booking-guests" />
            </div>
            {nights > 0 && selectedRoom && (
              <div className="space-y-2 text-sm border-t border-stone-200 pt-4">
                <Row label={`$${selectedRoom.price_per_night} × ${nights} nights`} value={`$${subtotal}`} />
                <Row label="Taxes (12%)" value={`$${taxes}`} />
                <div className="border-t border-stone-200 pt-2 flex justify-between font-medium"><span>Total</span><span>${total}</span></div>
              </div>
            )}
            {bookErr && <div className="text-red-700 text-sm mt-3" data-testid="booking-error">{bookErr}</div>}
            {bookOk && <div className="bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800 mt-3" data-testid="booking-success">Booking <b>{bookOk.booking_number}</b> confirmed! Redirecting…</div>}
            <button onClick={book} disabled={booking} className="btn-primary w-full mt-4" data-testid="booking-confirm">{booking ? "Reserving..." : "Reserve — Pay at reception"}</button>
            <div className="text-xs text-stone-500 text-center mt-2">You won't be charged yet</div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return <div className="flex justify-between text-stone-600"><span>{label}</span><span>{value}</span></div>;
}
