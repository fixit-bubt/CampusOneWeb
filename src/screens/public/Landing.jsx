import React from "react";
import {
  ArrowRight, GraduationCap, ClipboardList, Search, CalendarDays, Store, Stethoscope,
  Moon, FileText, Calculator, Bus, Clock, Megaphone, Calendar, ExternalLink,
  BookMarked, Car, Droplet, UsersRound, Briefcase, Sparkles, Users, MessagesSquare,
} from "lucide-react";
import { navigate } from "../../lib/router.jsx";
import { Button, Badge, Card } from "../../components/ui.jsx";
import { Logo } from "../../components/Brand.jsx";
import { ACCENT_TILE } from "../../components/featureKit.jsx";
import { PublicNav } from "./Explore.jsx";
import { ScrollVelocityRow } from "../../components/ui/scroll-velocity-text";
import BorderButton from "../../components/ui/subtle-button";
import { BUBT_LOGO_CREST } from "../coverpage/logos.js";
import campusPhoto from "../../assets/bubt-campus.jpg";
import heroVideo from "../../assets/hero-bg.mp4";
import { useT } from "../../i18n/index.js";

// All public features that can be used without creating an account (10 items)
const NO_LOGIN_FEATURES = [
  { label: "Bus Schedule", path: "/explore/bus", icon: Bus },
  { label: "Cover Page", path: "/explore/cover-page", icon: FileText },
  { label: "CGPA Calculator", path: "/explore/cgpa", icon: Calculator },
  { label: "Prayer Times", path: "/explore/prayer", icon: Moon },
  { label: "Faculty Directory", path: "/explore/faculty", icon: GraduationCap },
  { label: "Class Routines", path: "/explore/routines", icon: Clock },
  { label: "Campus Events", path: "/explore/events", icon: CalendarDays },
  { label: "Campus Notices", path: "/explore/announcements", icon: Megaphone },
  { label: "Academic Calendar", path: "/explore/calendar", icon: Calendar },
  { label: "BUBT Annex", path: "https://annex.bubt.edu.bd", icon: ExternalLink, external: true },
];

// All authenticated features that require user login to access (12 items)
const LOGIN_FEATURES = [
  { Icon: ClipboardList, tone: "reports", title: "Campus Issues & Maintenance", body: "Flag a broken light, a leaking tap, or dead Wi-Fi in seconds, then track it from Open to Resolved." },
  { Icon: Search, tone: "lostfound", title: "Lost & Found", body: "Post what you've lost or found, browse the board, and claim items safely with proof." },
  { Icon: BookMarked, tone: "study", title: "Study Hub", body: "Find and download class notes, slides, and exam materials organized by department, intake, and section." },
  { Icon: Store, tone: "market", title: "Student Marketplace", body: "Buy and sell course books, calculators, drawing tools, and electronics with other students on campus." },
  { Icon: Car, tone: "ride", title: "Campus Rides", body: "Find or offer rides with classmates heading your way, share the route, and save on daily travel." },
  { Icon: Droplet, tone: "blood", title: "Blood Donation", body: "Find donors by blood group quickly during emergencies, or register as a donor to help fellow students." },
  { Icon: UsersRound, tone: "clubs", title: "Clubs & Communities", body: "Explore campus clubs, submit membership applications, and follow club notices and events." },
  { Icon: Briefcase, tone: "jobs", title: "Jobs & Internships", body: "Browse on-campus part-time jobs, internships, and student openings with clear deadlines." },
  { Icon: Sparkles, tone: "reports", title: "Fixi AI Assistant", body: "Ask quick questions about bus routes, class routines, prayer times, and university info anytime." },
  { Icon: Users, tone: "directory", title: "Student Directory", body: "Search for classmates across departments and intakes, send connection requests, and stay in touch." },
  { Icon: MessagesSquare, tone: "announce", title: "Peer Messages", body: "Chat directly with connected classmates about group projects, coursework, and campus life." },
  { Icon: Stethoscope, tone: "medical", title: "Medical Center", body: "Browse campus doctors, their specialties, and visiting hours for walk-in consultations at the clinic." },
];

const STATS = [
  { value: "400+", label: "Faculty profiles" },
  { value: "13", label: "Departments" },
  { value: "12+", label: "Campus tools" },
];

const CAMPUS_FEATURES = [
  "Bus Schedules",
  "Study Hub",
  "Lost & Found",
  "Fixi AI Assistant",
  "Faculty Directory",
  "Campus Maintenance",
  "Student Marketplace",
  "Blood Donation",
  "Campus Rides",
  "Prayer Times",
  "Clubs & Communities",
  "Events & Notices",
  "Student Jobs",
  "CGPA Calculator",
  "Cover Page Generator",
  "Medical Center",
];

