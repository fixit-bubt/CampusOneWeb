import React from "react";
import { Icon } from "../../components/Icon.jsx";
import {
  Button, Card, Badge, EmptyState, Avatar, Loading, useToast,
} from "../../components/ui.jsx";
import { AppShell, PageHeader } from "../../components/AppShell.jsx";
import { AccentTile, waHref, mailHref } from "../../components/featureKit.jsx";
import { useApp } from "../../data/store.jsx";
import { navigate } from "../../lib/router.jsx";

// ============================================================================
// FEATURE — Faculty Directory  (signature accent: indigo)
// Browse BUBT teachers by department, search by name, filter by research area
// ("find a supervisor"), view a full in-app profile, email, and bookmark.
// Data is live reference data (public.departments / public.faculty, seeded in
// 0031–0032); bookmarks are per-user (public.faculty_bookmarks). Read via
// useApp().departments / faculty / facultyBookmarks.
// ============================================================================

const ACCENT = "indigo";

// One icon per faculty/branch — the tone stays indigo everywhere (one signature
// accent per feature); only the glyph varies to give departments visual texture.
const BRANCH_ICON = {
  "Engineering & Applied Sciences": "Cpu",
  "Business": "Briefcase",
  "Science / Social Sciences": "Sigma",
  "Arts & Humanities": "BookOpenText",
  "Social Sciences": "Globe",
  "Law": "Scale",
};

const BRANCH_ORDER = [
  "Engineering & Applied Sciences",
  "Business",
  "Science / Social Sciences",
  "Arts & Humanities",
  "Social Sciences",
  "Law",
];

// Academic link metadata — order defines display order on the profile.
const LINK_META = {
  scholar: {
    label: "Google Scholar",
    subtitle: "Citations & Publications",
    icon: "GraduationCap",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/50",
  },
  researchgate: {
    label: "ResearchGate",
    subtitle: "Scientific Network & Papers",
    icon: "BookOpen",
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-900/50",
  },
  orcid: {
    label: "ORCID",
    subtitle: "Digital Researcher Identifier",
    icon: "Fingerprint",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50",
  },
  linkedin: {
    label: "LinkedIn",
    subtitle: "Professional Academic Network",
    icon: "Linkedin",
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900/50",
  },
  website: {
    label: "Personal Website",
    subtitle: "Research Portfolio & Lab",
    icon: "Globe",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/50",
  },
};

function parseQualification(raw = "") {
  const text = String(raw).trim();
  const lower = text.toLowerCase();

  let degreeType = "degree";
  let badgeTone = "indigo";
  let badgeLabel = "Degree";
  let iconName = "GraduationCap";

  if (lower.includes("ph.d") || lower.includes("phd") || lower.includes("doctor")) {
    degreeType = "doctorate";
    badgeTone = "purple";
    badgeLabel = "Ph.D.";
    iconName = "Award";
  } else if (
    lower.includes("m.sc") ||
    lower.includes("msc") ||
    lower.includes("master") ||
    lower.includes("m.eng") ||
    lower.includes("meng") ||
    lower.includes("mba") ||
    lower.includes("llm") ||
    lower.includes("pgd")
  ) {
    degreeType = "masters";
    badgeTone = "blue";
    badgeLabel = "Master's";
    iconName = "GraduationCap";
  } else if (
    lower.includes("b.sc") ||
    lower.includes("bsc") ||
    lower.includes("bachelor") ||
    lower.includes("bba") ||
    lower.includes("llb") ||
    lower.includes("b.a") ||
    lower.includes("ba") ||
    lower.includes("b.com")
  ) {
    degreeType = "bachelors";
    badgeTone = "emerald";
    badgeLabel = "Bachelor's";
    iconName = "BookOpen";
  } else if (lower.includes("diploma") || lower.includes("certificate")) {
    degreeType = "diploma";
    badgeTone = "amber";
    badgeLabel = "Diploma";
    iconName = "BookOpenText";
  }

  const parts = text.split(",").map((p) => p.trim()).filter(Boolean);
  const title = parts[0] || text;
  const institution = parts.slice(1).join(", ");

  return {
    raw: text,
    degreeType,
    badgeTone,
    badgeLabel,
    iconName,
    title,
    institution,
  };
}

