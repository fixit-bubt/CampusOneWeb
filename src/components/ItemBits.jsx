import React from "react";
import { Search, PackageCheck, MapPin, Calendar, Package } from "lucide-react";
import { Badge } from "./ui.jsx";
import { ITEM_CATEGORY_ICON, fmtDate } from "../lib/helpers.js";

// Photo (or category-icon placeholder) for a lost & found item.
export function ItemPhoto({ item, className = "" }) {
  if (item.photo) {
    return <img src={item.photo} alt={item.title} className={`object-cover ${className}`} />;
  }
  const PlaceholderIcon = ITEM_CATEGORY_ICON[item.category] || Package;
  return (
    <div className={`flex items-center justify-center bg-surface-2 text-ink-3 ${className}`}>
      <PlaceholderIcon size={40} strokeWidth={1.5} />
    </div>
  );
}

// Lost / Found type badge (clean neutral styling without bright colors).
export function ItemTypeBadge({ type }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-brd bg-surface/95 px-2 py-0.5 text-[10px] sm:text-[11px] font-medium text-ink shadow-2xs backdrop-blur-xs">
      {type === "Lost" ? (
        <Search size={11} className="text-ink-3 shrink-0" />
      ) : (
        <PackageCheck size={11} className="text-ink-3 shrink-0" />
      )}
      <span>{type}</span>
    </span>
  );
}

// Card used in the Lost & Found browse grid.
export function ItemCard({ item, onOpen }) {
  return (
    <button
      onClick={onOpen}
      className="group flex flex-col overflow-hidden rounded-xl border border-brd bg-surface text-left shadow-2xs transition-all duration-200 hover:border-ink-3 hover:shadow-xs active:scale-[0.99]"
    >
      <div className="relative h-32 sm:h-36 md:h-40 w-full overflow-hidden bg-surface-2">
        <ItemPhoto item={item} className="h-full w-full transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute left-2 top-2 sm:left-2.5 sm:top-2.5">
          <ItemTypeBadge type={item.type} />
        </div>
        {item.status === "Resolved" && (
          <div className="absolute right-2 top-2 sm:right-2.5 sm:top-2.5">
            <span className="inline-flex items-center rounded-md border border-brd bg-surface/95 px-2 py-0.5 text-[10px] sm:text-[11px] font-medium text-ink-3 shadow-2xs backdrop-blur-xs">
              Resolved
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-2.5 sm:p-3.5">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[10px] sm:text-[11px] font-semibold text-ink-3 uppercase tracking-wider truncate">{item.category}</span>
          <span className="text-[10px] sm:text-[11px] text-ink-3 shrink-0">{fmtDate(item.date)}</span>
        </div>
        <h3 className="line-clamp-1 text-xs sm:text-sm font-bold text-ink transition-colors">{item.title}</h3>
        {item.description && (
          <p className="mt-1 line-clamp-2 text-[11px] sm:text-xs text-ink-2 leading-relaxed">{item.description}</p>
        )}
        <div className="mt-2 pt-2 border-t border-brd flex items-center justify-between text-[11px] sm:text-xs text-ink-3">
          <span className="inline-flex items-center gap-1 truncate max-w-[150px] sm:max-w-[200px]">
            <MapPin size={12} className="text-ink-3 shrink-0" />
            <span className="truncate">{item.location || "Campus"}</span>
          </span>
          <span className="text-[10px] sm:text-[11px] font-medium text-ink-3 group-hover:text-ink shrink-0">View details</span>
        </div>
      </div>
    </button>
  );
}
