import React from "react";
import { Icon } from "./Icon.jsx";
import { Button, useToast } from "./ui.jsx";
import { useApp } from "../data/store.jsx";
import { navigate } from "../lib/router.jsx";

// ============================================================================
// Feature kit — shared building blocks for the campus features.
// Each feature has ONE signature accent (see `sector.*` tokens), used only for
// icon tiles + category badges. Chrome (brand primary) stays identical
// everywhere. Legacy hue tones keep Tailwind's palette with dark: variants.
// ============================================================================

// Full class strings so Tailwind's scanner picks them up.
// Sector keys (reports, blood, study…) are the app's per-feature accents.
const NEUTRAL_TILE = "bg-surface-2 text-ink border border-brd";
export const ACCENT_TILE = {
  sky: NEUTRAL_TILE,
  emerald: NEUTRAL_TILE,
  teal: NEUTRAL_TILE,
  violet: NEUTRAL_TILE,
  indigo: NEUTRAL_TILE,
  red: NEUTRAL_TILE,
  fuchsia: NEUTRAL_TILE,
  amber: NEUTRAL_TILE,
  blue: NEUTRAL_TILE,
  purple: NEUTRAL_TILE,
  slate: NEUTRAL_TILE,
  reports: NEUTRAL_TILE,
  lostfound: NEUTRAL_TILE,
  clubs: NEUTRAL_TILE,
  events: NEUTRAL_TILE,
  jobs: NEUTRAL_TILE,
  announce: NEUTRAL_TILE,
  study: NEUTRAL_TILE,
  bus: NEUTRAL_TILE,
  medical: NEUTRAL_TILE,
  market: NEUTRAL_TILE,
  ride: NEUTRAL_TILE,
  blood: NEUTRAL_TILE,
  directory: NEUTRAL_TILE,
  prayer: NEUTRAL_TILE,
  faculty: NEUTRAL_TILE,
  calendar: NEUTRAL_TILE,
  routines: NEUTRAL_TILE,
  coverpage: NEUTRAL_TILE,
  pdfmaker: NEUTRAL_TILE,
};

const NEUTRAL_SOFT = "bg-surface-2 border-brd";
export const ACCENT_SOFT = {
  sky: NEUTRAL_SOFT,
  emerald: NEUTRAL_SOFT,
  teal: NEUTRAL_SOFT,
  violet: NEUTRAL_SOFT,
  indigo: NEUTRAL_SOFT,
  red: NEUTRAL_SOFT,
  fuchsia: NEUTRAL_SOFT,
  amber: NEUTRAL_SOFT,
  purple: NEUTRAL_SOFT,
};

// Accent icon tile (matches the StatCard tile look). `icon` is a lucide name.
export function AccentTile({ icon, tone = "slate", size = 40, iconSize, className = "" }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-lg ${ACCENT_TILE[tone] || ACCENT_TILE.slate} ${className}`}
      style={{ width: size, height: size }}
    >
      <Icon name={icon} size={iconSize || Math.round(size * 0.5)} />
    </span>
  );
}

// ---------------------------------------------------------------------------
// Dhaka time helpers (the device clock may be in any tz; normalize to Dhaka).
// ---------------------------------------------------------------------------
export function dhakaParts(date = new Date()) {
  const f = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka", hour12: false,
    weekday: "short", year: "numeric", month: "short", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
  const p = {};
  f.formatToParts(date).forEach((x) => { p[x.type] = x.value; });
  return p;
}

export function nowDhakaMinutes() {
  const p = dhakaParts();
  return parseInt(p.hour, 10) * 60 + parseInt(p.minute, 10);
}

export function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function fmtTime(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function fmtCountdown(mins) {
  if (mins < 0) mins = 0;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

export function nextDeparture(times) {
  if (!times || times.length === 0) return null; // no departures → caller renders a fallback
  const now = nowDhakaMinutes();
  const sorted = [...times].map(toMinutes).sort((a, b) => a - b);
  for (const t of sorted) {
    if (t >= now) return { mins: t, wait: t - now, tomorrow: false };
  }
  const first = sorted[0];
  return { mins: first, wait: 24 * 60 - now + first, tomorrow: true };
}

export function minutesToHHMM(mins) {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// ৳ currency
export function taka(n) {
  return "\u09F3" + Number(n).toLocaleString("en-US");
}

// Build a wa.me link from a phone number. wa.me needs the number in FULL
// international form, digits only, no plus. Bangladeshi numbers are usually
// stored locally (01XXXXXXXXX) \u2014 that must become 8801XXXXXXXXX or WhatsApp
// shows an "invalid number" page. Returns null when there aren't enough digits.
export function waHref(phone) {
  let d = String(phone || "").replace(/[^0-9]/g, "");
  if (!d) return null;
  if (d.startsWith("00")) d = d.slice(2);                 // 00-prefixed intl
  if (d.startsWith("880")) { /* already international */ }
  else if (d.startsWith("0")) d = "880" + d.slice(1);     // BD local 01... -> 8801...
  else if (d.length === 10 && d.startsWith("1")) d = "880" + d; // 1XXXXXXXXX (missing 0)
  if (d.length < 11) return null;                          // too short to be real
  return `https://wa.me/${d}`;
}

