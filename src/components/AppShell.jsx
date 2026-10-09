import React, { useState } from "react";
import { LogOut, Menu, X, Bell, ChevronDown, Sparkles, MoreVertical } from "lucide-react";
import { useApp } from "../data/store.jsx";
import { navigate, Link, useHashRoute } from "../lib/router.jsx";
import { Avatar, Badge } from "./ui.jsx";
import { Icon, resolveIcon } from "./Icon.jsx";
import MegaMenu from "./ui/mega-menu";
import { Logo } from "./Brand.jsx";
import { AccentTile } from "./featureKit.jsx";
import { ThemeToggle } from "./ThemeToggle.jsx";
import { LanguageToggle } from "./LanguageToggle.jsx";

// ============================================================================
// AppShell — sidebar + top bar + content area for all logged-in screens.
// Role-aware, sectioned nav. Mobile: sidebar collapses into a slide-in drawer.
// Nav items use lucide icon NAMES (resolved by <Icon name=…/>); only features
// that actually exist are listed — Campus Life / Community grow per release.
// ============================================================================

// Study Hub is students-only (staff/admins don't have a section), so it's added
// to the Student nav explicitly rather than to the shared CAMPUS_LIFE group.
const STUDY_HUB = { key: "study-hub", label: "Study Hub", icon: "BookMarked", path: "/study-hub", tone: "study", sub: "Course notes & section files" };
// Cover Page Generator is also students-only (BUBT assignment/lab/report covers).
const COVER_PAGE = { key: "cover-page", label: "Cover Page", icon: "FileBadge", path: "/cover-page", tone: "coverpage", sub: "Assignment cover maker" };
// PDF Maker (photos->PDF, merge, organize, compress) — students only, and
// entirely client-side. Its /pdf-maker/:tool subroutes highlight this row via
// activeKeyForPath's longest-prefix match.
const PDF_MAKER = { key: "pdf-maker", label: "PDF Maker", icon: "FileStack", path: "/pdf-maker", tone: "pdfmaker", sub: "Merge, organize & compress" };
// BUBT's own student portal (results/routine/attendance), embedded in-app —
// all roles, like mobile's Annex tab. A real internal route (see Annex.jsx),
// not an external link, so it needs no special-case in the nav renderer.
const ANNEX = { key: "annex", label: "Annex Portal", icon: "ExternalLink", path: "/annex", tone: "study", sub: "BUBT student portal" };

// "Academics" — coursework tools: what you need to attend and pass classes.
// Split out of Campus Life, which had grown to 11 items and stopped being a
// meaningful grouping. Study Hub + Cover Page are students-only (see above).
const ACADEMICS = [
  { key: "tools", label: "Academic Tools", icon: "Wrench", path: "/tools", tone: "study", sub: "CGPA, covers & PDF tools", match: ["/tools", "/cover-page", "/pdf-maker", "/cgpa"] },
  { key: "routines", label: "Class Routines", icon: "ClipboardList", path: "/routines", tone: "routines", sub: "Class & exam schedules" },
  { key: "calendar", label: "Academic Calendar", icon: "CalendarRange", path: "/calendar", tone: "calendar", sub: "Semesters, exams & holidays" },
  { key: "faculty", label: "Faculty Directory", icon: "GraduationCap", path: "/faculty", tone: "faculty", sub: "Teachers & professors" },
];
// CGPA calculator is students-only (RequireRole below), like Cover Page/PDF
// Maker — ACADEMICS itself is shared with Admin's nav, so it can't go there.
const CGPA = { key: "cgpa", label: "CGPA Calculator", icon: "Calculator", path: "/cgpa", tone: "study", sub: "Grade & target tracker" };
// Shared "Campus Life" group — things happening around campus, not coursework.
const CAMPUS_LIFE = [
  { key: "clubs", label: "Clubs", icon: "UsersRound", path: "/clubs", tone: "clubs", sub: "Student clubs & communities" },
  { key: "events", label: "Events", icon: "CalendarDays", path: "/events", tone: "events", sub: "Campus events & seminars" },
  { key: "announcements", label: "Announcements", icon: "Megaphone", path: "/announcements", tone: "announce", sub: "Official notices & circulars" },
  { key: "prayer", label: "Prayer Times", icon: "Moon", path: "/prayer", tone: "prayer", sub: "Azan, jamaat & musallahs" },
  { key: "jobs", label: "Jobs & Internships", icon: "Briefcase", path: "/jobs", tone: "jobs", sub: "Career & part-time roles" },
];
// Bus lives in Services with Medical — it's campus logistics, not an activity.
const BUS = { key: "bus", label: "Bus Schedule", icon: "Bus", path: "/bus", tone: "bus", sub: "Routes & departure times" };
const MEDICAL = { key: "medical", label: "Medical Center", icon: "Stethoscope", path: "/medical", tone: "medical", sub: "On-campus clinic & doctors" };
// Shared "Community" group (grows as features ship: ride share, blood…).
const COMMUNITY = [
  { key: "marketplace", label: "Marketplace", icon: "Store", path: "/marketplace", tone: "market", sub: "Buy & sell student items" },
  { key: "rideshare", label: "Ride Share", icon: "Car", path: "/rides", tone: "ride", sub: "Campus carpool & rides" },
  { key: "blood", label: "Blood Donation", icon: "Droplet", path: "/blood", tone: "blood", sub: "Donors & emergency requests" },
];

