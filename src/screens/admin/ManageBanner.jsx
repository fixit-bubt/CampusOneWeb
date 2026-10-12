import React, { useState, useMemo } from "react";
import {
  Megaphone,
  Image as ImageIcon,
  Plus,
  Trash2,
  Eye,
  ArrowUp,
  ArrowDown,
  Check,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Search,
  ExternalLink,
  Layers,
  HelpCircle,
  Info,
} from "lucide-react";
import { useApp } from "../../data/store.jsx";
import { navigate, Link } from "../../lib/router.jsx";
import {
  Card,
  Button,
  Badge,
  EmptyState,
  Loading,
  useToast,
} from "../../components/ui.jsx";
import { AppShell, PageHeader } from "../../components/AppShell.jsx";

export default function ManageBanner() {
  const {
    announcements = [],
    currentUser,
    updateAnnouncementBannerStatus,
    saveBannerOrder,
    dataLoading,
  } = useApp();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [activePreviewIdx, setActivePreviewIdx] = useState(0);
  const [showIneligible, setShowIneligible] = useState(false);
  const [busyId, setBusyId] = useState(null);

  // All announcements with a valid photo
  const eligibleAnnouncements = useMemo(() => {
    return announcements.filter((a) => {
      const img =
        a.image ||
        a.imageUrl ||
        a.image_url ||
        (a.attachmentUrl &&
        /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(a.attachmentUrl)
          ? a.attachmentUrl
          : null);
      return Boolean(img);
    });
  }, [announcements]);

  // Ineligible announcements (text-only, no photo)
  const ineligibleAnnouncements = useMemo(() => {
    return announcements.filter((a) => {
      const img =
        a.image ||
        a.imageUrl ||
        a.image_url ||
        (a.attachmentUrl &&
        /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(a.attachmentUrl)
          ? a.attachmentUrl
          : null);
      return !img;
    });
  }, [announcements]);

  // Read saved banner order from local storage
  const savedOrder = useMemo(() => {
    try {
      const raw = localStorage.getItem("campusone.banner_order");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, [announcements]);

  // Active banner items (strictly max 6)
  const activeBannerItems = useMemo(() => {
    const list = [];
    // 1. First add based on saved order
    savedOrder.forEach((code) => {
      const match = eligibleAnnouncements.find((a) => a.id === code);
      if (match && !list.some((item) => item.id === match.id)) {
        list.push(match);
      }
    });

    // 2. Then add items with inBanner true that were not in savedOrder
    eligibleAnnouncements.forEach((a) => {
      if ((a.inBanner || a.pinned) && !list.some((item) => item.id === a.id)) {
        list.push(a);
      }
    });

    // 3. If still empty, seed with first available eligible announcements up to 6
    if (list.length === 0) {
      return eligibleAnnouncements.slice(0, 6);
    }

    return list.slice(0, 6);
  }, [eligibleAnnouncements, savedOrder]);

  const activeIdsSet = useMemo(
    () => new Set(activeBannerItems.map((a) => a.id)),
    [activeBannerItems]
  );

  // Filter available announcements (not yet active in banner)
  const availableAnnouncements = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return eligibleAnnouncements.filter((a) => {
      if (activeIdsSet.has(a.id)) return false;
      if (!q) return true;
      return (
        (a.title || "").toLowerCase().includes(q) ||
        (a.department || "").toLowerCase().includes(q) ||
        (a.id || "").toLowerCase().includes(q)
      );
    });
  }, [eligibleAnnouncements, activeIdsSet, searchQuery]);

  // Handler: Remove from banner
  const handleRemoveFromBanner = async (item) => {
    setBusyId(item.id);
    try {
      if (updateAnnouncementBannerStatus) {
        const res = await updateAnnouncementBannerStatus(item.id, false);
        if (!res.ok) {
          toast({ type: "error", title: "Failed to remove", message: res.error });
          return;
        }
      } else {
        // Fallback local update
        const nextOrder = activeBannerItems
          .filter((a) => a.id !== item.id)
          .map((a) => a.id);
        localStorage.setItem("campusone.banner_order", JSON.stringify(nextOrder));
      }

      toast({
        type: "success",
        title: "Removed from banner",
        message: `"${item.title.slice(0, 32)}..." removed from dashboard banner.`,
      });
      if (activePreviewIdx >= activeBannerItems.length - 1) {
        setActivePreviewIdx(Math.max(0, activeBannerItems.length - 2));
      }
    } finally {
      setBusyId(null);
    }
  };

  // Handler: Add to banner
  const handleAddToBanner = async (item) => {
    if (activeBannerItems.length >= 6) {
      toast({
        type: "warn",
        title: "Banner is full (6/6)",
        message: "The banner carousel holds a maximum of 6 slides. Please remove one first.",
      });
      return;
    }

    setBusyId(item.id);
    try {
      if (updateAnnouncementBannerStatus) {
        const res = await updateAnnouncementBannerStatus(item.id, true);
        if (!res.ok) {
          toast({ type: "error", title: "Failed to add", message: res.error });
          return;
        }
      } else {
        const nextOrder = [...activeBannerItems.map((a) => a.id), item.id].slice(0, 6);
        localStorage.setItem("campusone.banner_order", JSON.stringify(nextOrder));
      }

      toast({
        type: "success",
        title: "Added to banner",
        message: `"${item.title.slice(0, 32)}..." will now appear on student dashboards.`,
      });
    } finally {
      setBusyId(null);
    }
  };

  // Handler: Move up / down
  const handleMove = async (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= activeBannerItems.length) return;

    const reordered = [...activeBannerItems];
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;

    const orderedIds = reordered.map((a) => a.id);
    if (saveBannerOrder) {
      await saveBannerOrder(orderedIds);
    } else {
      localStorage.setItem("campusone.banner_order", JSON.stringify(orderedIds));
    }

    setActivePreviewIdx(targetIdx);
    toast({
      type: "success",
      title: "Banner order updated",
      message: `Moved to slide position #${targetIdx + 1}.`,
    });
  };

  const previewItem =
    activeBannerItems[activePreviewIdx] || activeBannerItems[0] || null;

  return (
    <AppShell activeKey="banner-admin" title="Dashboard Banner">
      <div className="mx-auto max-w-5xl space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 dark:bg-indigo-400/10 dark:text-indigo-400">
                <ImageIcon size={18} />
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-ink">
                Dashboard Banner Slides
              </h1>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-ink-3">
              Curate the rotating announcement slides shown at the top of the Student Dashboard. Exactly 6 announcements are featured.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/announcements/new"
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-brand px-3 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-brand-700 transition-colors"
            >
              <Plus size={15} />
              <span>Post Announcement</span>
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-brd bg-surface px-3 text-xs sm:text-sm font-semibold text-ink-2 hover:bg-surface-2 transition-colors"
            >
              <Eye size={14} />
              <span>Preview Live</span>
            </Link>
          </div>
        </div>

        {/* 1. Live Interactive Banner Preview */}
        <Card className="overflow-hidden border border-brd bg-surface shadow-xs">
          <div className="border-b border-brd bg-surface-2 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-brand" />
              <h2 className="text-xs sm:text-sm font-bold text-ink">
                Live Banner Preview
              </h2>
              <span className="text-[11px] text-ink-3">
                (How students see it on their dashboard)
              </span>
            </div>
            <Badge
              tone={activeBannerItems.length === 6 ? "emerald" : "amber"}
              className="font-bold text-xs"
            >
              {activeBannerItems.length} / 6 Slides Active
            </Badge>
          </div>

          <div className="p-4 sm:p-5">
            {previewItem ? (
              <div className="relative overflow-hidden rounded-2xl border border-brd bg-black shadow-md min-h-[170px] sm:min-h-[190px] text-white">
                {/* Background photo */}
                {previewItem.image && (
                  <>
                    <img
                      src={previewItem.image}
                      alt={previewItem.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/25" />
                  </>
                )}

                {/* Overlay details */}
                <div className="relative z-10 flex min-h-[170px] sm:min-h-[190px] flex-col justify-between p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-brand/85 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs backdrop-blur-xs">
                      Slide #{activePreviewIdx + 1} of {activeBannerItems.length}
                    </span>
                    <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-medium text-white/90 backdrop-blur-xs">
                      {previewItem.priority || "General"} Notice
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-xl font-extrabold leading-snug tracking-tight text-white line-clamp-2">
                      {previewItem.title}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-white/90 line-clamp-1">
                      {previewItem.department || "BUBT Announcement"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-brd p-8 text-center text-ink-3">
                <ImageIcon size={32} className="mx-auto mb-2 text-ink-3" />
                <p className="text-sm font-semibold text-ink">No announcements selected for banner</p>
                <p className="text-xs text-ink-3">Add up to 6 announcements with photos below to populate the dashboard banner.</p>
              </div>
            )}

            {/* Pagination Line Indicators (exact match with dashboard) */}
            {activeBannerItems.length > 0 && (
              <div className="mt-3 flex items-center justify-center gap-1.5">
                {activeBannerItems.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePreviewIdx(idx)}
                    aria-label={`Preview slide ${idx + 1}`}
                    className="group py-1 px-0.5 focus:outline-none cursor-pointer"
                  >
                    <span
                      className={`block h-[3px] rounded-full transition-all duration-300 ${
                        activePreviewIdx === idx
                          ? "w-6 bg-brand shadow-xs"
                          : "w-3.5 bg-slate-400 dark:bg-white/40 group-hover:bg-brand/70"
                      }`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* 2. Active Banner Announcements (with Remove & Reorder) */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-ink flex items-center gap-2">
                <span>Active in Banner</span>
                <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-semibold text-ink-2 border border-brd">
                  {activeBannerItems.length} / 6
                </span>
              </h2>
              <p className="text-xs text-ink-3">
                These {activeBannerItems.length} announcements rotate in the banner on student dashboards. Click "Remove" to take any off.
              </p>
            </div>
          </div>

          {activeBannerItems.length === 0 ? (
            <div className="rounded-xl border border-brd bg-surface p-8 text-center">
              <EmptyState
                icon={ImageIcon}
                title="No active banner slides"
                message="Select eligible announcements from the available list below to display them in the banner."
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeBannerItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`group relative overflow-hidden rounded-xl border transition-all ${
                    activePreviewIdx === index
                      ? "border-brand ring-1 ring-brand bg-brand-50/20 dark:bg-brand-500/5"
                      : "border-brd bg-surface hover:border-brd-2"
                  } p-3.5 flex flex-col justify-between`}
                >
                  <div className="flex items-start gap-3">
                    {/* Thumbnail */}
                    <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border border-brd bg-zinc-900">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-zinc-500">
                          <ImageIcon size={20} />
                        </div>
                      )}
                      <span className="absolute top-1 left-1 rounded bg-black/75 px-1 py-0.2 text-[9px] font-black text-white">
                        #{index + 1}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="rounded bg-surface-2 px-1.5 py-0.2 text-[10px] font-bold text-ink-2 border border-brd">
                          {item.id}
                        </span>
                        {item.priority && (
                          <span className={`rounded px-1.5 py-0.2 text-[10px] font-semibold ${
                            item.priority === "Urgent"
                              ? "bg-danger-bg text-danger"
                              : item.priority === "Important"
                              ? "bg-warn-bg text-warn"
                              : "bg-surface-2 text-ink-3"
                          }`}>
                            {item.priority}
                          </span>
                        )}
                        <span className="text-[10px] text-ink-3 ml-auto">
                          {item.date}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-ink line-clamp-2 leading-snug">
                        {item.title}
                      </h4>
                      <p className="mt-0.5 text-[11px] text-ink-3 truncate">
                        {item.department || "General Notice"}
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-3 pt-2.5 border-t border-brd flex items-center justify-between gap-2">
                    {/* Reorder Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMove(index, -1)}
                        disabled={index === 0}
                        title="Move slide left / up"
                        className="flex h-7 w-7 items-center justify-center rounded border border-brd bg-surface text-ink-2 hover:bg-surface-2 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(index, 1)}
                        disabled={index === activeBannerItems.length - 1}
                        title="Move slide right / down"
                        className="flex h-7 w-7 items-center justify-center rounded border border-brd bg-surface text-ink-2 hover:bg-surface-2 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <ArrowDown size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePreviewIdx(index)}
                        className={`px-2 py-1 text-[11px] font-semibold rounded border transition-colors ${
                          activePreviewIdx === index
                            ? "bg-brand text-white border-brand"
                            : "bg-surface text-ink-2 border-brd hover:bg-surface-2"
                        }`}
                      >
                        Preview
                      </button>
                    </div>

                    {/* Remove from Banner Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveFromBanner(item)}
                      disabled={busyId === item.id}
                      className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold text-danger hover:bg-danger-bg border border-danger/25 hover:border-danger/40 transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>Remove from Banner</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Available Announcements (Eligible with Photo to add to banner) */}
        <div className="pt-2">
          <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-ink">
                Available Announcements
              </h2>
              <p className="text-xs text-ink-3">
                Official notices with cover photos that can be added to the dashboard banner.
              </p>
            </div>

            {/* Search Filter */}
            <div className="relative w-full sm:w-64">
              <Search
                size={14}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-3"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notices..."
                className="h-8 w-full rounded border border-brd bg-surface pl-8 pr-3 text-xs text-ink placeholder:text-ink-3 focus:border-brand focus:outline-none"
              />
            </div>
          </div>

          {availableAnnouncements.length === 0 ? (
            <div className="rounded-xl border border-brd bg-surface p-6 text-center text-xs text-ink-3">
              {searchQuery
                ? "No matching available announcements found."
                : "All announcements with photos are currently active in the banner."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableAnnouncements.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-brd bg-surface p-3.5 flex items-center justify-between gap-3 hover:border-brd-2 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-14 w-18 shrink-0 overflow-hidden rounded-lg border border-brd bg-zinc-900">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-zinc-500">
                          <ImageIcon size={18} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-ink-3">
                          {item.id}
                        </span>
                        <span className="text-[10px] text-ink-3">
                          · {item.department || "BUBT"}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-ink line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-ink-3 truncate">
                        {item.date}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddToBanner(item)}
                    disabled={activeBannerItems.length >= 6 || busyId === item.id}
                    title={
                      activeBannerItems.length >= 6
                        ? "Banner is full (max 6 slides). Remove a slide first."
                        : "Feature on dashboard banner"
                    }
                    className={`shrink-0 inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                      activeBannerItems.length >= 6
                        ? "bg-surface-2 text-ink-3 border border-brd opacity-60 cursor-not-allowed"
                        : "bg-brand text-white hover:bg-brand-700 shadow-xs cursor-pointer"
                    }`}
                  >
                    <Plus size={13} />
                    <span>Add to Banner</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Ineligible Notices (Text-Only without Photo) */}
        {ineligibleAnnouncements.length > 0 && (
          <div className="rounded-xl border border-brd bg-surface-2/60 p-4">
            <button
              type="button"
              onClick={() => setShowIneligible(!showIneligible)}
              className="flex w-full items-center justify-between text-left text-xs font-bold text-ink-2 hover:text-ink cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Info size={14} className="text-ink-3" />
                <span>
                  {ineligibleAnnouncements.length} text-only announcements without photo (ineligible for banner carousel)
                </span>
              </div>
              <span className="text-[11px] font-semibold text-brand">
                {showIneligible ? "Hide" : "Show"}
              </span>
            </button>

            {showIneligible && (
              <div className="mt-3 space-y-2 border-t border-brd pt-3">
                <p className="text-[11px] text-ink-3">
                  The dashboard banner requires a cover photo to look visually appealing. To feature any of these notices, edit them and upload an announcement image.
                </p>
                <div className="divide-y divide-brd overflow-hidden rounded-lg border border-brd bg-surface">
                  {ineligibleAnnouncements.map((note) => (
                    <div
                      key={note.id}
                      className="flex items-center justify-between p-2.5 text-xs"
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <p className="font-semibold text-ink truncate">{note.title}</p>
                        <p className="text-[11px] text-ink-3">
                          {note.id} · {note.department} · {note.date}
                        </p>
                      </div>
                      <Link
                        to={`/announcements/${note.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-brand hover:underline shrink-0"
                      >
                        <span>View</span>
                        <ExternalLink size={11} />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
