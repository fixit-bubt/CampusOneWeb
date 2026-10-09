import React, { useState, useEffect, useMemo } from "react";
import { PackageSearch, ArrowRight, CircleDot, Loader, CircleCheck, FileText, CirclePlus, Search, X, CalendarDays, Megaphone, Clock, Sparkles, ChevronRight, BookMarked, Calculator, Bus, Moon } from "lucide-react";
import { useApp } from "../../data/store.jsx";
import { navigate, Link } from "../../lib/router.jsx";
import { Button, Card, EmptyState, StatCard, Loading } from "../../components/ui.jsx";
import { AppShell } from "../../components/AppShell.jsx";
import { ReportListRow } from "../../components/ReportListRow.jsx";
import { CampusToday } from "../../components/CampusToday.jsx";
import { usePrayerSchedule, prayerState } from "../prayer/Prayer.jsx";
import { nextDeparture, minutesToHHMM, fmtTime, fmtCountdown, toMinutes, useTick } from "../../components/featureKit.jsx";

const DASHBOARD_SEARCH_ITEMS = [
  { label: "Study Hub", sub: "Lecture notes, question banks & textbooks", path: "/study-hub", icon: BookMarked },
  { label: "Report Campus Issue", sub: "Flag broken lights, Wi-Fi, maintenance", path: "/reports/new", icon: FileText },
  { label: "Lost & Found", sub: "Post lost items or claim found items", path: "/lost-found", icon: PackageSearch },
  { label: "Cover Page Generator", sub: "Assignment, lab & report covers", path: "/cover-page", icon: FileText },
  { label: "CGPA Calculator", sub: "Calculate semester & cumulative CGPA", path: "/cgpa", icon: Calculator },
  { label: "Class & Exam Routines", sub: "View daily routine & exam schedules", path: "/routines", icon: Clock },
  { label: "Campus Events", sub: "Seminars, workshops & club activities", path: "/events", icon: CalendarDays },
  { label: "Announcements & Notices", sub: "Official university circulars", path: "/announcements", icon: Megaphone },
  { label: "AI Campus Assistant", sub: "Ask Gemini about schedules & campus info", path: "/chatbot", icon: Sparkles },
  { label: "Marketplace", sub: "Buy and sell books, calculators, gadgets", path: "/marketplace", icon: PackageSearch },
  { label: "Ride Sharing", sub: "Share rides & commute with classmates", path: "/rides", icon: ArrowRight },
  { label: "Blood Donation", sub: "Emergency blood donor registry", path: "/blood", icon: Sparkles },
  { label: "Bus Schedule", sub: "Campus bus routes & departure times", path: "/bus", icon: Clock },
  { label: "Prayer Times", sub: "Jamaat times & campus Musallahs", path: "/prayer", icon: Clock },
];

const DEFAULT_DASHBOARD_SLIDES = [
  {
    id: "dash-slide-1",
    type: "Event",
    tag: "Upcoming Event",
    title: "Innovate & Code: BUBT Inter-University Hackathon 2026",
    subtitle: "Campus Auditorium & CSE Lab 402 · 09:30 AM",
    path: "/events",
    btnText: "View Event",
    icon: CalendarDays,
    image: "/events/hackathon-2026.jpg",
  },
  {
    id: "dash-slide-2",
    type: "Notice",
    tag: "Exam Schedule",
    title: "Tri-Semester Final Examination Routine Published",
    subtitle: "Controller of Examinations · All Depts",
    path: "/routines",
    btnText: "Check Routine",
    icon: Clock,
    image: "/announcements/exam-routine.jpg",
  },
  {
    id: "dash-slide-3",
    type: "Notice",
    tag: "Official Notice",
    title: "10th Convocation Ceremony — Registration Open",
    subtitle: "Office of the Registrar · Graduating Students",
    path: "/announcements",
    btnText: "Read Notice",
    icon: Megaphone,
    image: "/announcements/convocation-2026.jpg",
  },
  {
    id: "dash-slide-4",
    type: "Event",
    tag: "Campus Drive",
    title: "Voluntary Blood Donation Drive & Free Health Camp",
    subtitle: "Building 2 Main Lobby · Rover Scout Group",
    path: "/blood",
    btnText: "Participate",
    icon: Sparkles,
    image: "/events/blood-drive.jpg",
  },
];

