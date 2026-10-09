import React, { useState, useEffect, useMemo } from "react";
import { PackageSearch, ArrowRight, CircleDot, Loader, CircleCheck, FileText, CirclePlus, Search, X, CalendarDays, Megaphone, Clock, Sparkles, ChevronRight, BookMarked, Calculator, Bus, Moon, Newspaper, Users, Briefcase, Heart, Car, ShoppingBag, Wrench } from "lucide-react";
import { useApp } from "../../data/store.jsx";
import { navigate, Link } from "../../lib/router.jsx";
import { Button, Card, EmptyState, StatCard, Loading } from "../../components/ui.jsx";
import { AppShell } from "../../components/AppShell.jsx";
import { usePrayerSchedule, prayerState } from "../prayer/Prayer.jsx";
import { nextDeparture, minutesToHHMM, fmtTime, fmtCountdown, toMinutes, useTick } from "../../components/featureKit.jsx";
import { fmtDate } from "../../lib/helpers.js";

const DASHBOARD_SEARCH_ITEMS = [
  { label: "Study Hub", sub: "Lecture notes, question banks & textbooks", path: "/study-hub", icon: BookMarked },
  { label: "Report Campus Issue", sub: "Flag broken lights, Wi-Fi, maintenance", path: "/reports/new", icon: FileText },
  { label: "Lost & Found", sub: "Post lost items or claim found items", path: "/lost-found", icon: PackageSearch },
  { label: "Cover Page Generator", sub: "Assignment, lab & report covers", path: "/cover-page", icon: FileText },
  { label: "CGPA Calculator", sub: "Calculate semester & cumulative CGPA", path: "/cgpa", icon: Calculator },
  { label: "Class & Exam Routines", sub: "View daily routine & exam schedules", path: "/routines", icon: Clock },
  { label: "Campus Events", sub: "Seminars, workshops & club activities", path: "/events", icon: CalendarDays },
  { label: "Announcements & Notices", sub: "Official university circulars", path: "/announcements", icon: Megaphone },
  { label: "Fixi", sub: "Your BUBT campus companion", path: "/chatbot", icon: Sparkles },
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
    title: "10th Convocation Ceremony - Registration Open",
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

// 4 frequently used campus features (square shaped, horizontal line)
const FREQUENT_FEATURES = [
  {
    id: "study-hub",
    title: "Study Hub",
    path: "/study-hub",
    icon: BookMarked,
    color: "bg-surface-2 text-ink border-brd",
  },
  {
    id: "routines",
    title: "Routines",
    path: "/routines",
    icon: Clock,
    color: "bg-surface-2 text-ink border-brd",
  },
  {
    id: "cover-page",
    title: "Cover Page",
    path: "/cover-page",
    icon: FileText,
    color: "bg-surface-2 text-ink border-brd",
  },
  {
    id: "cgpa",
    title: "CGPA Calc",
    path: "/cgpa",
    icon: Calculator,
    color: "bg-surface-2 text-ink border-brd",
  },
];

const DEFAULT_COMMUNITY_NEWS = [
  {
    id: "news-1",
    category: "Event",
    source: "Campus Auditorium",
    title: "Innovate & Code: BUBT Inter-University Hackathon 2026",
    body: "Annual 36-hour hackathon with students across national universities competing in AI, Web, and Mobile tracks.",
    date: "Upcoming",
    image: "/events/hackathon-2026.jpg",
    icon: CalendarDays,
    badgeColor: "bg-surface-2 text-ink-2 border-brd",
    path: "/events",
  },
  {
    id: "news-2",
    category: "Notice",
    source: "Controller of Examinations",
    title: "Tri-Semester Final Examination Routine Published",
    body: "Official schedule for undergraduate and graduate programs. Check section timing and room allocation.",
    date: "Official",
    image: "/announcements/exam-routine.jpg",
    icon: Megaphone,
    badgeColor: "bg-surface-2 text-ink-2 border-brd",
    path: "/routines",
  },
  {
    id: "news-3",
    category: "Notice",
    source: "Office of the Registrar",
    title: "10th Convocation Ceremony - Registration Open",
    body: "Graduating students are requested to complete online registration and cap & gown sizing before the deadline.",
    date: "Notice",
    image: "/announcements/convocation-2026.jpg",
    icon: Megaphone,
    badgeColor: "bg-surface-2 text-ink-2 border-brd",
    path: "/announcements",
  },
  {
    id: "news-4",
    category: "Club Update",
    source: "BUBT IT Club",
    title: "Spring Executive Panel & Workshop Series Announced",
    body: "Join hands-on sessions in Cloud Architecture, Competitive Programming, and UI/UX Design this semester.",
    date: "Club Feed",
    image: null,
    icon: Users,
    badgeColor: "bg-surface-2 text-ink-2 border-brd",
    path: "/clubs",
  },
];

export default function StudentDashboard() {
  const {
    currentUser,
    reports = [],
    dataLoading,
    announcements = [],
    events = [],
    busRoutes = [],
    savedBusRoutes = [],
    clubs = [],
    clubPosts = [],
    bloodRequests = [],
  } = useApp();
  if (!currentUser) return null;
  const mine = reports.filter((r) => r.studentId === currentUser.id);
  const count = (s) => mine.filter((r) => r.status === s).length;

  // News system category filter state
  const [newsFilter, setNewsFilter] = useState("All");

  // Community News list: aggregate announcements, club posts, events, and urgent blood requests
  const communityNews = useMemo(() => {
    const list = [];

    (announcements || []).forEach((a) => {
      list.push({
        id: `ann-${a.id}`,
        category: "Notice",
        source: a.department || "Administration",
        title: a.title,
        body: a.body || "",
        date: a.date ? fmtDate(a.date) : "Recent",
        rawDate: a.date || "",
        image: a.image || a.imageUrl || null,
        icon: Megaphone,
        badgeColor: "bg-surface-2 text-ink-2 border-brd",
        path: `/announcements/${a.id}`,
      });
    });

    (clubPosts || []).forEach((p) => {
      const club = (clubs || []).find((c) => c.id === p.clubId);
      list.push({
        id: `club-post-${p.id}`,
        category: "Club Update",
        source: club ? club.name : "Campus Club",
        title: p.title || `${club?.name || "Club"} Update`,
        body: p.body || "",
        date: p.createdAt ? fmtDate(p.createdAt.split("T")[0]) : "Recent",
        rawDate: p.createdAt ? p.createdAt.split("T")[0] : "",
        image: p.imageUrl || null,
        icon: Users,
        badgeColor: "bg-surface-2 text-ink-2 border-brd",
        path: p.clubId ? `/clubs/${p.clubId}` : "/clubs",
      });
    });

    (events || []).forEach((e) => {
      list.push({
        id: `event-${e.id}`,
        category: "Event",
        source: e.venue || "BUBT Campus",
        title: e.title,
        body: e.description || `${e.venue} ${e.time ? `· ${e.time}` : ""}`,
        date: e.date ? fmtDate(e.date) : "Upcoming",
        rawDate: e.date || "",
        image: e.banner || e.bannerUrl || null,
        icon: CalendarDays,
        badgeColor: "bg-surface-2 text-ink-2 border-brd",
        path: e.id ? `/events/${e.id}` : "/events",
      });
    });

    (bloodRequests || []).filter((b) => b.urgency === "Immediate" || b.status === "open").slice(0, 2).forEach((b) => {
      list.push({
        id: `blood-${b.id}`,
        category: "Urgent",
        source: `${b.hospital} (${b.area || "Dhaka"})`,
        title: `Urgent ${b.bloodGroup} Blood Required`,
        body: `Needed at ${b.hospital}. Can you donate or help connect a donor?`,
        date: b.dateNeeded ? fmtDate(b.dateNeeded) : "Urgent",
        rawDate: b.dateNeeded || "",
        image: null,
        icon: Heart,
        badgeColor: "bg-surface-2 text-ink-2 border-brd",
        path: "/blood",
      });
    });

    list.sort((a, b) => (b.rawDate || "").localeCompare(a.rawDate || ""));
    return list.length > 0 ? list : DEFAULT_COMMUNITY_NEWS;
  }, [announcements, clubPosts, clubs, events, bloodRequests]);

  const filteredNews = useMemo(() => {
    if (newsFilter === "All") return communityNews;
    if (newsFilter === "Notices") return communityNews.filter((n) => n.category === "Notice");
    if (newsFilter === "Clubs") return communityNews.filter((n) => n.category === "Club Update");
    if (newsFilter === "Events") return communityNews.filter((n) => n.category === "Event");
    return communityNews;
  }, [communityNews, newsFilter]);

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
      <div className="relative z-10 mb-2.5 pt-1">
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
          <div className="absolute inset-x-0 top-10 z-20 overflow-hidden rounded border border-brd bg-surface shadow-xl">
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
        className="relative mb-2.5 sm:mb-3 cursor-pointer select-none touch-pan-y"
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

          {/* Card Content overlaid on full card: title & short description only */}
          <div className="relative z-10 flex min-h-[130px] flex-col justify-end">
            <div>
              <h3 className="text-base sm:text-lg md:text-xl font-extrabold leading-snug tracking-tight text-white line-clamp-2">
                {activeCard.title}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-white/90 line-clamp-2">
                {activeCard.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Pagination Indicators (Sleek thin lines) */}
        <div className="mt-1.5 flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
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

      {/* Frequently Used Options - 4 square shape buttons in same horizontal line */}
      <div className="mt-3 sm:mt-3.5">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-ink-3" />
            <h3 className="text-xs font-bold uppercase tracking-[0.06em] text-ink-3">
              Frequently used
            </h3>
          </div>
        </div>

        {/* 4 Square-shaped buttons in 1 horizontal line */}
        <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
          {FREQUENT_FEATURES.map((feat) => {
            const FeatIcon = feat.icon;
            return (
              <button
                key={feat.id}
                type="button"
                onClick={() => navigate(feat.path)}
                className="group flex aspect-square flex-col items-center justify-center rounded-xl border border-brd bg-surface p-2 text-center shadow-2xs transition-all duration-200 hover:border-ink-3 hover:shadow-xs active:scale-95"
              >
                <span className={`flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl border ${feat.color} transition-transform duration-200 group-hover:scale-105`}>
                  <FeatIcon size={18} className="sm:size-[22px] text-ink" />
                </span>
                <span className="mt-1.5 sm:mt-2 text-[11px] sm:text-xs font-bold text-ink truncate w-full transition-colors">
                  {feat.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Community Updates - News System */}
      <div className="mt-3.5 sm:mt-4">
        <div className="mb-2.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1.5">
            <Newspaper size={15} className="text-ink-3" />
            <h3 className="text-xs font-bold uppercase tracking-[0.06em] text-ink-3">
              Community updates
            </h3>
          </div>
          {/* News Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 sm:pb-0">
            {["All", "Notices", "Clubs", "Events"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setNewsFilter(tab)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${
                  newsFilter === tab
                    ? "bg-ink text-surface shadow-xs dark:bg-neutral-100 dark:text-neutral-900"
                    : "border border-brd bg-surface text-ink-3 hover:text-ink hover:bg-surface-2"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* News Feed List */}
        {filteredNews.length === 0 ? (
          <div className="rounded-xl border border-brd bg-surface p-4 text-center text-xs text-ink-3">
            No community updates found for this category.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNews.slice(0, 4).map((item) => {
              const ItemIcon = item.icon || Megaphone;
              return (
                <div
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className="group relative flex items-start gap-3 rounded-xl border border-brd bg-surface p-3 sm:p-3.5 transition-all duration-200 hover:border-ink-3 hover:shadow-xs cursor-pointer"
                >
                  {/* Thumbnail / Category Icon */}
                  {item.image ? (
                    <div className="h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-lg border border-brd bg-surface-2">
                      <img
                        src={item.image}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className={`flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 flex-col items-center justify-center rounded-lg border ${item.badgeColor} p-1 text-center`}>
                      <ItemIcon size={18} className="mb-1 text-ink-3" />
                      <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider line-clamp-1">{item.category}</span>
                    </div>
                  )}

                  {/* News Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.2 text-[10px] font-semibold border ${item.badgeColor}`}>
                        {item.category}
                      </span>
                      <span className="text-[11px] text-ink-3 font-medium">·</span>
                      <span className="text-[11px] text-ink-3 font-medium truncate max-w-[130px] sm:max-w-[200px]">
                        {item.source}
                      </span>
                      {item.date && (
                        <>
                          <span className="text-[11px] text-ink-3 font-medium">·</span>
                          <span className="text-[11px] text-ink-3 font-medium">{item.date}</span>
                        </>
                      )}
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-ink leading-snug line-clamp-1 transition-colors">
                      {item.title}
                    </h4>

                    <p className="mt-0.5 text-[11px] sm:text-xs text-ink-2 line-clamp-2 leading-relaxed">
                      {item.body}
                    </p>
                  </div>

                  {/* Right Arrow */}
                  <div className="hidden sm:flex h-full items-center self-center pl-1 text-ink-3 group-hover:text-ink">
                    <ChevronRight size={15} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
