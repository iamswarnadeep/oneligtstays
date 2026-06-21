import { useEffect, useState, useRef } from "react";
import { Link, NavLink, Navigate, Routes, Route } from "react-router-dom";
import { LayoutDashboard, Home as HomeIcon, BedDouble, CalendarCheck, LogOut, IndianRupee, Building2, Users, MapPin, Tag, Layers, Menu, X, Upload, Eye, Plus, Trash2, Edit2 } from "lucide-react";
import api, { formatError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { LOGO_URL, inr } from "@/lib/brand";

const NAV = [
  { to: "/admin", t: "Dashboard", i: LayoutDashboard, end: true },
  { to: "/admin/properties", t: "Properties", i: Building2 },
  { to: "/admin/rooms", t: "Rooms", i: BedDouble },
  { to: "/admin/bookings", t: "Bookings", i: CalendarCheck },
  { to: "/admin/destinations", t: "Destinations", i: MapPin },
  { to: "/admin/property-types", t: "Property Types", i: Layers },
  { to: "/admin/offers", t: "Offers", i: Tag },
  { to: "/admin/users", t: "Users", i: Users },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  if (user === undefined) return <div className="p-10">Loading…</div>;
  if (!user || user.role !== "admin") return <Navigate to="/" />;

  return (
    <div className="min-h-screen flex bg-stone-50" data-testid="admin-layout">
      {/* MOBILE TOPBAR */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-stone-900 text-white flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img src={LOGO_URL} alt="OLS" className="h-8 bg-white rounded p-1" />
          <span className="font-display text-sm">Admin</span>
        </Link>
        <button onClick={() => setOpen(!open)} className="p-1">{open ? <X /> : <Menu />}</button>
      </div>

      {/* SIDEBAR */}
      <aside className={`bg-[#0A0A0A] text-stone-300 w-60 shrink-0 fixed lg:sticky top-0 h-screen z-40 transition-transform ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} flex flex-col`}>
        <Link to="/" className="flex items-center gap-3 p-6">
          <img src={LOGO_URL} alt="OLS" className="h-10 bg-white rounded-lg p-1" />
          <div className="text-white font-display text-lg">Admin</div>
        </Link>
        <nav className="flex-1 px-3 space-y-1 text-sm overflow-y-auto">
          {NAV.map((m) => (
            <NavLink key={m.to} to={m.to} end={m.end} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-md ${isActive ? "bg-stone-800 text-white" : "hover:bg-stone-800/50"}`} data-testid={`admin-nav-${m.t.toLowerCase().replace(/\s/g, '-')}`}>
              <m.i className="w-4 h-4" /> {m.t}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-stone-800 space-y-1 text-sm">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-stone-800/50"><HomeIcon className="w-4 h-4" /> View site</Link>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-stone-800/50 text-left" data-testid="admin-logout"><LogOut className="w-4 h-4" /> Logout</button>
        </div>
      </aside>

      <main className="flex-1 p-4 lg:p-8 pt-16 lg:pt-8 min-w-0">
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="properties" element={<AdminProperties />} />
          <Route path="rooms" element={<AdminRooms />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="destinations" element={<AdminDestinations />} />
          <Route path="property-types" element={<AdminPropertyTypes />} />
          <Route path="offers" element={<AdminOffers />} />
          <Route path="users" element={<AdminUsers />} />
        </Routes>
      </main>
    </div>
  );
}

// =============================================================================
// DASHBOARD
// =============================================================================
function AdminDashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get("/admin/stats").then((r) => setStats(r.data)); }, []);
  if (!stats) return <div className="text-stone-500">Loading…</div>;
  return (
    <div data-testid="admin-dashboard">
      <h1 className="font-display text-2xl md:text-3xl mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        <Stat icon={IndianRupee} label="Total Revenue" value={inr(stats.total_revenue)} />
        <Stat icon={CalendarCheck} label="Bookings" value={stats.total_bookings} />
        <Stat icon={Building2} label="Properties" value={stats.active_properties} />
        <Stat icon={Users} label="Customers" value={stats.total_customers} />
      </div>
      <div className="bg-white border border-stone-200 rounded-xl p-4 md:p-6">
        <div className="font-display text-lg md:text-xl mb-4">Monthly Revenue</div>
        {stats.monthly_revenue.length === 0 ? <div className="text-sm text-stone-500">No bookings yet</div> : (
          <div className="grid grid-cols-12 gap-2 items-end h-40 md:h-48">
            {stats.monthly_revenue.map((m) => {
              const max = Math.max(...stats.monthly_revenue.map(x => x.revenue));
              const h = max ? (m.revenue / max) * 100 : 0;
              return (
                <div key={m.month} className="flex flex-col items-center">
                  <div className="w-full bg-stone-900 rounded-t" style={{ height: `${h}%` }} title={inr(m.revenue)} />
                  <div className="text-[0.6rem] text-stone-500 mt-2">{m.month.slice(5)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="mt-4 text-sm text-stone-600">Occupancy rate: <b>{stats.occupancy_rate}%</b></div>
    </div>
  );
}
function Stat({ icon: Icon, label, value }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 md:p-5">
      <Icon className="w-5 h-5 text-stone-700 mb-2" />
      <div className="text-[0.65rem] text-stone-500 uppercase tracking-wider">{label}</div>
      <div className="font-display text-xl md:text-2xl mt-1">{value}</div>
    </div>
  );
}

// =============================================================================
// IMAGE UPLOADER (used in editors)
// =============================================================================
function ImageUploader({ value, onChange, testid }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();
  const list = (value || "").split("\n").map(s => s.trim()).filter(Boolean);
  const BACKEND = process.env.REACT_APP_BACKEND_URL;

  const upload = async (files) => {
    setUploading(true);
    try {
      const urls = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const { data } = await api.post("/admin/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
        urls.push(BACKEND + data.url);
      }
      onChange([...list, ...urls].join("\n"));
    } catch (e) { alert(formatError(e)); }
    finally { setUploading(false); }
  };
  const remove = (i) => { const nl = list.filter((_, idx) => idx !== i); onChange(nl.join("\n")); };

  return (
    <div>
      <div className="ols-label mb-1">Images</div>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mb-2">
        {list.map((u, i) => (
          <div key={i} className="relative aspect-square border border-stone-200 rounded-md overflow-hidden bg-stone-50">
            <img src={u} alt="" className="w-full h-full object-cover" />
            <button type="button" onClick={() => remove(i)} className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full text-[10px] flex items-center justify-center">×</button>
          </div>
        ))}
        <button type="button" onClick={() => inputRef.current?.click()} className="aspect-square border-2 border-dashed border-stone-300 rounded-md flex flex-col items-center justify-center text-xs text-stone-500 hover:border-stone-500" data-testid={testid}>
          {uploading ? "Uploading…" : <><Upload className="w-4 h-4 mb-1" />Upload</>}
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} className="w-full border border-stone-300 px-3 py-2 text-xs outline-none rounded-md mt-1" placeholder="Or paste image URLs, one per line" />
    </div>
  );
}

// =============================================================================
// PROPERTIES
// =============================================================================
function AdminProperties() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const load = () => api.get("/properties?limit=200").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);
  const del = async (id) => { if (!window.confirm("Delete?")) return; await api.delete(`/admin/properties/${id}`); load(); };
  return (
    <div data-testid="admin-properties">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl md:text-3xl">Properties</h1>
        <button onClick={() => setEditing({})} className="btn-primary text-sm" data-testid="add-property"><Plus className="w-4 h-4" /> Add property</button>
      </div>
      <div className="bg-white border border-stone-200 rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-stone-50 text-stone-600">
            <tr><th className="text-left p-3">Title</th><th className="text-left p-3">Destination</th><th className="text-left p-3">Type</th><th className="text-left p-3">From</th><th className="text-left p-3">GST</th><th className="text-left p-3">Status</th><th /></tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t border-stone-100">
                <td className="p-3 font-medium">{p.title}</td>
                <td className="p-3">{p.destination}</td>
                <td className="p-3 capitalize">{p.property_type}</td>
                <td className="p-3">{inr(p.starting_price)}</td>
                <td className="p-3">{p.gst_percent ?? 12}%</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs">{p.status}</span></td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button onClick={() => setEditing(p)} className="text-stone-700 mr-3" data-testid={`edit-property-${p.id}`}><Edit2 className="w-4 h-4 inline" /></button>
                  <button onClick={() => del(p.id)} className="text-red-700" data-testid={`delete-property-${p.id}`}><Trash2 className="w-4 h-4 inline" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && <PropertyEditor item={editing} onClose={() => { setEditing(null); load(); }} />}
    </div>
  );
}

function PropertyEditor({ item, onClose }) {
  const isNew = !item.id;
  const [destinations, setDestinations] = useState([]);
  const [types, setTypes] = useState([]);
  const [f, setF] = useState({
    title: item.title || "",
    destination: item.destination || "",
    property_type: item.property_type || "villa",
    description: item.description || "",
    location: item.location || "",
    latitude: item.latitude || 0,
    longitude: item.longitude || 0,
    starting_price: item.starting_price || 100,
    gst_percent: item.gst_percent ?? 12,
    images: (item.images || []).join("\n"),
    amenities: (item.amenities || []).join(", "),
    is_featured: item.is_featured || false,
    status: item.status || "active",
    highlights: (item.highlights || []).join("\n"),
    policies: (item.policies || []).join("\n"),
    house_rules: (item.house_rules || []).join("\n"),
    faqs: item.faqs || [],
  });
  const [err, setErr] = useState("");

  useEffect(() => {
    api.get("/destinations").then((r) => setDestinations(r.data));
    api.get("/property-types").then((r) => setTypes(r.data));
  }, []);

  const updateFaq = (i, k, v) => { const n = [...f.faqs]; n[i] = { ...n[i], [k]: v }; setF({ ...f, faqs: n }); };
  const addFaq = () => setF({ ...f, faqs: [...f.faqs, { q: "", a: "" }] });
  const delFaq = (i) => setF({ ...f, faqs: f.faqs.filter((_, idx) => idx !== i) });

  const save = async (e) => {
    e.preventDefault();
    const payload = {
      ...f,
      starting_price: +f.starting_price, gst_percent: +f.gst_percent,
      latitude: +f.latitude, longitude: +f.longitude,
      images: f.images.split("\n").map(s => s.trim()).filter(Boolean),
      amenities: f.amenities.split(",").map(s => s.trim()).filter(Boolean),
      highlights: f.highlights.split("\n").map(s => s.trim()).filter(Boolean),
      policies: f.policies.split("\n").map(s => s.trim()).filter(Boolean),
      house_rules: f.house_rules.split("\n").map(s => s.trim()).filter(Boolean),
      faqs: f.faqs.filter(x => x.q && x.a),
    };
    try {
      if (isNew) await api.post("/admin/properties", payload);
      else await api.put(`/admin/properties/${item.id}`, payload);
      onClose();
    } catch (e) { setErr(formatError(e)); }
  };
  return (
    <Modal onClose={onClose}>
      <form onSubmit={save} className="space-y-3" data-testid="property-editor">
        <div className="font-display text-xl md:text-2xl">{isNew ? "Add Property" : "Edit Property"}</div>
        {err && <div className="text-red-700 text-sm">{err}</div>}
        <Field label="Title" v={f.title} on={(v) => setF({ ...f, title: v })} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Select label="Destination" v={f.destination} on={(v) => setF({ ...f, destination: v })} options={destinations.map(d => d.name)} placeholder="Select destination" />
          <Select label="Property Type" v={f.property_type} on={(v) => setF({ ...f, property_type: v })} options={types.length ? types.map(t => t.name.toLowerCase()) : ["villa", "resort", "homestay", "cottage", "hotel"]} />
        </div>
        <Field label="Location" v={f.location} on={(v) => setF({ ...f, location: v })} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Field label="Latitude" type="number" v={f.latitude} on={(v) => setF({ ...f, latitude: v })} />
          <Field label="Longitude" type="number" v={f.longitude} on={(v) => setF({ ...f, longitude: v })} />
          <Field label="Starting Price ₹" type="number" v={f.starting_price} on={(v) => setF({ ...f, starting_price: v })} />
          <Field label="GST %" type="number" v={f.gst_percent} on={(v) => setF({ ...f, gst_percent: v })} />
        </div>
        <Field label="Description" v={f.description} on={(v) => setF({ ...f, description: v })} textarea />
        <ImageUploader value={f.images} onChange={(v) => setF({ ...f, images: v })} testid="property-image-upload" />
        <Field label="Amenities (comma-separated)" v={f.amenities} on={(v) => setF({ ...f, amenities: v })} />
        <Field label="Highlights (one per line)" v={f.highlights} on={(v) => setF({ ...f, highlights: v })} textarea />
        <Field label="Policies (one per line)" v={f.policies} on={(v) => setF({ ...f, policies: v })} textarea />
        <Field label="House Rules (one per line)" v={f.house_rules} on={(v) => setF({ ...f, house_rules: v })} textarea />

        {/* FAQs editor */}
        <div className="border border-stone-200 rounded-md p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="ols-label">FAQs</div>
            <button type="button" onClick={addFaq} className="text-xs text-blue-600 underline" data-testid="add-faq">+ Add FAQ</button>
          </div>
          <div className="space-y-2">
            {f.faqs.map((faq, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-2 items-start">
                <input value={faq.q} onChange={(e) => updateFaq(i, "q", e.target.value)} placeholder="Question" className="border border-stone-300 rounded px-2 py-1.5 text-sm outline-none" />
                <input value={faq.a} onChange={(e) => updateFaq(i, "a", e.target.value)} placeholder="Answer" className="border border-stone-300 rounded px-2 py-1.5 text-sm outline-none" />
                <button type="button" onClick={() => delFaq(i)} className="text-red-700 text-xs px-2">Remove</button>
              </div>
            ))}
            {f.faqs.length === 0 && <div className="text-xs text-stone-500">No FAQs yet.</div>}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.is_featured} onChange={(e) => setF({ ...f, is_featured: e.target.checked })} /> Featured on home page</label>
        <div className="flex gap-2 justify-end pt-3">
          <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
          <button className="btn-primary" data-testid="save-property">Save</button>
        </div>
      </form>
    </Modal>
  );
}

// =============================================================================
// ROOMS
// =============================================================================
function AdminRooms() {
  const [props, setProps] = useState([]);
  const [propId, setPropId] = useState("");
  const [rooms, setRooms] = useState([]);
  const [editing, setEditing] = useState(null);
  useEffect(() => { api.get("/properties?limit=200").then((r) => { setProps(r.data); if (r.data[0]) setPropId(r.data[0].id); }); }, []);
  const load = () => { if (propId) api.get("/admin/rooms", { params: { property_id: propId } }).then((r) => setRooms(r.data)); };
  useEffect(() => { load(); }, [propId]);
  const del = async (id) => { if (!window.confirm("Delete room?")) return; await api.delete(`/admin/rooms/${id}`); load(); };
  return (
    <div data-testid="admin-rooms">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl md:text-3xl">Rooms</h1>
        <button onClick={() => setEditing({ property_id: propId })} className="btn-primary text-sm" data-testid="add-room"><Plus className="w-4 h-4" /> Add room</button>
      </div>
      <div className="mb-4">
        <select value={propId} onChange={(e) => setPropId(e.target.value)} className="border border-stone-300 rounded-md px-3 py-2 text-sm w-full md:w-auto">
          {props.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </div>
      <div className="bg-white border border-stone-200 rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead className="bg-stone-50 text-stone-600">
            <tr><th className="text-left p-3">Room</th><th className="text-left p-3">Size</th><th className="text-left p-3">Capacity</th><th className="text-left p-3">Price</th><th /></tr>
          </thead>
          <tbody>
            {rooms.map((r) => (
              <tr key={r.id} className="border-t border-stone-100">
                <td className="p-3 font-medium">{r.room_name}</td>
                <td className="p-3">{r.room_size}</td>
                <td className="p-3">{r.max_adults}A / {r.max_children}C</td>
                <td className="p-3">{inr(r.price_per_night)}</td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button onClick={() => setEditing(r)} className="text-stone-700 mr-3"><Edit2 className="w-4 h-4 inline" /></button>
                  <button onClick={() => del(r.id)} className="text-red-700"><Trash2 className="w-4 h-4 inline" /></button>
                </td>
              </tr>
            ))}
            {rooms.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-stone-500">No rooms yet</td></tr>}
          </tbody>
        </table>
      </div>
      {editing && <RoomEditor item={editing} properties={props} onClose={() => { setEditing(null); load(); }} />}
    </div>
  );
}

function RoomEditor({ item, properties, onClose }) {
  const isNew = !item.id;
  const [f, setF] = useState({
    property_id: item.property_id || properties[0]?.id || "",
    room_name: item.room_name || "",
    description: item.description || "",
    max_adults: item.max_adults || 2,
    max_children: item.max_children || 0,
    room_size: item.room_size || "",
    price_per_night: item.price_per_night || 100,
    total_rooms: item.total_rooms || 5,
    images: (item.images || []).join("\n"),
    amenities: (item.amenities || []).join(", "),
  });
  const [err, setErr] = useState("");
  const save = async (e) => {
    e.preventDefault();
    const payload = {
      ...f, max_adults: +f.max_adults, max_children: +f.max_children,
      price_per_night: +f.price_per_night, total_rooms: +f.total_rooms,
      images: f.images.split("\n").map(s => s.trim()).filter(Boolean),
      amenities: f.amenities.split(",").map(s => s.trim()).filter(Boolean),
    };
    try {
      if (isNew) await api.post("/admin/rooms", payload);
      else await api.put(`/admin/rooms/${item.id}`, payload);
      onClose();
    } catch (e) { setErr(formatError(e)); }
  };
  return (
    <Modal onClose={onClose}>
      <form onSubmit={save} className="space-y-3" data-testid="room-editor">
        <div className="font-display text-xl md:text-2xl">{isNew ? "Add Room" : "Edit Room"}</div>
        {err && <div className="text-red-700 text-sm">{err}</div>}
        <Select label="Property" v={f.property_id} on={(v) => setF({ ...f, property_id: v })} options={properties.map(p => ({ value: p.id, label: p.title }))} />
        <Field label="Room name" v={f.room_name} on={(v) => setF({ ...f, room_name: v })} />
        <Field label="Description" v={f.description} on={(v) => setF({ ...f, description: v })} textarea />
        <div className="grid grid-cols-3 gap-3">
          <Field label="Adults" type="number" v={f.max_adults} on={(v) => setF({ ...f, max_adults: v })} />
          <Field label="Children" type="number" v={f.max_children} on={(v) => setF({ ...f, max_children: v })} />
          <Field label="Size" v={f.room_size} on={(v) => setF({ ...f, room_size: v })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Price/night ₹" type="number" v={f.price_per_night} on={(v) => setF({ ...f, price_per_night: v })} />
          <Field label="Total rooms" type="number" v={f.total_rooms} on={(v) => setF({ ...f, total_rooms: v })} />
        </div>
        <ImageUploader value={f.images} onChange={(v) => setF({ ...f, images: v })} testid="room-image-upload" />
        <Field label="Amenities (comma-separated)" v={f.amenities} on={(v) => setF({ ...f, amenities: v })} />
        <div className="flex gap-2 justify-end pt-3">
          <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
          <button className="btn-primary" data-testid="save-room">Save</button>
        </div>
      </form>
    </Modal>
  );
}

// =============================================================================
// BOOKINGS
// =============================================================================
function AdminBookings() {
  const [items, setItems] = useState([]);
  const [view, setView] = useState(null);
  const load = () => api.get("/admin/bookings").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);
  const update = async (id, field, value) => { await api.put(`/admin/bookings/${id}`, { [field]: value }); load(); };
  return (
    <div data-testid="admin-bookings">
      <h1 className="font-display text-2xl md:text-3xl mb-6">Bookings</h1>
      <div className="bg-white border border-stone-200 rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[820px]">
          <thead className="bg-stone-50 text-stone-600">
            <tr><th className="text-left p-3">#</th><th className="text-left p-3">Guest</th><th className="text-left p-3">Property</th><th className="text-left p-3">Dates</th><th className="text-left p-3">Amount</th><th className="text-left p-3">Status</th><th className="text-left p-3">Payment</th><th /></tr>
          </thead>
          <tbody>
            {items.map((b) => (
              <tr key={b.id} className="border-t border-stone-100" data-testid={`admin-booking-${b.id}`}>
                <td className="p-3 font-mono text-xs">{b.booking_number}</td>
                <td className="p-3">
                  <div>{b.user_name}</div>
                  <div className="text-xs text-stone-500">{b.user_email}</div>
                  <div className="text-xs text-stone-500">{b.guest_phone || "—"}</div>
                </td>
                <td className="p-3">{b.property_title}<div className="text-xs text-stone-500">{b.room_name}</div></td>
                <td className="p-3 text-xs">{b.checkin}<br />{b.checkout}</td>
                <td className="p-3">{inr(b.amount)}</td>
                <td className="p-3">
                  <select value={b.status} onChange={(e) => update(b.id, "status", e.target.value)} className="border border-stone-300 rounded px-2 py-1 text-xs">
                    {["confirmed", "completed", "cancelled"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-3">
                  <select value={b.payment_status} onChange={(e) => update(b.id, "payment_status", e.target.value)} className="border border-stone-300 rounded px-2 py-1 text-xs">
                    {["pending", "paid", "refunded"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-3">
                  <button onClick={() => setView(b)} className="text-stone-700 underline text-xs" data-testid={`view-booking-${b.id}`}><Eye className="w-4 h-4 inline" /> View</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={8} className="p-6 text-center text-stone-500">No bookings yet</td></tr>}
          </tbody>
        </table>
      </div>
      {view && <BookingDetail booking={view} onClose={() => setView(null)} />}
    </div>
  );
}

function BookingDetail({ booking, onClose }) {
  return (
    <Modal onClose={onClose}>
      <div className="space-y-4" data-testid="booking-detail-modal">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display text-xl md:text-2xl">{booking.property_title}</div>
            <div className="text-xs font-mono text-stone-500 mt-1">{booking.booking_number}</div>
          </div>
          <span className={`px-2 py-1 rounded text-xs ${booking.status === "cancelled" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{booking.status}</span>
        </div>
        {booking.property_image && <img src={booking.property_image} alt="" className="w-full h-40 object-cover rounded-lg" />}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <KV label="Guest Name" value={booking.guest_name || booking.user_name} />
          <KV label="Email" value={booking.user_email || booking.guest_email} />
          <KV label="Phone" value={booking.guest_phone || "—"} />
          <KV label="Number of Guests" value={booking.guests} />
          <KV label="Number of Rooms" value={booking.rooms_count || 1} />
          <KV label="Room Type" value={booking.room_name} />
          <KV label="Check-in" value={booking.checkin} />
          <KV label="Check-out" value={booking.checkout} />
          <KV label="Nights" value={booking.nights} />
          <KV label="Payment Method" value={booking.payment_method === "pay_at_reception" ? "Pay at Reception" : booking.payment_method} />
          <KV label="Payment Status" value={booking.payment_status} />
        </div>
        <div className="border-t border-stone-200 pt-3">
          <div className="font-semibold text-sm mb-2">Pricing</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-stone-600"><span>Price/night × nights × rooms</span><span>{inr(booking.subtotal)}</span></div>
            <div className="flex justify-between text-stone-600"><span>GST ({booking.gst_percent || 12}%)</span><span>{inr(booking.taxes)}</span></div>
            <div className="flex justify-between font-semibold pt-2 border-t border-stone-100"><span>Total</span><span>{inr(booking.amount)}</span></div>
          </div>
        </div>
        <div className="flex justify-end pt-2"><button onClick={onClose} className="btn-outline">Close</button></div>
      </div>
    </Modal>
  );
}

// =============================================================================
// DESTINATIONS
// =============================================================================
function AdminDestinations() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const load = () => api.get("/destinations").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);
  const del = async (id) => { if (!window.confirm("Delete?")) return; await api.delete(`/admin/destinations/${id}`); load(); };
  return (
    <div data-testid="admin-destinations">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl md:text-3xl">Destinations</h1>
        <button onClick={() => setEditing({})} className="btn-primary text-sm"><Plus className="w-4 h-4" /> Add destination</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((d) => (
          <div key={d.id} className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            <img src={d.image} alt={d.name} className="w-full h-32 object-cover" />
            <div className="p-3">
              <div className="font-semibold">{d.name}</div>
              <div className="text-xs text-stone-500">{d.property_count || 0} stays</div>
              <div className="mt-2 flex gap-2 text-xs">
                <button onClick={() => setEditing(d)} className="text-stone-700"><Edit2 className="w-3.5 h-3.5 inline" /> Edit</button>
                <button onClick={() => del(d.id)} className="text-red-700"><Trash2 className="w-3.5 h-3.5 inline" /> Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {editing && <DestinationEditor item={editing} onClose={() => { setEditing(null); load(); }} />}
    </div>
  );
}
function DestinationEditor({ item, onClose }) {
  const isNew = !item.id;
  const [f, setF] = useState({ name: item.name || "", image: item.image || "", description: item.description || "", property_count: item.property_count || 0 });
  const [err, setErr] = useState("");
  const save = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...f, property_count: +f.property_count };
      if (isNew) await api.post("/admin/destinations", payload);
      else await api.put(`/admin/destinations/${item.id}`, payload);
      onClose();
    } catch (e) { setErr(formatError(e)); }
  };
  return (
    <Modal onClose={onClose}>
      <form onSubmit={save} className="space-y-3">
        <div className="font-display text-xl">{isNew ? "Add Destination" : "Edit Destination"}</div>
        {err && <div className="text-red-700 text-sm">{err}</div>}
        <Field label="Name" v={f.name} on={(v) => setF({ ...f, name: v })} />
        <ImageUploader value={f.image} onChange={(v) => setF({ ...f, image: v.split("\n")[0] || "" })} />
        <Field label="Description" v={f.description} on={(v) => setF({ ...f, description: v })} textarea />
        <Field label="Property count" type="number" v={f.property_count} on={(v) => setF({ ...f, property_count: v })} />
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
          <button className="btn-primary">Save</button>
        </div>
      </form>
    </Modal>
  );
}

// =============================================================================
// PROPERTY TYPES
// =============================================================================
function AdminPropertyTypes() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const load = () => api.get("/property-types").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);
  const add = async (e) => { e.preventDefault(); if (!name) return; await api.post("/admin/property-types", { name }); setName(""); load(); };
  const del = async (id) => { if (!window.confirm("Delete?")) return; await api.delete(`/admin/property-types/${id}`); load(); };
  return (
    <div data-testid="admin-property-types">
      <h1 className="font-display text-2xl md:text-3xl mb-6">Property Types</h1>
      <form onSubmit={add} className="flex gap-2 mb-6 max-w-md">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Villa" className="flex-1 border border-stone-300 rounded-md px-3 py-2 text-sm outline-none" data-testid="new-type-name" />
        <button className="btn-primary text-sm" data-testid="add-type">Add</button>
      </form>
      <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100">
        {items.map((t) => (
          <div key={t.id} className="flex items-center justify-between p-3 text-sm">
            <span>{t.name}</span>
            <button onClick={() => del(t.id)} className="text-red-700"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
        {items.length === 0 && <div className="p-6 text-center text-stone-500 text-sm">No property types yet — using default list.</div>}
      </div>
    </div>
  );
}

// =============================================================================
// OFFERS
// =============================================================================
function AdminOffers() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const load = () => api.get("/admin/offers").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);
  const del = async (id) => { if (!window.confirm("Delete?")) return; await api.delete(`/admin/offers/${id}`); load(); };
  return (
    <div data-testid="admin-offers">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl md:text-3xl">Offers</h1>
        <button onClick={() => setEditing({})} className="btn-primary text-sm"><Plus className="w-4 h-4" /> Add Offer</button>
      </div>
      <div className="bg-white border border-stone-200 rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-stone-50 text-stone-600">
            <tr><th className="text-left p-3">Bank/Brand</th><th className="text-left p-3">Title</th><th className="text-left p-3">Code</th><th className="text-left p-3">Active</th><th /></tr>
          </thead>
          <tbody>
            {items.map((o) => (
              <tr key={o.id} className="border-t border-stone-100">
                <td className="p-3 font-medium">{o.bank}</td>
                <td className="p-3">{o.title}</td>
                <td className="p-3 font-mono text-xs">{o.code}</td>
                <td className="p-3">{o.active ? "Yes" : "No"}</td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button onClick={() => setEditing(o)} className="text-stone-700 mr-3"><Edit2 className="w-4 h-4 inline" /></button>
                  <button onClick={() => del(o.id)} className="text-red-700"><Trash2 className="w-4 h-4 inline" /></button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-stone-500">No offers yet.</td></tr>}
          </tbody>
        </table>
      </div>
      {editing && <OfferEditor item={editing} onClose={() => { setEditing(null); load(); }} />}
    </div>
  );
}
function OfferEditor({ item, onClose }) {
  const isNew = !item.id;
  const [f, setF] = useState({ bank: item.bank || "", title: item.title || "", sub: item.sub || "", code: item.code || "", color: item.color || "from-rose-50 to-amber-50", active: item.active ?? true });
  const [err, setErr] = useState("");
  const save = async (e) => {
    e.preventDefault();
    try {
      if (isNew) await api.post("/admin/offers", f);
      else await api.put(`/admin/offers/${item.id}`, f);
      onClose();
    } catch (e) { setErr(formatError(e)); }
  };
  return (
    <Modal onClose={onClose}>
      <form onSubmit={save} className="space-y-3" data-testid="offer-editor">
        <div className="font-display text-xl">{isNew ? "Add Offer" : "Edit Offer"}</div>
        {err && <div className="text-red-700 text-sm">{err}</div>}
        <Field label="Bank / Brand" v={f.bank} on={(v) => setF({ ...f, bank: v })} />
        <Field label="Title (e.g. Get 11% off, upto ₹5000)" v={f.title} on={(v) => setF({ ...f, title: v })} />
        <Field label="Subtitle / conditions" v={f.sub} on={(v) => setF({ ...f, sub: v })} />
        <Field label="Promo code" v={f.code} on={(v) => setF({ ...f, code: v })} />
        <Select label="Background gradient" v={f.color} on={(v) => setF({ ...f, color: v })} options={[
          { value: "from-red-50 to-orange-50", label: "Red → Orange" },
          { value: "from-blue-50 to-indigo-50", label: "Blue → Indigo" },
          { value: "from-amber-50 to-yellow-50", label: "Amber → Yellow" },
          { value: "from-rose-50 to-amber-50", label: "Rose → Amber" },
          { value: "from-emerald-50 to-teal-50", label: "Emerald → Teal" },
        ]} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} /> Active (visible on home page)</label>
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
          <button className="btn-primary" data-testid="save-offer">Save</button>
        </div>
      </form>
    </Modal>
  );
}

// =============================================================================
// USERS
// =============================================================================
function AdminUsers() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const load = () => api.get("/admin/users").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);
  const del = async (id) => { if (!window.confirm("Delete this user?")) return; await api.delete(`/admin/users/${id}`); load(); };
  return (
    <div data-testid="admin-users">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl md:text-3xl">Users</h1>
        <button onClick={() => setEditing({})} className="btn-primary text-sm"><Plus className="w-4 h-4" /> Add user</button>
      </div>
      <div className="bg-white border border-stone-200 rounded-xl overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-stone-50 text-stone-600">
            <tr><th className="text-left p-3">Name</th><th className="text-left p-3">Email</th><th className="text-left p-3">Phone</th><th className="text-left p-3">Role</th><th /></tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id} className="border-t border-stone-100">
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.phone || "—"}</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded bg-stone-100 text-xs">{u.role}</span></td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button onClick={() => setEditing(u)} className="text-stone-700 mr-3" data-testid={`edit-user-${u.id}`}><Edit2 className="w-4 h-4 inline" /></button>
                  <button onClick={() => del(u.id)} className="text-red-700" data-testid={`delete-user-${u.id}`}><Trash2 className="w-4 h-4 inline" /></button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-stone-500">No users yet.</td></tr>}
          </tbody>
        </table>
      </div>
      {editing && <UserEditor item={editing} onClose={() => { setEditing(null); load(); }} />}
    </div>
  );
}
function UserEditor({ item, onClose }) {
  const isNew = !item.id;
  const [f, setF] = useState({ name: item.name || "", email: item.email || "", phone: item.phone || "", role: item.role || "user", password: "" });
  const [err, setErr] = useState("");
  const save = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...f };
      if (!payload.password && !isNew) delete payload.password;
      if (isNew) await api.post("/admin/users", payload);
      else await api.put(`/admin/users/${item.id}`, payload);
      onClose();
    } catch (e) { setErr(formatError(e)); }
  };
  return (
    <Modal onClose={onClose}>
      <form onSubmit={save} className="space-y-3" data-testid="user-editor">
        <div className="font-display text-xl">{isNew ? "Add User" : "Edit User"}</div>
        {err && <div className="text-red-700 text-sm">{err}</div>}
        <Field label="Full Name" v={f.name} on={(v) => setF({ ...f, name: v })} />
        <Field label="Email" type="email" v={f.email} on={(v) => setF({ ...f, email: v })} />
        <Field label="Phone" v={f.phone} on={(v) => setF({ ...f, phone: v })} />
        <Select label="Role" v={f.role} on={(v) => setF({ ...f, role: v })} options={["user", "admin"]} />
        <Field label={isNew ? "Password" : "New password (leave blank to keep)"} type="password" v={f.password} on={(v) => setF({ ...f, password: v })} />
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
          <button className="btn-primary" data-testid="save-user">Save</button>
        </div>
      </form>
    </Modal>
  );
}

