import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, Star } from "lucide-react";
import api from "@/lib/api";
import SearchWidget from "@/components/SearchWidget";
import PropertyCard from "@/components/PropertyCard";

const TYPES = ["villa", "resort", "homestay", "cottage", "hotel"];
const AMENITIES = ["Private Pool", "Wi-Fi", "Spa", "Breakfast", "Pet Friendly", "Parking", "Fireplace", "Bonfire"];

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
  });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("grid");

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
        setItems(data);
      })
      .finally(() => setLoading(false));
  }, [filters]);

  const toggleAmenity = (a) => setFilters((f) => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a] }));

  return (
    <div data-testid="search-page">
      <div className="bg-[var(--ols-secondary)] py-8 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <SearchWidget initial={initial} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 grid lg:grid-cols-[280px_1fr] gap-10">
        {/* FILTERS */}
        <aside className="space-y-8" data-testid="filters-sidebar">
          <div>
            <div className="flex items-center gap-2 mb-4"><SlidersHorizontal className="w-4 h-4" /><h3 className="font-serif text-2xl">Filters</h3></div>
          </div>
          <FilterBlock title="Price per night">
            <input type="range" min={0} max={1000} value={filters.max} onChange={(e) => setFilters({ ...filters, max: +e.target.value })} className="w-full accent-[var(--ols-primary)]" data-testid="filter-price" />
            <div className="text-sm text-stone-600 mt-2">$0 – ${filters.max}{filters.max === 1000 && "+"}</div>
          </FilterBlock>
          <FilterBlock title="Property type">
            <div className="space-y-2">
              {TYPES.map((t) => (
                <label key={t} className="flex items-center gap-2 text-sm capitalize cursor-pointer">
                  <input type="radio" name="type" checked={filters.type === t} onChange={() => setFilters({ ...filters, type: t })} data-testid={`filter-type-${t}`} />
                  {t}
                </label>
              ))}
              {filters.type && <button onClick={() => setFilters({ ...filters, type: "" })} className="text-xs text-stone-500 underline" data-testid="filter-type-clear">Clear</button>}
            </div>
          </FilterBlock>
          <FilterBlock title="Rating">
            <div className="space-y-2">
              {[5,4,3].map((r) => (
                <label key={r} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="rating" checked={filters.rating === r} onChange={() => setFilters({ ...filters, rating: r })} data-testid={`filter-rating-${r}`} />
                  <span className="flex items-center gap-1">{[...Array(r)].map((_, i) => <Star key={i} className="w-3 h-3 fill-[var(--ols-accent)] text-[var(--ols-accent)]" />)} & up</span>
                </label>
              ))}
            </div>
          </FilterBlock>
          <FilterBlock title="Amenities">
            <div className="space-y-2">
              {AMENITIES.map((a) => (
                <label key={a} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={filters.amenities.includes(a)} onChange={() => toggleAmenity(a)} data-testid={`filter-amenity-${a.replace(/\s/g,'-').toLowerCase()}`} />
                  {a}
                </label>
              ))}
            </div>
          </FilterBlock>
        </aside>

        {/* RESULTS */}
        <main>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-serif text-3xl">{filters.destination ? `Stays in ${filters.destination}` : "All stays"}</h1>
              <div className="text-sm text-stone-500 mt-1">{loading ? "Loading..." : `${items.length} curated stays`}</div>
            </div>
            <div className="flex gap-2 text-xs">
              <button onClick={() => setView("grid")} className={`px-3 py-2 border ${view==="grid"?"bg-stone-900 text-white border-stone-900":"border-stone-300"}`} data-testid="view-grid">Grid</button>
              <button onClick={() => setView("list")} className={`px-3 py-2 border ${view==="list"?"bg-stone-900 text-white border-stone-900":"border-stone-300"}`} data-testid="view-list">List</button>
            </div>
          </div>
          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">{[...Array(4)].map((_,i)=><div key={i} className="aspect-[4/3] bg-stone-100 animate-pulse" />)}</div>
          ) : items.length === 0 ? (
            <div className="border border-dashed border-stone-300 p-12 text-center text-stone-500" data-testid="no-results">No stays match your filters. Try adjusting them.</div>
          ) : (
            <div className={view === "grid" ? "grid md:grid-cols-2 gap-6" : "space-y-6"} data-testid="results-list">
              {items.map((p) => <PropertyCard key={p.id} property={p} onAuth={onAuth} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function FilterBlock({ title, children }) {
  return (
    <div className="pb-6 border-b border-stone-200">
      <div className="ols-label mb-3">{title}</div>
      {children}
    </div>
  );
}
