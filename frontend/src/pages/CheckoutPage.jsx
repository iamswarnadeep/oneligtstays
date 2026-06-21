import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ShieldCheck, Lock, CreditCard, Building2, ArrowLeft, MapPin } from "lucide-react";
import api, { formatError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { inr, inrDec } from "@/lib/brand";

export default function CheckoutPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [payment, setPayment] = useState("pay_at_reception");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [guestInfo, setGuestInfo] = useState({
    name: user?.name || "", email: user?.email || "", phone: user?.phone || "",
  });

  useEffect(() => {
    const raw = sessionStorage.getItem("ols_checkout");
    if (!raw) { nav("/"); return; }
    setData(JSON.parse(raw));
  }, [nav]);

  if (!data) return <div className="p-10">Loading…</div>;

  const confirm = async () => {
    if (!user) { nav("/"); return; }
    setSubmitting(true); setErr("");
    try {
      const { data: booking } = await api.post("/bookings", {
        property_id: data.property_id, room_id: data.room_id,
        checkin: data.checkin, checkout: data.checkout,
        guests: data.guests, rooms_count: data.rooms_count,
        guest_name: guestInfo.name, guest_email: guestInfo.email, guest_phone: guestInfo.phone,
        payment_method: payment,
      });
      sessionStorage.removeItem("ols_checkout");
      sessionStorage.setItem("ols_last_booking", JSON.stringify(booking));
      nav(`/booking/${booking.id}/confirmation`);
    } catch (e) { setErr(formatError(e)); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="bg-stone-50 min-h-screen pb-20" data-testid="checkout-page">
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-8">
        <button onClick={() => nav(-1)} className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 mb-6"><ArrowLeft className="w-4 h-4" /> Back to property</button>
        <h1 className="font-display text-3xl md:text-4xl">Checkout</h1>
        <p className="text-sm text-stone-500 mt-1">Review your booking details and choose a payment method.</p>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8 mt-8">
          {/* MAIN */}
          <div className="space-y-6">
            {/* Property summary */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 flex gap-4">
              {data.property_image && <img src={data.property_image} alt="" className="w-32 h-24 object-cover rounded-xl" />}
              <div className="min-w-0">
                <div className="font-display text-xl">{data.property_title}</div>
                <div className="flex items-center gap-1 text-xs text-stone-500 mt-1"><MapPin className="w-3 h-3" /> {data.property_location}</div>
                <div className="text-sm mt-2"><b>{data.room_name}</b> · {data.nights} {data.nights > 1 ? "nights" : "night"} · {data.rooms_count} {data.rooms_count > 1 ? "rooms" : "room"} · {data.guests} guests</div>
                <div className="text-xs text-stone-500 mt-0.5">{data.checkin} → {data.checkout}</div>
              </div>
            </div>

            {/* Guest info */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5">
              <div className="font-display text-xl mb-4">Guest Details</div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Input label="Full Name" value={guestInfo.name} onChange={(v) => setGuestInfo({ ...guestInfo, name: v })} testid="checkout-name" />
                <Input label="Email" type="email" value={guestInfo.email} onChange={(v) => setGuestInfo({ ...guestInfo, email: v })} testid="checkout-email" />
                <Input label="Phone" value={guestInfo.phone} onChange={(v) => setGuestInfo({ ...guestInfo, phone: v })} testid="checkout-phone" />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5">
              <div className="font-display text-xl mb-4">Payment Method</div>
              <div className="space-y-3">
                <label className={`flex items-start gap-3 p-4 border rounded-xl cursor-not-allowed opacity-60`} data-testid="payment-online">
                  <input type="radio" disabled className="mt-1 accent-stone-900" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2"><CreditCard className="w-4 h-4" /><div className="font-semibold text-sm">Pay Online</div><span className="badge badge-light text-[0.55rem]">Coming Soon</span></div>
                    <div className="text-xs text-stone-500 mt-1">Pay securely with UPI, cards or netbanking.</div>
                  </div>
                </label>
                <label className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer ${payment === "pay_at_reception" ? "border-stone-900 bg-stone-50" : "border-stone-200"}`} data-testid="payment-reception">
                  <input type="radio" checked={payment === "pay_at_reception"} onChange={() => setPayment("pay_at_reception")} className="mt-1 accent-stone-900" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2"><Building2 className="w-4 h-4" /><div className="font-semibold text-sm">Pay at Reception</div></div>
                    <div className="text-xs text-stone-500 mt-1">Reserve now, pay when you arrive. Free cancellation up to 48h.</div>
                  </div>
                </label>
              </div>
            </div>

            {err && <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl" data-testid="checkout-error">{err}</div>}
          </div>

          {/* PRICE BREAKDOWN */}
          <aside>
            <div className="bg-white border border-stone-200 rounded-2xl p-5 sticky top-24" data-testid="checkout-summary">
              <div className="font-display text-xl mb-4">Price Breakdown</div>
              <div className="space-y-2 text-sm">
                <Row label={`${inr(data.price_per_night)} × ${data.nights} nights × ${data.rooms_count} rooms`} value={inrDec(data.subtotal)} />
                <Row label={`GST (${data.gst_percent}%)`} value={inrDec(data.taxes)} />
                <div className="flex justify-between font-semibold pt-3 mt-2 border-t border-stone-200 text-base"><span>Total</span><span>{inrDec(data.total)}</span></div>
              </div>
              <button onClick={confirm} disabled={submitting} className="btn-primary w-full mt-6" data-testid="confirm-booking">
                {submitting ? "Reserving..." : "Confirm Booking"}
              </button>
              <div className="text-xs text-stone-500 mt-3 flex items-center gap-1.5 justify-center"><Lock className="w-3 h-3" /> Your details are secure</div>
              <div className="text-xs text-stone-500 mt-1 flex items-center gap-1.5 justify-center"><ShieldCheck className="w-3 h-3" /> Free cancellation up to 48h</div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", testid }) {
  return (
    <label className="block">
      <div className="text-[0.65rem] text-stone-500 uppercase tracking-wider mb-1">{label}</div>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-900" data-testid={testid} />
    </label>
  );
}
function Row({ label, value }) {
  return <div className="flex justify-between text-stone-600"><span>{label}</span><span>{value}</span></div>;
}