const NAV_BY_ROLE = {
  Student: [
    {
      section: null, items: [
        { key: "dashboard", label: "Dashboard", icon: "LayoutDashboard", path: "/dashboard" },
        // One row for the whole report loop: My Reports / Campus Board tabs plus
        // the "Report an Issue" button all live on this page, so /campus-issues
        // and /reports/new have no sidebar row of their own. `match` keeps the
        // row highlighted on the sibling route (see activeKeyForPath).
        { key: "reports", label: "Reports", icon: "FileText", path: "/reports", match: ["/campus-issues"] },
        { key: "messages", label: "Messages", icon: "MessagesSquare", path: "/messages" },
      ]
    },
    { section: "Academics", items: [STUDY_HUB, ...ACADEMICS, CGPA, COVER_PAGE, PDF_MAKER] },
    { section: "Campus Life", items: CAMPUS_LIFE },
    {
      section: "Services", items: [
        MEDICAL,
        BUS,
        { key: "lost-found", label: "Lost & Found", icon: "PackageSearch", path: "/lost-found", tone: "lostfound", sub: "Report & claim campus items" },
      ]
    },
    {
      section: "Community", items: [
        ...COMMUNITY,
        { key: "directory", label: "Students", icon: "Users", path: "/students", tone: "directory", sub: "Student directory & chat" },
      ]
    },
    {
      section: null, items: [
        { key: "profile", label: "My Profile", icon: "CircleUser", path: "/profile" },
        ANNEX,
      ]
    },
  ],
  Staff: [
    {
      section: null, items: [
        { key: "dashboard", label: "Dashboard", icon: "LayoutDashboard", path: "/staff" },
        { key: "assigned", label: "Assigned to Me", icon: "ClipboardCheck", path: "/staff/assigned" },
      ]
    },
    // Staff are maintenance workers, not students — the student-academic items
    // (Faculty, Clubs, Events, Academic Calendar, Class Routines, Jobs) are
    // dropped, so Staff get no Academics group at all. Only the
    // campus-worker-relevant slice of Campus Life stays.
    { section: "Campus Life", items: CAMPUS_LIFE.filter((i) => ["prayer", "announcements"].includes(i.key)) },
    { section: "Services", items: [MEDICAL, BUS] },
    // Community features are "any adult on campus" — kept in full.
    { section: "Community", items: COMMUNITY },
    {
      section: null, items: [
        { key: "profile", label: "My Profile", icon: "CircleUser", path: "/profile" },
        ANNEX,
      ]
    },
  ],
  Admin: [
    {
      section: null, items: [
        { key: "dashboard", label: "Dashboard", icon: "LayoutDashboard", path: "/admin" },
        { key: "all-reports", label: "All Reports", icon: "FileText", path: "/admin/reports" },
      ]
    },
    // The four admin-only editors were a flat block competing with Dashboard and
    // All Reports for attention. Grouped, so Admin's top level is the two things
    // they open daily and every role now fits the same shape of nav.
    {
      section: "Manage", items: [
        { key: "users", label: "Users", icon: "Users", path: "/admin/users", tone: "directory", sub: "Manage user roles & access" },
        { key: "faculty-admin", label: "Faculty Profiles", icon: "GraduationCap", path: "/admin/faculty", tone: "faculty", sub: "Teacher directory records" },
        { key: "studyhub-admin", label: "Study Hub", icon: "BookMarked", path: "/admin/study-hub", tone: "study", sub: "Departments & sections" },
        { key: "clubs-admin", label: "Clubs", icon: "UsersRound", path: "/admin/clubs", tone: "clubs", sub: "Approve & manage clubs" },
      ]
    },
    { section: "Academics", items: ACADEMICS },
    { section: "Campus Life", items: CAMPUS_LIFE.filter((i) => i.key !== "clubs") },
    { section: "Services", items: [MEDICAL, BUS] },
    { section: "Community", items: COMMUNITY },
    {
      section: null, items: [
        { key: "profile", label: "My Profile", icon: "CircleUser", path: "/profile" },
        ANNEX,
      ]
    },
  ],
};

// Stable empty fallback — a fresh [] each render would retrigger the accordion
// effect, whose dep list includes `nav`.
const EMPTY_NAV = [];

export const ROLE_TONE = { Student: "blue", Staff: "amber", Admin: "emerald" };

// Set of feature nav keys visible to a role. CampusToday uses this so its cards
// only ever show features the role can actually open from the sidebar — the card
// grid can't drift from the nav (e.g. Staff has no Events/Jobs/Clubs nav item, so
// it gets no Events/Jobs/Clubs card either).
export function navKeysForRole(role) {
  return new Set((NAV_BY_ROLE[role] || []).flatMap((g) => g.items).map((i) => i.key));
}

