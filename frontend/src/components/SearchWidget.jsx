import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, Users, Search } from "lucide-react";

export default function SearchWidget({ compact = false, initial = {} }) {
  const nav = useNavigate();
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 864e5).toISOString().split("T")[0];
  const [destination, setDestination] = useState(initial.destination || "");
  const [checkin, setCheckin] = useState(initial.checkin || today);
  const [checkout, setCheckout] = useState(initial.checkout || tomorrow);
  const [guests, setGuests] = useState(initial.guests || 2);

  const submit = (e) => {
    e?.preventDefault?.();
    const p = new URLSearchParams({ destination, checkin, checkout, guests: String(guests) });
    nav(`/search?${p.toString()}`);
  };

  return (
    <form onSubmit={submit} className={`bg-white ${compact ? "p-3" : "p-5 md:p-6"} shadow-[0_10px_40px_rgba(28,25,23,0.12)] border border-stone-100 grid grid-cols-1 md:grid-cols-12 gap-3 items-end`} data-testid="search-widget">
      <Field label="Destination" icon={MapPin} className="md:col-span-3">
        <input data-testid="search-destination" list="ols-destinations" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Where to?" className="w-full outline-none text-sm py-2" />
        <datalist id="ols-destinations">
          {["Goa","Manali","Udaipur","Coorg","Munnar","Lonavala"].map((d) => <option key={d} value={d} />)}
        </datalist>
      </Field>
      <Field label="Check-in" icon={Calendar} className="md:col-span-3">
        <input data-testid="search-checkin" type="date" value={checkin} min={today} onChange={(e) => setCheckin(e.target.value)} className="w-full outline-none text-sm py-2 bg-transparent" />
      </Field>
      <Field label="Check-out" icon={Calendar} className="md:col-span-3">
        <input data-testid="search-checkout" type="date" value={checkout} min={checkin} onChange={(e) => setCheckout(e.target.value)} className="w-full outline-none text-sm py-2 bg-transparent" />
      </Field>
      <Field label="Guests" icon={Users} className="md:col-span-2">
        <input data-testid="search-guests" type="number" min={1} max={20} value={guests} onChange={(e) => setGuests(+e.target.value)} className="w-full outline-none text-sm py-2 bg-transparent" />
      </Field>
      <button type="submit" className="btn-primary md:col-span-1 flex items-center justify-center gap-2" data-testid="search-submit">
        <Search className="w-4 h-4" /> <span className="md:hidden">Search</span>
      </button>
    </form>
  );
}

function Field({ label, icon: Icon, children, className = "" }) {
  return (
    <div className={`${className} border-b md:border-b-0 md:border-r border-stone-200 md:pr-4 last:border-r-0`}>
      <div className="ols-label mb-1 flex items-center gap-2"><Icon className="w-3 h-3" /> {label}</div>
      {children}
    </div>
  );
}
