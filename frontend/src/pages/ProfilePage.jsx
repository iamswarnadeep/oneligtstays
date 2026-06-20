import { useEffect, useState } from "react";
import { useSearchParams, Link, Navigate } from "react-router-dom";
import { Calendar } from "lucide-react";
import api, { formatError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import DatePicker from "@/components/DatePicker";

const TABS = [
  { k: "profile", t: "Profile" },
  { k: "bookings", t: "Trips" },
  { k: "wishlist", t: "Wishlist" },
];

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [sp, setSp] = useSearchParams();
  const tab = sp.get("tab") || "profile";

  if (user === undefined) return <div className="p-10 text-stone-500">Loading…</div>;
  if (!user) return <Navigate to="/" />;

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-10 py-10" data-testid="profile-page">
      {/* Pill Tabs */}
      <div className="flex justify-center mb-10">
        <div className="pill-tabs" data-testid="profile-tabs">
          {TABS.map((m) => (
            <button key={m.k} onClick={() => setSp({ tab: m.k })} className={`pill-tab ${tab === m.k ? "active" : ""}`} data-testid={`tab-${m.k}`}>{m.t}</button>
          ))}
        </div>
      </div>

      {tab === "profile" && <ProfileTab user={user} setUser={setUser} />}
      {tab === "bookings" && <BookingsTab />}
      {tab === "wishlist" && <WishlistTab />}
    </div>
  );
}

function FloatingInput({ label, required, ...props }) {
  const [focused, setFocused] = useState(false);
  const filled = props.value && String(props.value).length > 0;
  return (
    <label className="block relative">
      <div className={`border rounded-md px-3 pt-5 pb-2 transition ${focused ? "border-stone-900" : "border-stone-300"}`}>
        <div className={`absolute left-3 transition-all pointer-events-none ${focused || filled ? "text-[0.65rem] top-1.5 text-stone-500" : "top-3.5 text-sm text-stone-500"}`}>
          {label}{required && <span className="text-red-500"> *</span>}
        </div>
        <input
          {...props}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="w-full outline-none bg-transparent text-sm"
        />
      </div>
    </label>
  );
}

function ProfileTab({ user, setUser }) {
  const [form, setForm] = useState({
    first_name: user.name?.split(" ")[0] || "",
    last_name: user.name?.split(" ").slice(1).join(" ") || "",
    gender: user.gender || "",
    dob: user.dob || "",
    email: user.email,
    city: user.city || "",
    phone: user.phone || "",
  });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const save = async (e) => {
    e.preventDefault();
    setMsg(""); setErr("");
    try {
      const name = [form.first_name, form.last_name].filter(Boolean).join(" ");
      const { data } = await api.put("/auth/profile", { name, phone: form.phone });
      setUser(data);
      setMsg("Profile updated");
    } catch (e) { setErr(formatError(e)); }
  };

  return (
    <form onSubmit={save} className="space-y-4 max-w-xl mx-auto" data-testid="profile-form">
      <FloatingInput label="First Name" required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} data-testid="profile-first-name" />
      <FloatingInput label="Last Name" required value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} data-testid="profile-last-name" />
      <div className="grid grid-cols-2 gap-3">
        <label className="block relative">
          <div className="border rounded-md px-3 pt-5 pb-2 border-stone-300">
            <div className="absolute left-3 top-1.5 text-[0.65rem] text-stone-500">Gender <span className="text-red-500">*</span></div>
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full outline-none bg-transparent text-sm" data-testid="profile-gender">
              <option value="">Select</option>
              <option>Male</option><option>Female</option><option>Other</option>
            </select>
          </div>
        </label>
        <label className="block relative">
          <div className="border rounded-md px-3 pt-5 pb-2 border-stone-300">
            <div className="absolute left-3 top-1.5 text-[0.65rem] text-stone-500">Date of birth <span className="text-red-500">*</span></div>
            <DatePicker value={form.dob} onChange={(v) => setForm({ ...form, dob: v })} placeholder="Select date" testid="profile-dob" />
          </div>
        </label>
      </div>
      <FloatingInput label="Email ID" required type="email" value={form.email} disabled data-testid="profile-email" />
      <FloatingInput label="Residential City" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} data-testid="profile-city" />
      <div className="grid grid-cols-[80px_1fr] gap-3">
        <div className="border border-stone-300 rounded-md px-3 py-3 text-sm flex items-center justify-center">+91</div>
        <FloatingInput label="Mobile Number" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} data-testid="profile-phone" />
      </div>

      {msg && <div className="text-sm text-emerald-700">{msg}</div>}
      {err && <div className="text-sm text-red-700">{err}</div>}
      <div className="flex justify-center pt-2">
        <button className="btn-primary !rounded-md px-8" data-testid="profile-save">Update</button>
      </div>
    </form>
  );
}

function BookingsTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const load = () => api.get("/bookings/my").then((r) => setItems(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const today = new Date().toISOString().split("T")[0];
  const filtered = items.filter((b) => {
    if (filter === "upcoming") return b.checkin >= today && b.status !== "cancelled";
    if (filter === "completed") return b.checkout < today && b.status !== "cancelled";
    if (filter === "cancelled") return b.status === "cancelled";
    return true;
  });
  const cancel = async (id) => {
    if (!confirm("Cancel this booking?")) return;
    await api.post(`/bookings/${id}/cancel`);
    load();
  };
  return (
    <div data-testid="bookings-tab">
      <div className="flex gap-2 mb-6 text-sm justify-center flex-wrap">
        {[["all","All"],["upcoming","Upcoming"],["completed","Completed"],["cancelled","Cancelled"]].map(([k,t]) => (
          <button key={k} onClick={() => setFilter(k)} className={`px-4 py-1.5 rounded-full text-sm font-medium ${filter===k?"bg-stone-900 text-white":"bg-stone-100 hover:bg-stone-200"}`} data-testid={`bookings-${k}`}>{t}</button>
        ))}
      </div>
      {loading ? <div className="text-stone-500">Loading…</div> : filtered.length === 0 ? (
        <div className="border border-dashed border-stone-300 p-12 text-center text-stone-500 rounded-2xl">
          <Calendar className="w-10 h-10 mx-auto mb-3 text-stone-300" />
          No trips yet. Start exploring!
          <div><Link to="/search" className="btn-outline mt-4">Browse Stays</Link></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => (
            <div key={b.id} className="bg-white border border-stone-200 rounded-2xl p-4 grid md:grid-cols-[140px_1fr_auto] gap-4 items-center" data-testid={`booking-${b.id}`}>
              {b.property_image && <img src={b.property_image} alt="" className="w-full md:w-[140px] h-28 object-cover rounded-xl" />}
              <div>
                <div className="text-[0.6rem] text-stone-500 uppercase tracking-wider">{b.booking_number}</div>
                <div className="font-display text-xl mt-0.5">{b.property_title}</div>
                <div className="text-xs text-stone-500 mt-1">{b.room_name} • {b.checkin} → {b.checkout} • {b.guests} guests</div>
                <div className="text-xs mt-2"><span className={`px-2 py-0.5 rounded-full ${b.status==="cancelled"?"bg-red-50 text-red-700":"bg-emerald-50 text-emerald-700"}`}>{b.status}</span></div>
              </div>
              <div className="text-right">
                <div className="font-display text-xl">${b.amount}</div>
                <div className="text-xs text-stone-500">{b.payment_status}</div>
                {b.status !== "cancelled" && new Date(b.checkin) > new Date() && (
                  <button onClick={() => cancel(b.id)} className="text-xs text-red-700 underline mt-2" data-testid={`cancel-${b.id}`}>Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WishlistTab() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/wishlist").then((r) => setItems(r.data)); }, []);
  return (
    <div data-testid="wishlist-tab">
      {items.length === 0 ? (
        <div className="border border-dashed border-stone-300 p-12 text-center text-stone-500 rounded-2xl">Your wishlist is empty. <Link to="/search" className="text-stone-900 underline">Discover stays</Link></div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((p) => (
            <Link key={p.id} to={`/property/${p.slug}`} className="bg-white border border-stone-200 rounded-2xl overflow-hidden flex hover:shadow-lg transition">
              <img src={p.images?.[0]} alt="" className="w-36 h-36 object-cover" />
              <div className="p-4 flex-1">
                <div className="font-display text-lg">{p.title}</div>
                <div className="text-xs text-stone-500">{p.location}</div>
                <div className="font-display text-lg mt-3">${p.starting_price}<span className="text-xs text-stone-500 font-medium">/night</span></div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