// Remembers the sidebar's scroll offset across navigations (and even a remount),
// so clicking a nav item never snaps the list back to the top.
let navScrollStore = 0;

// Named nav groups collapse into accordions so the sidebar isn't a 23-row wall.
// Ungrouped items (section: null — Dashboard, Reports, Profile…) always show.
// The accordion is EXCLUSIVE: opening a group closes the others. That caps the
// expanded sidebar at (ungrouped + headers + largest group) instead of letting a
// user who expanded everything once keep a full-height list forever.
const NAV_OPEN_STORE = "fixit.navOpenSection";
function readOpenSection() {
  try {
    const raw = localStorage.getItem(NAV_OPEN_STORE);
    return typeof raw === "string" && raw ? raw : null;
  } catch { return null; }
}
function writeOpenSection(name) {
  try {
    if (name) localStorage.setItem(NAV_OPEN_STORE, name);
    else localStorage.removeItem(NAV_OPEN_STORE);
  } catch { /* storage blocked — in-memory only */ }
}
// Section a nav key lives in, or null when it's an always-visible item.
function sectionForKey(nav, key) {
  for (const g of nav) if (g.section && g.items.some((i) => i.key === key)) return g.section;
  return null;
}

// Open/close state for the nav accordion. Lives in AppLayout, NOT in
// SidebarContent, because SidebarContent is mounted twice (desktop aside +
// mobile drawer) — per-instance state would let the two copies disagree.
function useNavAccordion(drawerOpen) {
  const [openSection, setOpenSection] = useState(null);
  // Whenever the menu drawer opens, start with every section collapsed
  React.useEffect(() => {
    if (drawerOpen) {
      setOpenSection(null);
    }
  }, [drawerOpen]);
  const toggleSection = React.useCallback((name) => {
    setOpenSection((prev) => (prev === name ? null : name));
  }, []);
  return { openSection, toggleSection };
}

