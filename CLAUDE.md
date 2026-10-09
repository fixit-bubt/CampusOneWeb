# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project

CampusOne (formerly FixIt) is a comprehensive campus management and daily campus-life web application for BUBT (Bangladesh University of Business & Technology). It serves Student, Staff, and Admin roles.
Stack: React 18 + Vite 6 + Tailwind CSS on the frontend, Supabase (Postgres 15 + Auth + Row-Level Security + Storage + Edge Functions) on the backend. Deployed automatically on Vercel from `main`. Sibling to the CampusOne React Native/Expo Android app.

## Commands

```bash
npm.cmd run dev       # http://localhost:5173 (Windows powershell: always use npm.cmd)
npm.cmd run build     # production build (vite build)
npm.cmd run preview   # preview production build
```

There is no test suite and no lint script configured in this repo.

### Environment

Copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` from the Supabase project API settings. The anon key is safe client-side; never commit the service_role key.

### Database Migrations

Numbered, sequential SQL files in `supabase/migrations/` (0001–0087) define schema and RLS policies.
To apply a migration to the live project: `supabase db query --linked --file supabase/migrations/00NN_name.sql`.
**Never** run `supabase db push` — the sequential filenames do not match remote migration timestamp format.

**Do not use the `mcp__supabase__*` tools for this project.** The Supabase MCP server configured in this environment points at an unrelated client project (`evergreen`).

## Architecture

### Single Data Layer Pattern

No screen talks to Supabase directly. Every screen reads and writes through one React context, `useApp()`, exposed by `src/data/store.jsx` (~3.5k lines):

```
Screen Component  →  useApp()  →  src/data/store.jsx  →  Supabase (Postgres + Auth + Storage)
```

- `store.jsx` owns auth session, loads user profiles, and exposes `currentUser` (role-normalized).
- Row-Level Security returns only authorized rows; `store.jsx` does not re-filter client-side.
- Model mappers (`toUser`, `toReport`, `toItem`, `toListing`, etc.) convert database snake_case to UI camelCase.

### Routing & Navigation Architecture

`src/lib/router.jsx` is a lightweight hash router (`useHashRoute`, `navigate`, `matchRoute`, `<Link>`). All routes are registered in `src/App.jsx`, protected by `<RequireAuth>` and `<RequireRole role="...">`.

- Desktop Navigation (`xl` breakpoint and up): Floating capsule pill centered at top of viewport.
- Mobile Navigation (< `xl` breakpoint):
  - **Sticky Top Header (`h-11`)**: 3-line hamburger menu button on left, centered two-tone `CampusOne` branding (`Campus` + emerald `One`) with tagline (`Full campus in one app`), and notification bell on right.
  - **Bottom Navigation Bar**: 5 primary tabs: Home (`/dashboard`), Study Hub (`/study-hub`), AI Orb (`/chatbot`), Academic Tools (`/tools`), and Profile (`/profile`).

### Academic Tools & Study Hub
- `#/tools` (`AcademicTools.jsx`): Central academic utility directory linking Cover Page Generator, CGPA Calculator, Class Routines, and Tri-Semester Academic Calendar.
- `#/study-hub` (`StudyHub.jsx`): Clean, unified student view with real-time course search, accurate material/question/book aggregates, and streamlined tabbed content views without redundant filter rows.

### Chat / AI Assistant

`src/screens/chatbot/chatCore.jsx` is a shared engine driving both the full `/chatbot` page and the floating `ChatWidget` mounted in `App.jsx`. Text-first, clean message bubbles, and compact composer. Communicates with Google Gemini via Supabase Edge Function `chat`.

### Design System & Theming

- `src/index.css` provides CSS variable tokens (`ink`, `surface`, `brd`, `brand`, etc.) for both light and dark themes.
- `src/components/ui.jsx` provides shared UI primitives (Button, Input, Modal, Card, Badge, Spinner).
- `src/i18n/` (`en.js` / `bn.js`) provides bilingual localization.

## Operational Notes

- Commit messages: keep `-m` bodies short, single-line, and free of quotes or parentheses.
- No AI footprints: Never append `Co-Authored-By: Claude`, `Co-Authored-By: Antigravity`, or any AI trailer.
- Push policy: Never run `git push` unless explicitly asked by the user with the word "push".
- Synchronized memory updates: When asked to "update memorys" (or "update memories"), update all memory documents (`AGENTS.md`, `agent.md`, and `CLAUDE.md`) across the repository.
