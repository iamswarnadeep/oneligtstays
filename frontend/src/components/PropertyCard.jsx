import { Link } from "react-router-dom";
import { Heart, MapPin, Star, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { useState } from "react";

export default function PropertyCard({ property, onAuth }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);

  const toggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { onAuth?.(); return; }
    try {
      await api.post("/wishlist/toggle", { property_id: property.id });
      setLiked((v) => !v);
    } catch {}
  };

  return (
    <Link to={`/property/${property.slug}`} className="property-card block bg-white border border-stone-200 overflow-hidden group" data-testid={`property-card-${property.slug}`}>
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        <img src={property.images?.[0]} alt={property.title} className="ols-img w-full h-full object-cover" loading="lazy" />
        <button onClick={toggle} className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white" data-testid={`wishlist-${property.slug}`}>
          <Heart className={`w-4 h-4 ${liked ? "fill-rose-500 text-rose-500" : "text-stone-700"}`} />
        </button>
        <div className="absolute top-3 left-3 ols-label bg-white/90 backdrop-blur px-2 py-1 text-[0.6rem]">{property.property_type}</div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-serif text-xl tracking-tight leading-snug truncate">{property.title}</h3>
            <div className="flex items-center gap-1 text-xs text-stone-500 mt-1">
              <MapPin className="w-3 h-3" /> <span className="truncate">{property.location}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm shrink-0">
            <Star className="w-3.5 h-3.5 fill-[var(--ols-accent)] text-[var(--ols-accent)]" />
            <span className="font-medium">{(property.avg_rating || 4.8).toFixed(1)}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-100">
          <div className="ols-label text-stone-500 flex items-center gap-1"><Users className="w-3 h-3" /> {(property.rooms_count || 4) + "+ rooms"}</div>
          <div>
            <div className="ols-label text-stone-500 text-right text-[0.55rem]">From</div>
            <div className="font-serif text-2xl text-[var(--ols-text)] leading-none">${Math.round(property.starting_price)}<span className="text-xs text-stone-500 font-sans">/night</span></div>
          </div>
        </div>
      </div>
    </Link>
  );
}