export default function Landing() {
  const t = useT();
  return (
    <div className="min-h-screen bg-surface">
      {/* Shared with explore pages — fixed overlay that stays pinned on screen while scrolling */}
      <PublicNav overlay />

      {/* Hero — Always dark mode with dark video veil and light/crisp accents.
          Lower sections respond to light/dark mode normally. */}
      <section className="dark relative flex min-h-[100dvh] flex-col justify-between overflow-hidden bg-black text-white">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={campusPhoto}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-center"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        {/* Fixed cinematic dark veil so hero is always dark */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/60 to-black/95 pointer-events-none" />
        <div className="hero-glow absolute inset-0 pointer-events-none" />

        {/* Top clearance for overlaid fixed capsule */}
        <div className="h-24 shrink-0 sm:h-28 md:h-24" />

        {/* Hero content centered within viewport height */}
        <div className="relative mx-auto my-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 py-4 sm:py-6">
          <div className="mx-auto max-w-2xl text-center">
            {/* BUBT Logo X CampusOne Branding (No capsule, no bg, larger, text only) */}
            <div className="flex items-center justify-center gap-3.5 sm:gap-5 md:gap-6 mb-5 sm:mb-7 select-none">
              {/* BUBT Logo without bg */}
              <img
                src={BUBT_LOGO_CREST}
                alt="BUBT Logo"
                className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 object-contain drop-shadow-xl"
              />

              {/* X separator */}
              <span className="text-xl sm:text-2xl md:text-3xl font-light text-white/50">
                ✕
              </span>

              {/* CampusOne Text Only */}
              <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                Campus<span className="text-emerald-400">One</span>
              </span>
            </div>

            <h1 className="text-[34px] leading-[1.08] font-extrabold tracking-tight text-white sm:text-[48px] md:text-[56px]">
              {t.landing.heroTitle1}
              <br />
              <span className="bg-gradient-to-r from-[#5b85f7] via-[#818cf8] to-sector-clubs bg-clip-text text-transparent">
                {t.landing.heroTitle2}
              </span>
            </h1>

            <p className="mx-auto mt-3.5 sm:mt-5 max-w-xl text-base leading-relaxed text-zinc-300 sm:text-lg md:text-xl">
              {t.landing.heroBody}
            </p>

            <div className="mt-6 sm:mt-8 flex flex-col items-center justify-center">
              <BorderButton onClick={() => navigate("/register")}>
                {t.landing.getStarted}
              </BorderButton>
              <button
                type="button"
                onClick={() => document.getElementById("explore-without-account")?.scrollIntoView({ behavior: "smooth" })}
                className="mt-3.5 sm:mt-4 text-sm sm:text-base font-semibold text-zinc-300 hover:text-white hover:underline transition-colors cursor-pointer"
              >
                {t.landing.browseFaculty}
              </button>
            </div>

            {/* Stats (normal text, no capsule) */}
            <div className="mt-6 sm:mt-10 mb-2 flex flex-wrap items-center justify-center gap-x-8 sm:gap-x-12 gap-y-3">
              {STATS.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">{s.value}</div>
                  <div className="mt-0.5 text-xs sm:text-sm font-medium text-zinc-400">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Moving features at the bottom of hero section */}
        <div className="relative w-full bg-transparent py-3 sm:py-4 overflow-hidden select-none">
          <ScrollVelocityRow baseVelocity={0.8}>
            {CAMPUS_FEATURES.map((feature) => (
              <span
                key={feature}
                className="mx-4 sm:mx-6 font-semibold text-sm sm:text-base tracking-wide text-zinc-300/80 hover:text-white transition-colors cursor-default"
              >
                {feature}
                <span className="mx-4 sm:mx-6 text-zinc-500">•</span>
              </span>
            ))}
          </ScrollVelocityRow>
        </div>
      </section>

      {/* No-account grid — all public features readable without creating an account */}
      <section id="explore-without-account" className="scroll-mt-24 border-t border-brd bg-bg">
        <div className="mx-auto max-w-7xl px-6 2xl:max-w-[96rem] py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">No account needed</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Try it before you sign up
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-ink-2">
              These pages are open to everyone - no login required.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5">
            {NO_LOGIN_FEATURES.map((l) => {
              const NavIcon = l.icon;
              return (
                <button
                  key={l.label}
                  onClick={() => l.external ? window.open(l.path, "_blank", "noopener,noreferrer") : navigate(l.path)}
                  className="flex flex-col items-center gap-2.5 rounded-xl border border-brd bg-surface p-5 text-center transition-all duration-200 hover:-translate-y-1 hover:border-brd-2 hover:shadow-lg cursor-pointer"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand dark:bg-brand-50/15">
                    <NavIcon size={22} />
                  </span>
                  <span className="text-sm font-bold text-ink">{l.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features requiring login */}
      <section className="border-t border-brd bg-bg">
        <div className="mx-auto max-w-7xl px-6 2xl:max-w-[96rem] py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">Everything on campus</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              One login. Every campus service.
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-ink-2">
              All in-app services accessible with your verified BUBT student or staff account.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-8">
            {LOGIN_FEATURES.map((f) => {
              const FeatureIcon = f.Icon;
              return (
                <Card
                  key={f.title}
                  className="p-6 transition-all duration-200 hover:-translate-y-1 hover:border-brd-2 hover:shadow-lg"
                >
                  <span className={`flex h-11 w-11 items-center justify-center rounded-md ${ACCENT_TILE[f.tone]}`}>
                    <FeatureIcon size={22} />
                  </span>
                  <h3 className="mt-5 text-xl font-bold text-ink">{f.title}</h3>
                  <p className="mt-2 text-base leading-relaxed text-ink-2">{f.body}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="border-t border-brd bg-bg">
        <div className="mx-auto max-w-7xl px-6 2xl:max-w-[96rem] pb-16 sm:pb-20">
          {/* Fixed brand hues (not tokens) so white text keeps contrast in both themes. */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2b5be3] to-[#1f47c4] px-6 py-12 text-center sm:py-14">
            <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-20 -left-12 h-64 w-64 rounded-full bg-white/5" />
            <h2 className="relative text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-lg leading-relaxed text-white/80">
              Create an account and get your whole campus in one place: issues, faculty, buses, market, and more.
            </p>
            <button
              onClick={() => navigate("/register")}
              className="relative mt-7 inline-flex h-11 items-center gap-2 rounded-md bg-white px-6 text-base font-bold text-[#1f47c4] transition-colors hover:bg-white/90"
            >
              Create your account
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-brd bg-surface">
        <div className="flex flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <Logo size="sm" />
          <p className="text-base text-ink-3">© 2026 CampusOne · Bangladesh University of Business &amp; Technology</p>
        </div>
      </footer>
    </div>
  );
}
