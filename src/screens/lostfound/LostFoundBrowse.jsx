import React, { useState, useMemo } from "react";
import { Search, SearchX, PackageSearch, Plus, X, RotateCcw } from "lucide-react";
import { useApp } from "../../data/store.jsx";
import { navigate } from "../../lib/router.jsx";
import { Button, Select, EmptyState, Loading } from "../../components/ui.jsx";
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

      {/* 1. Main Navigation Tabs (Clean horizontal segmented control) */}
      <div className="mb-3 flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
        {TABS.map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
                active
                  ? "bg-brand text-white shadow-xs"
                  : "border border-brd bg-surface text-ink-2 hover:bg-surface-2 hover:text-ink"
              }`}
            >
              <span>{t.label}</span>
              {counts[t.id] != null && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
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

      {/* 2. Organized, Compact Toolbar (Search + Category + Status + Reset) */}
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Field */}
        <div className="relative flex-1 sm:max-w-md">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search items"
            placeholder="Search items by name, location..."
            className="h-9 w-full rounded-lg border border-brd bg-surface pl-9 pr-8 text-xs sm:text-sm text-ink placeholder:text-ink-3 shadow-2xs transition-colors focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2">
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-9 text-xs sm:text-sm sm:w-40"
          >
            <option value="All">All Categories</option>
            {ITEM_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>

          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-9 text-xs sm:text-sm sm:w-32"
          >
            <option value="Active">Active</option>
            <option value="Resolved">Resolved</option>
            <option value="All">All Status</option>
          </Select>

          {isFiltered && (
            <button
              onClick={clearFilters}
              title="Reset filters"
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-brd bg-surface px-2.5 text-xs font-semibold text-ink-3 hover:bg-surface-2 hover:text-ink transition-colors"
            >
              <RotateCcw size={13} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Results Count */}
      <div className="mb-3.5 flex items-center justify-between text-xs text-ink-3">
        <span>
          Showing <strong className="font-semibold text-ink">{filtered.length}</strong> {filtered.length === 1 ? "item" : "items"}
        </span>
      </div>

      {/* 4. Grid & States */}
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
