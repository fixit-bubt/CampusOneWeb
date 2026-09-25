# AGENTS.md — FixIt Campus Web Engineering & Knowledge Reference

This document is the single, authoritative reference for any AI agent or developer working on the **FixIt — Campus Management** web repository. It synthesizes all project memory, live code patterns, database schemas, environment constraints, and engineering workflows.

---

## 1. Executive Summary & Project Purpose

- **Project:** FixIt — Campus Management (Web Application)
- **Institution:** Bangladesh University of Business & Technology (BUBT), Dhaka, Bangladesh
- **Academic Context:** Senior Design Project (SDP IV) / Final Year Capstone Project
- **Live Production URL:** [https://fixit-campus-theta.vercel.app](https://fixit-campus-theta.vercel.app) (auto-deployed from `main`)
- **Git Remote:** `https://github.com/fixit-bubt/fixit-campus.git` (branch: `main`)
- **Sibling Mobile App:** [CampusOne](https://github.com/fixit-bubt/CampusOneAndroid.git) (React Native 0.85 + Expo SDK 56 Android app). Both clients share the **exact same Supabase backend** and database tables.
- **Core Purpose:** Comprehensive campus management and daily campus-life platform for BUBT students, faculty, and administrative staff:
  - Infrastructure issue reporting & maintenance dispatch
  - Anonymous "Campus Issues" public board with "Me too" vote counting
  - Student-to-student Lost & Found with claims verification
  - Peer-to-peer Marketplace (books, devices, course-code tagged items)
  - Student Ride Sharing with route planning & seat reservations
  - Blood Donation registry with 90-day eligibility enforcement & urgent pledges
  - Open Department-wide Study Hub (lecture notes, exam question banks, reference books)
  - Club Hub (directory, membership join requests, posts, executive roles)
  - Campus Events & RSVP tracking
  - Campus-wide Jobs & Internships board with bookmarks and circular PDFs
  - Realtime student-to-student DMs and club/section group chat
  - In-App DM context grants (chat directly from listings, rides, claims, blood pledges)
  - AI Assistant chatbot powered by Google Gemini (full page + persistent floating widget)
  - Client-side PDF Maker (photos to PDF, merge, organize, compress)
  - Public no-login explore pages (Faculty, Events, Bus, Prayer, Routines, Calendar, Cover Page, CGPA)
  - Academic tools: Tri-semester Academic Calendar, class & exam routines, Cover Page generator, CGPA calculator

---

## 2. Repositories, Environments & Backend Reference

### 2.1 Git Remotes & Branching
- **Active Web Repo:** `https://github.com/fixit-bubt/fixit-campus.git` (`main` branch)
- **Local Working Directory:** `c:\Users\dracu\Desktop\fix it sdp\fixit-campus`
- **Deployment:** Vercel automatically builds and deploys every push to `main`.
- **Branch Protection:** `main` has PR protection enabled in GitHub; programmatic pushes in this environment use admin bypass.

### 2.2 Supabase Backend Configuration
- **Project Ref:** `xhgpxvyqrufbbuivttmi`
- **Dashboard Project Name:** `fixit-campus`
- **Region:** `ap-south-1`
- **API URL:** `https://xhgpxvyqrufbbuivttmi.supabase.co`
- **Anon Key:** Configured in `src/lib/supabase.js` via `VITE_SUPABASE_ANON_KEY` (safe for browser client bundle). Never commit the `service_role` key.
- **CLI Link:** The local Supabase CLI is authenticated and linked directly to project `xhgpxvyqrufbbuivttmi`.

### 2.3 ⛔ ABSOLUTE OFF-LIMITS PROHIBITION: The "Evergreen" Client Project
- **HARD RULE:** The project named `evergreen` / `evergreenweb` (Supabase ref `btdbqnzbyozlnbeddkrk`) is a completely separate client's medical/telemedicine production database with real patient data.
- **NEVER** use the Supabase MCP tools in this repository if they point to `btdbqnzbyozlnbeddkrk`.
- **NEVER** inspect, read, query, migrate, alter, or touch any filesystem directory, git branch, or Supabase project containing `evergreen`.

---

## 3. Critical Non-Negotiable Workflow Rules

### 3.1 Git & Commit Integrity
1. **NO AI Footprint / Attribution:** NEVER append `Co-Authored-By: Claude`, `Co-Authored-By: Antigravity`, or any AI/Anthropic/Google trailer to git commit messages. The repository author must remain strictly the student user.
2. **NO UNPROMPTED GIT PUSH:** **Never run `git push` unless the user explicitly types "push" in their instruction.** Multiple agents and the user operate across this codebase; premature pushing causes remote race conditions and overwrites.
3. **Short, Single-Line Commit Messages:** Keep `-m` messages short, single-line, and free of quotes or parentheses. Multi-line punctuation-heavy commit messages break PowerShell argument passing and trip safety classifiers.
4. **Attribution Integrity:** Solo SDP project with team commit remapping for academic submission. Never infer individual team workload solely from raw `git log`.

### 3.2 Code Craft & "No AI Tells"
University faculty actively scrutinize the source code for signs of AI generation:
1. **NO AI Header Comments:** Never write comments like `// Matches design...`, `// Web parity pass`, `// Showcase`, `// Real devs do X`.
2. **NO Box-Drawing Dividers:** Avoid ASCII decorative banners like `// ──────── Section ────────`.
3. **NO Em-Dashes in UI Copy:** Never use `—` in user-facing labels or toasts. Use standard hyphens `-`, commas `,`, or periods `.`. (Middle dots `·` for metadata separators and ellipses `…` are acceptable).
4. **Terse, Human Comments:** Document only non-obvious architecture constraints, security boundaries, or browser quirks.

### 3.3 Windows PowerShell Execution Quirk
- On this system, running raw `.ps1` scripts is disabled by execution policy (`PSSecurityException`).
- Always run npm commands via `npm.cmd` (e.g., `npm.cmd run build`, `npm.cmd run dev`) or `npx.cmd`.

---

## 4. Tech Stack & Dependencies

| Layer | Technology | Version / Key Details |
|---|---|---|
| **Runtime / Build** | Vite 6 + Node.js | Fast ESM bundler; code-split chunks; static asset copying |
| **UI Framework** | React 18 | Functional components, hooks, React.lazy + Suspense |
| **Styling** | Tailwind CSS v3 | Custom CSS variable tokens, `darkMode: "class"`, Plus Jakarta Sans + Hind Siliguri |
| **Icons** | Lucide React | `lucide-react` icons styled with semantic colors & sector tokens |
| **Routing** | Custom Hash Router | `src/lib/router.jsx` (`useHashRoute`, `navigate`, `matchRoute`) |
| **State & Data Layer** | React Context (`useApp`) | Centralized data store in `src/data/store.jsx` (~3.5k lines) |
| **Backend & Auth** | Supabase JS v2.49.1 | Postgres 15, Auth (PKCE flow), Storage, Realtime Broadcast, Edge Functions |
| **AI Assistant** | Google Gemini | `gemini-flash-lite-latest` via Supabase Edge Function `chat` + SSE stream |
| **PDF Processing** | `pdf-lib` + `pdf.js` | Client-side only; web worker for assembly + DOM-bound worker for rasterizing |
| **Localization** | Custom i18n (`useT`) | `src/i18n/` with English (`en.js`) and Bengali (`bn.js`) dictionaries |

---

## 5. Architecture & Single Data Layer

### 5.1 The Single Data Layer Pattern (`store.jsx`)
No screen component ever imports or calls `supabase` directly (with the sole exception of public explore pages reading public anon-granted data). Every screen reads state and dispatches mutations through the custom hook `useApp()`, provided by `src/data/store.jsx`:

```
Screen Component  →  useApp()  →  src/data/store.jsx  →  Supabase (Postgres + Auth + Storage)
```

- **Session Ownership:** `store.jsx` manages `currentUser`, loads profiles, listens to `onAuthStateChange`, and exposes role-normalized objects.
- **Row-Level Security Assumption:** Loaders do not re-filter data client-side; they rely strictly on Postgres RLS returning only authorized rows.
- **Model Normalization Mappers:** Database rows use `snake_case` with lowercase enums; `store.jsx` uses mapper functions (`toUser`, `toReport`, `toItem`, `toCampusIssue`, `toListing`, `toRide`, etc.) to produce `camelCase` properties with capitalized roles (`Student`, `Staff`, `Admin`). New features MUST follow this mapper convention.

### 5.2 Context State & Methods Index
Key properties and functions provided by `useApp()`:
- **Auth:** `currentUser`, `sessionUserId`, `loading`, `dataLoading`, `login`, `loginWithGoogle`, `register`, `logout`, `createUser`, `requestPasswordReset`, `resetPasswordWithCode`, `verifySignupCode`.
- **Reports:** `reports`, `createReport`, `updateReport`, `setReportStatus`, `assignReport`, `deleteReport`.
- **Campus Issues Board:** `campusIssues`, `reloadCampusIssues`, `toggleReportVote`, `setReportBoardVisibility`, `reportVoteCounts`.
- **Lost & Found:** `items`, `claims`, `addItem`, `updateItem`, `deleteItem`, `addClaim`, `setClaimStatus`, `getContact`, `getProofUrl`.
- **Messaging & DMs:** `messages`, `dmPartners`, `unreadByConv`, `totalUnreadMessages`, `sendMessage`, `editMessage`, `removeMessage`, `openDmThread`, `blockUser`, `unblockUser`.
- **Marketplace & Rides:** `listings`, `addListing`, `updateListing`, `deleteListing`, `markListingSold`, `getListingContact`, `rides`, `addRide`, `requestSeat`, `deleteRide`, `getRideContact`.
- **Blood Donation:** `bloodRequests`, `donors`, `addBloodRequest`, `pledgeBlood`, `registerDonor`, `getDonorContact`, `getBloodRequesterContact`, `markDonatedToday`, `getBloodResponders`, `confirmBloodDonation`, `markBloodRequestFulfilled`.
- **Study Hub:** `studyIntakes`, `studySections`, `studyCourses`, `studyMaterials`, `studyQuestionBank`, `studyBooks`, `studyBookmarks`, `uploadStudyMaterial`, `uploadStudyQB`, `addStudyBook`, `toggleStudyBookmark`.
- **Clubs & Jobs:** `clubs`, `clubMembers`, `clubPosts`, `requestJoinClub`, `jobs`, `jobBookmarks`, `canPostJobs`, `addJob`, `toggleJobBookmark`.

---

## 6. Routing, Navigation & Layout Architecture

### 6.1 Minimal Hash Router (`src/lib/router.jsx`)
The application uses a lightweight, zero-dependency hash router rather than `react-router-dom`:
- Routes are formatted as `#/path` (e.g., `#/dashboard`, `#/reports/new`).
- **Hook:** `useHashRoute()` returns the sanitized route path without `#`.
- **Navigation:** `navigate(to)` updates `window.location.hash`.
- **Pattern Matching:** `matchRoute("/resource/:id", path)` extracts parameters into an object `{ id: "..." }`.

### 6.2 Route Matching Rules in `src/App.jsx`
- **Literal Before Parameterized:** Literal paths (`/jobs/new`, `/jobs/saved`, `/jobs/moderate`, `/faculty/saved`) MUST precede parameterized routes (`/jobs/:id`, `/faculty/:id`).
- **Access Guards:**
  - `<RequireAuth>`: Ensures `currentUser` is truthy; otherwise redirects to `#/login`.
  - `<RequireRole role="Student|Staff|Admin">`: Redirects unauthorized roles to their respective role dashboard.
- **Mandatory Student Onboarding Gate:**
  A signed-in Student who lacks a `studentId` is hard-gated to `<Onboarding />` before any authenticated route can render. Staff and Admins bypass onboarding.

### 6.3 Floating Nav Capsule & Responsive Shell (`AppShell.jsx`)
- **Nav Capsule:** The classic vertical sidebar was eliminated. Desktop navigation renders inside a floating horizontal capsule pill centered at the top of the viewport.
- **CRITICAL Breakpoint is `xl` (≥ 1280px):**
  - At `xl` and above: Floating capsule displays logo, grouped menu dropdowns (`Academics`, `Campus Life`, `Community`, `Services`, `Manage`), and account profile controls.
  - Below `xl` (< 1280px): The layout automatically collapses into a hamburger trigger with an off-canvas drawer.
  - **LOAD-BEARING RULE:** Never use `lg` for the capsule breakpoint! At `lg` (1024px), Admin nav items overflow horizontally and intercept clicks intended for the account dropdown.
  - **LOAD-BEARING RULE:** Never set `overflow-hidden` or `overflow-x-auto` on the nav container element. Any overflow setting clips the dropdown panels that hang below the bar, rendering them completely invisible.
- **Sticky Offsets:** Top floating capsule consumes 84–88px of vertical clearance. Sticky elements (e.g., CoverPage preview, public CGPA cards) must use `top-24` or higher to clear the capsule.

---

## 7. Design System, Tokens & UI Components

### 7.1 Typography
Configured in `src/index.css` via `@fontsource/plus-jakarta-sans` and `@fontsource/hind-siliguri`:
- **Primary Latin Font:** Plus Jakarta Sans (400, 500, 600, 700, 800)
- **Bengali Script Font:** Hind Siliguri (400, 500, 600, 700) with adjusted line-height (`~1.6`) for matras
- **Heading Styles:** 700/800 font weight with tight letter tracking (`-0.02em` on h1).
- **Uppercase Labels:** 700 font weight with tracking `+0.06em`.

### 7.2 Color Tokens & CSS Variables
Styles strictly flow through CSS custom variables in `src/index.css` and extended Tailwind utility classes:

| Token Name | Light Theme | Dark Theme (`.dark`) | Utility Class |
|---|---|---|---|
| Brand Primary | `#2b5be3` | `#6a8cf2` | `bg-brand`, `text-brand` |
| Brand Hover / 700 | `#1f47c4` | `#8aa4f7` | `bg-brand-700` |
| Background | `#f5f7fb` | `#0a0f1c` | `bg-bg` |
| Surface (Card) | `#ffffff` | `#111829` | `bg-surface` |
| Surface Alt | `#eef2f8` | `#182034` | `bg-surface-2` |
| Border | `#e4e9f1` | `#232f48` | `border-brd` |
| Primary Text | `#0f1a2e` | `#e9eefb` | `text-ink` |
| Secondary Text | `#46536e` | `#a4b1cc` | `text-ink-2` |
| Muted Text | `#8693aa` | `#6c7a99` | `text-ink-3` |
| Success | `#12915e` | `#36c98a` | `text-success`, `bg-success-bg` |
| Warning | `#b9760a` | `#e0a23c` | `text-warn`, `bg-warn-bg` |
| Danger | `#d63d35` | `#f0685e` | `text-danger`, `bg-danger-bg` |

### 7.3 Sector Accents
Each feature domain has a dedicated accent color for iconography, category chips, and badges:
- `sector-reports`: `#4f6bed`
- `sector-lostfound`: `#c77d1a`
- `sector-clubs`: `#8b5cf0`
- `sector-events`: `#e0568a`
- `sector-jobs`: `#0e9c8a`
- `sector-study`: `#2ba0c9`
- `sector-bus`: `#e08a2b`
- `sector-medical`: `#e2483d`
- `sector-market`: `#2e9e63`
- `sector-ride`: `#6e8b1f`
- `sector-blood`: `#c7344a`
- `sector-directory`: `#5b6b86`
- `sector-prayer`: `#1f8a5b`
- `sector-faculty`: `#0e9c8a`
- `sector-routines`: `#5c6bc0`
- `sector-coverpage`: `#00838f`

### 7.4 Layout Rules & Component Recipes (`src/components/ui.jsx`)
- **Full-Width Navigation Rows:** List navigation items must render as full-width rows (icon on left, title/description center, chevron on right). Never use 2-column cards for navigation destinations.
- **Button Primitives:**
  - Primary: `bg-brand text-white hover:bg-brand-700 rounded-md shadow-sm h-11 px-4 font-bold`
  - Secondary: `bg-surface text-ink-2 border border-brd hover:bg-surface-2 rounded-md`
  - Destructive: `bg-danger text-white hover:brightness-95 rounded-md`
- **Modal Accessibility Gotcha:** `Modal` in `ui.jsx` isolates focus. Never pass inline arrow functions to `onClose` inside parent effect dependencies, as this triggers focus theft and prevents keyboard typing in modal inputs.

---

## 8. Database Schema & Ground-Truth Reference

### 8.1 Database Migration Engine & Deployment Rule
- All schema DDL, RLS policies, indexes, and triggers reside sequentially in `supabase/migrations/` (`0001_init.sql` through `0086_dm_grants_hardening.sql`).
- **TO APPLY A NEW MIGRATION:**
  ```bash
  supabase db query --linked --file supabase/migrations/00NN_name.sql
  ```
  This uses the Management API via existing Supabase CLI credentials without requiring a database password.
- **NEVER RUN `supabase db push`:** Remote Supabase migration history uses 14-digit timestamp formats (`20260708...`), whereas local migrations use sequential prefixes (`00NN_...`). Running `db push` causes CLI desynchronization and attempts to re-execute the entire migration history against production.

### 8.2 Profiles Table & RLS Self-Read Invariant
- **Table Name:** `profiles` (PK `id` references `auth.users`).
- **The Self-Read Invariant:** Under policy `profiles_select_self_admin_or_matched`, a standard user can SELECT **only their own profile row** (or admin/matched claims counterpart).
- **CRITICAL CONSEQUENCE:** Never execute `.from('profiles').select(...)` or embed foreign key joins like `profiles!user_id(full_name)` for arbitrary third-party users — it silently returns `null`, causing blank names throughout the UI.
- **The Solution:** Always fetch names and avatars using `directory_profiles()` SECURITY DEFINER RPC (or `peopleService` in the mobile sibling), which returns safe non-confidential profile details.

### 8.3 Ground-Truth Table Names & Critical Columns

| Domain | Exact Table Name | Key Columns, Enums & Gotchas |
|---|---|---|
| **Profiles** | `profiles` | `full_name`, `role` ('student','staff','admin'), `department`, `expertise`, `whatsapp`, `intake`, `section`, `student_id`, `show_whatsapp`, `allow_dms`. |
| **Reports** | `reports` | `code`, `reporter_id`, `assigned_staff_id`, `category`, `status` ('Open','In Progress','Resolved','Rejected','Closed'), `show_on_board` (bool default false). |
| **Report Votes** | `report_votes` | `user_id`, `report_id`. Powers anonymous "Me too" vote counting on the Campus Issues board. |
| **Lost & Found** | `lost_found_items` | `code`, `type` ('Lost','Found'), `title`, `category`, `status` ('Open','Resolved'), `reporter_id`, `deleted_at`. |
| **Claims** | `claims` | `item_id`, `claimant_id`, `status` ('Pending','Approved','Rejected'), `proof_url` (private `proofs` storage bucket with signed URLs). |
| **Marketplace** | `listings` | **NOT** `marketplace`. Columns: `code`, `category`, `course_code` (for books/notes), `price`, `status` ('Available','Sold'), `seller_id`. Contact reveal via `listing_contact(p_code)` RPC. |
| **Ride Sharing** | `rides` | **NOT** `ride_shares`. Columns: `code`, `origin`, `destination`, `date`, `time`, `seats_total`, `fare`, `driver_id`. Contact reveal via `ride_contact(p_code, p_target)` RPC. |
| **Blood Donors** | `donors` | **NOT** `blood_donors`. Columns: `user_id`, `blood_group`, `area`, `last_donated`. (Phone stored in `profiles.whatsapp`). Contact reveal via `donor_contact(p_user_id)` RPC. |
| **Blood Requests** | `blood_requests` | `patient_name`, `blood_group`, `hospital`, `units`, `needed_date`, `requester_id`, `fulfilled_at`. Contact reveal via `blood_requester_contact(p_code)` RPC. |
| **Blood Pledges** | `blood_pledges` | `request_id`, `donor_id`, `fulfilled_at`. Used when a student clicks "I can help". |
| **Study Hub** | `study_materials`, `study_question_bank`, `study_books` | `course_id`, `section_id`, `file_url`, `file_kind` (pdf, doc, etc.), `size_bytes`, `verified`. |
| **Study Bookmarks** | `study_bookmarks` | `user_id`, `item_type` ('material','question','book'), `item_id`. |
| **Clubs** | `clubs`, `club_posts`, `club_join_requests` | `clubs.about` (NOT description). Officers post on behalf of clubs. |
| **Jobs** | `jobs` | **NO status column**. Active status derived via `deleted_at IS NULL` and `deadline >= localToday()`. Removed jobs set `deleted_at = now()`. |
| **Job Bookmarks** | `job_bookmarks` | `user_id`, `job_id`. Join table for saved jobs. |
| **Messages** | `messages` | `sender_id`, `peer_low`, `peer_high`, `club_id`, `section_id`, `body`. Derived conversation IDs; no standalone conversations table. |
| **DM Grants** | `dm_grants` | `peer_low`, `peer_high`, `context_type`, `context_id`, `expires_at`. Keyed on sorted UUIDs. |
| **Notifications** | `notifications` | Columns: `user_id`, `sector`, `title`, `body`, `reference_type`, `reference_id` (**TEXT** in production!). Prod lacks `create_notification()` — triggers must insert directly. |

### 8.4 Security Definer Lockdown Pattern
In Postgres/Supabase, creating a `SECURITY DEFINER` function implicitly grants execute permissions to `PUBLIC` and `anon`. Every custom definer function MUST explicitly revoke anonymous execution:
```sql
REVOKE EXECUTE ON FUNCTION public.my_secure_function(...) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.my_secure_function(...) TO authenticated;
```

---

## 9. Specialized Features & Technical Subsystems

### 9.1 Campus Issues Board & "Me Too" Voting (0079 & 0080)
- **Concept:** Replaced the planned duplicate-report banner with an anonymous campus-wide board (`#/campus-issues`, merged into `Reports.jsx` under the "Campus Issues" tab).
- **Privacy Architecture:** The base `reports_select` policy is left untouched. The public board is served strictly through the `campus_issues_feed()` SECURITY DEFINER RPC, which completely strips `reporter_id` and `assigned_staff_id`.
- **Opt-In Policy:** `reports.show_on_board` defaults to `FALSE`. Reporters must actively opt in to share issues on the public board. Safety and Security category reports are forced private by server triggers.
- **Admin Visibility (0080):** Admins see aggregate "Me too" vote counts in `AllReports.jsx` via `report_vote_counts()`, allowing prioritization without revealing voter identities.

### 9.2 Realtime Messaging & Group Chat (0081 – 0083)
- **Supabase Broadcast Architecture:** Uses `realtime.broadcast_changes` on `realtime.messages` instead of heavy Postgres CDC replication, saving substantial connection quota.
- **Channel Topics:**
  - Direct Messages: `chat:dm:<low_uuid>:<high_uuid>`
  - Club Chat: `chat:club:<club_id>`
  - Section Chat: `chat:section:<section_id>`
- **Authorization:** Handled by RLS on `realtime.messages` (`chat_topic_read`).
- **Notification ID Cast Gotcha (0082):** In production, `notifications.reference_id` is a `TEXT` column, not a `UUID`. All trigger comparisons and inserts must cast explicitly (`new.sender_id::text`).

### 9.3 In-App DM Context Grants (0085 & 0086)
- **Problem Solved:** Students previously had to exchange contact via WhatsApp or wait for a mutual connection request before chatting.
- **Solution:** A student can initiate an immediate, direct in-app message from a Marketplace listing, Ride share, approved Lost & Found claim, or Blood pledge.
- **Mechanism:** Calling `open_dm_thread(context_type, code, target)` verifies the user relationship server-side and creates a row in `dm_grants` (sorted `peer_low < peer_high`, expires in 90 days).
- **Triple-Union Gate (`dmPartners`):** In `store.jsx`, realtime listening, unread badges, and access guards are driven by the union:
  $$\text{dmPartners} = \text{Accepted Connections} \cup \text{Live DM Grants} \cup \text{Peers of Existing Messages}$$

### 9.4 AI Chatbot & Floating ChatWidget (`chatCore.jsx`)
- **Architecture:** `src/screens/chatbot/chatCore.jsx` provides the single shared core engine (`useChatSession` hook, `MessageList`, `Composer`, `RichText`). BOTH the full `/chatbot` page and `ChatWidget.jsx` use this engine — never fork the logic.
- **Floating Widget Mount:** `ChatWidget` mounts once in `src/App.jsx` as a persistent sibling of `<AuthedRoutes>` inside `<AppLayout>`. It hides itself on `/chatbot*` or for non-student roles, but remains mounted so chat history and draft state survive page transitions.
- **Edge Function:** Talks to `supabase/functions/chat/index.ts` using Google Gemini (`gemini-flash-lite-latest`). Grounded with 10 database tools (bus routes, prayer times, lost & found, clubs, rides, routines, events, blood requests, jobs, faculty directory).
- **CORS Handling:** Browser clients require OPTIONS preflights and explicit CORS headers (`Access-Control-Allow-Origin: *`), handled inside the edge function.

### 9.5 PDF Maker (`src/screens/pdfmaker/`)
- **Zero Backend Footprint:** 100% client-side operations; zero database rows, zero file uploads.
- **Dual-Worker Execution:**
  - `pdf-lib` runs inside `pdfWorker.js` (Web Worker) for document generation, merging, and photo rasterization.
  - `pdf.js` runs on the **main thread** (`pdfRender.js`) because its font loader requires DOM access (`document`).
- **Asset Copying Rule (`vite.config.js`):** Standard fonts and cmaps copied via `vite-plugin-static-copy` MUST include `rename: { stripBase: true }`. Otherwise, fonts nest inside redundant subfolders, resulting in silent font 404 errors and blank rendered PDF text.
- **Lazy Loading:** `PdfMaker` is the only `React.lazy` component in `src/App.jsx`, saving ~500KB gzipped from the initial application bundle.

### 9.6 Blood Donation System (90-Day Rule & Fulfillment)
- **90-Day Eligibility:** A donor is eligible if `donors.last_donated` is `NULL` or $\ge 90\text{ days}$ ago. Ineligible donors display an "Eligible in N days" badge and have their direct contact button disabled.
- **Pledge Fulfillment Flow:** Requesters review responders via `donor_pledges_for_request(p_request_id)`. Clicking "Confirm donated" triggers `confirm_blood_donation(p_request_id, p_donor_id)`, which automatically updates the donor's `last_donated` date to today and notifies them.
- **Privacy Enforcement:** Blood donor phone numbers are revealed ONLY via the `donor_contact` RPC if the donor has enabled `show_whatsapp`.

### 9.7 Contact Link Helpers (`src/components/featureKit.jsx`)
- **`waHref(phone)`:** Plain Bangladesh phone numbers (`01XXXXXXXXX`) cause `wa.me` to display an "invalid number" error. `waHref` automatically normalizes numbers to international format (`8801XXXXXXXXX`). Always wrap WhatsApp phone links with `waHref()`.
- **`mailHref(email)`:** Plain `mailto:` links fail silently on desktop browsers without an installed default mail client. `mailHref` generates a direct Gmail compose link (`https://mail.google.com/mail/?view=cm&to=...`).

### 9.8 Dhaka Local Time (UTC+6) Rule
- Bangladesh Standard Time is UTC+6. Between 00:00 and 06:00 Dhaka time, UTC date calculations point to yesterday.
- **Rule:** For date calculations, filters, and display comparisons, never use `new Date().toISOString().split('T')[0]`. Always use local date helpers or compute against Asia/Dhaka time.

---

## 10. Sibling Mobile App (CampusOne) Relationship

- **Repository:** `https://github.com/fixit-bubt/CampusOneAndroid.git` (React Native 0.85 + Expo SDK 56)
- **Architecture Parity:** Both clients share the same Supabase database (`xhgpxvyqrufbbuivttmi`).
- **Parity Status:**
  - All core database schemas and feature sets match 1:1.
  - Web client incorporates custom desktop accommodations: keyboard shortcuts, multi-column layouts, floating nav capsule, in-app PDF Maker, and persistent floating AI chat widget.
  - When backend behavior or database schema mechanics are in doubt, refer to the verified database migration files (`supabase/migrations/`) or CampusOne's service layer (`src/services/`).

---

## 11. Local Development, Build & Deployment Procedures

### 11.1 Installation & Development
```bash
# Install dependencies
npm.cmd install

# Start local development server (http://localhost:5173)
npm.cmd run dev

# Run production build
npm.cmd run build

# Preview production build locally
npm.cmd run preview
```

### 11.2 Environment Variables (`.env`)
```bash
VITE_SUPABASE_URL=https://xhgpxvyqrufbbuivttmi.supabase.co
VITE_SUPABASE_ANON_KEY=<anon_publishable_key>
```

### 11.3 Deployment Verification Checklist
Before submitting code or pushing to `main`:
1. `npm.cmd run build` completes with **zero errors**.
2. Both Light and Dark theme renderings are verified (`class="dark"` on `<html>`).
3. No hardcoded raw Tailwind colors (`slate-*`, `blue-600`) remain in modified screens; all styles use semantic tokens (`ink`, `surface`, `brd`, `brand`).
4. Commit messages are single-line, terse, and contain **zero AI co-author trailers**.
5. Git push is executed **only upon explicit user request**.