function SidebarContent({ nav, activeKey, onNavigate, onLogout, badges = {}, openSection, onToggleSection }) {
  const navRef = React.useRef(null);
  // Badge count for a collapsed group, so unread messages etc. aren't hidden.
  const groupBadge = (items) => items.reduce((n, i) => n + (badges[i.key] || 0), 0);
  // Restore after every render (route change re-renders this); a no-op when the
  // position is already correct, but reasserts it if anything reset the scroll.
  React.useLayoutEffect(() => {
    const el = navRef.current;
    if (el && el.scrollTop !== navScrollStore) el.scrollTop = navScrollStore;
  });
  // When the ACTIVE item changes (navigation / fresh load), make sure it's in
  // view — scrolls only this list, never the window. Scoped to activeKey so it
  // never fights the user's manual scrolling on unrelated re-renders.
  // openSection is a dep too: navigating into a COLLAPSED group reveals it from
  // a passive effect one commit later, so on the activeKey commit the row isn't
  // in the DOM yet and the querySelector below bails. Without this dep the
  // active row would silently never be scrolled into view on that path.
  React.useLayoutEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const act = el.querySelector('[data-active="true"]');
    if (!act) return;
    const er = el.getBoundingClientRect();
    const ar = act.getBoundingClientRect();
    if (er.height > 0 && (ar.top < er.top || ar.bottom > er.bottom)) {
      el.scrollTop += ar.top - er.top - (er.height - ar.height) / 2;
    }
  }, [activeKey, openSection]);
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center px-5">
        <Link to="/"><Logo /></Link>
      </div>
      <nav
        ref={navRef}
        onScroll={(e) => { navScrollStore = e.currentTarget.scrollTop; }}
        className="flex-1 min-h-0 space-y-4 overflow-y-auto px-3 py-2"
      >
        {nav.map((group, gi) => {
          const collapsible = Boolean(group.section);
          const open = !collapsible || openSection === group.section;
          const hidden = collapsible && !open ? groupBadge(group.items) : 0;
          return (
            <div key={group.section || `g${gi}`} className="space-y-1">
              {collapsible && (
                <button
                  onClick={() => onToggleSection(group.section)}
                  aria-expanded={open}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                    open ? "bg-surface-2/70 text-ink" : "text-ink-3 hover:bg-surface-2 hover:text-ink-2"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <ChevronDown size={14} className={`transition-transform duration-200 text-ink-3 ${open ? "" : "-rotate-90"}`} />
                    <span>{group.section}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold tracking-normal lowercase text-ink-3/80">
                      {group.items.length} features
                    </span>
                    {hidden > 0 && (
                      <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-white">
                        {hidden > 9 ? "9+" : hidden}
                      </span>
                    )}
                  </span>
                </button>
              )}
              {open && (
                collapsible ? (
                  <div className="ml-2 pl-2.5 border-l-2 border-brd/80 space-y-1 my-1">
                    {group.items.map((item) => {
                      const active = item.key === activeKey;
                      return (
                        <button
                          key={item.key}
                          data-active={active ? "true" : undefined}
                          onClick={() => onNavigate(item.path)}
                          className={`group flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-all ${
                            active
                              ? "bg-brand-50/90 dark:bg-brand-950/40 border border-brand/30 shadow-xs"
                              : "hover:bg-surface-2 text-ink-2 hover:text-ink"
                          }`}
                        >
                          <AccentTile icon={item.icon} tone={item.tone || "slate"} size={28} iconSize={14} />
                          <div className="min-w-0 flex-1">
                            <p className={`truncate text-xs font-bold leading-tight ${active ? "text-brand" : "text-ink group-hover:text-brand"}`}>
                              {item.label}
                            </p>
                            {item.sub && (
                              <p className="truncate text-[10.5px] font-normal text-ink-3 leading-tight mt-0.5">
                                {item.sub}
                              </p>
                            )}
                          </div>
                          {badges[item.key] > 0 && (
                            <span className="ml-auto inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-white">
                              {badges[item.key] > 9 ? "9+" : badges[item.key]}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  group.items.map((item) => {
                    const active = item.key === activeKey;
                    return (
                      <button
                        key={item.key}
                        data-active={active ? "true" : undefined}
                        onClick={() => onNavigate(item.path)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                          active
                            ? "bg-brand text-white shadow-xs"
                            : "text-ink-2 hover:bg-surface-2 hover:text-ink"
                        }`}
                      >
                        <Icon name={item.icon} size={18} className={active ? "text-white" : "text-ink-3"} />
                        <span className="flex-1 text-left">{item.label}</span>
                        {badges[item.key] > 0 && (
                          <span className="ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-danger px-1.5 text-[11px] font-bold leading-none text-white">
                            {badges[item.key] > 9 ? "9+" : badges[item.key]}
                          </span>
                        )}
                      </button>
                    );
                  })
                )
              )}
            </div>
          );
        })}
      </nav>
      <div className="shrink-0 space-y-2 border-t border-brd p-3">
        <div className="flex items-center justify-between px-1 py-1">
          <div className="flex items-center gap-1.5">
            <LanguageToggle />
            <ThemeToggle />
          </div>
          <button
            onClick={() => onNavigate("/notifications")}
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-ink-2 hover:bg-surface-2"
          >
            <Bell size={16} className="text-ink-3" />
            Notifs
          </button>
        </div>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-base font-semibold text-ink-2 hover:bg-surface-2 hover:text-ink"
        >
          <LogOut size={18} className="text-ink-3" />
          Log out
        </button>
      </div>
    </div>
  );
}

// Maps the current route to the nav key to highlight, by longest matching item
// path (so /clubs/123 → clubs, /reports/new → reports). An item may also list
// extra `match` paths for routes it owns that aren't under its own path — e.g.
// the Reports row owns /campus-issues, which is its Campus Board tab.
function activeKeyForPath(path, role) {
  const items = (NAV_BY_ROLE[role] || []).flatMap((g) => g.items);
  let bestKey = null, bestLen = -1;
  for (const it of items) {
    for (const base of [it.path, ...(it.match || [])]) {
      if ((path === base || path.startsWith(base + "/")) && base.length > bestLen) {
        bestKey = it.key; bestLen = base.length;
      }
    }
  }
  return bestKey;
}

// Lets the per-screen top bar open the mobile drawer, which now lives in the
// persistent AppLayout rather than in each screen's AppShell.
const LayoutContext = React.createContext({ openDrawer: () => { } });
export function useLayout() { return React.useContext(LayoutContext); }

// buildMegaMenuItems — maps the role-based navigation structure into MegaMenuItem[]
// for the animated desktop navbar dropdowns.
function buildMegaMenuItems({ nav, activeKey, onNavigate, badges = {} }) {
  const result = [];

  for (const group of nav) {
    if (!group.section) {
      // Direct items like Dashboard, Reports, Messages, Annex Portal (excluding profile)
      for (const item of group.items) {
        if (item.key === "profile") continue;
        const count = badges[item.key] || 0;
        result.push({
          id: item.key,
          label: item.label,
          isActive: item.key === activeKey,
          badge: count > 0 ? (count > 9 ? "9+" : count) : undefined,
          onClick: () => onNavigate(item.path),
        });
      }
    } else {
      // Grouped items: direct single list inside dropdown (no multiple sections)
      const hasActive = group.items.some((i) => i.key === activeKey);
      const groupTotal = group.items.reduce((sum, i) => sum + (badges[i.key] || 0), 0);

      const items = group.items.map((item) => {
        const count = badges[item.key] || 0;
        return {
          label: item.label,
          description: item.sub || "",
          icon: resolveIcon(item.icon),
          path: item.path,
          isActive: item.key === activeKey,
          badge: count > 0 ? (count > 9 ? "9+" : count) : undefined,
          onClick: () => onNavigate(item.path),
        };
      });

      result.push({
        id: group.section,
        label: group.section,
        isActive: hasActive,
        badge: groupTotal > 0 ? (groupTotal > 9 ? "9+" : groupTotal) : undefined,
        align: ["Community"].includes(group.section) ? "right" : "left",
        items,
      });
    }
  }

  return result;
}

// BottomNavBackdrop — 1-piece full-width continuous SVG canvas for the mobile
// bottom navigation bar. Spans the entire screen width with zero subpixel seams,
// zero color mismatch, and a mathematically smooth C1-continuous organic valley
// cradle under the elevated center AI orb.
function BottomNavBackdrop({ hasFab = true }) {
  const [width, setWidth] = React.useState(() => (typeof window !== "undefined" ? window.innerWidth : 390));

  React.useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const w = width;
  const h = 100;
  const r = 20; // rounded outer shoulder radius
  const cx = w / 2;
  const nw = 46; // notch half-width (92px total)
  const nd = 26; // notch depth

  // 1-piece path: left rounded shoulder -> flat top -> cradle valley -> flat top -> right rounded shoulder -> bottom
  const bgPath = hasFab
    ? `M 0,${r} A ${r} ${r} 0 0 1 ${r},0 L ${cx - nw},0 C ${cx - nw + 18},0 ${cx - 16},${nd} ${cx},${nd} C ${cx + 16},${nd} ${cx + nw - 18},0 ${cx + nw},0 L ${w - r},0 A ${r} ${r} 0 0 1 ${w},${r} L ${w},${h} L 0,${h} Z`
    : `M 0,${r} A ${r} ${r} 0 0 1 ${r},0 L ${w - r},0 A ${r} ${r} 0 0 1 ${w},${r} L ${w},${h} L 0,${h} Z`;

  // Continuous top rim highlight stroke
  const rimPath = hasFab
    ? `M 0,${r} A ${r} ${r} 0 0 1 ${r},0 L ${cx - nw},0 C ${cx - nw + 18},0 ${cx - 16},${nd} ${cx},${nd} C ${cx + 16},${nd} ${cx + nw - 18},0 ${cx + nw},0 L ${w - r},0 A ${r} ${r} 0 0 1 ${w},${r}`
    : `M 0,${r} A ${r} ${r} 0 0 1 ${r},0 L ${w - r},0 A ${r} ${r} 0 0 1 ${w},${r}`;

  return (
    <div
      className="absolute top-0 inset-x-0 pointer-events-none overflow-hidden"
      style={{ height: 100 }}
    >
      <svg
        width="100%"
        height={100}
        viewBox={`0 0 ${w} 100`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block w-full h-full"
      >
        <defs>
          <linearGradient id="navBgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f2862" />
            <stop offset="100%" stopColor="#0a1b42" />
          </linearGradient>
        </defs>

        {/* 1. Entire navbar background — 1 single continuous path, zero mismatch */}
        <path d={bgPath} fill="url(#navBgGrad)" />

        {/* 2. Clean crisp top border line (zero glow) */}
        <path
          d={rimPath}
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}

function HeaderMenuDropdown({ currentUser, unreadNotifCount = 0, onLogout, onNavigate }) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="More options"
        aria-expanded={open}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-white/85 hover:bg-white/10 hover:text-white transition-colors"
      >
        <MoreVertical size={20} />
        {unreadNotifCount > 0 && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger ring-2 ring-[#0a1b42]" />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-60 rounded-2xl border border-brd bg-surface p-2 shadow-2xl text-ink animate-in fade-in zoom-in-95 duration-150"
        >
          {/* User profile item */}
          <button
            role="menuitem"
            onClick={() => { setOpen(false); onNavigate("/profile"); }}
            className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-surface-2 transition-colors"
          >
            <Avatar name={currentUser?.name} src={currentUser?.avatar} size={36} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-ink">{currentUser?.name}</p>
              <p className="truncate text-xs text-ink-3 capitalize">{currentUser?.role}</p>
            </div>
          </button>

          <div className="my-1.5 border-t border-brd" />

          {/* Notifications */}
          <button
            role="menuitem"
            onClick={() => { setOpen(false); onNavigate("/notifications"); }}
            className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm font-semibold text-ink-2 hover:bg-surface-2 hover:text-ink transition-colors"
          >
            <span className="flex items-center gap-2.5">
              <Bell size={16} className="text-ink-3" />
              Notifications
            </span>
            {unreadNotifCount > 0 && (
              <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
              </span>
            )}
          </button>

          {/* Preferences */}
          <div className="my-1.5 border-t border-brd" />
          <div className="flex items-center justify-between px-2.5 py-1.5">
            <span className="text-xs font-semibold text-ink-3">Preferences</span>
            <div className="flex items-center gap-1">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>

          <div className="my-1.5 border-t border-brd" />

          {/* Log out */}
          <button
            role="menuitem"
            onClick={() => { setOpen(false); onLogout(); }}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-danger hover:bg-danger-bg transition-colors"
          >
            <LogOut size={16} />
            <span>Log out</span>
          </button>
        </div>
      )}
    </div>
  );
}

// AppLayout — persistent frame for all signed-in screens. Rendered ONCE around
// the routed content (see App.jsx) so the sidebar and its scroll position
// survive navigation instead of remounting per screen. Active nav is derived
// from the route, so screens don't pass activeKey to keep the sidebar in sync.
export function AppLayout({ children }) {
  const { currentUser, logout, totalUnreadMessages = 0, unreadNotifCount = 0 } = useApp();
  const path = useHashRoute();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close the mobile drawer on Escape (it's a modal dialog).
  React.useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  // Close drawer whenever the route changes.
  React.useEffect(() => {
    setDrawerOpen(false);
  }, [path]);

  // Derived before the signed-out early return — all hooks must be called
  // before any conditional return to prevent "rendered fewer hooks than expected".
  const nav = NAV_BY_ROLE[currentUser?.role] || EMPTY_NAV;
  const activeKey = activeKeyForPath(path, currentUser?.role);
  const { openSection, toggleSection } = useNavAccordion(drawerOpen);
  const go = React.useCallback((p) => {
    setDrawerOpen(false);
    navigate(p);
  }, []);
  const navBadges = React.useMemo(() => ({ messages: totalUnreadMessages }), [totalUnreadMessages]);

  const desktopMegaItems = React.useMemo(() => {
    if (!currentUser) return [];
    return buildMegaMenuItems({
      nav,
      activeKey,
      onNavigate: go,
      badges: navBadges,
    });
  }, [currentUser, nav, activeKey, go, navBadges]);

  if (!currentUser) return <>{children}</>;
  const isChatbotMain = path === "/chatbot" || (path.startsWith("/chatbot/") && path !== "/chatbot/history");

  return (
    <LayoutContext.Provider value={{ openDrawer: () => setDrawerOpen(true) }}>
      <div className={`bg-bg w-full max-w-full ${isChatbotMain ? "fixed inset-0 h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col" : "min-h-screen overflow-x-hidden"}`}>
        {/* Mobile top header — fixed to screen across all pages with 3-line menu on left, centered CampusOne + tagline, notifications on right */}
        <header className="fixed top-0 inset-x-0 z-40 flex h-11 w-full items-center justify-between border-b border-[#1d3d7d]/80 bg-gradient-to-r from-[#0a1b42] via-[#0f2862] to-[#0a1b42] px-3 text-white shadow-xs backdrop-blur-md xl:hidden">
          {/* Left: 3-line hamburger button to open the menu drawer */}
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/85 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Menu size={18} />
          </button>

          {/* Center: CampusOne name + tagline */}
          <Link to="/" className="flex flex-col items-center justify-center text-center">
            <span className="font-extrabold tracking-tight text-sm leading-none text-white">
              Campus<span className="text-emerald-400">One</span>
            </span>
            <span className="text-[6.5px] font-normal tracking-wide text-blue-200/65 leading-none mt-0.5">
              Full campus in one app
            </span>
          </Link>

          {/* Right: Notifications */}
          <button
            onClick={() => navigate("/notifications")}
            aria-label={unreadNotifCount > 0 ? `Notifications, ${unreadNotifCount} unread` : "Notifications"}
            className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/85 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Bell size={18} />
            {unreadNotifCount > 0 && (
              <span className="absolute right-0.5 top-0.5 inline-flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-danger px-1 text-[9px] font-bold leading-none text-white">
                {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
              </span>
            )}
          </button>
        </header>

        {/* Floating nav capsule — desktop only (xl and up). On mobile, navigation is at the bottom bar */}
        <div className="sticky top-0 z-30 hidden px-3 pb-2 pt-3 sm:px-6 sm:pt-4 xl:block shrink-0">
          {/* Width cap is shared with <main> below so the capsule and page content line up cleanly. */}
          <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-1.5 rounded-full border border-[#1d3d7d]/80 bg-gradient-to-r from-[#0a1b42]/95 via-[#0f2862]/95 to-[#0a1b42]/95 px-3 shadow-lg shadow-black/20 backdrop-blur-md sm:px-4 text-white">
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white xl:hidden"
            >
              <Menu size={18} />
            </button>

            <Link to="/" className="shrink-0 px-1"><Logo onDark /></Link>

            <nav className="ml-1.5 hidden min-w-0 flex-1 items-center gap-0.5 xl:flex">
              <MegaMenu items={desktopMegaItems} />
            </nav>

            <div className="ml-auto flex shrink-0 items-center gap-1">
              <LanguageToggle className="!text-white/80 hover:!bg-white/10 hover:!text-white !rounded-full !h-8 !px-2 !text-xs" />
              <ThemeToggle className="!text-white/80 hover:!bg-white/10 hover:!text-white !rounded-full !h-8 !w-8" />
              <button
                onClick={() => navigate("/notifications")}
                title="Notifications"
                aria-label={unreadNotifCount > 0 ? `Notifications, ${unreadNotifCount} unread` : "Notifications"}
                className="relative inline-flex h-8 w-8 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Bell size={17} />
                {unreadNotifCount > 0 && (
                  <span className="absolute right-0.5 top-0.5 inline-flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-danger px-1 text-[9px] font-bold leading-none text-white">
                    {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
                  </span>
                )}
              </button>
              <button onClick={() => navigate("/profile")} title="My profile" className="rounded-full ring-2 ring-white/20 hover:ring-white/40 transition-all">
                <Avatar name={currentUser.name} src={currentUser.avatar} size={28} />
              </button>
              <HeaderMenuDropdown
                currentUser={currentUser}
                unreadNotifCount={unreadNotifCount}
                onLogout={logout}
                onNavigate={go}
              />
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 xl:hidden">
            <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60" onClick={() => setDrawerOpen(false)} />
            <div role="dialog" aria-modal="true" aria-label="Menu" className="absolute inset-y-0 left-0 w-64 bg-surface shadow-xl">
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="absolute right-3 top-4 inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-3 hover:bg-surface-2"
              >
                <X size={18} />
              </button>
              <SidebarContent nav={nav} activeKey={activeKey} onNavigate={go} onLogout={logout} badges={navBadges} openSection={openSection} onToggleSection={toggleSection} />
            </div>
          </div>
        )}

        {/* Main column — full width now that the nav is overhead, not beside. */}
        <div className={`w-full max-w-full ${isChatbotMain ? "flex-1 min-h-0 flex flex-col overflow-hidden pt-11 pb-[60px] xl:pt-0 xl:pb-4" : "overflow-x-hidden pt-11 pb-16 sm:pb-20 xl:pt-0 xl:pb-0"}`}>
          {children}
        </div>

        {/* Mobile bottom navigation bar — Borderless luxury overlay */}
        {(() => {
          const studentTabs = [
            { key: "dashboard", label: "Home", icon: "Home", path: "/dashboard" },
            { key: "study-hub", label: "Study Hub", icon: "BookMarked", path: "/study-hub" },
            { key: "chatbot", label: "Fixi", icon: "Sparkles", path: "/chatbot", isCenterFab: true },
            { key: "tools", label: "Tools", icon: "Wrench", path: "/tools" },
            { key: "profile", label: "Profile", icon: "CircleUser", path: "/profile" },
          ];
          const staffTabs = [
            { key: "dashboard", label: "Home", icon: "Home", path: "/staff" },
            { key: "assigned", label: "Assigned", icon: "ClipboardCheck", path: "/staff/assigned" },
            { key: "bus", label: "Bus", icon: "Bus", path: "/bus" },
            { key: "reports", label: "Reports", icon: "FileText", path: "/reports" },
            { key: "profile", label: "Profile", icon: "CircleUser", path: "/profile" },
          ];
          const adminTabs = [
            { key: "dashboard", label: "Home", icon: "Home", path: "/admin" },
            { key: "all-reports", label: "Reports", icon: "FileText", path: "/admin/reports" },
            { key: "users", label: "Users", icon: "Users", path: "/admin/users" },
            { key: "tools", label: "Tools", icon: "Wrench", path: "/tools" },
            { key: "profile", label: "Profile", icon: "CircleUser", path: "/profile" },
          ];
          const tabs = currentUser.role === "Student" ? studentTabs
            : currentUser.role === "Staff" ? staffTabs
              : adminTabs;
          const hasFab = tabs.some((t) => t.isCenterFab);

          return (
            <nav
              aria-label="Mobile Bottom Navigation"
              className="fixed bottom-0 inset-x-0 z-40 select-none xl:hidden"
            >
              {/* 1-piece seamless SVG backdrop with smooth organic cradle */}
              <BottomNavBackdrop hasFab={hasFab} />

              {/* Navigation items bar */}
              <div
                className="relative mx-auto flex max-w-md items-center justify-between px-2"
                style={{
                  height: 60,
                  paddingBottom: "max(0.2rem, env(safe-area-inset-bottom))",
                }}
              >
                {tabs.map((tab) => {
                  const isToolsActive = tab.path === "/tools" && (
                    path === "/tools" || path.startsWith("/tools/") ||
                    path === "/cover-page" || path.startsWith("/cover-page/") ||
                    path === "/pdf-maker" || path.startsWith("/pdf-maker/") ||
                    path === "/cgpa" || path.startsWith("/cgpa/") ||
                    path === "/routines" || path.startsWith("/routines/") ||
                    path === "/calendar" || path.startsWith("/calendar/")
                  );
                  const isCur = isToolsActive ||
                    (tab.isDrawer ? drawerOpen :
                      tab.key === activeKey ||
                      (tab.path && (path === tab.path || path.startsWith(tab.path + "/"))));

                  if (tab.isCenterFab) {
                    return (
                      <div
                        key={tab.key}
                        className="relative flex items-center justify-center shrink-0"
                        style={{ width: 68, height: 60 }}
                      >
                        {/* Cosmic Glass Luxury AI Orb — clean with zero background behind */}
                        <button
                          type="button"
                          onClick={() => { go(tab.path); }}
                          aria-label="Fixi"
                          className="group absolute -top-4 left-1/2 -translate-x-1/2 flex items-center justify-center p-[2px] rounded-full bg-gradient-to-b from-indigo-400/40 via-indigo-900/30 to-slate-900/80 shadow-md shadow-black/40 transition-all duration-200 active:scale-95 hover:scale-105"
                        >
                          <span className="relative flex h-[50px] w-[50px] items-center justify-center rounded-full overflow-hidden bg-[radial-gradient(circle_at_35%_25%,#38bdf8_0%,#1e40af_35%,#0f172a_75%,#030712_100%)] border border-cyan-400/25 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.45),inset_0_-2px_6px_rgba(0,0,0,0.85)]">
                            {/* Specular glass reflection */}
                            <span className="pointer-events-none absolute top-1 left-2 h-3 w-5 rounded-full bg-gradient-to-b from-white/35 to-transparent blur-[0.5px]" />
                            <Sparkles
                              size={22}
                              className={`text-white transition-transform duration-300 group-hover:rotate-12 ${isCur ? "animate-pulse" : ""
                                }`}
                            />
                          </span>
                        </button>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => {
                        if (tab.isDrawer) { setDrawerOpen(true); }
                        else { go(tab.path); }
                      }}
                      className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[11px] transition-all active:scale-95 ${isCur
                          ? "text-blue-400 font-semibold"
                          : "text-slate-300/80 hover:text-white font-medium"
                        }`}
                    >
                      <span className="relative flex h-6 w-6 items-center justify-center">
                        <Icon
                          name={tab.icon}
                          size={20}
                          strokeWidth={isCur ? 2.2 : 1.8}
                          className={`transition-colors ${isCur ? "text-blue-400" : "text-slate-300/80"
                            }`}
                        />
                        {tab.badge > 0 && (
                          <span className="absolute -top-1 -right-2 inline-flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-danger px-1 text-[8px] font-bold text-white shadow-xs">
                            {tab.badge > 9 ? "9+" : tab.badge}
                          </span>
                        )}
                      </span>
                      <span className="truncate leading-tight tracking-tight">{tab.label}</span>
                      {/* Active blue dot indicator */}
                      <span
                        className={`mt-0.5 h-1 w-1 rounded-full transition-all ${isCur
                            ? "bg-blue-400"
                            : "bg-transparent opacity-0"
                          }`}
                      />
                    </button>
                  );
                })}
              </div>
            </nav>
          );
        })()}
      </div>
    </LayoutContext.Provider>
  );
}

// AppShell — per-screen content frame, rendered inside AppLayout. Navigation
// and account controls live in AppLayout's capsule, so this is now just the
// page's h1, the data-error banner and the content column. `activeKey` is
// accepted for backward-compat but unused (active nav is route-derived).
export function AppShell({ activeKey, title, children }) {
  const { currentUser, dataError, retryData } = useApp();
  const path = useHashRoute();
  const isChatbotMain = path === "/chatbot" || (path.startsWith("/chatbot/") && path !== "/chatbot/history");
  if (!currentUser) return null;

  return (
    <>
      {/* The nav capsule in AppLayout carries the account controls and the
            hamburger now, so this renders no bar of its own. `title` stays the
            document's h1 — visually hidden, because PageHeader already shows the
            page name in the content. Page-level buttons belong to PageHeader's
            own `action` slot; the old top-bar `actions` prop is gone. */}
      {title && <h1 className="sr-only">{title}</h1>}

      {/* A background load failed — offer a retry instead of silently showing empty lists. */}
      {dataError && (
        <div className="mx-3 mb-2 flex items-center justify-between gap-3 rounded-2xl border border-brd bg-warn-bg px-4 py-2.5 text-base text-warn sm:mx-6">
          <span>Some data couldn't be loaded. Check your connection and try again.</span>
          <button onClick={retryData} className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-warn px-3 text-xs font-bold text-white hover:brightness-95">
            Retry
          </button>
        </div>
      )}

      {/* Content — matches the capsule's max-w-6xl width so page content lines up cleanly with the nav */}
      <main
        className={`mx-auto w-full ${
          isChatbotMain
            ? "max-w-3xl flex-1 min-h-0 flex flex-col overflow-hidden px-2 sm:px-4 py-1.5 sm:py-2"
            : "max-w-6xl overflow-x-hidden px-4 pb-3 pt-2 sm:px-6 sm:pb-5 sm:pt-3"
        }`}
      >
        {children}
      </main>
    </>
  );
}

// PageHeader — title + subtitle + optional action, used at top of content
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-3.5 sm:mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h2>
        {subtitle && <p className="mt-1 text-base text-ink-2">{subtitle}</p>}
      </div>
      {action && <div className="flex shrink-0 gap-2">{action}</div>}
    </div>
  );
}
