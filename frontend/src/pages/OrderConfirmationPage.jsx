import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { CheckCircle2, MapPin, Calendar, Users, Bed, Download, Home, FileText } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { inr, inrDec } from "@/lib/brand";

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    if (!user) { nav("/"); return; }
    const raw = sessionStorage.getItem("ols_last_booking");
    if (raw) {
      const b = JSON.parse(raw);
      if (b.id === id) { setBooking(b); return; }
    }
    api.get("/bookings/my").then((r) => {
      const b = r.data.find((x) => x.id === id);
      if (b) setBooking(b);
    });
  }, [id, user, nav]);

  if (!booking) return <div className="p-10 text-stone-500">Loading booking…</div>;

  return (
    <div className="bg-stone-50 min-h-screen pb-20" data-testid="confirmation-page">
      <div className="max-w-3xl mx-auto px-6 lg:px-10 py-12">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-3xl md:text-4xl">Booking Confirmed!</h1>
          <p className="text-stone-600 mt-2">Thanks {booking.guest_name?.split(" ")[0] || "Guest"} — we've received your reservation.</p>
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900 text-white text-xs font-mono" data-testid="booking-number">{booking.booking_number}</div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
          {booking.property_image && (
            <img src={booking.property_image} alt={booking.property_title} className="w-full h-48 object-cover" />
          )}
          <div className="p-6 space-y-5">
            <div>
              <div className="font-display text-2xl">{booking.property_title}</div>
              <div className="flex items-center gap-1 text-sm text-stone-500 mt-1"><MapPin className="w-3.5 h-3.5" /> {booking.property_location}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-stone-100 text-sm">
              <Info icon={Calendar} label="Check-in" value={booking.checkin} />
              <Info icon={Calendar} label="Check-out" value={booking.checkout} />
              <Info icon={Bed} label="Room" value={`${booking.room_name} · ${booking.rooms_count || 1} room(s)`} />
              <Info icon={Users} label="Guests" value={`${booking.guests}`} />
            </div>

            <div className="pt-4 border-t border-stone-100">
              <div className="font-semibold text-sm mb-3">Price summary</div>
              <div className="space-y-1.5 text-sm">
                <Row label={`${inr(booking.price_per_night)} × ${booking.nights} nights × ${booking.rooms_count || 1} rooms`} value={inrDec(booking.subtotal)} />
                <Row label={`GST (${booking.gst_percent || 12}%)`} value={inrDec(booking.taxes)} />
                <div className="flex justify-between font-semibold pt-2 mt-2 border-t border-stone-100 text-base"><span>Total</span><span>{inrDec(booking.amount)}</span></div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100">
              <div className="font-semibold text-sm mb-2">Payment</div>
              <div className="text-sm text-stone-700">{booking.payment_method === "pay_at_reception" ? "Pay at Reception" : "Online"} — Status: <b>{booking.payment_status || "pending"}</b></div>
            </div>

            <div className="pt-4 border-t border-stone-100 grid grid-cols-2 gap-2">
              <button onClick={() => window.print()} className="btn-outline text-sm" data-testid="print-receipt"><FileText className="w-4 h-4" /> Print receipt</button>
              <Link to="/profile?tab=bookings" className="btn-primary text-sm" data-testid="view-bookings"><Home className="w-4 h-4" /> View all bookings</Link>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-stone-500 mt-6">
          A confirmation email has been sent to <b>{booking.guest_email}</b>.<br />
          See you soon at OneLightStays!
        </div>
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div>
      <div className="text-xs text-stone-500 flex items-center gap-1.5"><Icon className="w-3.5 h-3.5" /> {label}</div>
      <div className="font-medium mt-0.5">{value}</div>
    </div>
  );
}
function Row({ label, value }) {
  return <div className="flex justify-between text-stone-600"><span>{label}</span><span>{value}</span></div>;
}
