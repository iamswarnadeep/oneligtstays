import { Link } from "react-router-dom";
import { Heart, MapPin, Star, Bed, Bath, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { useState } from "react";

export default function PropertyCard({ property, onAuth, layout = "grid" }) {
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

  if (layout === "list") {
    return (
      <Link to={`/property/${property.slug}`} className="property-card block bg-white border border-stone-200 group" data-testid={`property-card-${property.slug}`}>
        <div className="grid md:grid-cols-[340px_1fr_180px] gap-0">
          <div className="relative aspect-[4/3] md:aspect-auto md:h-full overflow-hidden bg-stone-100">
            <img src={property.images?.[0]} alt={property.title} className="ols-img w-full h-full object-cover" loading="lazy" />
            <button onClick={toggle} className="absolute top-3 right-3 w-9 h-9 bg-white/95 rounded-full flex items-center justify-center hover:bg-white" data-testid={`wishlist-${property.slug}`}>
              <Heart className={`w-4 h-4 ${liked ? "fill-rose-500 text-rose-500" : "text-stone-700"}`} />
            </button>
            {property.is_featured && (
              <div className="absolute top-3 left-3 badge badge-dark"><Star className="w-3 h-3 fill-current" /> Best Rated</div>
            )}
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-display text-2xl tracking-tight">{property.title} <span className="text-stone-500 font-medium">— {property.destination}</span></div>
                <div className="flex items-center gap-1 text-sm text-stone-500 mt-1.5"><MapPin className="w-3.5 h-3.5" /> {property.location}</div>
              </div>
              <div className="flex items-center gap-1 bg-stone-50 px-2 py-1 rounded-md text-sm shrink-0">
                <Star className="w-3.5 h-3.5 fill-stone-900 text-stone-900" />
                <span className="font-semibold">{(property.avg_rating || 4.8).toFixed(1)}</span>
                <span className="text-stone-400 text-xs">of 5</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-sm text-stone-600">
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> Upto {property.max_guests || 8} Guests</span>
              <span className="flex items-center gap-1.5"><Bed className="w-4 h-4" /> {property.rooms_count || 3} Rooms</span>
              <span className="flex items-center gap-1.5"><Bath className="w-4 h-4" /> {property.bath_count || 3} Baths</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {(property.amenities || []).slice(0, 5).map((a) => (
                <span key={a} className="text-xs px-2.5 py-1 rounded-full bg-stone-100 text-stone-600">{a}</span>
              ))}
              {(property.amenities || []).length > 5 && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-stone-100 text-stone-600">+{property.amenities.length - 5}</span>
              )}
            </div>
            <p className="text-sm text-stone-600 mt-4 line-clamp-2">{property.description}</p>
          </div>
          <div className="p-6 flex flex-col items-end justify-between bg-stone-50/50 border-l border-stone-100">
            <div className="text-right">
              <div className="font-display text-2xl">${Math.round(property.starting_price)}</div>
              <div className="text-xs text-stone-500">Per Night + Taxes</div>
            </div>
            <button className="btn-primary w-full mt-4" data-testid={`view-${property.slug}`}>View</button>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/property/${property.slug}`} className="property-card block bg-white border border-stone-200 group" data-testid={`property-card-${property.slug}`}>
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        <img src={property.images?.[0]} alt={property.title} className="ols-img w-full h-full object-cover" loading="lazy" />
        <button onClick={toggle} className="absolute top-3 right-3 w-9 h-9 bg-white/95 rounded-full flex items-center justify-center hover:bg-white" data-testid={`wishlist-${property.slug}`}>
          <Heart className={`w-4 h-4 ${liked ? "fill-rose-500 text-rose-500" : "text-stone-700"}`} />
        </button>
        {property.is_featured && (
          <div className="absolute top-3 left-3 badge badge-dark"><Star className="w-3 h-3 fill-current" /> Best Rated</div>
        )}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 badge badge-light flex items-center gap-1"><Star className="w-3 h-3 fill-stone-900 text-stone-900" /> {(property.avg_rating || 4.8).toFixed(1)}</div>
      </div>
      <div className="p-5">
        <div className="font-display text-lg leading-tight truncate">{property.title}</div>
        <div className="flex items-center gap-1 text-xs text-stone-500 mt-1"><MapPin className="w-3 h-3" /> {property.destination}, {property.location?.split(",").pop()?.trim()}</div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-100">
          <div>
            <div className="font-display text-xl text-stone-900">${Math.round(property.starting_price)}<span className="text-xs text-stone-500 font-medium ml-0.5">/night</span></div>
            <div className="text-[0.65rem] text-stone-500 mt-0.5">+ Taxes</div>
          </div>
          <button className="w-9 h-9 rounded-full bg-stone-900 text-white flex items-center justify-center hover:bg-stone-700" data-testid={`view-${property.slug}`}>→</button>
        </div>
      </div>
    </Link>
  );
}
