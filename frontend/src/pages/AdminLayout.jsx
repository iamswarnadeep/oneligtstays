import { useEffect, useState } from "react";
import { Link, NavLink, Navigate, Routes, Route } from "react-router-dom";
import { LayoutDashboard, Home as HomeIcon, BedDouble, CalendarCheck, LogOut, DollarSign, Building2, Users } from "lucide-react";
import api, { formatError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  if (user === undefined) return <div className="p-10">Loading…</div>;
  if (!user || user.role !== "admin") return <Navigate to="/" />;
  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr] bg-stone-50" data-testid="admin-layout">
      <aside className="bg-[#1C1917] text-stone-300 p-6">
        <Link to="/" className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-[var(--ols-primary)] flex items-center justify-center"><span className="font-serif text-white">O</span></div>
          <div className="text-white font-serif text-lg">Admin</div>
        </Link>
        <nav className="space-y-1 text-sm">
          {[
            { to: "/admin", t: "Dashboard", i: LayoutDashboard, end: true },
            { to: "/admin/properties", t: "Properties", i: Building2 },
            { to: "/admin/rooms", t: "Rooms", i: BedDouble },
            { to: "/admin/bookings", t: "Bookings", i: CalendarCheck },
          ].map((m) => (
            <NavLink key={m.to} to={m.to} end={m.end} className={({isActive}) => `flex items-center gap-3 px-3 py-2 ${isActive?"bg-stone-800 text-white":"hover:bg-stone-800/50"}`} data-testid={`admin-nav-${m.t.toLowerCase()}`}>
              <m.i className="w-4 h-4" /> {m.t}
            </NavLink>
          ))}
        </nav>
        <div className="mt-10 pt-6 border-t border-stone-800 space-y-1 text-sm">
          <Link to="/" className="flex items-center gap-3 px-3 py-2 hover:bg-stone-800/50"><HomeIcon className="w-4 h-4" /> View site</Link>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-stone-800/50 text-left" data-testid="admin-logout"><LogOut className="w-4 h-4" /> Logout</button>
        </div>
      </aside>
      <main className="p-8">
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="properties" element={<AdminProperties />} />
          <Route path="rooms" element={<AdminRooms />} />
          <Route path="bookings" element={<AdminBookings />} />
        </Routes>
      </main>
    </div>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get("/admin/stats").then((r) => setStats(r.data)); }, []);
  if (!stats) return <div className="text-stone-500">Loading…</div>;
  return (
    <div data-testid="admin-dashboard">
      <h1 className="font-serif text-3xl mb-8">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Stat icon={DollarSign} label="Total Revenue" value={`$${stats.total_revenue}`} />
        <Stat icon={CalendarCheck} label="Bookings" value={stats.total_bookings} />
        <Stat icon={Building2} label="Active Properties" value={stats.active_properties} />
        <Stat icon={Users} label="Customers" value={stats.total_customers} />
      </div>
      <div className="bg-white border border-stone-200 p-6">
        <div className="font-serif text-xl mb-4">Monthly revenue</div>
        {stats.monthly_revenue.length === 0 ? <div className="text-sm text-stone-500">No bookings yet</div> : (
          <div className="grid grid-cols-12 gap-2 items-end h-48">
            {stats.monthly_revenue.map((m) => {
              const max = Math.max(...stats.monthly_revenue.map(x => x.revenue));
              const h = max ? (m.revenue / max) * 100 : 0;
              return (
                <div key={m.month} className="flex flex-col items-center">
                  <div className="w-full bg-[var(--ols-primary)]" style={{ height: `${h}%` }} title={`$${m.revenue}`} />
                  <div className="text-xs text-stone-500 mt-2">{m.month.slice(5)}</div>
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
    <div className="bg-white border border-stone-200 p-5">
      <Icon className="w-5 h-5 text-[var(--ols-primary)] mb-2" />
      <div className="text-xs text-stone-500 uppercase tracking-wider">{label}</div>
      <div className="font-serif text-3xl mt-1">{value}</div>
    </div>
  );
}

function AdminProperties() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const load = () => api.get("/properties?limit=200").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);
  const del = async (id) => { if (!confirm("Delete?")) return; await api.delete(`/admin/properties/${id}`); load(); };
  return (
    <div data-testid="admin-properties">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl">Properties</h1>
        <button onClick={() => setEditing({})} className="btn-primary" data-testid="add-property">+ Add property</button>
      </div>
      <div className="bg-white border border-stone-200">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-600">
            <tr><th className="text-left p-3">Title</th><th className="text-left p-3">Destination</th><th className="text-left p-3">Type</th><th className="text-left p-3">From</th><th className="text-left p-3">Status</th><th /></tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t border-stone-100">
                <td className="p-3 font-medium">{p.title}</td>
                <td className="p-3">{p.destination}</td>
                <td className="p-3 capitalize">{p.property_type}</td>
                <td className="p-3">${p.starting_price}</td>
                <td className="p-3"><span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs">{p.status}</span></td>
                <td className="p-3 text-right">
                  <button onClick={() => setEditing(p)} className="text-[var(--ols-primary)] mr-3" data-testid={`edit-property-${p.id}`}>Edit</button>
                  <button onClick={() => del(p.id)} className="text-red-700" data-testid={`delete-property-${p.id}`}>Delete</button>
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
  const [f, setF] = useState({
    title: item.title || "",
    destination: item.destination || "",
    property_type: item.property_type || "villa",
    description: item.description || "",
    location: item.location || "",
    latitude: item.latitude || 0,
    longitude: item.longitude || 0,
    starting_price: item.starting_price || 100,
    images: (item.images || []).join("\n"),
    amenities: (item.amenities || []).join(", "),
    is_featured: item.is_featured || false,
    status: item.status || "active",
    highlights: (item.highlights || []).join("\n"),
    policies: (item.policies || []).join("\n"),
    house_rules: (item.house_rules || []).join("\n"),
  });
  const [err, setErr] = useState("");
  const save = async (e) => {
    e.preventDefault();
    const payload = {
      ...f,
      starting_price: +f.starting_price,
      latitude: +f.latitude, longitude: +f.longitude,
      images: f.images.split("\n").map(s=>s.trim()).filter(Boolean),
      amenities: f.amenities.split(",").map(s=>s.trim()).filter(Boolean),
      highlights: f.highlights.split("\n").map(s=>s.trim()).filter(Boolean),
      policies: f.policies.split("\n").map(s=>s.trim()).filter(Boolean),
      house_rules: f.house_rules.split("\n").map(s=>s.trim()).filter(Boolean),
      faqs: item.faqs || [],
    };
    try {
      if (isNew) await api.post("/admin/properties", payload);
      else await api.put(`/admin/properties/${item.id}`, payload);
      onClose();
    } catch (e) { setErr(formatError(e)); }
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <form onSubmit={save} className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-3" data-testid="property-editor">
        <div className="font-serif text-2xl">{isNew ? "Add Property" : "Edit Property"}</div>
        {err && <div className="text-red-700 text-sm">{err}</div>}
        <Field label="Title" v={f.title} on={(v)=>setF({...f,title:v})} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Destination" v={f.destination} on={(v)=>setF({...f,destination:v})} />
          <Select label="Type" v={f.property_type} on={(v)=>setF({...f,property_type:v})} options={["villa","resort","homestay","cottage","hotel"]} />
        </div>
        <Field label="Location" v={f.location} on={(v)=>setF({...f,location:v})} />
        <div className="grid grid-cols-3 gap-3">
          <Field label="Latitude" type="number" v={f.latitude} on={(v)=>setF({...f,latitude:v})} />
          <Field label="Longitude" type="number" v={f.longitude} on={(v)=>setF({...f,longitude:v})} />
          <Field label="Starting Price" type="number" v={f.starting_price} on={(v)=>setF({...f,starting_price:v})} />
        </div>
        <Field label="Description" v={f.description} on={(v)=>setF({...f,description:v})} textarea />
        <Field label="Images (one URL per line)" v={f.images} on={(v)=>setF({...f,images:v})} textarea />
        <Field label="Amenities (comma-separated)" v={f.amenities} on={(v)=>setF({...f,amenities:v})} />
        <Field label="Highlights (one per line)" v={f.highlights} on={(v)=>setF({...f,highlights:v})} textarea />
        <Field label="Policies (one per line)" v={f.policies} on={(v)=>setF({...f,policies:v})} textarea />
        <Field label="House Rules (one per line)" v={f.house_rules} on={(v)=>setF({...f,house_rules:v})} textarea />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.is_featured} onChange={(e)=>setF({...f,is_featured:e.target.checked})} /> Featured on home page</label>
        <div className="flex gap-2 justify-end pt-3">
          <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
          <button className="btn-primary" data-testid="save-property">Save</button>
        </div>
      </form>
    </div>
  );
}

function AdminRooms() {
  const [props, setProps] = useState([]);
  const [propId, setPropId] = useState("");
  const [rooms, setRooms] = useState([]);
  const [editing, setEditing] = useState(null);
  useEffect(() => { api.get("/properties?limit=200").then((r) => { setProps(r.data); if (r.data[0]) setPropId(r.data[0].id); }); }, []);
  const load = () => { if (propId) api.get("/admin/rooms", { params: { property_id: propId } }).then((r) => setRooms(r.data)); };
  useEffect(() => { load(); }, [propId]);
  const del = async (id) => { if (!confirm("Delete room?")) return; await api.delete(`/admin/rooms/${id}`); load(); };
  return (
    <div data-testid="admin-rooms">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl">Rooms</h1>
        <button onClick={() => setEditing({ property_id: propId })} className="btn-primary" data-testid="add-room">+ Add room</button>
      </div>
      <div className="mb-4">
        <select value={propId} onChange={(e) => setPropId(e.target.value)} className="border border-stone-300 px-3 py-2 text-sm" data-testid="rooms-property-select">
          {props.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </div>
      <div className="bg-white border border-stone-200">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-600">
            <tr><th className="text-left p-3">Room</th><th className="text-left p-3">Size</th><th className="text-left p-3">Capacity</th><th className="text-left p-3">Price</th><th /></tr>
          </thead>
          <tbody>
            {rooms.map((r) => (
              <tr key={r.id} className="border-t border-stone-100">
                <td className="p-3 font-medium">{r.room_name}</td>
                <td className="p-3">{r.room_size}</td>
                <td className="p-3">{r.max_adults}A / {r.max_children}C</td>
                <td className="p-3">${r.price_per_night}</td>
                <td className="p-3 text-right">
                  <button onClick={() => setEditing(r)} className="text-[var(--ols-primary)] mr-3" data-testid={`edit-room-${r.id}`}>Edit</button>
                  <button onClick={() => del(r.id)} className="text-red-700" data-testid={`delete-room-${r.id}`}>Delete</button>
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
      ...f,
      max_adults: +f.max_adults, max_children: +f.max_children,
      price_per_night: +f.price_per_night, total_rooms: +f.total_rooms,
      images: f.images.split("\n").map(s=>s.trim()).filter(Boolean),
      amenities: f.amenities.split(",").map(s=>s.trim()).filter(Boolean),
    };
    try {
      if (isNew) await api.post("/admin/rooms", payload);
      else await api.put(`/admin/rooms/${item.id}`, payload);
      onClose();
    } catch (e) { setErr(formatError(e)); }
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <form onSubmit={save} className="bg-white max-w-xl w-full p-6 space-y-3 max-h-[90vh] overflow-y-auto" data-testid="room-editor">
        <div className="font-serif text-2xl">{isNew ? "Add Room" : "Edit Room"}</div>
        {err && <div className="text-red-700 text-sm">{err}</div>}
        <Select label="Property" v={f.property_id} on={(v)=>setF({...f,property_id:v})} options={properties.map(p=>({value:p.id,label:p.title}))} />
        <Field label="Room name" v={f.room_name} on={(v)=>setF({...f,room_name:v})} />
        <Field label="Description" v={f.description} on={(v)=>setF({...f,description:v})} textarea />
        <div className="grid grid-cols-3 gap-3">
          <Field label="Adults" type="number" v={f.max_adults} on={(v)=>setF({...f,max_adults:v})} />
          <Field label="Children" type="number" v={f.max_children} on={(v)=>setF({...f,max_children:v})} />
          <Field label="Size" v={f.room_size} on={(v)=>setF({...f,room_size:v})} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Price/night" type="number" v={f.price_per_night} on={(v)=>setF({...f,price_per_night:v})} />
          <Field label="Total rooms" type="number" v={f.total_rooms} on={(v)=>setF({...f,total_rooms:v})} />
        </div>
        <Field label="Images (one URL per line)" v={f.images} on={(v)=>setF({...f,images:v})} textarea />
        <Field label="Amenities (comma-separated)" v={f.amenities} on={(v)=>setF({...f,amenities:v})} />
        <div className="flex gap-2 justify-end pt-3">
          <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
          <button className="btn-primary" data-testid="save-room">Save</button>
        </div>
      </form>
    </div>
  );
}

function AdminBookings() {
  const [items, setItems] = useState([]);
  const load = () => api.get("/admin/bookings").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);
  const update = async (id, field, value) => { await api.put(`/admin/bookings/${id}`, { [field]: value }); load(); };
  return (
    <div data-testid="admin-bookings">
      <h1 className="font-serif text-3xl mb-6">Bookings</h1>
      <div className="bg-white border border-stone-200">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-600">
            <tr><th className="text-left p-3">#</th><th className="text-left p-3">Guest</th><th className="text-left p-3">Property</th><th className="text-left p-3">Dates</th><th className="text-left p-3">Amount</th><th className="text-left p-3">Status</th><th className="text-left p-3">Payment</th></tr>
          </thead>
          <tbody>
            {items.map((b) => (
              <tr key={b.id} className="border-t border-stone-100" data-testid={`admin-booking-${b.id}`}>
                <td className="p-3 font-mono text-xs">{b.booking_number}</td>
                <td className="p-3">{b.user_name}<div className="text-xs text-stone-500">{b.user_email}</div></td>
                <td className="p-3">{b.property_title}<div className="text-xs text-stone-500">{b.room_name}</div></td>
                <td className="p-3 text-xs">{b.checkin}<br/>{b.checkout}</td>
                <td className="p-3">${b.amount}</td>
                <td className="p-3">
                  <select value={b.status} onChange={(e) => update(b.id, "status", e.target.value)} className="border border-stone-300 px-2 py-1 text-xs">
                    {["confirmed","completed","cancelled"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-3">
                  <select value={b.payment_status} onChange={(e) => update(b.id, "payment_status", e.target.value)} className="border border-stone-300 px-2 py-1 text-xs">
                    {["pending","paid","refunded"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-stone-500">No bookings yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({ label, v, on, textarea, type = "text" }) {
  return (
    <label className="block">
      <div className="ols-label mb-1">{label}</div>
      {textarea ? (
        <textarea value={v} onChange={(e) => on(e.target.value)} rows={3} className="w-full border border-stone-300 px-3 py-2 text-sm outline-none" />
      ) : (
        <input type={type} value={v} onChange={(e) => on(e.target.value)} className="w-full border border-stone-300 px-3 py-2 text-sm outline-none" />
      )}
    </label>
  );
}

function Select({ label, v, on, options }) {
  return (
    <label className="block">
      <div className="ols-label mb-1">{label}</div>
      <select value={v} onChange={(e) => on(e.target.value)} className="w-full border border-stone-300 px-3 py-2 text-sm outline-none">
        {options.map((o) => typeof o === "string" ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}
