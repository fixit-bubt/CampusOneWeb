import React, { useState, useMemo } from "react";
import { Search, SearchX, PackageSearch, Plus, X, RotateCcw, ChevronDown } from "lucide-react";
import { useApp } from "../../data/store.jsx";
import { navigate } from "../../lib/router.jsx";
import { Button, EmptyState, Loading } from "../../components/ui.jsx";
import { AppShell, PageHeader } from "../../components/AppShell.jsx";
import { ItemCard } from "../../components/ItemBits.jsx";
import { ITEM_CATEGORIES } from "../../lib/helpers.js";

const TABS = [
  { id: "all", label: "All Items" },
  { id: "lost", label: "Lost" },
  { id: "found", label: "Found" },
  { id: "my-posts", label: "My Posts" },
];

export default function LostFoundBrowse() {
  const { items, dataLoading, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState("all");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("Active");

  // Tab counts
  const counts = useMemo(() => {
    return {
      all: items.filter((i) => i.status === "Open").length,
      lost: items.filter((i) => i.status === "Open" && i.type === "Lost").length,
      found: items.filter((i) => i.status === "Open" && i.type === "Found").length,
      "my-posts": items.filter((i) => i.posterId === currentUser?.id).length,
    };
  }, [items, currentUser?.id]);

  const isFiltered = query.trim() !== "" || category !== "All" || status !== "Active";

  const clearFilters = () => {
    setQuery("");
    setCategory("All");
    setStatus("Active");
  };

  const filtered = useMemo(() => {
    return items
      .filter((i) => {
        if (activeTab === "lost" && i.type !== "Lost") return false;
        if (activeTab === "found" && i.type !== "Found") return false;
        if (activeTab === "my-posts" && i.posterId !== currentUser?.id) return false;
        return true;
      })
      .filter((i) => {
        if (status === "Active" && i.status !== "Open") return false;
        if (status === "Resolved" && i.status !== "Resolved") return false;
        return true;
      })
      .filter((i) => {
        if (category !== "All" && i.category !== category) return false;
        return true;
      })
      .filter((i) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return (
          (i.title || "").toLowerCase().includes(q) ||
          (i.description || "").toLowerCase().includes(q) ||
          (i.location || "").toLowerCase().includes(q) ||
          (i.category || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  }, [items, activeTab, status, category, query, currentUser?.id]);

  return (
    <AppShell activeKey="lost-found" title="Lost & Found">
      <PageHeader
        title="Lost & Found"
        subtitle="Report lost belongings or help reunite found items with classmates."
        action={<Button icon={Plus} onClick={() => navigate("/lost-found/new")}>Post an Item</Button>}
      />

      {/* 1. Main Navigation Tabs (Compact inline segmented control) */}
      <div className="mb-2.5 flex items-center overflow-x-auto pb-0.5">
        <div className="inline-flex items-center rounded-lg border border-brd bg-surface-2 p-0.5 text-xs">
          {TABS.map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                  active
                    ? "bg-brand text-white shadow-xs"
                    : "text-ink-2 hover:text-ink hover:bg-surface/50"
                }`}
              >
                <span>{t.label}</span>
                {counts[t.id] != null && (
                  <span
                    className={`rounded px-1 text-[10px] font-bold ${
                      active ? "bg-white/20 text-white" : "bg-surface-3 text-ink-3"
                    }`}
                  >
                    {counts[t.id]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Compact, Single-Row Toolbar (Search + Category + Status + Reset + Count) */}
      <div className="mb-3.5 flex flex-wrap items-center gap-2">
        {/* Search Field (Compact h-8) */}
        <div className="relative flex-1 min-w-[170px] max-w-xs sm:max-w-sm">
          <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search items"
            placeholder="Search items, locations..."
            className="h-8 w-full rounded-md border border-brd bg-surface pl-7 pr-6 text-xs text-ink placeholder:text-ink-3 shadow-2xs transition-colors focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Category Dropdown (Compact h-8) */}
        <div className="relative">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-8 appearance-none rounded-md border border-brd bg-surface pl-2.5 pr-6 text-xs text-ink cursor-pointer shadow-2xs focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          >
            <option value="All">All Categories</option>
            {ITEM_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ink-3" />
        </div>

        {/* Status Dropdown (Compact h-8) */}
        <div className="relative">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-8 appearance-none rounded-md border border-brd bg-surface pl-2.5 pr-6 text-xs text-ink cursor-pointer shadow-2xs focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          >
            <option value="Active">Active only</option>
            <option value="Resolved">Resolved only</option>
            <option value="All">All Status</option>
          </select>
          <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ink-3" />
        </div>

        {/* Reset button */}
        {isFiltered && (
          <button
            type="button"
            onClick={clearFilters}
            title="Reset filters"
            className="inline-flex h-8 items-center gap-1 rounded-md border border-brd bg-surface px-2 text-xs font-semibold text-ink-3 hover:bg-surface-2 hover:text-ink transition-colors shadow-2xs"
          >
            <RotateCcw size={12} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}

        {/* Live item count aligned right */}
        <div className="ml-auto text-xs text-ink-3 whitespace-nowrap">
          <span>
            <strong className="font-semibold text-ink">{filtered.length}</strong> {filtered.length === 1 ? "item" : "items"}
          </span>
        </div>
      </div>

      {/* 3. Grid & States */}
      {dataLoading ? (
        <Loading />
      ) : items.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="Nothing here yet"
          message="Be the first to post a lost or found item - use “Post an Item” above."
          action={<Button icon={Plus} onClick={() => navigate("/lost-found/new")}>Post an Item</Button>}
        />
      ) : filtered.length === 0 ? (
        activeTab === "my-posts" && counts["my-posts"] === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="You haven't posted any items yet"
            message="When you report something lost or found, your posts will show up here."
            action={<Button icon={Plus} onClick={() => navigate("/lost-found/new")}>Post an Item</Button>}
          />
        ) : (
          <EmptyState
            icon={SearchX}
            title="No matching items found"
            message="Try searching for something else or clearing your filters."
            action={<Button variant="secondary" onClick={clearFilters}>Reset Filters</Button>}
          />
        )
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((i) => (
            <ItemCard key={i.id} item={i} onOpen={() => navigate(`/lost-found/${i.id}`)} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
