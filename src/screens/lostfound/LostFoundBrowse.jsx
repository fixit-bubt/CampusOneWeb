import React, { useState, useMemo, useCallback } from "react";
import { Search, SearchX, PackageSearch, Plus, X, RotateCcw, ChevronDown, SlidersHorizontal, Check } from "lucide-react";
import { useApp } from "../../data/store.jsx";
import { navigate } from "../../lib/router.jsx";
import { Button, EmptyState, Loading, Modal } from "../../components/ui.jsx";
import { AppShell, PageHeader } from "../../components/AppShell.jsx";
import { ItemCard } from "../../components/ItemBits.jsx";
import { ITEM_CATEGORIES } from "../../lib/helpers.js";

const TYPE_OPTIONS = [
  { id: "all", label: "All Items" },
  { id: "lost", label: "Lost" },
  { id: "found", label: "Found" },
  { id: "my-posts", label: "My Posts" },
];

const STATUS_OPTIONS = [
  { id: "Active", label: "Active only" },
  { id: "Resolved", label: "Resolved only" },
  { id: "All", label: "All Status" },
];

export default function LostFoundBrowse() {
  const { items, dataLoading, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState("all");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("Active");

  // Modal open & draft filter states
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [draftTab, setDraftTab] = useState("all");
  const [draftCategory, setDraftCategory] = useState("All");
  const [draftStatus, setDraftStatus] = useState("Active");

  // Tab counts
  const counts = useMemo(() => {
    return {
      all: items.filter((i) => i.status === "Open").length,
      lost: items.filter((i) => i.status === "Open" && i.type === "Lost").length,
      found: items.filter((i) => i.status === "Open" && i.type === "Found").length,
      "my-posts": items.filter((i) => i.posterId === currentUser?.id).length,
    };
  }, [items, currentUser?.id]);

  // Count active non-default filters
  const appliedFilterCount = useMemo(() => {
    let count = 0;
    if (activeTab !== "all") count++;
    if (category !== "All") count++;
    if (status !== "Active") count++;
    return count;
  }, [activeTab, category, status]);

  const isFiltered = query.trim() !== "" || appliedFilterCount > 0;

  const handleOpenFilters = () => {
    setDraftTab(activeTab);
    setDraftCategory(category);
    setDraftStatus(status);
    setFilterModalOpen(true);
  };

  const handleCloseFilters = useCallback(() => {
    setFilterModalOpen(false);
  }, []);

  const handleApplyFilters = () => {
    setActiveTab(draftTab);
    setCategory(draftCategory);
    setStatus(draftStatus);
    setFilterModalOpen(false);
  };

  const handleResetDrafts = () => {
    setDraftTab("all");
    setDraftCategory("All");
    setDraftStatus("Active");
  };

  const clearFilters = () => {
    setQuery("");
    setActiveTab("all");
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

      {/* Screen Toolbar: Outside Search + Filter Button */}
      <div className="mb-3 flex items-center gap-2">
        {/* Search input outside */}
        <div className="relative flex-1">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search items"
            placeholder="Search items, locations..."
            className="h-10 w-full rounded-lg border border-brd bg-surface pl-9 pr-8 text-xs sm:text-sm text-ink placeholder:text-ink-3 shadow-2xs transition-colors focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Button */}
        <button
          type="button"
          onClick={handleOpenFilters}
          className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-xs sm:text-sm font-semibold transition-colors shadow-2xs ${
            appliedFilterCount > 0
              ? "border-brand bg-brand/10 text-brand dark:bg-brand/20"
              : "border-brd bg-surface text-ink-2 hover:bg-surface-2 hover:text-ink"
          }`}
        >
          <SlidersHorizontal size={15} />
          <span>Filters</span>
          {appliedFilterCount > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
              {appliedFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Item count & active filter status */}
      <div className="mb-3 flex items-center justify-between text-xs text-ink-3">
        <span>
          Showing <strong className="font-semibold text-ink">{filtered.length}</strong> {filtered.length === 1 ? "item" : "items"}
          {appliedFilterCount > 0 && (
            <span className="ml-1 text-ink-3">
              ({activeTab !== "all" ? `${TYPE_OPTIONS.find((t) => t.id === activeTab)?.label}` : ""}
              {category !== "All" ? ` · ${category}` : ""}
              {status !== "Active" ? ` · ${status}` : ""})
            </span>
          )}
        </span>

        {isFiltered && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1 font-semibold text-brand hover:underline"
          >
            <RotateCcw size={11} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Grid & States */}
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
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
          {filtered.map((i) => (
            <ItemCard key={i.id} item={i} onOpen={() => navigate(`/lost-found/${i.id}`)} />
          ))}
        </div>
      )}

      {/* Filter Modal */}
      <Modal
        open={filterModalOpen}
        onClose={handleCloseFilters}
        title="Filter Items"
        icon={SlidersHorizontal}
        tone="blue"
        size="md"
        footer={
          <div className="flex w-full items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handleResetDrafts}>
              Reset
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={handleCloseFilters}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleApplyFilters}>
                Apply Filters
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {/* 1. Item Type */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-2">
              Item Type
            </label>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {TYPE_OPTIONS.map((t) => {
                const isSelected = draftTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setDraftTab(t.id)}
                    className={`flex items-center justify-between rounded-lg border px-2.5 py-2 text-xs font-semibold transition-all ${
                      isSelected
                        ? "border-brand bg-brand text-white shadow-xs"
                        : "border-brd bg-surface-2 text-ink-2 hover:bg-surface-3"
                    }`}
                  >
                    <span>{t.label}</span>
                    {counts[t.id] != null && (
                      <span
                        className={`rounded px-1 text-[10px] font-bold ${
                          isSelected ? "bg-white/20 text-white" : "bg-surface-3 text-ink-3"
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

          {/* 2. Category */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-2">
              Category
            </label>
            <div className="relative">
              <select
                value={draftCategory}
                onChange={(e) => setDraftCategory(e.target.value)}
                className="h-10 w-full appearance-none rounded-lg border border-brd bg-surface px-3 pr-8 text-xs text-ink cursor-pointer shadow-2xs focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              >
                <option value="All">All Categories</option>
                {ITEM_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-3" />
            </div>
          </div>

          {/* 3. Status */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-2">
              Status
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {STATUS_OPTIONS.map((s) => {
                const isSelected = draftStatus === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setDraftStatus(s.id)}
                    className={`rounded-lg border px-2.5 py-2 text-xs font-semibold transition-all text-center ${
                      isSelected
                        ? "border-brand bg-brand text-white shadow-xs"
                        : "border-brd bg-surface-2 text-ink-2 hover:bg-surface-3"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