const cleanHtml = (str = "") =>
  (str || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

const shortDept = (name) => cleanHtml(name || "").replace(/^Department of\s+/i, "");

// Rank order for listing faculty within a department (chairman always first).
function rankIndex(desig = "") {
  const d = desig.toLowerCase();
  if (d.includes("associate professor")) return 2;
  if (d.includes("assistant professor")) return 3;
  if (d.includes("adjunct") || d.includes("visiting")) return 4;
  if (d.includes("professor")) return 1;
  if (d.includes("senior lecturer")) return 5;
  if (d.includes("lecturer")) return 6;
  if (d.includes("teaching assistant")) return 7;
  if (d.includes("demonstrator")) return 8;
  return 9;
}
function sortFaculty(list) {
  return [...list].sort((a, b) => {
    if (a.isChairman !== b.isChairman) return a.isChairman ? -1 : 1;
    const r = rankIndex(a.designation) - rankIndex(b.designation);
    if (r !== 0) return r;
    return (a.name ?? "").localeCompare(b.name ?? "");
  });
}

// --- Faculty Code / Initial Helpers -------------------------------------------
export function getFacultyCode(f) {
  if (!f) return "";
  const code = f.shortCode || f.short_code || f.faculty_code;
  if (!code || typeof code !== "string") return "";
  return code.trim().toUpperCase();
}

export function matchesFaculty(f, query) {
  if (!query) return true;
  const q = query.trim().toLowerCase();
  const qUpper = query.trim().toUpperCase();

  if ((f.name ?? "").toLowerCase().includes(q)) return true;
  if ((f.designation ?? "").toLowerCase().includes(q)) return true;

  const code = getFacultyCode(f);
  if (code && code.includes(qUpper)) return true;

  if (f.email && f.email.toLowerCase().includes(q)) return true;
  if ((f.interests ?? f.research_interests ?? []).some((i) => (i ?? "").toLowerCase().includes(q))) return true;

  return false;
}

// --- Save (bookmark) star -----------------------------------------------------
function SaveStar({ saved, onClick }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      title={saved ? "Saved in shortlist" : "Save teacher"}
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors ${
        saved ? "text-warn hover:bg-warn-bg" : "text-ink-3 hover:bg-surface-2 hover:text-ink-3"
      }`}
    >
      <Icon name="Star" size={18} className={saved ? "fill-amber-400" : ""} />
    </button>
  );
}

function PersonBadges({ f }) {
  const code = getFacultyCode(f);
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      {code && (
        <span
          title={`Faculty Code / Routine Initial: ${code}`}
          className="inline-flex items-center gap-1 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 px-1.5 py-0.5 font-mono text-[11px] font-bold text-indigo-700 dark:text-indigo-300"
        >
          <span className="text-[9px] uppercase font-semibold text-indigo-500/80 dark:text-indigo-400/80">Code:</span>
          {code}
        </span>
      )}
      {f.isChairman && <Badge tone="blue" icon="Crown">Chairman</Badge>}
      {f.onLeave && <Badge tone="amber" icon="PlaneTakeoff">On leave</Badge>}
    </div>
  );
}

// --- Faculty card (clean professional directory card without bulky tags) ------
function FacultyCard({ f, dept, saved, onToggleSave }) {
  const open = () => navigate(`/faculty/${f.id}`);
  const cleanName = cleanHtml(f.name);
  const cleanDesig = cleanHtml(f.designation);

  return (
    <Card className="group flex flex-col justify-between overflow-hidden p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:shadow-md">
      <div>
        <div className="flex items-start gap-3.5">
          <button onClick={open} className="relative shrink-0" title={`View ${cleanName}'s profile`}>
            <Avatar name={cleanName} src={f.photo} size={56} className="ring-2 ring-surface border border-brd shadow-xs group-hover:scale-105 transition-transform" />
            <span
              className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full ring-2 ring-surface ${
                f.onLeave ? "bg-amber-400" : "bg-emerald-500"
              }`}
              title={f.onLeave ? "On study leave" : "Active faculty"}
            />
          </button>
          <div className="min-w-0 flex-1">
            <button onClick={open} className="block max-w-full text-left">
              <p className="truncate text-base font-bold text-ink group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {cleanName}
              </p>
            </button>
            <p className="mt-0.5 truncate text-xs font-semibold text-ink-2">{cleanDesig}</p>
            {dept && (
              <p className="mt-0.5 truncate text-xs font-medium text-indigo-600 dark:text-indigo-400">
                {shortDept(dept.name)}
              </p>
            )}
          </div>
          <SaveStar saved={saved} onClick={onToggleSave} />
        </div>

        <PersonBadges f={f} />

        {/* Directory contact info snippet */}
        <div className="mt-3.5 space-y-1.5 border-t border-brd/60 pt-3 text-xs">
          {f.email ? (
            <div className="flex items-center gap-2 text-ink-2 truncate" title={f.email}>
              <Icon name="Mail" size={13} className="shrink-0 text-ink-3" />
              <span className="truncate">{f.email}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-ink-3">
              <Icon name="Mail" size={13} className="shrink-0 text-ink-3/60" />
              <span>Institutional email on file</span>
            </div>
          )}
          {f.phone ? (
            <div className="flex items-center gap-2 text-ink-3 truncate" title={f.phone}>
              <Icon name="Phone" size={13} className="shrink-0 text-ink-3" />
              <span className="truncate">{f.phone}</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-brd pt-3">
        {f.email ? (
          <a
            href={mailHref(f.email) || `mailto:${f.email}`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            title={f.email}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-3 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <Icon name="Mail" size={14} /> Send Email
          </a>
        ) : (
          <span className="text-xs text-ink-3">Contact via portal</span>
        )}
        <Button size="sm" variant="secondary" iconRight="ArrowRight" onClick={open}>
          Profile
        </Button>
      </div>
    </Card>
  );
}

// --- Department card ----------------------------------------------------------
function DepartmentCard({ dept, count }) {
  return (
    <button
      onClick={() => navigate(`/faculty/dept/${dept.deptNumber}`)}
      className="group flex items-center gap-4 rounded-md border border-brd bg-surface p-5 text-left shadow-sm transition-colors hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:bg-indigo-50/40 dark:hover:bg-indigo-500/10"
    >
      <AccentTile icon={BRANCH_ICON[dept.branch] || "GraduationCap"} tone={ACCENT} size={44} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold text-ink">{shortDept(dept.name)}</p>
        <p className="mt-0.5 truncate text-xs text-ink-3">{count} teacher{count === 1 ? "" : "s"}</p>
      </div>
      <Icon name="ArrowRight" size={18} className="text-ink-3 group-hover:text-indigo-500 dark:group-hover:text-indigo-300" />
    </button>
  );
}

// --- Search field -------------------------------------------------------------
function SearchField({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <Icon name="Search" size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-md border border-brd bg-surface pl-10 pr-10 text-base text-ink placeholder:text-ink-3 transition-colors focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center rounded-sm text-ink-3 hover:bg-surface-2 hover:text-ink-2"
        >
          <Icon name="X" size={15} />
        </button>
      )}
    </div>
  );
}

// ============================================================================
// Browse / directory
// ============================================================================
export function FacultyDirectory() {
  const { departments, faculty, facultyBookmarks, departmentById, toggleFacultyBookmark, dataLoading } = useApp();
  const [query, setQuery] = React.useState("");
  const [interest, setInterest] = React.useState(null);
  const toast = useToast();

  const onToggleSave = async (id, name) => {
    const saved = facultyBookmarks.includes(id);
    const r = await toggleFacultyBookmark(id);
    if (!r.ok) toast({ type: "error", title: "Couldn't update", message: r.error });
    else toast({ type: "success", title: saved ? "Removed from saved" : "Saved", message: name });
  };

  // Per-department headcounts (from the loaded faculty rows).
  const countByDept = React.useMemo(() => {
    const m = {};
    faculty.forEach((f) => { m[f.departmentId] = (m[f.departmentId] || 0) + 1; });
    return m;
  }, [faculty]);

  // Most common research areas → "find a supervisor" filter chips.
  const popularInterests = React.useMemo(() => {
    const counts = new Map();
    faculty.forEach((f) => f.interests.forEach((i) => {
      const key = i.trim().toLowerCase();
      if (!key) return;
      const cur = counts.get(key) || { label: i.trim(), n: 0 };
      cur.n += 1;
      counts.set(key, cur);
    }));
    return [...counts.values()].sort((a, b) => b.n - a.n).slice(0, 14);
  }, [faculty]);

  const q = query.trim().toLowerCase();
  const filtering = q.length > 0 || !!interest;

  const results = React.useMemo(() => {
    if (!filtering) return [];
    let list = faculty;
    if (interest) {
      const si = interest.toLowerCase();
      list = list.filter((f) => (f.interests ?? []).some((i) => (i ?? "").toLowerCase() === si));
    }
    if (q) {
      list = list.filter((f) => matchesFaculty(f, q));
    }
    return sortFaculty(list);
  }, [faculty, q, interest, filtering]);

  // Departments grouped by branch (only branches that exist), each sorted big→small.
  const branches = React.useMemo(() => {
    const byBranch = {};
    departments.forEach((d) => { (byBranch[d.branch] ||= []).push(d); });
    const order = [...BRANCH_ORDER, ...Object.keys(byBranch).filter((b) => !BRANCH_ORDER.includes(b))];
    return order
      .filter((b) => byBranch[b])
      .map((b) => ({
        branch: b,
        depts: byBranch[b].sort((a, c) => (countByDept[c.id] || 0) - (countByDept[a.id] || 0)),
      }));
  }, [departments, countByDept]);

  const savedCount = facultyBookmarks.length;
  const headerAction = (
    <Button variant="secondary" icon="Star" onClick={() => navigate("/faculty/saved")}>
      Saved{savedCount ? ` · ${savedCount}` : ""}
    </Button>
  );

  if (dataLoading && faculty.length === 0) {
    return (
      <AppShell activeKey="faculty" title="Faculty">
        <PageHeader title="Faculty Directory" subtitle="Browse BUBT teachers, find a supervisor by research area, and save the ones you need." />
        <Loading />
      </AppShell>
    );
  }

  return (
    <AppShell activeKey="faculty" title="Faculty">
      <PageHeader
        title="Faculty Directory"
        subtitle={`${faculty.length} teachers across ${departments.length} departments, browse, search, and find a supervisor.`}
        action={headerAction}
      />

      <SearchField value={query} onChange={setQuery} placeholder="Search by name, faculty code (e.g. SR), or research area…" />

      {popularInterests.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-3">
            <Icon name="FlaskConical" size={13} /> Find a supervisor by research area
          </p>
          <div className="flex flex-wrap gap-1.5">
            {popularInterests.map((it) => {
              const active = interest && interest.toLowerCase() === it.label.toLowerCase();
              return (
                <button
                  key={it.label}
                  onClick={() => setInterest(active ? null : it.label)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active ? "bg-indigo-600 text-white" : "bg-surface text-ink-2 border border-brd hover:bg-surface-2"
                  }`}
                >
                  {it.label}
                  <span className={`rounded-full px-1.5 text-[10px] ${active ? "bg-white/20" : "bg-surface-3 text-ink-3"}`}>{it.n}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {filtering ? (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-base text-ink-3">
              {results.length} result{results.length === 1 ? "" : "s"}
              {interest && <> in <span className="font-semibold text-ink-2">{interest}</span></>}
            </p>
            <button onClick={() => { setQuery(""); setInterest(null); }} className="text-xs font-semibold text-ink-3 hover:text-ink-2">
              Clear
            </button>
          </div>
          {results.length === 0 ? (
            <EmptyState icon="SearchX" title="No teachers found" message="Try a different name or research area." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((f) => (
                <FacultyCard
                  key={f.id}
                  f={f}
                  dept={departmentById(f.departmentId)}
                  saved={facultyBookmarks.includes(f.id)}
                  onToggleSave={() => onToggleSave(f.id, f.name)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {branches.map(({ branch, depts }) => (
            <section key={branch}>
              <h3 className="mb-3 text-base font-semibold text-ink">{branch}</h3>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {depts.map((d) => (
                  <DepartmentCard key={d.id} dept={d} count={countByDept[d.id] || 0} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </AppShell>
  );
}

// ============================================================================
// Department — one department's roster
// ============================================================================
export function DepartmentFaculty({ deptNo }) {
  const { departmentByNumber, faculty, facultyBookmarks, toggleFacultyBookmark, dataLoading } = useApp();
  const [query, setQuery] = React.useState("");
  const [rankFilter, setRankFilter] = React.useState("all");
  const [viewMode, setViewMode] = React.useState("grid"); // 'grid' | 'list'
  const toast = useToast();
  const dept = departmentByNumber(deptNo);

  const onToggleSave = async (id, name) => {
    const saved = facultyBookmarks.includes(id);
    const r = await toggleFacultyBookmark(id);
    if (!r.ok) toast({ type: "error", title: "Couldn't update", message: r.error });
    else toast({ type: "success", title: saved ? "Removed from saved" : "Saved to shortlist", message: name });
  };

  const q = query.trim().toLowerCase();
  const roster = React.useMemo(() => {
    if (!dept) return [];
    return sortFaculty((faculty || []).filter((f) => f.departmentId === dept.id));
  }, [faculty, dept]);

  // Academic rank distribution
  const rankCounts = React.useMemo(() => {
    let prof = 0, assoc = 0, asst = 0, lect = 0, leave = 0;
    roster.forEach((f) => {
      const d = (f.designation || "").toLowerCase();
      if (f.onLeave) leave++;
      if (d.includes("associate professor")) assoc++;
      else if (d.includes("assistant professor")) asst++;
      else if (d.includes("professor")) prof++;
      else if (d.includes("lecturer")) lect++;
    });
    return { all: roster.length, prof, assoc, asst, lect, leave };
  }, [roster]);

  const list = React.useMemo(() => {
    let res = roster;
    if (rankFilter === "prof") {
      res = res.filter((f) => {
        const d = (f.designation || "").toLowerCase();
        return d.includes("professor") && !d.includes("associate") && !d.includes("assistant");
      });
    } else if (rankFilter === "assoc") {
      res = res.filter((f) => (f.designation || "").toLowerCase().includes("associate professor"));
    } else if (rankFilter === "asst") {
      res = res.filter((f) => (f.designation || "").toLowerCase().includes("assistant professor"));
    } else if (rankFilter === "lect") {
      res = res.filter((f) => (f.designation || "").toLowerCase().includes("lecturer"));
    } else if (rankFilter === "leave") {
      res = res.filter((f) => f.onLeave);
    }

    if (q) {
      res = res.filter((f) => matchesFaculty(f, q));
    }
    return res;
  }, [roster, rankFilter, q]);

  if (!dept) {
    return (
      <AppShell activeKey="faculty" title="Department">
        {dataLoading ? <Loading /> : (
          <EmptyState
            icon="GraduationCap"
            title="Department not found"
            message="This department may have changed."
            action={<Button onClick={() => navigate("/faculty")}>Back to directory</Button>}
          />
        )}
      </AppShell>
    );
  }

  const rankTabs = [
    { key: "all", label: "All", count: rankCounts.all },
    ...(rankCounts.prof > 0 ? [{ key: "prof", label: "Professors", count: rankCounts.prof }] : []),
    ...(rankCounts.assoc > 0 ? [{ key: "assoc", label: "Associate Prof", count: rankCounts.assoc }] : []),
    ...(rankCounts.asst > 0 ? [{ key: "asst", label: "Assistant Prof", count: rankCounts.asst }] : []),
    ...(rankCounts.lect > 0 ? [{ key: "lect", label: "Lecturers", count: rankCounts.lect }] : []),
    ...(rankCounts.leave > 0 ? [{ key: "leave", label: "On Leave", count: rankCounts.leave }] : []),
  ];

  return (
    <AppShell activeKey="faculty" title={shortDept(dept.name)}>
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Navigation Breadcrumb */}
        <button onClick={() => navigate("/faculty")} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-3 hover:text-ink-2 transition-colors">
          <Icon name="ArrowLeft" size={16} /> All departments
        </button>

        {/* Professional Header Banner */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <AccentTile icon={BRANCH_ICON[dept.branch] || "GraduationCap"} tone={ACCENT} size={52} />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">{shortDept(dept.name)}</h1>
                  <Badge tone="indigo">{roster.length} Faculty Members</Badge>
                </div>
                <p className="mt-1 text-sm font-medium text-ink-3">{dept.branch}</p>
                {dept.chairman && (
                  <p className="mt-1.5 text-xs text-ink-2 flex items-center gap-1.5">
                    <Icon name="Crown" size={14} className="text-blue-600 dark:text-blue-400" />
                    <span className="text-ink-3 font-semibold">Chair:</span>
                    <span className="font-bold text-ink">{cleanHtml(dept.chairman)}</span>
                  </p>
                )}
              </div>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 self-start sm:self-auto rounded-lg border border-brd bg-surface-2 p-1">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="Grid view"
                className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                  viewMode === "grid" ? "bg-surface text-ink shadow-xs" : "text-ink-3 hover:text-ink-2"
                }`}
              >
                <Icon name="LayoutGrid" size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                title="Directory list view"
                className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                  viewMode === "list" ? "bg-surface text-ink shadow-xs" : "text-ink-3 hover:text-ink-2"
                }`}
              >
                <Icon name="List" size={16} />
              </button>
            </div>
          </div>
        </Card>

        {/* Directory Search & Filters */}
        <div className="space-y-3">
          <SearchField value={query} onChange={setQuery} placeholder={`Search teachers in ${shortDept(dept.name)} by name or code (e.g. SR)…`} />

          {/* Academic Rank Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {rankTabs.map((rt) => {
              const active = rankFilter === rt.key;
              return (
                <button
                  key={rt.key}
                  type="button"
                  onClick={() => setRankFilter(rt.key)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-surface text-ink-2 border border-brd hover:bg-surface-2"
                  }`}
                >
                  <span>{rt.label}</span>
                  <span className={`rounded-full px-1.5 text-[10px] ${active ? "bg-white/20 text-white" : "bg-surface-3 text-ink-3"}`}>
                    {rt.count}
                  </span>
                </button>
              );
            })}
            {(rankFilter !== "all" || q) && (
              <button
                onClick={() => { setRankFilter("all"); setQuery(""); }}
                className="ml-auto text-xs font-semibold text-ink-3 hover:text-ink-2"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between text-xs text-ink-3 px-1">
          <p>Showing <span className="font-bold text-ink">{list.length}</span> of {roster.length} faculty members</p>
        </div>

        {/* Roster View */}
        {list.length === 0 ? (
          <EmptyState icon="SearchX" title="No faculty members found" message="Try adjusting your search query or rank filter." />
        ) : viewMode === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((f) => (
              <FacultyCard
                key={f.id}
                f={f}
                dept={null}
                saved={facultyBookmarks.includes(f.id)}
                onToggleSave={() => onToggleSave(f.id, f.name)}
              />
            ))}
          </div>
        ) : (
          <Card className="overflow-hidden">
            <div className="divide-y divide-brd">
              {list.map((f) => {
                const cleanName = cleanHtml(f.name);
                const cleanDesig = cleanHtml(f.designation);
                const saved = facultyBookmarks.includes(f.id);
                return (
                  <div
                    key={f.id}
                    onClick={() => navigate(`/faculty/${f.id}`)}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-surface-2 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative shrink-0">
                        <Avatar name={cleanName} src={f.photo} size={48} className="ring-1 ring-brd" />
                        <span
                          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-surface ${
                            f.onLeave ? "bg-amber-400" : "bg-emerald-500"
                          }`}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-ink group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {cleanName}
                          </p>
                          {getFacultyCode(f) && (
                            <span
                              title={`Faculty Code: ${getFacultyCode(f)}`}
                              className="inline-flex items-center gap-1 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 px-1.5 py-0.5 font-mono text-[11px] font-bold text-indigo-700 dark:text-indigo-300"
                            >
                              <span className="text-[9px] uppercase font-semibold text-indigo-500/80 dark:text-indigo-400/80">Code:</span>
                              {getFacultyCode(f)}
                            </span>
                          )}
                          {f.isChairman && <Badge tone="blue" icon="Crown">Chairman</Badge>}
                          {f.onLeave && <Badge tone="amber" icon="PlaneTakeoff">On leave</Badge>}
                        </div>
                        <p className="text-xs font-semibold text-ink-2 mt-0.5">{cleanDesig}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 border-brd/40 pt-2 sm:pt-0">
                      {f.email ? (
                        <a
                          href={mailHref(f.email) || `mailto:${f.email}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-ink-3 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium truncate max-w-[200px]"
                          title={f.email}
                        >
                          {f.email}
                        </a>
                      ) : (
                        <span className="text-xs text-ink-3">No email</span>
                      )}
                      <div className="flex items-center gap-2">
                        <SaveStar saved={saved} onClick={() => onToggleSave(f.id, f.name)} />
                        <Button size="sm" variant="secondary" iconRight="ArrowRight">
                          Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

// ============================================================================
// Profile — a single teacher (Option A: everything in-app)
// ============================================================================
function AcademicLinkTile({ href, meta }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`group flex items-center justify-between gap-3 rounded-lg border p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-sm ${meta.bg}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface shadow-xs ${meta.color}`}>
          <Icon name={meta.icon} size={20} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-ink group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {meta.label}
          </p>
          <p className="truncate text-xs text-ink-3">{meta.subtitle}</p>
        </div>
      </div>
      <Icon name="ExternalLink" size={15} className="text-ink-3 shrink-0 group-hover:text-ink-2" />
    </a>
  );
}

function CredentialCard({ raw }) {
  const q = parseQualification(raw);
  return (
    <div className="flex items-start gap-3.5 rounded-lg border border-brd bg-surface p-4 transition-colors hover:border-indigo-300 dark:hover:border-indigo-500/30">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
        <Icon name={q.iconName} size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-base font-bold text-ink">{q.title}</p>
          <Badge tone={q.badgeTone}>{q.badgeLabel}</Badge>
        </div>
        {q.institution && (
          <p className="mt-1 text-sm text-ink-2">{q.institution}</p>
        )}
      </div>
    </div>
  );
}

export function FacultyProfile({ id }) {
  const { faculty, facultyById, departmentById, facultyBookmarks, toggleFacultyBookmark, dataLoading } = useApp();
  const toast = useToast();
  const f = facultyById(id);

  const [activeTab, setActiveTab] = React.useState("overview");
  const [copiedEmail, setCopiedEmail] = React.useState(false);
  const [copiedShare, setCopiedShare] = React.useState(false);

  const colleagues = React.useMemo(() => {
    if (!f) return [];
    return (faculty || []).filter((other) => other.departmentId === f.departmentId && other.id !== f.id);
  }, [faculty, f]);

  if (!f) {
    return (
      <AppShell activeKey="faculty" title="Faculty">
        {dataLoading ? <Loading /> : (
          <EmptyState
            icon="UserX"
            title="Teacher not found"
            message="This profile may have changed."
            action={<Button onClick={() => navigate("/faculty")}>Back to directory</Button>}
          />
        )}
      </AppShell>
    );
  }

  const dept = departmentById(f.departmentId);
  const saved = facultyBookmarks.includes(f.id);
  const activeLinks = Object.keys(LINK_META).filter((k) => f.links[k]);
  const phoneDigits = (f.phone || "").replace(/[^0-9]/g, "");
  const waLink = waHref(f.phone);

  async function toggleSave() {
    const r = await toggleFacultyBookmark(f.id);
    if (!r.ok) toast({ type: "error", title: "Couldn't update", message: r.error });
    else toast({ type: "success", title: saved ? "Removed from saved" : "Saved to shortlist", message: f.name });
  }

  async function copyEmail() {
    if (!f.email) return;
    try {
      await navigator.clipboard.writeText(f.email);
      setCopiedEmail(true);
      toast({ type: "success", title: "Email copied", message: f.email });
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      toast({ type: "error", title: "Couldn't copy email" });
    }
  }

  async function shareProfile() {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${f.name} - BUBT Faculty Profile`,
          text: `${f.name}, ${f.designation} at BUBT.`,
          url: shareUrl,
        });
        return;
      } catch {
        /* user dismissed */
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      toast({ type: "success", title: "Profile link copied to clipboard" });
      setTimeout(() => setCopiedShare(false), 2000);
    } catch {
      toast({ type: "error", title: "Couldn't copy link" });
    }
  }

  const tabs = [
    { key: "overview", label: "Overview", icon: "Compass" },
    { key: "qualifications", label: "Qualifications", icon: "GraduationCap", count: f.qualifications.length },
    { key: "research", label: "Research & Links", icon: "FlaskConical", count: f.interests.length },
    { key: "contact", label: "Contact & Office", icon: "Mail" },
  ];

  return (
    <AppShell activeKey="faculty" title={f.name}>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Top Breadcrumb & Actions */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => navigate(dept ? `/faculty/dept/${dept.deptNumber}` : "/faculty")}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-3 hover:text-ink-2 transition-colors"
          >
            <Icon name="ArrowLeft" size={16} />
            <span>{dept ? shortDept(dept.name) : "Faculty Directory"}</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={shareProfile}
              title="Share profile"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-brd bg-surface px-3 text-xs font-semibold text-ink-2 hover:bg-surface-2 transition-colors shadow-xs"
            >
              <Icon name={copiedShare ? "Check" : "Share2"} size={14} className={copiedShare ? "text-success" : "text-ink-3"} />
              <span>{copiedShare ? "Copied" : "Share"}</span>
            </button>
          </div>
        </div>

        {/* Profile Identity Card */}
        <Card className="p-6 border-brd shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
            <div className="flex flex-col sm:flex-row items-start gap-4 min-w-0">
              <div className="relative shrink-0">
                <Avatar
                  name={cleanHtml(f.name)}
                  src={f.photo}
                  size={84}
                  className="ring-2 ring-surface shadow-md bg-surface border border-brd"
                />
                <span
                  className={`absolute bottom-0 right-0 h-4 w-4 rounded-full ring-2 ring-surface ${
                    f.onLeave ? "bg-amber-400" : "bg-emerald-500"
                  }`}
                  title={f.onLeave ? "On study leave" : "Active faculty"}
                />
              </div>

              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink leading-tight">
                  {cleanHtml(f.name)}
                </h1>
                <p className="mt-1 text-base font-semibold text-ink-2">{cleanHtml(f.designation)}</p>
                {dept && (
                  <button
                    onClick={() => navigate(`/faculty/dept/${dept.deptNumber}`)}
                    className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <Icon name={BRANCH_ICON[dept.branch] || "GraduationCap"} size={14} />
                    <span>{shortDept(dept.name)}</span>
                    <span className="text-ink-3 font-normal">· {dept.branch}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Single Save Teacher Action Button */}
            <div className="flex items-center gap-2 shrink-0 self-start">
              <Button
                variant={saved ? "secondary" : "primary"}
                icon="Star"
                onClick={toggleSave}
                className={saved ? "text-warn" : ""}
              >
                {saved ? "Saved in Shortlist" : "Save Teacher"}
              </Button>
            </div>
          </div>

          {/* Badges Strip */}
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-brd pt-4">
            <Badge tone="indigo" icon="UserCheck">Verified Faculty</Badge>
            {getFacultyCode(f) && (
              <span
                title="Official Faculty Code / Routine Initial"
                className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 px-3 py-1 font-mono text-xs font-bold text-indigo-700 dark:text-indigo-300 shadow-2xs"
              >
                <Icon name="Tag" size={13} />
                <span>Faculty Code: {getFacultyCode(f)}</span>
              </span>
            )}
            {f.isChairman && <Badge tone="blue" icon="Crown">Department Chairman</Badge>}
            {f.onLeave ? (
              <Badge tone="amber" icon="PlaneTakeoff">On Study Leave</Badge>
            ) : (
              <Badge tone="emerald" icon="Check">Active on Campus</Badge>
            )}
            {f.interests.length > 0 && !f.onLeave && (
              <Badge tone="teal" icon="FlaskConical">Supervision Available</Badge>
            )}
          </div>

          {/* Quick Actions Row */}
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            {f.email && (
              <>
                <a
                  href={mailHref(f.email) || `mailto:${f.email}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-700"
                >
                  <Icon name="Mail" size={16} /> Email Teacher
                </a>
                <button
                  onClick={copyEmail}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-brd bg-surface px-3 text-sm font-semibold text-ink-2 hover:bg-surface-2 transition-colors shadow-xs"
                  title="Copy email address"
                >
                  <Icon name={copiedEmail ? "Check" : "Copy"} size={15} className={copiedEmail ? "text-success" : "text-ink-3"} />
                  <span>{copiedEmail ? "Copied" : "Copy Email"}</span>
                </button>
              </>
            )}
            {phoneDigits && (
              <a
                href={`tel:${f.phone}`}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-brd bg-surface px-3.5 text-sm font-semibold text-ink-2 hover:bg-surface-2 transition-colors shadow-xs"
              >
                <Icon name="Phone" size={15} className="text-ink-3" /> Call
              </a>
            )}
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-success px-4 text-sm font-bold text-white hover:brightness-95 transition-all shadow-xs"
              >
                <Icon name="MessageCircle" size={15} /> WhatsApp
              </a>
            )}
            {f.profileUrl && (
              <a
                href={f.profileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-brd bg-surface px-3.5 text-sm font-semibold text-ink-2 hover:bg-surface-2 transition-colors shadow-xs sm:ml-auto"
              >
                <Icon name="ExternalLink" size={15} className="text-ink-3" /> BUBT Official Profile
              </a>
            )}
          </div>
        </Card>

        {/* Quick Highlights Metrics */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card className="p-3.5 text-left">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-3">
              <Icon name="Building2" size={14} className="text-indigo-600 dark:text-indigo-400" /> Department
            </p>
            <p className="mt-1 truncate text-base font-bold text-ink">
              {dept ? shortDept(dept.name) : "Faculty"}
            </p>
            <p className="truncate text-xs text-ink-3">{dept?.branch || "BUBT"}</p>
          </Card>

          <Card className="p-3.5 text-left">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-3">
              <Icon name="Award" size={14} className="text-indigo-600 dark:text-indigo-400" /> Academic Rank
            </p>
            <p className="mt-1 truncate text-base font-bold text-ink">{f.designation}</p>
            <p className="truncate text-xs text-ink-3">{f.isChairman ? "Department Chair" : "Faculty Member"}</p>
          </Card>

          <Card className="p-3.5 text-left">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-3">
              <Icon name="FlaskConical" size={14} className="text-indigo-600 dark:text-indigo-400" /> Research Focus
            </p>
            <p className="mt-1 truncate text-base font-bold text-ink">
              {f.interests.length > 0 ? `${f.interests.length} Domains` : "General"}
            </p>
            <p className="truncate text-xs text-ink-3">{f.interests[0] || "Academic Studies"}</p>
          </Card>

          <Card className="p-3.5 text-left">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-3">
              <Icon name="Clock" size={14} className="text-indigo-600 dark:text-indigo-400" /> Campus Status
            </p>
            <p className="mt-1 truncate text-base font-bold text-ink">
              {f.onLeave ? "On Study Leave" : "Active on Campus"}
            </p>
            <p className="truncate text-xs text-ink-3">{f.onLeave ? "Remote only" : "Office consultations"}</p>
          </Card>
        </div>

        {/* Profile Tabs Navigation */}
        <div className="flex border-b border-brd gap-2 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-colors whitespace-nowrap ${
                  active
                    ? "border-brand text-brand"
                    : "border-transparent text-ink-2 hover:border-brd-2 hover:text-ink"
                }`}
              >
                <Icon name={tab.icon} size={16} />
                <span>{tab.label}</span>
                {tab.count != null && tab.count > 0 && (
                  <span className={`rounded-full px-1.5 py-0.2 text-[11px] ${
                    active ? "bg-brand/10 text-brand" : "bg-surface-3 text-ink-3"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Academic Role & Responsibilities */}
            <Card className="p-5">
              <h2 className="text-lg font-bold text-ink">Academic Role & Institutional Affiliation</h2>
              <div className="mt-3 space-y-3 text-sm text-ink-2">
                <p>
                  {f.name} serves as <span className="font-semibold text-ink">{f.designation}</span> in the{" "}
                  <span className="font-semibold text-ink">{dept ? dept.name : "Department"}</span> at Bangladesh University of Business &amp; Technology (BUBT).
                </p>
                {f.isChairman && (
                  <div className="rounded-lg border border-blue-200 dark:border-blue-900/50 bg-blue-50/70 dark:bg-blue-950/30 p-3 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
                    <Icon name="Crown" size={16} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="font-bold text-sm">Department Chairman</p>
                      <p className="mt-0.5">Oversees departmental administration, curriculum development, and academic coordination.</p>
                    </div>
                  </div>
                )}
                {f.onLeave && (
                  <div className="rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/30 p-3 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                    <Icon name="PlaneTakeoff" size={16} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                    <div>
                      <p className="font-bold text-sm">Currently on Study Leave</p>
                      <p className="mt-0.5">This teacher is pursuing higher academic research abroad. Campus office hours are temporarily suspended.</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Student Consultation & Supervision Guidance */}
            <Card className="p-5">
              <div className="flex items-center gap-2">
                <Icon name="Sparkles" size={18} className="text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-lg font-bold text-ink">Student Consultation &amp; Advising</h2>
              </div>
              <p className="mt-2 text-sm text-ink-2">
                BUBT students may consult with faculty during designated office hours for course inquiries, academic advising, final year projects (FYDP), and research proposals.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-brd bg-surface-2 p-3 text-xs">
                  <p className="font-bold text-ink flex items-center gap-1.5">
                    <Icon name="Clock" size={14} className="text-indigo-600 dark:text-indigo-400" /> Consultation Hours
                  </p>
                  <p className="mt-1 text-ink-3">Check weekly timetable or contact via email to schedule an appointment.</p>
                </div>
                <div className="rounded-lg border border-brd bg-surface-2 p-3 text-xs">
                  <p className="font-bold text-ink flex items-center gap-1.5">
                    <Icon name="FlaskConical" size={14} className="text-indigo-600 dark:text-indigo-400" /> Thesis &amp; Capstone
                  </p>
                  <p className="mt-1 text-ink-3">Students seeking supervision should bring a brief project concept paper and transcript.</p>
                </div>
              </div>
            </Card>

            {/* Research Preview */}
            {f.interests.length > 0 && (
              <Card className="p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-ink">Key Research Areas</h2>
                  <button
                    onClick={() => setActiveTab("research")}
                    className="text-xs font-semibold text-brand hover:underline inline-flex items-center gap-1"
                  >
                    View all {f.interests.length} areas <Icon name="ArrowRight" size={12} />
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {f.interests.slice(0, 6).map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-800/40 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300"
                    >
                      {item}
                    </span>
                  ))}
                  {f.interests.length > 6 && (
                    <button
                      onClick={() => setActiveTab("research")}
                      className="rounded-full bg-surface-3 px-3 py-1 text-xs font-semibold text-ink-3 hover:bg-surface-2"
                    >
                      +{f.interests.length - 6} more
                    </button>
                  )}
                </div>
              </Card>
            )}

            {/* Department Colleagues Strip */}
            {colleagues.length > 0 && (
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-ink">Colleagues in {dept ? shortDept(dept.name) : "Department"}</h2>
                    <p className="text-xs text-ink-3">Other faculty members in this department</p>
                  </div>
                  {dept && (
                    <button
                      onClick={() => navigate(`/faculty/dept/${dept.deptNumber}`)}
                      className="text-xs font-semibold text-brand hover:underline inline-flex items-center gap-1"
                    >
                      Full roster ({colleagues.length + 1}) <Icon name="ArrowRight" size={12} />
                    </button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {colleagues.slice(0, 4).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => navigate(`/faculty/${c.id}`)}
                      className="flex items-center gap-3 rounded-lg border border-brd bg-surface p-3 text-left transition-all hover:border-indigo-300 hover:bg-surface-2"
                    >
                      <Avatar name={c.name} src={c.photo} size={42} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-ink">{c.name}</p>
                        <p className="truncate text-xs text-ink-3">{c.designation}</p>
                      </div>
                      <Icon name="ArrowRight" size={14} className="text-ink-3 shrink-0" />
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Tab 2: Qualifications */}
        {activeTab === "qualifications" && (
          <div className="space-y-6">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-ink">Educational Background &amp; Degrees</h2>
                  <p className="text-xs text-ink-3">Academic credentials and formal qualifications</p>
                </div>
                <Badge tone="indigo" icon="Award">{f.qualifications.length} Credentials</Badge>
              </div>

              {f.qualifications.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {f.qualifications.map((raw, idx) => (
                    <CredentialCard key={idx} raw={raw} />
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-lg border border-dashed border-brd bg-surface-2 p-6 text-center">
                  <Icon name="GraduationCap" size={32} className="mx-auto text-ink-3" />
                  <p className="mt-2 text-base font-semibold text-ink">Educational background maintained on BUBT site</p>
                  <p className="mt-1 text-xs text-ink-3 max-w-md mx-auto">
                    Specific degree transcripts and honors for this faculty member are hosted on the official university portal.
                  </p>
                  {f.profileUrl && (
                    <a
                      href={f.profileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-md bg-brand px-4 text-xs font-bold text-white hover:bg-brand-700 transition-colors shadow-xs"
                    >
                      <Icon name="ExternalLink" size={13} /> View on BUBT Portal
                    </a>
                  )}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Tab 3: Research & Links */}
        {activeTab === "research" && (
          <div className="space-y-6">
            {/* Research Domains */}
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-ink">Research Domains &amp; Interests</h2>
                  <p className="text-xs text-ink-3">Specialized areas for research, publications, and thesis advising</p>
                </div>
                <Badge tone="indigo" icon="FlaskConical">{f.interests.length} Topics</Badge>
              </div>

              {f.interests.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {f.interests.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => navigate("/faculty")}
                      title={`Find other teachers in ${topic}`}
                      className="group inline-flex items-center gap-2 rounded-lg border border-indigo-200 dark:border-indigo-800/40 bg-indigo-50/70 dark:bg-indigo-950/30 px-3.5 py-2 text-xs font-semibold text-indigo-800 dark:text-indigo-300 transition-all hover:bg-indigo-100 dark:hover:bg-indigo-900/40 shadow-xs"
                    >
                      <Icon name="FlaskConical" size={13} className="text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                      <span>{topic}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-ink-3">
                  No specific research domains are tagged for this teacher in the current database snapshot.
                </p>
              )}
            </Card>

            {/* Academic & Scholarly Profiles */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-ink">Academic Networks &amp; Scholarly Profiles</h2>
                  <p className="text-xs text-ink-3">External research indexes and citations</p>
                </div>
                {activeLinks.length > 0 && <Badge tone="neutral">{activeLinks.length} Links</Badge>}
              </div>

              {activeLinks.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {activeLinks.map((k) => (
                    <AcademicLinkTile key={k} href={f.links[k]} meta={LINK_META[k]} />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-brd bg-surface-2 p-5 text-center">
                  <p className="text-sm font-semibold text-ink-2">No external academic profiles linked</p>
                  <p className="mt-1 text-xs text-ink-3">
                    Google Scholar or ResearchGate profiles have not been linked yet for this faculty member.
                  </p>
                </div>
              )}

              {f.profileUrl && (
                <div className="mt-4 pt-4 border-t border-brd">
                  <a
                    href={f.profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-brd-2 bg-surface-2 px-4 py-3 text-xs font-bold text-ink-2 hover:bg-surface-3 transition-colors"
                  >
                    <Icon name="ExternalLink" size={15} />
                    <span>View Official Profile on bubt.edu.bd</span>
                  </a>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Tab 4: Contact & Office */}
        {activeTab === "contact" && (
          <div className="space-y-6">
            {/* Primary Contact Channels */}
            <Card className="p-5">
              <h2 className="text-lg font-bold text-ink">Institutional Contact Information</h2>
              <p className="text-xs text-ink-3 mt-0.5">Reach out regarding coursework, appointments, and academic matters</p>

              <div className="mt-4 space-y-3">
                {/* Email Item */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-brd bg-surface-2 p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                      <Icon name="Mail" size={18} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-ink-3">Official BUBT Email</p>
                      <p className="text-base font-bold text-ink break-all">{f.email || "No email listed"}</p>
                    </div>
                  </div>
                  {f.email && (
                    <div className="flex items-center gap-2">
                      <a
                        href={mailHref(f.email) || `mailto:${f.email}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 items-center gap-1.5 rounded-md bg-brand px-3 text-xs font-bold text-white hover:bg-brand-700 transition-colors shadow-xs"
                      >
                        <Icon name="Mail" size={14} /> Send Email
                      </a>
                      <button
                        onClick={copyEmail}
                        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-brd bg-surface px-3 text-xs font-semibold text-ink-2 hover:bg-surface-2 transition-colors shadow-xs"
                      >
                        <Icon name={copiedEmail ? "Check" : "Copy"} size={14} className={copiedEmail ? "text-success" : "text-ink-3"} />
                        <span>{copiedEmail ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Phone Item */}
                {phoneDigits ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-brd bg-surface-2 p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        <Icon name="Phone" size={18} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-ink-3">Direct Phone / Ext.</p>
                        <p className="text-base font-bold text-ink">{f.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${f.phone}`}
                        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-brd bg-surface px-3 text-xs font-semibold text-ink-2 hover:bg-surface-2 transition-colors shadow-xs"
                      >
                        <Icon name="Phone" size={14} /> Call
                      </a>
                      {waLink && (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-success px-3 text-xs font-bold text-white hover:brightness-95 transition-all shadow-xs"
                        >
                          <Icon name="MessageCircle" size={14} /> WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </Card>

            {/* Student Email Etiquette Guide */}
            <Card className="p-5">
              <div className="flex items-center gap-2">
                <Icon name="BookOpenText" size={18} className="text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-base font-bold text-ink">Student Email Guidelines</h2>
              </div>
              <p className="mt-1 text-xs text-ink-3">When sending an academic inquiry to faculty:</p>
              <ul className="mt-3 space-y-2 text-xs text-ink-2">
                <li className="flex items-start gap-2">
                  <Icon name="Check" size={14} className="mt-0.5 text-success shrink-0" />
                  <span><strong>Subject line:</strong> Mention course code and section (e.g., "[CSE 221 - Sec 3] Question about Assignment 2").</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" size={14} className="mt-0.5 text-success shrink-0" />
                  <span><strong>Signature:</strong> Include your full name, Student ID, Intake, and Section.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" size={14} className="mt-0.5 text-success shrink-0" />
                  <span><strong>Official account:</strong> Always send from your official BUBT student email.</span>
                </li>
              </ul>
            </Card>

            {/* Campus Location */}
            <Card className="p-5">
              <div className="flex items-center gap-2">
                <Icon name="MapPin" size={18} className="text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-base font-bold text-ink">Campus Location</h2>
              </div>
              <p className="mt-2 text-sm text-ink-2">
                Bangladesh University of Business &amp; Technology (BUBT)
              </p>
              <p className="text-xs text-ink-3 mt-0.5">
                Rupnagar R/A, Mirpur-2, Dhaka-1216, Bangladesh.
              </p>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}

// ============================================================================
// Saved — this user's bookmarked teachers
// ============================================================================
export function SavedFaculty() {
  const { faculty, facultyBookmarks, departmentById, toggleFacultyBookmark, dataLoading } = useApp();
  const toast = useToast();

  const onToggleSave = async (id, name) => {
    const saved = facultyBookmarks.includes(id);
    const r = await toggleFacultyBookmark(id);
    if (!r.ok) toast({ type: "error", title: "Couldn't update", message: r.error });
    else toast({ type: "success", title: saved ? "Removed from saved" : "Saved", message: name });
  };

  const saved = sortFaculty(faculty.filter((f) => facultyBookmarks.includes(f.id)));

  return (
    <AppShell activeKey="faculty" title="Saved Teachers">
      <div className="mx-auto max-w-5xl">
        <button onClick={() => navigate("/faculty")} className="mb-4 inline-flex items-center gap-1.5 text-base font-semibold text-ink-3 hover:text-ink-2">
          <Icon name="ArrowLeft" size={16} /> Directory
        </button>
        <PageHeader title="Saved Teachers" subtitle="Teachers you've bookmarked — your shortlist of supervisors and contacts." />

        {dataLoading && faculty.length === 0 ? (
          <Loading />
        ) : saved.length === 0 ? (
          <EmptyState
            icon="Star"
            title="No saved teachers yet"
            message="Tap the star on any teacher to add them here."
            action={<Button onClick={() => navigate("/faculty")} icon="GraduationCap">Browse faculty</Button>}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {saved.map((f) => (
              <FacultyCard
                key={f.id}
                f={f}
                dept={departmentById(f.departmentId)}
                saved
                onToggleSave={() => onToggleSave(f.id, f.name)}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
