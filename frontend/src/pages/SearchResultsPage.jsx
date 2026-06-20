import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, Star, Map, ChevronDown } from "lucide-react";
import api from "@/lib/api";
import SearchWidget from "@/components/SearchWidget";
import PropertyCard from "@/components/PropertyCard";

const TYPES = ["villa", "resort", "homestay", "cottage", "hotel"];
const AMENITIES = ["Private Pool", "Wi-Fi", "Spa", "Breakfast", "Pet Friendly", "Parking", "Fireplace", "Bonfire", "Jacuzzi", "View"];
const FEATURES = ["Newly Launched", "Pure Veg", "High Speed Wifi", "Pool / Jacuzzi", "Pet Friendly"];

export default function SearchResultsPage({ onAuth }) {
  const [sp] = useSearchParams();
  const initial = useMemo(() => ({
    destination: sp.get("destination") || "",
    checkin: sp.get("checkin") || "",
    checkout: sp.get("checkout") || "",
    guests: sp.get("guests") || 2,
  }), [sp]);

  const [filters, setFilters] = useState({
    destination: sp.get("destination") || "",
    type: sp.get("type") || "",
    min: 0,
    max: 1000,
    rating: 0,
    amenities: [],
    features: [],
  });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("popular");

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filters.destination) params.destination = filters.destination;
    if (filters.type) params.property_type = filters.type;
    if (filters.min) params.min_price = filters.min;
    if (filters.max && filters.max < 1000) params.max_price = filters.max;
    if (filters.rating) params.rating = filters.rating;
    api.get("/properties", { params })
      .then((r) => {
        let data = r.data;
        if (filters.amenities.length) {
          data = data.filter((p) => filters.amenities.every((a) => (p.amenities || []).includes(a)));
        }
        if (sort === "rating") data = [...data].sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
        if (sort === "price_low") data = [...data].sort((a, b) => a.starting_price - b.starting_price);
        if (sort === "price_high") data = [...data].sort((a, b) => b.starting_price - a.starting_price);
        setItems(data);
      })
      .finally(() => setLoading(false));
  }, [filters, sort]);

  const toggle = (key, val) => setFilters((f) => ({ ...f, [key]: f[key].includes(val) ? f[key].filter((x) => x !== val) : [...f[key], val] }));

  return (
    <div data-testid="search-page" className="bg-stone-50 min-h-screen">
      {/* COMPACT SEARCH HEADER */}
      <div className="bg-white border-b border-stone-200 sticky top-[73px] z-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4">
          <SearchWidget initial={initial} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8 grid lg:grid-cols-[280px_1fr] gap-8">
        {/* FILTERS */}
        <aside className="bg-white border border-stone-200 rounded-2xl p-5 h-fit lg:sticky lg:top-[180px]" data-testid="filters-sidebar">
          <button className="w-full btn-outline text-sm mb-5">
            <Map className="w-4 h-4" /> View on Map
          </button>
          <label className="flex items-center justify-between text-sm mb-5">
            <span>Display Total Price <div className="text-xs text-stone-500">Price per night with taxes</div></span>
            <input type="checkbox" className="w-9 h-5 accent-stone-900" data-testid="display-total-price" />
          </label>

          <FilterBlock title="Price Range">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 border border-stone-300 rounded-md px-2.5 py-2 text-xs">
                <div className="text-[0.55rem] text-stone-500 uppercase">From</div>
                <div>$ {filters.min}</div>
              </div>
              <div className="flex-1 border border-stone-300 rounded-md px-2.5 py-2 text-xs">
                <div className="text-[0.55rem] text-stone-500 uppercase">To</div>
                <div>$ {filters.max}{filters.max === 1000 && "+"}</div>
              </div>
            </div>
            <input type="range" min={0} max={1000} value={filters.max} onChange={(e) => setFilters({ ...filters, max: +e.target.value })} className="w-full accent-stone-900" data-testid="filter-price" />
            <button className="w-full mt-3 btn-primary !rounded-md py-2 text-xs">Apply</button>
          </FilterBlock>

          <FilterBlock title="Rooms">
            <div className="flex items-center justify-between text-sm">
              <span>No. of Rooms</span>
              <div className="flex items-center gap-3">
                <button className="w-7 h-7 rounded-full border border-stone-300">−</button>
                <span>01+</span>
                <button className="w-7 h-7 rounded-full border border-stone-300">+</button>
              </div>
            </div>
          </FilterBlock>

          <FilterBlock title="Key Amenities / Features">
            <div className="space-y-2">
              {FEATURES.map((a) => (
                <label key={a} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={filters.features.includes(a)} onChange={() => toggle("features", a)} className="accent-stone-900" data-testid={`filter-feature-${a.replace(/\s|\/|/g,'-').toLowerCase()}`} />
                  {a}
                </label>
              ))}
              <button className="text-xs text-stone-500 underline">See more</button>
            </div>
          </FilterBlock>

          <FilterBlock title="Property Type">
            <div className="space-y-2">
              {TYPES.map((t) => (
                <label key={t} className="flex items-center gap-2 text-sm capitalize cursor-pointer">
                  <input type="radio" name="type" checked={filters.type === t} onChange={() => setFilters({ ...filters, type: t })} className="accent-stone-900" data-testid={`filter-type-${t}`} />
                  {t}
                </label>
              ))}
              {filters.type && <button onClick={() => setFilters({ ...filters, type: "" })} className="text-xs text-stone-500 underline mt-1" data-testid="filter-type-clear">Clear</button>}
            </div>
          </FilterBlock>

          <FilterBlock title="Amenities">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {AMENITIES.map((a) => (
                <label key={a} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={filters.amenities.includes(a)} onChange={() => toggle("amenities", a)} className="accent-stone-900" data-testid={`filter-amenity-${a.replace(/\s/g,'-').toLowerCase()}`} />
                  {a}
                </label>
              ))}
            </div>
          </FilterBlock>

          <FilterBlock title="Rating" last>
            <div className="space-y-2">
              {[5,4,3].map((r) => (
                <label key={r} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="rating" checked={filters.rating === r} onChange={() => setFilters({ ...filters, rating: r })} className="accent-stone-900" data-testid={`filter-rating-${r}`} />
                  <span className="flex items-center gap-1">{[...Array(r)].map((_, i) => <Star key={i} className="w-3 h-3 fill-stone-900 text-stone-900" />)} & up</span>
                </label>
              ))}
            </div>
          </FilterBlock>
        </aside>

        {/* RESULTS */}
        <main>
          <div className="text-xs text-stone-500 mb-2"><a href="/" className="hover:underline">Home</a> &gt; <span className="text-stone-900">{filters.destination ? `Villas in ${filters.destination}` : "All Stays"}</span></div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="font-display text-3xl">{filters.destination ? `Villas in ${filters.destination}` : "All curated stays"}</h1>
              <div className="text-sm text-stone-500 mt-1">{loading ? "Loading..." : `${items.length} ${items.length === 1 ? "stay" : "stays"} found`}</div>
            </div>
            <div className="relative">
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="appearance-none pl-3 pr-8 py-2 border border-stone-300 rounded-full bg-white text-sm font-medium" data-testid="sort-select">
                <option value="popular">Sort: Most Loved</option>
                <option value="rating">Rating: High to Low</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">{[...Array(4)].map((_,i)=><div key={i} className="h-48 bg-stone-200 animate-pulse rounded-2xl" />)}</div>
          ) : items.length === 0 ? (
            <div className="border border-dashed border-stone-300 p-12 text-center text-stone-500 rounded-2xl bg-white" data-testid="no-results">No stays match your filters. Try adjusting them.</div>
          ) : (
            <div className="space-y-5" data-testid="results-list">
              {items.map((p) => <PropertyCard key={p.id} property={p} onAuth={onAuth} layout="list" />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function FilterBlock({ title, children, last }) {
  const [open, setOpen] = useState(true);
  return (
    <div className={`${last ? "" : "pb-5 border-b border-stone-200 mb-5"}`}>
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between mb-3">
        <div className="text-sm font-semibold">{title}</div>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && children}
    </div>
  );
}