export default function StudentDashboard() {
  const { currentUser, reports, dataLoading, announcements = [], events = [], busRoutes = [], savedBusRoutes = [] } = useApp();
  if (!currentUser) return null;
  const mine = reports.filter((r) => r.studentId === currentUser.id);
  const count = (s) => mine.filter((r) => r.status === s).length;
  const recent = [...mine].sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? "")).slice(0, 5);

  // Auto-refresh countdowns every 15 seconds
  useTick(15000);

  // Live Next Bus to campus + countdown progress (out of 120min cycle)
  const busPool = savedBusRoutes?.length ? busRoutes.filter((r) => savedBusRoutes.includes(r.id)) : busRoutes;
  const nextBus = busPool
    .map((r) => { const n = nextDeparture(r.toDepartures); return n ? { route: r, ...n } : null; })
    .filter(Boolean)
    .sort((a, b) => a.wait - b.wait)[0];
  const busProgress = nextBus
    ? Math.max(8, Math.min(100, Math.round(((120 - Math.min(nextBus.wait, 120)) / 120) * 100)))
    : 0;

  // Live Next Prayer time + countdown progress (between prayer spans)
  const { displayList = [] } = usePrayerSchedule();
  const prayerSt = displayList.length ? prayerState(displayList) : null;
  const nextPrayer = prayerSt?.next || null;
  const prayerProgress = useMemo(() => {
    if (!prayerSt || !displayList.length || prayerSt.currentIdx < 0 || !nextPrayer) return 25;
    try {
      const curAzan = toMinutes(displayList[prayerSt.currentIdx].azan);
      const nextAzan = toMinutes(nextPrayer.azan);
      const span = nextAzan > curAzan ? nextAzan - curAzan : (24 * 60 - curAzan + nextAzan);
      if (span <= 0) return 50;
      const elapsed = span - (prayerSt.wait || 0);
      return Math.max(8, Math.min(100, Math.round((elapsed / span) * 100)));
    } catch {
      return 50;
    }
  }, [prayerSt, displayList, nextPrayer]);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  // Combined slides for events & announcements — strictly require a real photo
  const combinedSlides = useMemo(() => {
    const list = [];
    if (events && events.length > 0) {
      events.forEach((e, i) => {
        const realBanner = e.banner || e.bannerUrl || e.banner_url || null;
        if (!realBanner) return; // rule: cannot be shown in banner without a photo
        list.push({
          id: `ev-${e.id || i}`,
          type: "Event",
          tag: e.category ? `${e.category} Event` : "Campus Event",
          title: e.title,
          subtitle: `${e.venue || "Campus"} ${e.time ? `· ${e.time}` : ""}`,
          path: e.id ? `/events/${e.id}` : "/events",
          btnText: "View Event",
          icon: CalendarDays,
          image: realBanner,
        });
      });
    }
    if (announcements && announcements.length > 0) {
      announcements.forEach((a, i) => {
        const realImage = a.image || a.imageUrl || a.image_url || (a.attachmentUrl && /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(a.attachmentUrl) ? a.attachmentUrl : null) || null;
        if (!realImage) return; // rule: an announcement cannot be shown in banner if it doesn't have a photo
        list.push({
          id: `ann-${a.id || i}`,
          type: "Notice",
          tag: a.priority ? `${a.priority} Notice` : "Notice",
          title: a.title,
          subtitle: a.department ? `${a.department} Department` : "BUBT Announcement",
          path: a.id ? `/announcements/${a.id}` : "/announcements",
          btnText: "Read Notice",
          icon: Megaphone,
          image: realImage,
        });
      });
    }
    return list.length > 0 ? list : DEFAULT_DASHBOARD_SLIDES;
  }, [events, announcements]);

  // Carousel auto rotation state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);

  useEffect(() => {
    if (combinedSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % combinedSlides.length);
    }, 4200);
    return () => clearInterval(interval);
  }, [combinedSlides.length]);

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };
  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 40) {
      setCurrentSlide((prev) => (prev + 1) % combinedSlides.length);
    } else if (diff < -40) {
      setCurrentSlide((prev) => (prev - 1 + combinedSlides.length) % combinedSlides.length);
    }
    setTouchStartX(null);
  };

  // Search filtered results
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return DASHBOARD_SEARCH_ITEMS.filter(
      (item) => item.label.toLowerCase().includes(q) || item.sub.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const activeCard = combinedSlides[currentSlide] || combinedSlides[0];
  const ActiveIcon = activeCard.icon || Sparkles;

  return (
    <AppShell activeKey="dashboard" title="Dashboard">
      {/* 1. Search Field (placed before the announcement cards, sleek rectangular shape) */}
      <div className="relative z-30 mb-4 pt-1">
        <div className="relative flex items-center">
          <Search size={14} className="pointer-events-none absolute left-2.5 text-ink-3" />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setSearchOpen(true)}
            onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
            placeholder="Search campus features, notices, events, routines..."
            className="h-8 w-full rounded border border-brd bg-surface pl-8 pr-7 text-xs text-ink placeholder:text-ink-3 shadow-xs transition-all focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(""); setSearchOpen(false); }}
              aria-label="Clear search"
              className="absolute right-2 text-ink-3 hover:text-ink"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Live Search Suggestions Dropdown */}
        {searchOpen && searchQuery && (
          <div className="absolute inset-x-0 top-10 z-50 overflow-hidden rounded border border-brd bg-surface shadow-xl">
            {searchResults.length === 0 ? (
              <div className="p-3 text-center text-xs text-ink-3">No matching campus features found.</div>
            ) : (
              <div className="divide-y divide-brd max-h-72 overflow-y-auto">
                {searchResults.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => { navigate(item.path); setSearchOpen(false); }}
                      className="flex w-full items-center gap-3 p-2.5 text-left transition-colors hover:bg-surface-2"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-brand-50 text-brand">
                        <ItemIcon size={14} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-ink">{item.label}</p>
                        <p className="truncate text-[11px] text-ink-3">{item.sub}</p>
                      </div>
                      <ChevronRight size={13} className="text-ink-3" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Auto Changing Cards for Announcements and Events (smooth rounded banner) */}
      <div
        className="relative mb-6 cursor-pointer select-none touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => navigate(activeCard.path)}
      >
        <div className="relative min-h-[160px] overflow-hidden rounded-2xl border border-brd bg-black p-4 sm:p-5 text-white shadow-md transition-all duration-500 hover:opacity-95">
          {/* Full background photo */}
          {activeCard.image && (
            <>
              <img
                src={activeCard.image}
                alt={activeCard.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/25" />
            </>
          )}

          {/* Card Content overlaid on full card */}
          <div className="relative z-10 flex min-h-[130px] flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/40 border border-white/20 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold tracking-wide text-white backdrop-blur-md">
                  <ActiveIcon size={12} />
                  {activeCard.tag}
                </span>
                <span className="text-[10px] font-bold tracking-wider text-white/80 uppercase">
                  {activeCard.type}
                </span>
              </div>

              <h3 className="mt-2 text-base sm:text-lg md:text-xl font-extrabold leading-snug tracking-tight text-white line-clamp-2">
                {activeCard.title}
              </h3>
              <p className="mt-1 text-xs text-white/90 line-clamp-1">
                {activeCard.subtitle}
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-ink shadow-sm transition-transform active:scale-95">
                {activeCard.btnText}
                <ArrowRight size={12} />
              </span>
              <span className="text-[11px] font-medium text-white/80">
                {currentSlide + 1} / {combinedSlides.length}
              </span>
            </div>
          </div>
        </div>

        {/* Pagination Indicators (Sleek thin lines) */}
        <div className="mt-2.5 flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {combinedSlides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className="group py-1 px-0.5 focus:outline-none"
            >
              <span
                className={`block h-[2px] rounded-full transition-all duration-300 ${
                  currentSlide === idx
                    ? "w-6 bg-brand"
                    : "w-3 bg-ink/35 dark:bg-white/40 group-hover:bg-brand/60"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* 1. Report Summary Card — Dark Luxury Sapphire/Indigo with Blueprint Matrix Pattern */}
      <div className="relative overflow-hidden flex items-center rounded-md border border-indigo-900/60 bg-gradient-to-r from-[#0a1226] via-[#101b3b] to-[#080e20] px-3 py-2 sm:px-3.5 sm:py-2.5 shadow-xs text-white">
        {/* Subtle Engineering Blueprint / System Matrix Pattern Background */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.10]"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="reportsBlueprintPattern"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 24 0 L 0 0 0 24"
                fill="none"
                stroke="#60a5fa"
                strokeWidth="0.4"
              />
              <circle cx="0" cy="0" r="0.75" fill="#93c5fd" />
              <circle cx="12" cy="12" r="0.5" fill="#60a5fa" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#reportsBlueprintPattern)" />
        </svg>

        {/* Left: "Reports" label (fixed width for exact vertical alignment) */}
        <button
          onClick={() => navigate("/reports")}
          className="relative z-10 flex w-20 sm:w-24 shrink-0 items-center justify-between pr-2.5 sm:pr-3 border-r border-indigo-900/60 text-left transition-opacity hover:opacity-80"
        >
          <span className="text-xs sm:text-sm font-extrabold text-white tracking-tight">Reports</span>
          <ChevronRight size={13} className="text-indigo-400/80 shrink-0" />
        </button>

        {/* 3 separate parts */}
        <div className="relative z-10 grid flex-1 grid-cols-3 divide-x divide-indigo-900/60 pl-2 sm:pl-3">
          {/* 1. Open */}
          <button
            onClick={() => navigate("/reports")}
            className="flex flex-col items-center justify-center px-1 py-0.5 text-center transition-colors hover:bg-white/5 rounded"
          >
            <span className="text-sm sm:text-base font-black text-amber-300 leading-tight">
              {count("Open")}
            </span>
            <span className="text-[10px] sm:text-[11px] font-medium text-indigo-200/70">
              Open
            </span>
          </button>

          {/* 2. In Progress */}
          <button
            onClick={() => navigate("/reports")}
            className="flex flex-col items-center justify-center px-1 py-0.5 text-center transition-colors hover:bg-white/5 rounded"
          >
            <span className="text-sm sm:text-base font-black text-sky-300 leading-tight">
              {count("In Progress")}
            </span>
            <span className="text-[10px] sm:text-[11px] font-medium text-indigo-200/70">
              In Progress
            </span>
          </button>

          {/* 3. Resolved */}
          <button
            onClick={() => navigate("/reports")}
            className="flex flex-col items-center justify-center px-1 py-0.5 text-center transition-colors hover:bg-white/5 rounded"
          >
            <span className="text-sm sm:text-base font-black text-emerald-300 leading-tight">
              {count("Resolved")}
            </span>
            <span className="text-[10px] sm:text-[11px] font-medium text-indigo-200/70">
              Resolved
            </span>
          </button>
        </div>
      </div>

      {/* Compact Quick Cards: Bus Schedule & Prayer Time matching Reports card format */}
      <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* 1. Bus Schedule Card — Dark Transit Amber with Route Line Pattern */}
        <div className="relative overflow-hidden flex items-center rounded-md border border-amber-900/60 bg-gradient-to-r from-[#1c1305] via-[#261b07] to-[#160f04] px-3 py-2 sm:px-3.5 sm:py-2.5 shadow-xs text-white">
          {/* Transit Route Line Background Pattern */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.11]"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="busTransitPattern"
                width="28"
                height="28"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M0 14 L28 14"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="0.45"
                  strokeDasharray="3 3"
                />
                <circle cx="14" cy="14" r="1.5" fill="none" stroke="#fbbf24" strokeWidth="0.5" />
                <path
                  d="M14 0 L14 28"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="0.35"
                  strokeDasharray="2 3"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#busTransitPattern)" />
          </svg>

          {/* Left: "Bus" label (fixed width for exact vertical alignment) */}
          <button
            onClick={() => navigate("/bus")}
            className="relative z-10 flex w-20 sm:w-24 shrink-0 items-center justify-between pr-2.5 sm:pr-3 border-r border-amber-900/60 text-left transition-opacity hover:opacity-80"
          >
            <span className="text-xs sm:text-sm font-extrabold text-white tracking-tight">Bus</span>
            <ChevronRight size={13} className="text-amber-400/80 shrink-0" />
          </button>

          {/* 3 separate parts */}
          <div className="relative z-10 grid flex-1 grid-cols-3 divide-x divide-amber-900/60 pl-2 sm:pl-3">
            {/* 1. Route */}
            <button
              onClick={() => navigate("/bus")}
              className="flex flex-col items-center justify-center px-1 py-0.5 text-center transition-colors hover:bg-white/5 rounded min-w-0"
            >
              <span className="truncate text-xs sm:text-sm font-bold text-white leading-tight max-w-full">
                {nextBus ? nextBus.route.name.split(" ")[0] : "All"}
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium text-amber-300/70 truncate">
                Route
              </span>
            </button>

            {/* 2. Departure */}
            <button
              onClick={() => navigate("/bus")}
              className="flex flex-col items-center justify-center px-1 py-0.5 text-center transition-colors hover:bg-white/5 rounded min-w-0"
            >
              <span className="text-xs sm:text-sm font-bold text-white leading-tight">
                {nextBus ? fmtTime(minutesToHHMM(nextBus.mins)) : "--:--"}
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium text-amber-300/70 truncate">
                Departs
              </span>
            </button>

            {/* 3. Countdown & Progress */}
            <button
              onClick={() => navigate("/bus")}
              className="flex flex-col items-center justify-center px-1 py-0.5 text-center transition-colors hover:bg-white/5 rounded min-w-0"
            >
              <span className="text-xs sm:text-sm font-bold text-amber-200 leading-tight">
                {nextBus ? (nextBus.tomorrow ? "Tomorrow" : fmtCountdown(nextBus.wait)) : "No bus"}
              </span>
              <div className="mt-1 h-1 w-10 sm:w-14 overflow-hidden rounded-full bg-black/40 border border-amber-900/50">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${busProgress}%` }}
                />
              </div>
            </button>
          </div>
        </div>

        {/* 2. Prayer Time Card — Dark Luxury Islamic Midnight Green with Minimal Geometric Pattern */}
        <div className="relative overflow-hidden flex items-center rounded-md border border-emerald-900/60 bg-gradient-to-r from-[#031d16] via-[#05261d] to-[#021b13] px-3 py-2 sm:px-3.5 sm:py-2.5 shadow-xs text-white">
          {/* Minimal Islamic Geometric Pattern Background */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.11]"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="islamicMosaicPattern"
                width="28"
                height="28"
                patternUnits="userSpaceOnUse"
              >
                {/* Minimal interlaced diamond frame */}
                <path
                  d="M14 0 L28 14 L14 28 L0 14 Z"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="0.4"
                />
                {/* Subtle center 8-pointed star */}
                <polygon
                  points="14,6 16.5,11.5 22,14 16.5,16.5 14,22 11.5,16.5 6,14 11.5,11.5"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="0.45"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#islamicMosaicPattern)" />
          </svg>

          {/* Left: "Prayer" label (fixed width for exact vertical alignment) */}
          <button
            onClick={() => navigate("/prayer")}
            className="relative z-10 flex w-20 sm:w-24 shrink-0 items-center justify-between pr-2.5 sm:pr-3 border-r border-emerald-900/60 text-left transition-opacity hover:opacity-80"
          >
            <span className="text-xs sm:text-sm font-extrabold text-white tracking-tight">
              Prayer
            </span>
            <ChevronRight size={13} className="text-emerald-400/80 shrink-0" />
          </button>

          {/* 3 separate parts */}
          <div className="relative z-10 grid flex-1 grid-cols-3 divide-x divide-emerald-900/60 pl-2 sm:pl-3">
            {/* 1. Salah */}
            <button
              onClick={() => navigate("/prayer")}
              className="flex flex-col items-center justify-center px-1 py-0.5 text-center transition-colors hover:bg-white/5 rounded min-w-0"
            >
              <span className="truncate text-xs sm:text-sm font-bold text-white leading-tight max-w-full">
                {nextPrayer ? nextPrayer.en : "Prayer"}
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium text-emerald-300/70 truncate">
                Salah
              </span>
            </button>

            {/* 2. Azan Time */}
            <button
              onClick={() => navigate("/prayer")}
              className="flex flex-col items-center justify-center px-1 py-0.5 text-center transition-colors hover:bg-white/5 rounded min-w-0"
            >
              <span className="text-xs sm:text-sm font-bold text-white leading-tight">
                {nextPrayer ? fmtTime(nextPrayer.azan) : "--:--"}
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium text-emerald-300/70 truncate">
                Azan
              </span>
            </button>

            {/* 3. Countdown & Progress */}
            <button
              onClick={() => navigate("/prayer")}
              className="flex flex-col items-center justify-center px-1 py-0.5 text-center transition-colors hover:bg-white/5 rounded min-w-0"
            >
              <span className="text-xs sm:text-sm font-bold text-emerald-200 leading-tight">
                {prayerSt ? (prayerSt.tomorrow ? "Tomorrow" : fmtCountdown(prayerSt.wait)) : "Schedule"}
              </span>
              <div className="mt-1 h-1 w-10 sm:w-14 overflow-hidden rounded-full bg-black/40 border border-emerald-900/50">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                  style={{ width: `${prayerProgress}%` }}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={() => navigate("/lost-found")}
          className="group flex w-full items-center gap-3.5 sm:gap-4 rounded-lg border border-brd bg-surface p-4 sm:p-5 text-left shadow-sm transition-colors hover:border-brand hover:bg-brand-50"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-surface-3 text-ink-2">
            <PackageSearch size={22} />
          </span>
          <div className="flex-1">
            <p className="text-base font-bold text-ink">Browse Lost &amp; Found</p>
            <p className="text-xs text-ink-3">Find a lost item or post one you found.</p>
          </div>
          <ArrowRight size={18} className="text-ink-3 group-hover:text-brand" />
        </button>
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-[0.06em] text-ink-3">Recent reports</h3>
          {mine.length > 0 && (
            <Link to="/reports" className="text-base font-semibold text-brand hover:text-brand-700">View all</Link>
          )}
        </div>
        {dataLoading ? (
          <Loading />
        ) : recent.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No reports yet"
            message="When you report a campus issue, it'll show up here so you can track its progress."
            // A button rather than a pointer at some other control: "View all"
            // above is hidden while the student has no reports, so this is their
            // only way into the report flow from the dashboard — and copy that
            // names a nav row goes stale every time the sidebar is regrouped.
            action={<Button icon={CirclePlus} onClick={() => navigate("/reports/new")}>Report an Issue</Button>}
          />
        ) : (
          <Card className="divide-y divide-brd overflow-hidden">
            {recent.map((r) => (
              <ReportListRow key={r.id} report={r} onOpen={() => navigate(`/reports/${r.id}`)} />
            ))}
          </Card>
        )}
      </div>

      <CampusToday className="mt-8" />
    </AppShell>
  );
}