// =============================================================================
// UI HELPERS
// =============================================================================
function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white max-w-2xl w-full p-5 md:p-6 rounded-xl max-h-[90vh] overflow-y-auto">{children}</div>
    </div>
  );
}
function Field({ label, v, on, textarea, type = "text" }) {
  return (
    <label className="block">
      <div className="ols-label mb-1">{label}</div>
      {textarea ? (
        <textarea value={v} onChange={(e) => on(e.target.value)} rows={3} className="w-full border border-stone-300 px-3 py-2 text-sm outline-none rounded-md" />
      ) : (
        <input type={type} value={v} onChange={(e) => on(e.target.value)} className="w-full border border-stone-300 px-3 py-2 text-sm outline-none rounded-md" />
      )}
    </label>
  );
}
function Select({ label, v, on, options, placeholder }) {
  return (
    <label className="block">
      <div className="ols-label mb-1">{label}</div>
      <select value={v} onChange={(e) => on(e.target.value)} className="w-full border border-stone-300 px-3 py-2 text-sm outline-none rounded-md bg-white">
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => typeof o === "string" ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}
function KV({ label, value }) {
  return (
    <div>
      <div className="text-[0.65rem] text-stone-500 uppercase tracking-wider">{label}</div>
      <div className="mt-0.5">{value || "—"}</div>
    </div>
  );
}