// Open a compose window for an email address. Plain mailto: silently does
// nothing on desktop browsers with no configured mail app, so we use Gmail's
// web compose (opens for any Google session — this user base is Gmail-based).
// Returns null for a missing/invalid address so the caller can hide the button.
export function mailHref(email) {
  const e = String(email || "").trim();
  if (!e || !e.includes("@")) return null;
  // view=cm opens the normal Gmail inbox with a compose popup (no fs=1, which
  // would be the bare full-screen compose window).
  return `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(e)}`;
}

// MessageButton — opens an in-app DM from a transactional context instead of
// handing out a phone number (migration 0085). The server re-checks the
// relationship for `context`/`code` and issues a grant, so this works without
// the two students being connected first.
//
// Deliberately sits NEXT TO the WhatsApp link rather than replacing it: this is
// Bangladesh, plenty of students will still prefer WhatsApp, and only they know
// which is faster for them. Renders nothing for non-students (Staff/Admin have
// no conversations) or when the target is the viewer.
export function MessageButton({ context, code, targetId, label = "Message", variant = "primary", size = "sm", full = false }) {
  const { currentUser, openDmThread } = useApp();
  const toast = useToast();
  const [busy, setBusy] = React.useState(false);

  if (!targetId || currentUser?.role !== "Student" || targetId === currentUser?.id) return null;

  async function go() {
    if (busy) return;
    setBusy(true);
    try {
      const r = await openDmThread(context, code, targetId);
      if (!r.ok) { toast({ type: "error", title: "Couldn't open chat", message: r.error }); return; }
      navigate(`/messages/dm/${targetId}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button size={size} variant={variant} full={full} icon="MessagesSquare" loading={busy} onClick={go}>
      {label}
    </Button>
  );
}

// ---------------------------------------------------------------------------
// CGPA calculator — BUBT / UGC Bangladesh uniform grading scale. Shared by the
// public preview (Explore.jsx PublicCGPA) and the authed page (screens/cgpa).
// ---------------------------------------------------------------------------
export const GRADE_POINTS = [
  ["A+", 4.0], ["A", 3.75], ["A-", 3.5], ["B+", 3.25], ["B", 3.0],
  ["B-", 2.75], ["C+", 2.5], ["C", 2.25], ["D", 2.0], ["F", 0.0],
];
export const GRADE_MAP = Object.fromEntries(GRADE_POINTS);

// Credit-weighted GPA over `{ credit, grade }` rows; ignores rows with a
// non-positive/invalid credit or an unrecognized grade.
export function computeGpa(rows) {
  let qp = 0, cr = 0;
  for (const r of rows) {
    const c = parseFloat(r.credit);
    if (!Number.isFinite(c) || c <= 0) continue;
    const p = GRADE_MAP[r.grade];
    if (p === undefined) continue;
    qp += c * p;
    cr += c;
  }
  return { gpa: cr > 0 ? qp / cr : 0, totalCredits: cr };
}

export function useTick(ms = 30000) {
  const [, setN] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setN((n) => n + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
}


// CountdownBanner — hero "next X" banner used by Bus + Prayer.
export function CountdownBanner({ tone = "sky", icon, eyebrow, title, time, waitMins, tomorrow, meta, right }) {
  useTick();
  return (
    <div className={`relative overflow-hidden rounded-xl border ${ACCENT_SOFT[tone]} p-5 sm:p-6`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <AccentTile icon={icon} tone={tone} size={48} />
          <div>
            {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.06em] text-ink-3">{eyebrow}</p>}
            <p className="mt-0.5 text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</p>
            {meta && <p className="mt-1 text-base text-ink-2">{meta}</p>}
          </div>
        </div>
        <div className="sm:text-right">
          {time && <p className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{time}</p>}
          {waitMins != null && (
            <p className="mt-0.5 text-base font-semibold text-ink-3">
              {tomorrow ? "tomorrow · " : "in "}{fmtCountdown(waitMins)}
            </p>
          )}
          {right}
        </div>
      </div>
    </div>
  );
}

// SegmentToggle — segmented control (To Campus / From Campus, Find / Offer…).
export function SegmentToggle({ options, value, onChange, className = "" }) {
  return (
    <div className={`inline-flex rounded-md border border-brd bg-surface p-1 ${className}`}>
      {options.map((opt) => {
        const val = typeof opt === "string" ? opt : opt.value;
        const label = typeof opt === "string" ? opt : opt.label;
        const active = value === val;
        return (
          <button
            key={val}
            onClick={() => onChange(val)}
            className={`inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-base font-semibold transition-colors ${
              active ? "bg-brand text-white shadow-sm" : "text-ink-2 hover:bg-surface-2"
            }`}
          >
            {typeof opt !== "string" && opt.icon && <Icon name={opt.icon} size={15} />}
            {label}
          </button>
        );
      })}
    </div>
  );
}

