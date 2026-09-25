# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

FixIt is a campus management web app for BUBT (Bangladesh University of Business & Technology): campus issue reporting, Lost & Found, and a growing set of campus-life features (Study Hub, Clubs, Jobs, Marketplace, Messaging, an AI chatbot, etc.) for Student / Staff / Admin roles. Stack: React 18 + Vite 6 + Tailwind CSS on the frontend, Supabase (Postgres + Auth + Row-Level Security + Storage + one Edge Function) on the backend. Deployed on Vercel from `main`.

## Commands

```bash
npm run dev       # http://localhost:5173
npm run build     # production build (vite build)
npm run preview   # preview the production build
```

There is no test suite and no lint script configured in this repo.

### Environment

Copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` from the Supabase project's API settings. The anon/publishable key is safe client-side; never commit the service_role key.

### Database migrations

Numbered, sequential SQL files in `supabase/migrations/` (currently 0001–0086) define both the schema and the RLS policies — this is a security-first app where access rules are enforced in the database, not just hidden in the UI.

To apply a new migration to the live project: `supabase db query --linked --file supabase/migrations/00NN_name.sql` (uses the existing CLI auth, no DB password needed). **Never** run `supabase db push` — the migration filenames (`00NN_...`) don't match what the CLI expects for its remote migration history, so it treats everything as pending and will misfire.

**Do not use the `mcp__supabase__*` tools for this project.** The Supabase MCP server configured in this environment points at a different, unrelated client project — using it against FixIt work would read or write the wrong database.

## Architecture

### Single data layer

No screen talks to Supabase directly. Every screen reads and writes through one React context, `useApp()`, exposed by `src/data/store.jsx` (~3.5k lines — the one place that knows about Supabase):

```
Screen  →  useApp()  →  src/data/store.jsx  →  Supabase (Postgres + Auth + Storage)
```

- `store.jsx` owns the auth session, loads the signed-in user's profile, and exposes `currentUser` (role-normalized) that drives routing and nav.
- Row-Level Security returns only the rows a given user may see; `store.jsx`'s loaders assume this and don't re-filter client-side.
- Mutations are async functions on the context (`createReport`, `assignReport`, `addClaim`, `setClaimStatus`, …) that write to Supabase and refresh local lists.
- DB rows use snake_case / lowercase enums; `store.jsx` has `toUser`/`toReport`/etc. mappers that convert to the camelCase, capitalized-role shape the UI expects — new tables should follow this same mapper pattern rather than leaking raw row shapes into screens.

### Routing

`src/lib/router.jsx` is a minimal hash router (`useHashRoute`, `navigate`, `matchRoute` with `:params`, `<Link>`) — not react-router. All routes are registered as an explicit if-chain in `src/App.jsx`, gated by two wrapper components:

- `RequireAuth` — any signed-in user.
- `RequireRole role="Student|Staff|Admin"` — redirects to the caller's own dashboard if the role doesn't match.

Route order matters: literal paths (`/jobs/new`, `/faculty/saved`) must be checked before parameterized siblings (`/jobs/:id`, `/faculty/:id`). A signed-in Student with no `studentId` is hard-gated to the `Onboarding` screen before any route renders. The authenticated route table (`AuthedRoutes`) renders inside one persistent `AppLayout` (`src/components/AppShell.jsx`) so the nav and its scroll position survive navigation instead of remounting per screen.

### Navigation UI

`AppShell.jsx` renders a floating nav **capsule** (not a sidebar — that was removed; see route table above) that appears from the `xl` breakpoint up, with a mobile drawer below it. Nav items are role-filtered via `NAV_BY_ROLE`/`navKeysForRole()` in `AppShell.jsx` — dashboard widgets and other role-conditional UI should reuse `navKeysForRole()` rather than re-deriving their own per-role list, so they can't drift from what's actually in the nav.

### Screens

`src/screens/` is organized by domain (`student/`, `staff/`, `admin/`, `lostfound/`, `messages/`, `studyhub/`, `clubs/`, `jobs/`, `chatbot/`, `pdfmaker/`, `public/` for logged-out pages, etc.), each domain generally exporting several route components from one file (e.g. `screens/marketplace/Marketplace.jsx` exports `Marketplace`, `ListingDetail`, `ListingForm`, `MyListings`). `src/screens/public/Explore.jsx` holds the no-login "explore" variants of several features (faculty, events, calendar, CGPA, …) that mirror an authenticated screen but read public RLS-readable data.

`PdfMaker` is the one `React.lazy`-loaded screen (pulls in `pdf-lib` + `pdf.js`, ~500KB gzipped) — keep new heavy, rarely-used screens on the same pattern rather than growing the main bundle. Note pdf.js renders on the main thread (DOM-bound) while pdf-lib work happens in a worker; `vite.config.js` copies pdf.js's `standard_fonts`/`cmaps` assets with `rename: { stripBase: true }` — without that the fonts 404 silently and PDFs render blank text.

### Chat / AI assistant

`src/screens/chatbot/chatCore.jsx` is a shared engine driving **both** the full `/chatbot` page and the floating `ChatWidget` (mounted as a sibling of routed content in `App.jsx` so its conversation survives navigation) — never fork the two; extend `chatCore.jsx` instead. It talks to the `chat` Supabase Edge Function (`supabase/functions/chat/index.ts`) via `src/lib/chatbotApi.js`.

### i18n and theming

`src/i18n/` (`en.js`/`bn.js`) and `src/lib/theme.js` + `ThemeToggle`/`LanguageToggle` components provide app-wide language (English/Bangla) and light/dark theme switching.

### Design system

`src/components/ui.jsx` holds the shared primitives (Button, Input, Modal, Card, Badge, Spinner, …); `src/components/featureKit.jsx` holds cross-feature helpers reused by multiple domain screens (e.g. `waHref()` for BD-local → international WhatsApp links, `mailHref()` for Gmail-compose links) — check there before adding a one-off version of something that looks generic.

## Operational notes

- This is a solo SDP (senior design project) repo with a small set of contributors whose git identity is remapped for attribution purposes; don't infer team structure from `git log` alone without checking recent context.
- Commit messages: keep `-m` bodies short, single-line, and free of parentheses/quotes — long or punctuation-heavy multi-line bodies have broken PowerShell arg passing and tripped the commit-safety classifier in this environment before.
- A sibling React Native/Expo app ("CampusOne") shares this project's exact Supabase backend and is a useful reference for expected behavior when this web client's behavior is in doubt, but it lives in a separate repo.
- Synchronized memory updates: When asked to "update memorys" (or "update memories"), update and keep all memory documents (AGENTS.md and agent.md across root and fixit-campus/, plus CLAUDE.md) fully synchronized with latest architecture, schema, and mobile parity details.

