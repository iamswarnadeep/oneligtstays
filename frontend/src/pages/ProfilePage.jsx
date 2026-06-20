import { useEffect, useState } from "react";
import { useSearchParams, Link, Navigate } from "react-router-dom";
import { User, Calendar, Heart, KeyRound, LogOut } from "lucide-react";
import api, { formatError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user, logout, setUser } = useAuth();
  const [sp, setSp] = useSearchParams();
  const tab = sp.get("tab") || "profile";

  if (user === undefined) return <div className="p-10 text-stone-500">Loading…</div>;
  if (!user) return <Navigate to="/" />;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10" data-testid="profile-page">
      <h1 className="font-serif text-4xl mb-8">My Account</h1>
      <div className="grid md:grid-cols-[260px_1fr] gap-10">
        <aside className="border border-stone-200 bg-white p-2 h-fit">
          {[
            { k: "profile", t: "Profile", i: User },
            { k: "bookings", t: "My Bookings", i: Calendar },
            { k: "wishlist", t: "Wishlist", i: Heart },
            { k: "password", t: "Change Password", i: KeyRound },
          ].map((m) => (
            <button key={m.k} onClick={() => setSp({ tab: m.k })} className={`w-full flex items-center gap-3 p-3 text-sm text-left ${tab === m.k ? "bg-[var(--ols-secondary)] font-medium" : "hover:bg-stone-50"}`} data-testid={`tab-${m.k}`}>
              <m.i className="w-4 h-4" /> {m.t}
            </button>
          ))}
          <button onClick={logout} className="w-full flex items-center gap-3 p-3 text-sm text-left text-red-700 border-t border-stone-200" data-testid="profile-logout">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </aside>
        <main>
          {tab === "profile" && <ProfileTab user={user} setUser={setUser} />}
          {tab === "bookings" && <BookingsTab />}
          {tab === "wishlist" && <WishlistTab />}
          {tab === "password" && <PasswordTab />}
        </main>
      </div>
    </div>
  );
}

function ProfileTab({ user, setUser }) {
  const [form, setForm] = useState({ name: user.name || "", phone: user.phone || "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const save = async (e) => {
    e.preventDefault();
    setMsg(""); setErr("");
    try {
      const { data } = await api.put("/auth/profile", form);
      setUser(data);
      setMsg("Profile updated");
    } catch (e) { setErr(formatError(e)); }
  };
  return (
    <form onSubmit={save} className="bg-white border border-stone-200 p-8 max-w-xl space-y-4" data-testid="profile-form">
      <div className="font-serif text-2xl mb-2">Personal information</div>
      <Input label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} testid="profile-name" />
      <Input label="Email" value={user.email} disabled testid="profile-email" />
      <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} testid="profile-phone" />
      {msg && <div className="text-sm text-emerald-700">{msg}</div>}
      {err && <div className="text-sm text-red-700">{err}</div>}
      <button className="btn-primary" data-testid="profile-save">Save changes</button>
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
      <div className="flex gap-2 mb-6 text-sm">
        {[["all","All"],["upcoming","Upcoming"],["completed","Completed"],["cancelled","Cancelled"]].map(([k,t]) => (
          <button key={k} onClick={() => setFilter(k)} className={`px-3 py-1 border ${filter===k?"bg-stone-900 text-white border-stone-900":"border-stone-300"}`} data-testid={`bookings-${k}`}>{t}</button>
        ))}
      </div>
      {loading ? <div className="text-stone-500">Loading…</div> : filtered.length === 0 ? <div className="text-stone-500 border border-dashed border-stone-300 p-10 text-center">No bookings.</div> : (
        <div className="space-y-4">
          {filtered.map((b) => (
            <div key={b.id} className="bg-white border border-stone-200 p-5 grid md:grid-cols-[120px_1fr_auto] gap-5 items-center" data-testid={`booking-${b.id}`}>
              {b.property_image && <img src={b.property_image} alt="" className="w-full md:w-[120px] h-24 object-cover" />}
              <div>
                <div className="ols-label text-[0.6rem] mb-1">{b.booking_number}</div>
                <div className="font-serif text-xl">{b.property_title}</div>
                <div className="text-xs text-stone-500 mt-1">{b.room_name} • {b.checkin} → {b.checkout} • {b.guests} guests</div>
                <div className="text-xs mt-1"><span className={`px-2 py-0.5 ${b.status==="cancelled"?"bg-red-50 text-red-700":"bg-emerald-50 text-emerald-700"}`}>{b.status}</span></div>
              </div>
              <div className="text-right">
                <div className="font-serif text-xl">${b.amount}</div>
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
      {items.length === 0 ? <div className="text-stone-500 border border-dashed border-stone-300 p-10 text-center">Your wishlist is empty.</div> : (
        <div className="grid md:grid-cols-2 gap-5">
          {items.map((p) => (
            <Link key={p.id} to={`/property/${p.slug}`} className="bg-white border border-stone-200 overflow-hidden flex">
              <img src={p.images?.[0]} alt="" className="w-32 h-32 object-cover" />
              <div className="p-4 flex-1">
                <div className="font-serif text-lg">{p.title}</div>
                <div className="text-xs text-stone-500">{p.location}</div>
                <div className="font-serif text-lg mt-2">${p.starting_price}/night</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function PasswordTab() {
  const [form, setForm] = useState({ current_password: "", new_password: "" });
  const [msg, setMsg] = useState(""); const [err, setErr] = useState("");
  const submit = async (e) => {
    e.preventDefault(); setMsg(""); setErr("");
    try {
      await api.post("/auth/change-password", form);
      setMsg("Password updated");
      setForm({ current_password: "", new_password: "" });
    } catch (e) { setErr(formatError(e)); }
  };
  return (
    <form onSubmit={submit} className="bg-white border border-stone-200 p-8 max-w-xl space-y-4" data-testid="password-form">
      <div className="font-serif text-2xl mb-2">Change password</div>
      <Input type="password" label="Current password" value={form.current_password} onChange={(e) => setForm({ ...form, current_password: e.target.value })} required testid="current-password" />
      <Input type="password" label="New password" value={form.new_password} onChange={(e) => setForm({ ...form, new_password: e.target.value })} required testid="new-password" />
      {msg && <div className="text-sm text-emerald-700">{msg}</div>}
      {err && <div className="text-sm text-red-700">{err}</div>}
      <button className="btn-primary" data-testid="password-save">Update password</button>
    </form>
  );
}

function Input({ label, testid, ...props }) {
  return (
    <label className="block">
      <div className="ols-label mb-1">{label}</div>
      <input {...props} className="w-full border border-stone-300 px-3 py-2 text-sm outline-none focus:border-[var(--ols-primary)] disabled:bg-stone-100" data-testid={testid} />
    </label>
  );
}
