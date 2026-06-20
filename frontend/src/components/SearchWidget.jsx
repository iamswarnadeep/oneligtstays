import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, Users, Search } from "lucide-react";
import DatePicker from "@/components/DatePicker";

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
    <form onSubmit={submit} className="search-pill" data-testid="search-widget">
      <div>
        <div className="ols-label flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Where</div>
        <input data-testid="search-destination" list="ols-destinations" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Location, villa, landmark" className="mt-1" />
        <datalist id="ols-destinations">
          {["Goa","Manali","Udaipur","Coorg","Munnar","Lonavala"].map((d) => <option key={d} value={d} />)}
        </datalist>
      </div>
      <div>
        <div className="ols-label flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Check-in</div>
        <DatePicker value={checkin} onChange={setCheckin} minDate={today} placeholder="Add date" testid="search-checkin" className="mt-1" />
      </div>
      <div>
        <div className="ols-label flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Check-out</div>
        <DatePicker value={checkout} onChange={setCheckout} minDate={checkin || today} placeholder="Add date" testid="search-checkout" className="mt-1" />
      </div>
      <div>
        <div className="ols-label flex items-center gap-1.5"><Users className="w-3 h-3" /> Guests</div>
        <input data-testid="search-guests" type="number" min={1} max={20} value={guests} onChange={(e) => setGuests(+e.target.value)} className="mt-1" />
      </div>
      <button type="submit" className="m-1.5 px-6 bg-stone-900 text-white rounded-full font-semibold text-sm hover:bg-stone-700 flex items-center gap-2" data-testid="search-submit">
        <Search className="w-4 h-4" /> Search
      </button>
    </form>
  );
}
