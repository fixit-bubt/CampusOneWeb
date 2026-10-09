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

// Lost / Found type badge.
export function ItemTypeBadge({ type }) {
  return type === "Lost" ? (
    <Badge tone="red" icon={Search}>Lost</Badge>
  ) : (
    <Badge tone="emerald" icon={PackageCheck}>Found</Badge>
  );
}

// Card used in the Lost & Found browse grid.
export function ItemCard({ item, onOpen }) {
  return (
    <button
      onClick={onOpen}
      className="group flex flex-col overflow-hidden rounded-xl border border-brd bg-surface text-left shadow-2xs transition-all duration-200 hover:border-brand hover:shadow-xs active:scale-[0.99]"
    >
      <div className="relative h-44 w-full overflow-hidden bg-surface-2">
        <ItemPhoto item={item} className="h-full w-full transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute left-2.5 top-2.5"><ItemTypeBadge type={item.type} /></div>
        {item.status === "Resolved" && (
          <div className="absolute right-2.5 top-2.5"><Badge tone="slate">Resolved</Badge></div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[11px] font-semibold text-ink-3 uppercase tracking-wider">{item.category}</span>
          <span className="text-[11px] text-ink-3">{fmtDate(item.date)}</span>
        </div>
        <h3 className="line-clamp-1 text-sm sm:text-base font-bold text-ink group-hover:text-brand transition-colors">{item.title}</h3>
        {item.description && (
          <p className="mt-1 line-clamp-2 text-xs text-ink-2 leading-relaxed">{item.description}</p>
        )}
        <div className="mt-2.5 pt-2 border-t border-brd flex items-center justify-between text-xs text-ink-3">
          <span className="inline-flex items-center gap-1.5 truncate max-w-[200px]">
            <MapPin size={13} className="text-ink-3 shrink-0" />
            <span className="truncate">{item.location || "Campus"}</span>
          </span>
          <span className="text-[11px] font-semibold text-brand group-hover:underline shrink-0">View Details</span>
        </div>
      </div>
    </button>
  );
}
