# AGENTS.md — CampusOne Knowledge & Engineering Reference

This document is the single, authoritative reference for any AI agent or developer working on the **CampusOne** project. It synthesizes all project memory, live code patterns, database schemas, environment constraints, and developer preferences.

---

## 1. Executive Summary & Project Purpose

- **Project:** CampusOne (Android Mobile App)
- **Institution:** Bangladesh University of Business & Technology (BUBT), Dhaka, Bangladesh
- **Context:** University Capstone Project
- **Purpose:** An all-in-one campus mobile companion for BUBT students, faculty, and administrative staff. Covers everyday university life: bus schedules, prayer times, lost & found, peer-to-peer marketplace, campus rides, class routines, study hub, clubs, events, blood donation, student jobs, campus maintenance reporting, AI assistance, academic calendar, and BUBT Annex portal access.
- **Sibling Web App:** "FixIt — Campus Management" (`Desktop/fix it sdp/fixit-campus`), built with React + Vite + Tailwind JS. Both mobile and web share the **exact same Supabase backend** and database tables.
- **1:1 Feature Parity:** The website and mobile app share the **exact same core feature set and business logic**:
  - **Campus Maintenance & Issues:** Report infrastructure problems, track status, trade assignment to staff.
  - **Lost & Found:** Post items, claim with proof photos, pre-post matching.
  - **Student Marketplace:** Buy/sell books, electronics, course materials, contact reveal RPC.
  - **Campus Rides:** Ride sharing, route planning, seat availability, driver contact reveal.
  - **Blood Donation:** Donor directory, urgent blood requests, 90-day eligibility enforcement, "I can help" pledges.
  - **Study Hub:** Department/intake/section notes, file uploads, bookmarks, CR section moderation.
  - **Clubs & Communities:** Club directory, membership join requests, posts, executive roles.
  - **Events & Announcements:** Campus events, RSVP, administrative announcements.
  - **Student Jobs:** Campus recruitment, internships, bookmarks, deadlines.
  - **Campus Directories:** Student directory with connection requests, faculty/staff directory.
  - **Campus Info:** Bus schedules, prayer/masjid times, clinic/doctor directory.
  - **Tools & Utilities:** CGPA calculator, PDF tools, academic calendar, academic tools hub.
  - **Role System:** Student, Staff, and Admin dashboards and permissions are identical across both platforms.

---

## 2. Repositories, Environments & Backend Reference

### 2.1 Git Remotes
- **Target Repo (Active):** `https://github.com/fixit-bubt/CampusOneAndroid.git` (branch: `main`)
- **Web Repo (Active):** `https://github.com/fixit-bubt/CampusOneWeb.git` (branch: `main`)
- **Stale Repos (DO NOT TOUCH):** `nawyajmorshed/CampusOne`, `fixit-bubt/CampusOne`
- **STRICT PROHIBITION:** Never touch or push to any repository containing `evergreen`, `evergreenweb`, or personal non-CampusOne repositories.

### 2.2 Supabase Backend
- **Project Ref:** `xhgpxvyqrufbbuivttmi` (Dashboard name: `fixit-campus`, Region: `ap-south-1`)
- **API URL:** `https://xhgpxvyqrufbbuivttmi.supabase.co`
- **Anon Key:** Configured in `src/lib/supabase.ts` (safe for client bundle)
- **MCP Database Changes:** Allowed via project-scoped `.mcp.json`. Always verify the project ref is `xhgpxvyqrufbbuivttmi` before running any DDL or migration.

### 2.3 Working Directories
- **React Native Project Root:** `c:\Users\dracu\Desktop\CampusOne\CampusOne`
- **Outer Wrapper / Workspace:** `c:\Users\dracu\Desktop\CampusOne` (contains Capstone Thesis Word document and backup files)
- **Web App Root:** `c:\Users\dracu\Desktop\fix it sdp\fixit-campus`

---

## 3. Critical Non-Negotiable Rules & Workflow

### 3.1 Git Commits & Author Attribution
1. **NO AI Footprint:** NEVER add `Co-Authored-By: Claude`, `Co-Authored-By: Antigravity`, or any AI/Anthropic/Google trailer in commit messages.
2. **Commit Author:** Commits must reflect ONLY the user as author.
3. **Commit Cadence:** Commit and push after each completed, reviewed feature/screen increment. Do not batch multiple unrelated features into massive commits.
4. **Push Policy:** Never run `git push` unless explicitly asked by the user with the word "push".

### 3.2 Code Craft & "No AI Tells"
The app is graded and reviewed by university teachers who actively check for AI-generated code and copy.
1. **NO AI Header Comments:** Do not write comments like `// Matches design...`, `// Web parity: ...`, `// Showcase`, `// Real devs...`.
2. **NO Box-Drawing Banners:** Avoid ASCII separators like `// ───── Section ─────`.
3. **NO Em-Dashes in UI Copy:** Never use `—` in user-visible UI microcopy; use `-`, `,`, or `.` instead. (Middle-dots `·` for metadata separators and `…` for search placeholders are acceptable).
4. **Terse, Human Comments:** Keep comments short, direct, and focused on non-obvious logic, edge-to-edge gotchas, or security constraints.

### 3.3 User Communication Style
1. **Non-Technical & Click-by-Click:** The user prefers clear, numbered, step-by-step guidance for external dashboards (Google AI Studio, Supabase, Android settings).
2. **Plain English First:** Explain "what it does" in simple terms before diving into technical details.
3. **Typo Tolerance:** The user frequently types shorthand and colloquial typos (`naw` → now, `lick` → like, `loock` → look, `dose` → does, `stuff` → staff). Read intent generously.
4. **Iterative UI Polish:** Ship a solid first pass, test on device, and welcome incremental refinements.

---

## 4. Tech Stack & Dependencies

| Layer | Technology | Details |
|---|---|---|
| **Mobile Framework** | React Native 0.85.3 + Expo SDK 56.0.15 | TypeScript 6, React 19.2.3 |
| **Web Framework** | React 19 + Vite 6 + Tailwind CSS | JavaScript, HashRouter |
| **Mobile Navigation** | React Navigation 7 | Native Stack + Bottom Tabs |
| **Backend / DB** | Supabase JS v2.107.0 | PostgreSQL 15, Auth, Storage, Realtime, Edge Functions |
| **Push Notifications** | Direct FCM v1 | Firebase project `campusone-853e6` + `send-push` edge function |
| **AI Assistant** | Google Gemini | `gemini-flash-lite-latest` via Supabase Edge Function (`chat`) |
| **PDF Processing** | `pdf-lib` + vendored `pdf.js` | On-device assembly + hidden offscreen WebView rasterizer |
| **Storage / Cache** | `@react-native-async-storage/async-storage` & `expo-secure-store` | Session persistence and preferences |
| **Icons** | `@expo/vector-icons` (Feather) & `lucide-react` (Web) | Strict semantic iconography |
| **Theme / Design** | Custom Design System | Plus Jakarta Sans + Hind Siliguri (Bangla), dark-mode tokens |

---

## 5. Design System & UI/UX Principles

All visual styles must strictly flow from `src/theme/` (mobile) or `src/index.css` / CSS custom variables (web). **Never hardcode hex colors, arbitrary spacing, or font families in screen components.**

### 5.1 Tokens & Imports (Mobile)
- **Import Location:** `import { useTheme } from '../hooks/useTheme'; import { SectorColors, FontFamily, FontSize, Spacing, Radius, Layout } from '../theme';`
- **Dynamic Semantic Colors (`C.*`):** `C.bg`, `C.surface`, `C.border`, `C.text`, `C.textMuted`, `C.brand`, `C.success`, `C.warn`, `C.danger` (`#d63d35`).
- **Feature Sector Accents (`SectorColors`):** Use `SectorColors.<sector>` for feature tiles and icons (`reports`, `bus`, `study`, `medical`, `blood`, `ride`, `prayer`, `jobs`, `market`, `clubs`, `events`, `announce`, `lostfound`, `directory`, `faculty`, `pdfmaker`).
- **Typography:** Bilingual support with `FontFamily.jakarta*` and `FontFamily.hind*` (matra-aware line height).

### 5.2 Layout Rules: Full-Width Rows
- **Navigation Lists:** Always use **full-width rows** (icon on left, title, subtitle/description below, chevron on right).
- **Prohibited:** Never use 2-column grid cards for navigation destinations, and **never mix grids and rows on the same screen**.
- **Reference Layout:** `styles.toolCard` in `src/screens/main/ExploreScreen.tsx`.

---

## 6. Expo SDK 56, Android Quirks & Web Shell Architecture

### 6.1 KeyboardAvoidingView on Android
- **Old Broken Pattern:** `behavior={Platform.OS === 'ios' ? 'padding' : undefined}` relies on native `adjustResize`, which fails in edge-to-edge mode.
- **Rule:** Use `behavior="height"` on Android (or handle insets via `react-native-safe-area-context`).

### 6.2 Inverted FlatList Empty States
- **Old Broken Pattern:** Wrapping `ListEmptyComponent` in `transform: [{ scaleY: -1 }]` renders upside-down or mirrored text on modern React Native Fabric architecture.
- **Rule:** Never use `ListEmptyComponent` on an inverted `FlatList`. Conditionally render the empty state as a separate sibling component outside the list:
  ```tsx
  {data.length === 0 ? <EmptyView /> : <FlatList inverted data={data} ... />}
  ```

### 6.3 WebView Transparent Background Bleed
- Modern Android WebViews render `rgba(0,0,0,0)` transparently if the target webpage (such as BUBT's Annex portal) lacks an explicit background color.
- **Rule:** Always set explicit opaque `backgroundColor: '#fff'` on the `WebView` component (`style={{ backgroundColor: '#fff' }}`), preventing the app's dark theme from bleeding through.

### 6.4 Floating Nav Capsule & Responsive Shell (`AppShell.jsx`)
- **Nav Capsule:** The classic vertical sidebar was eliminated. Desktop navigation renders inside a floating horizontal capsule pill centered at the top of the viewport.
- **CRITICAL Breakpoint is `xl` (≥ 1280px):**
  - At `xl` and above: Floating capsule displays logo, grouped menu dropdowns (`Academics`, `Campus Life`, `Community`, `Services`, `Manage`), and account profile controls.
  - Below `xl` (< 1280px): The layout switches to mobile navigation:
    - **Top Header (`h-11`):** Left menu button triggering drawer, centered two-tone `CampusOne` branding (`Campus` + emerald `One`) with a compact tagline (`Full campus in one app`), and notification bell on right with unread badge.
    - **Bottom Navigation Bar:** 5 primary tabs: Home (`/dashboard`), Study Hub (`/study-hub`), Cosmic AI Orb (`/chatbot`), Academic Tools (`/tools`), and Profile (`/profile`). Replaced the drawer trigger with direct 1-tap profile navigation.
  - **LOAD-BEARING RULE:** Never use `lg` for the capsule breakpoint! At `lg` (1024px), Admin nav items overflow horizontally and intercept clicks intended for the account dropdown.
  - **LOAD-BEARING RULE:** Never set `overflow-hidden` or `overflow-x-auto` on the nav container element. Any overflow setting clips the dropdown panels that hang below the bar, rendering them completely invisible.
- **Sticky Offsets:** Top floating capsule consumes 84-88px of vertical clearance on desktop; mobile sticky top header consumes 44px (`h-11`). Sticky elements (e.g., CoverPage preview, public CGPA cards) must use `top-24` or higher to clear the capsule.

### 6.5 Public Navigation Capsule & Landing Architecture (`Explore.jsx` & `Landing.jsx`)
- **Landing Hero Video:** Uses HTML5 autoplaying background (`src/assets/hero-bg.mp4`) with `autoPlay`, `loop`, `muted`, `playsInline`, and static fallback poster (`bubt-campus.jpg`). Theme-aware overlay `.hero-photo-veil` guarantees WCAG contrast across light and dark modes.
- **Public Navigation Links (`EXPLORE_NAV`):** Strictly limited to 5 essentials: `Bus Schedule` (`/explore/bus`), `Cover Page` (`/explore/cover-page`), `CGPA` (`/explore/cgpa`), `Prayer` (`/explore/prayer`), and `Faculty` (`/explore/faculty`).
- **Responsive Capsule Layout:**
  - Desktop / Tablet (`md` and above): Links render centered inside the top floating capsule (`hidden md:flex`).
  - Mobile (< `md`): Secondary sub-capsule renders links as a compact, centered pill (`w-fit mx-auto`).
  - **No Scrollbar / Non-Slidable:** Mobile sub-capsule must never use `overflow-x-auto` or slider tracks. Utilizes `.no-scrollbar` and tight padding (`px-2 py-1 text-xs sm:text-sm`).
- **Top Card Mobile Constraint:** Logo uses `size="sm"` on public nav (`Logo size="sm" onDark`). Auth buttons use `size="sm"` and `!rounded-full` (`!h-8 !rounded-full !px-3`) so Sign Up / Log In buttons never poke out or overflow the curved capsule boundaries on narrow viewports.

---

## 7. Web Design System, Tokens & UI Components

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
| Brand Primary | `#2b5be3` | `#5b85f7` | `bg-brand`, `text-brand` |
| Brand Hover / 700 | `#1f47c4` | `#7b9ef8` | `bg-brand-700` |
| Background | `#eaf4fb` | `#000000` | `bg-bg` |
| Surface (Card) | `#ffffff` | `#121212` | `bg-surface` |
| Surface Alt | `#e1eff8` | `#1c1c1c` | `bg-surface-2` |
| Border | `#d4e5f2` | `#262626` | `border-brd` |
| Primary Text | `#0f1a2e` | `#f4f4f5` | `text-ink` |
| Secondary Text | `#46536e` | `#a1a1aa` | `text-ink-2` |
| Muted Text | `#8693aa` | `#71717a` | `text-ink-3` |
| Success | `#12915e` | `#34d399` | `text-success`, `bg-success-bg` |
| Warning | `#b9760a` | `#fbbf24` | `text-warn`, `bg-warn-bg` |
| Danger | `#d63d35` | `#f87171` | `text-danger`, `bg-danger-bg` |

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

## 8. Dhaka Local Time Rule (UTC+6)

- Dhaka is UTC+6. Between 00:00 and 06:00 Dhaka time, UTC date calculations return yesterday's date.
- **Rule:** For date-only comparisons, filters, and stamps (`events.date`, `jobs.deadline`, `lost_found_items.item_date`), ALWAYS use `localToday()` from `src/utils/format.ts`.
- **Prohibited:** Never call `new Date().toISOString().split('T')[0]`.
- **SQL Rule:** Server-side comparisons must use `(now() at time zone 'Asia/Dhaka')::date`.

---

## 9. Database Schema & Ground-Truth Rules

The live Supabase database (`xhgpxvyqrufbbuivttmi`) is the single source of truth.

### 9.1 Database Migration Engine & Deployment Rule
- All schema DDL, RLS policies, indexes, and triggers reside sequentially in `supabase/migrations/` (`0001_init.sql` through `0088_profile_pinned_tools.sql`).
- **TO APPLY A NEW MIGRATION:**
  ```bash
  supabase db query --linked --file supabase/migrations/00NN_name.sql
  ```

### 9.2 Ground-Truth Table Names & Columns

| Domain | Table Name (DO NOT GUESS) | Key Columns & Gotchas |
|---|---|---|
| **Marketplace** | `listings` (NOT `marketplace`) | Status: `'Available'` / `'Sold'`. Contact reveal via `listing_contact(p_code)` RPC. Upload to `photos` bucket (`marketplace/{user_id}/`). |
| **Rides** | `rides` (NOT `ride_shares`) | Columns: `origin`, `destination`, `date`, `time`, `seats_total`, `fare`, `driver_id`, `code`. Contact via `ride_contact(p_code, p_target)`. Call `delete_expired_rides()` before fetch. |
| **Blood Donors** | `donors` (NOT `blood_donors`) | Columns: `user_id`, `blood_group`, `area`, `last_donated`. No phone column (phone is in `profiles.whatsapp`). Contact via `donor_contact(p_user_id)` RPC. 90-day wait enforced. |
| **Blood Pledges** | `blood_pledges` | Columns: `request_id`, `donor_id`. Used when a student pledges "I can help". |
| **Events** | `events` | Date column is `date` (NOT `event_date`); location is `venue` (NOT `location`). Whitelist: `event_organizers`. |
| **Clubs** | `clubs` & `club_posts` | `clubs.about` (NOT `description`), filter `is_active = true`. Posts: `club_posts.body` (NOT `content`), `author_id`. |
| **Jobs** | `jobs` | **NO status column**. Removed jobs have `deleted_at IS NOT NULL`. Withdraw a job by setting `deleted_at = now()`. |
| **Reports** | `reports` | Columns: `code`, `reporter_id`, `assigned_staff_id`, `status` (`'Open'`, `'In Progress'`, `'Resolved'`, `'Rejected'`, `'Closed'`). Trade assignment matches `profiles.expertise`. |
| **Connections** | `connections` | `requester_id`, `addressee_id`, `status` (`'pending'`, `'accepted'`). Contact reveal via `student_profile_detail(p_target_id)` RPC. Atomic disconnect via `disconnect_student(p_target_id)` RPC. Event notification trigger `trg_notify_connection_event` for alerts and lockscreen push. |
| **Medical** | `doctors` & `appointments` | Clinic is walk-in / directory only. Doctors: `room`. Appointments: `student_id`, `slot`, `date`. |
| **Account Deletion** | `delete_own_account()` RPC | SECURITY DEFINER. Removes dependent records and caller from `auth.users` (cascading to `profiles`). Revoked from anon; authenticated only. |

### 9.3 Profiles RLS & Display Names
- `profiles` RLS policy (`profiles_select_self_admin_or_matched`) returns **ONLY the caller's own row** (or admin/matched lost-and-found counterpart).
- **Rule:** Never query `.from('profiles').select(...)` or embed `profiles!user_id(full_name)` for other users — it silently returns `null` or blank names.
- **Solution:** Always use `peopleService.ts` (`fetchPeople` / `loadPeople` / `personName`), backed by the cached SECURITY DEFINER RPC `directory_profiles()`.

### 9.4 Security Definer Functions
- In Supabase, default ACLs grant `anon` execute permissions on functions created by `postgres`.
- **Rule:** Every new `SECURITY DEFINER` function must explicitly revoke anon permissions:
  ```sql
  REVOKE EXECUTE ON FUNCTION public.my_function(...) FROM public, anon;
  GRANT EXECUTE ON FUNCTION public.my_function(...) TO authenticated;
  ```

### 9.5 Supabase JS v2 Mutations
- Supabase JS v2 **never throws errors automatically**.
- **Rule:** Always check and handle errors explicitly:
  ```typescript
  const { data, error } = await supabase.from('table').insert({...});
  if (error) {
    showToast(error.message, 'error');
    return;
  }
  ```
- Always implement loading, empty, and retry states. Never silently swallow errors.

### 9.6 Refresh on Focus
- Screens fetching dynamic data must refresh when focused to prevent stale lists after edits/inserts:
  ```typescript
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );
  ```

---

## 10. Role System & Navigation Architecture

### 10.1 Role Hierarchy & Policy
- **Roles:** `'student'` | `'staff'` | `'admin'`
- **Role Promotion Rule:** Students are **NEVER promoted to staff or admin** in the app. Students may only be elevated to **CR** (`study_section_members.role = 'cr'`) or **Club President** (`club_set_president` RPC).
- The `ManageUsersScreen` role toggle only switches `Staff ↔ Admin`.

### 10.2 Bottom Navigation Structure
- **Home:** Role-adaptive tab:
  - Admin → `AdminDashboardScreen`
  - Staff → `StaffDashboardScreen`
  - Student → `HomeScreen` (campus feed, quick actions)
- **Explore:** Full directory of campus tools and services.
- **Messages:** Student-to-student realtime chat & group messaging (students only).
- **Annex:** BUBT student portal in-app WebView.
- **Settings:** Profile, preferences, language toggle, notification settings.

### 10.3 Student Onboarding Gate
In `RootNavigator.tsx`, students who have not completed onboarding (`!profile?.student_id`) are redirected to `OnboardingScreen` before reaching the main app.

### 10.4 Role Resolution & Auth State Integrity (Anti-Flash Architecture)
- **Profile Load Race Elimination:** In `authStore.ts`, `SET_SESSION` resets `profileLoaded: false` and `profile: null` on any new session or account switch. `SET_PROFILE` only marks `profileLoaded: true` when `profile !== null`. On sign-out, state is cleanly cleared via `SIGN_OUT`.
- **Pre-Navigation Role Await:** `signIn()` proactively awaits `fetchProfile(userId)` before resolving, ensuring the caller stays in busy/loading state until the role is resolved.
- **Navigator Gate:** `RootNavigator.tsx` blocks on `if (loading || (session && (!profileLoaded || !profile)))` with a clean splash/loader, guaranteeing `AppNavigator` never mounts before the user's role is confirmed.
- **Push Notification Registration Timing:** FCM token registration in `RootNavigator.tsx` waits until `user?.id && profileLoaded && profile` are valid so permission dialogs never pop over uninitialized screens.
- **Home Fallback Safety:** `BottomTabNavigator.tsx`'s `HomeComponent` explicitly checks `profile?.role === 'student' ? HomeScreen : HomeLoadingScreen`. It never blindly defaults to `HomeScreen` for unverified or loading roles.
- **Multi-Role Defense:** `HomeScreen`, `AdminDashboardScreen`, and `StaffDashboardScreen` have guards ensuring non-matching roles never render or fire role-mismatched data queries.

---

## 11. Specialized Features

### 11.1 AI Assistant ("Fixi")
- **Service:** `src/services/chatbotService.ts` (Mobile) / `src/screens/chatbot/chatCore.jsx` (Web)
- **Persona:** "Fixi" — campus companion with an immediate, static friendly greeting bubble and clickable suggestions upon opening chat (zero API cost on mount).
- **Edge Function:** `supabase/functions/chat/index.ts`
- **Model:** Google Gemini (`gemini-flash-lite-latest`), API key securely stored in Supabase secrets.
- **Grounding Tools (10 tools):** Bus routes, prayer times, lost & found, clubs, rides, class routines, events, blood requests, jobs, faculty directory. CGPA calculations are solved directly by system prompt.
- **Streaming:** SSE streaming using `expo/fetch` (Mobile) and Web fetch streams.
- **Security:** Validates caller's JWT directly in the Edge Function; student-only restriction enforced server-side.

### 11.2 PDF Maker
- **Location:** `src/screens/pdfmaker/`
- **Architecture:** 100% on-device native `pdf-lib` for document generation + hidden offscreen WebView running vendored `pdf.js` (`assets/pdfjs/*.txt`) for rasterizing page thumbnails.
- **Capabilities:** Photos to PDF, PDF Merge, Organize/Reorder Pages, Compress.
- **Zero Schema Change:** Does not touch Supabase or upload files.

### 11.3 Direct FCM Push Notifications
- **Firebase Project:** `campusone-853e6`
- **Mechanism:** Trigger on `notifications` table (`trg_push_on_notification`) → `pg_net` HTTP post → `send-push` Edge Function → Google Service Account OAuth → FCM v1.
- **Device Registration:** Handled via `register_push_token` RPC in `src/lib/push.ts`.
- **Diagnosis:** If push fails, check `push_tokens` table and `net._http_response` first. `{"sent": 0}` means the target user has no registered device token.

### 11.4 Academic Tools Directory (`AcademicTools.jsx` & `#/tools`)
- **Directory Hub:** Centralized utilities screen hosting Cover Page Generator, PDF Maker, and CGPA Calculator.
- **Custom Pins & Web Bookmarks:** Allows students to pin frequently visited campus features or custom external URLs to their quick-access grid. Synced across devices via `profiles.pinned_tools` (jsonb in migration `0088`), with automatic migration from device `localStorage` and offline caching.

---

## 12. Android Build, Signing & Deployment

- **Keystore File:** `campusone-release.keystore` (located in the repo root).
- **Alias & Password:** Configured in `android/app/build.gradle` (`signingConfigs.release` with alias `campusone` and password `campusone2026`).
- **Local Android SDK & NDK:** Configured via `android/local.properties` (`sdk.dir=C:/Users/dracu/Android/sdk`). NDK version is `27.1.12297006`.
- **Google Sign-In Dependency:** Google Sign-In is registered against the **release keystore's SHA-1 fingerprint**. Debug builds (`npx expo run:android`) fail Google Sign-In with `DEVELOPER_ERROR`. Real testing must use the release APK.
- **Build Release APK Locally (No EAS required):**
  ```bash
  cd android
  .\gradlew assembleRelease
  ```
- **Build Release Android App Bundle (.aab) for Google Play Submission:**
  ```bash
  cd android
  .\gradlew bundleRelease
  ```
  Standard output: `android/app/build/outputs/bundle/release/app-release.aab`
- **Google Play Compliance & Legal Infrastructure:**
  - **Account Context:** Personal Account ID `6137426018535669538` (`nawyaj morshed`).
  - **Account Verification:** Official Government NID/Passport identity approval + SMS phone verification required before publishing.
  - **20-Tester / 14-Day Closed Testing Rule:** Personal accounts created after Nov 2023 must run a closed test with 20 opted-in testers for 14 continuous days before Google unlocks production release.
  - **In-App Policy & Terms:** `PrivacyPolicyScreen.tsx` and `TermsScreen.tsx` wired into both `AppNavigator` and `AuthNavigator`. Interactive footer links on `LandingScreen.tsx` and `RegisterScreen.tsx`.
  - **Account & Data Deletion:** In-app flow in `SettingsScreen.tsx` calling `delete_own_account()` RPC. Public web request page at `delete-account.html`.
  - **Public Web Pages:** `public/privacy-policy.html` and `public/delete-account.html` mirrored to `CampusOneWeb` public directory for live URL hosting.
  - **Store Listing Assets:**
    - App Icon: `assets/playstore-icon-full.png` (512×512 PNG, verified).
    - Feature Graphic: 1024×500 PNG banner (required by Play Console).
    - Reviewer Credentials: Test student credentials must be supplied in Play Console App Access declaration.
- **Release APK Locations:**
  - Standard output: `android/app/build/outputs/apk/release/app-release.apk` (~51MB, fully signed).
  - Quick-access root copy: `CampusOne-release.apk`.
- **Install on Device via ADB:**
  ```bash
  & "C:\Users\dracu\Android\sdk\platform-tools\adb.exe" install -r android/app/build/outputs/apk/release/app-release.apk
  & "C:\Users\dracu\Android\sdk\platform-tools\adb.exe" shell am start -n com.bubt.campusone/.MainActivity
  ```
- **Stale Path / Gradle Cache Gotcha:** If Gradle ever reports a missing directory referencing an old machine path (e.g. `C:\Users\Administrator\...`), remove `android/.gradle`, `android/build`, and `android/app/build`, verify `local.properties`, run `.\gradlew --stop`, and rebuild.

---

## 13. Capstone Project Thesis Report

- **Document Location:** `c:\Users\dracu\Desktop\CampusOne\Copy of Capstone_Project_Report_Format-DOCX (1).docx` (Backup: `...BACKUP.docx`).
- **Current State:** Chapters 1-4 completed (Introduction, Background Study, Methodology, Implementation & Result Analysis). Chapters 5-6 (Constraints/Milestones, Conclusion) remain template placeholders.
- **Report Strategy:** Mobile app and Web app are presented as **one unified system** with two client interfaces sharing a single backend.
- **Editing Tool:** Edit using `python-docx` (`pip show python-docx` is available). Always confirm scope before altering document structure.

---

## 14. UI/UX & Institutional Polish Standards (Varsity Pitch Ready)

The mobile and web applications are actively pitched and presented to BUBT administration, department heads, and academic review committees. The following design and implementation patterns are strictly mandatory across all screens:

### 14.1 Native Direct Contact Flow (`ContactSheet.tsx`)
- **Prohibition:** NEVER display raw, un-dialable system dialogs (`Alert.alert("Name", "+880...")`) for phone numbers.
- **Pattern:** Use `ContactSheet` from `src/components/ui/ContactSheet.tsx`.
- **Capabilities:**
  - One-tap Call Phone (`callPhone(cleanPhone)` via `tel:` intent).
  - One-tap Chat on WhatsApp (`openWhatsApp(cleanPhone)` via `https://wa.me/`).
  - Copy to clipboard (`handleCopy()` with success toast).
  - Send Email (`mailto:${email}` when email is present).
  - In-app student chat action fallback (`inAppChatAction`).
- **Integration Points:**
  - `MarketDetailScreen.tsx`: Triggered upon seller contact reveal RPC (`listing_contact`) and interactive seller contact card.
  - `RideDetailScreen.tsx`: Triggered upon driver contact reveal (`ride_contact`) and seat requester contact cards.
  - `BloodScreen.tsx`: Triggered upon donor contact reveal (`donor_contact`) and urgent patient requester contact reveal.
  - `LostFoundDetailScreen.tsx`: Triggered upon approved claim contact unlock (`claim_contact`).

### 14.2 Visual Media Pipeline & Attachments
- **Lost & Found Photos:**
  - `LostFoundBrowseScreen.tsx`: Render 52×52 rounded cover thumbnail with category icon fallback.
  - `LostFoundDetailScreen.tsx`: Render 190dp hero image card with anchored status badge (`Lost` in crimson / `Found` in emerald).
  - `PostItemFormScreen.tsx`: Support image picking via `expo-image-picker`, preview thumbnail with Change/Remove actions, and upload to public `photos` bucket via `uploadPhoto(uri, 'lostfound', user.id)`.

### 14.3 Home Live Status Carousel & Bus/Prayer Cards
- **Mobile (`CampusToday.tsx`):** Horizontal snap carousel (210dp card width, 13.5px bold title, 11.5px subtitle, sector accent pill). Surfaces next bus, next prayer, campus announcements, upcoming events, open jobs, urgent blood requests.
- **Web ([`StudentDashboard.jsx`](file:///c:/Users/dracu/Desktop/fix%20it%20sdp/fixit-campus/src/screens/student/StudentDashboard.jsx)):** Bus card with transit grid SVG and prayer card with Islamic geometric star mosaic SVG, showing departure/azan timings and real-time wait progress bars.

### 14.4 Real-World Logistics & Time Display
- **12-Hour Bus Departures:** Always format military time (e.g. `13:30`) to human 12-hour AM/PM format (e.g. `01:30 PM`) using `format12Hour` helper. Always safeguard route stops (`(r.stops ?? []).length`).
- **Dynamic Ramadan Detection:** In `PrayerScreen.tsx`, never hardcode fasting banners. Use `isRamadanNow()` checking Hijri calendar month 9 via `Intl.DateTimeFormat('en-u-ca-islamic-umalqura')`.

### 14.5 AI Assistant Onboarding (`ChatbotScreen.tsx`)
- Never present an empty blank screen. Present 4 varsity-focused starter prompt chips (Bus routes, prayer times, CGPA calculation, campus jobs) that pre-fill the composer on tap.

### 14.6 Navigation & Dashboard Layout Integrity
- Strictly enforce AGENTS.md Rule 5.2 (full-width rows with left icon, bold title, and right chevron).
- In `AdminDashboardScreen.tsx`, all 7 management destinations use full-width rows to prevent orphaned cards.

### 14.7 Theme-Aware Dark Mode Tokens (`pillBg`)
- Never use hardcoded light pastel constants (`Accent.tealBg = #e4f5f4`, `greenBg = #e8f8f0`, `grayBg = #f0f2f6`) on cards or badges in dark mode.
- Use `pillBg(fgHex, isDark)` from `src/theme/colors.ts`, generating `${fgHex}2e` on dark and `${fgHex}18` on light.

### 14.8 Student Directory Architecture & Peer Discovery (`StudentDirectory.jsx` & `DirectoryScreen.tsx`)
- **Segmented Discovery Track Switcher:** Full-width segmented track with native spring sliding indicator physics (`Animated.spring`, `tension: 68`, `friction: 10`, `useNativeDriver: true`) matching `LostFoundBrowseScreen.tsx`. Features three dedicated discovery scopes:
  - `All Students`: University-wide student roster with live total count badge.
  - `Connections`: Mutual accepted peer network with one-tap chat and phone actions.
  - `Requests`: Pending incoming and outgoing connection requests with live count badge and alert indicator.
- **Option A Funnel Layout (Zero Sandwich Effect):** Solves stacked bar clutter by organizing controls into a natural visual hierarchy:
  1. Top Scope: Segmented Track Switcher (`All Students | Connections | Requests`).
  2. Sub-Filters: Dual Control Bar (`[ ✨ My Sec (Intake-Section) ]` + `[ 🏛️ All Depts ▾ ]`) directly beneath tabs.
  3. Fine-Grained Search: Search input directly above the student card feed (`🔍 Search by name, intake, section, dept, blood...`).
- **Structured Dual Control Bar:**
  - **Left Button (`My Section`):** One-tap toggle filtering the directory down to students in the user's exact intake and section (e.g. `51-1`). Theme-aware styling across both light and dark modes.
  - **Right Button (`Department Picker`):** Displays current department with dynamic signature emblem and accent color.
- **Varsity-Grade Department Picker Modal:**
  - Modern slide-up bottom sheet modal (`animationType="slide"`) with grab handle, safe area insets (`useSafeAreaInsets`), and 9 BUBT faculties/departments:
    - `All Departments`: Royal Blue (`#2563EB`) · `globe`
    - `CSE (Computer Science & Engineering)`: Tech Cyan (`#0891B2`) · `cpu`
    - `EEE (Electrical & Electronic Engineering)`: Electric Amber (`#D97706`) · `zap`
    - `BBA (Business Administration)`: Growth Emerald (`#059669`) · `briefcase`
    - `Law (Department of Law)`: Justice Crimson (`#E11D48`) · `shield`
    - `English (Department of English)`: Literature Violet (`#7C3AED`) · `book-open`
    - `Civil (Civil Engineering)`: Infrastructure Orange (`#EA580C`) · `compass`
    - `Textile (Textile Engineering)`: Material Rose (`#DB2777`) · `layers`
    - `Economics (Department of Economics)`: Financial Indigo (`#4F46E5`) · `trending-up`
  - Real-time student count badges per department (`[count] peers`).
  - Active selection receives glowing colored border, tinted background, and checkmark pill.
- **Database & Backend Architecture:**
  - `disconnect_student(p_target_id UUID)`: SECURITY DEFINER RPC for atomic mutual disconnection.
  - `student_profile_detail(p_target_id UUID)`: SECURITY DEFINER RPC returning full profile details for single-student lookups.
  - `student_directory()`: Returns `student_id` and `is_cr` (checking `study_section_members.role = 'cr'`).
  - `connections_delete` RLS policy: Allows mutual deletion for both `pending` and `accepted` connections.
  - `trg_notify_connection_event`: In-app notification and FCM lockscreen push on connection request and acceptance.
- **1:1 Web Parity (`StudentDirectory.jsx`):**
  - Sibling web app equipped with Department filter select dropdown, Classmates toggle, CR & Blood badges, and modal Disconnect action. Verified via `vite build`.

---

## 15. Official Logo & Brand Assets (Google Play Ready)

### 15.1 Visual Brand Identity
- **Mark:** Royal blue squircle container (`#0D3ECF` to `#1B52F8` gradient) featuring a unified C1 monogram:
  - Sweeping 3D beveled letter "C".
  - Upright numeral "1" embedded in center space.
  - Academic graduation mortarboard cap with hanging tassel.
- **Typography:** Modern geometric sans-serif wordmark "CampusOne" - "Campus" in deep midnight navy (`#0A1C3D`), "One" in royal blue (`#1B52F8`).
- **Zero AI / Generic Icon Tells:** All generic `@expo/vector-icons` `school` hats and placeholder icons are strictly purged. The official mark is used universally.

### 15.2 Asset Registry & Directory Locations
- **Master App Icon:** `assets/icon.png` (1024×1024 transparent PNG).
- **Google Play Console Upload:** `assets/playstore-icon.png` & `assets/playstore-icon-full.png` (512×512 PNG, formatted to official Google Play store requirements).
- **Android Adaptive Icon Layers:**
  - Foreground: `assets/android-icon-foreground.png` (1024×1024, emblem centered inside 66% safe keyline zone).
  - Background: `assets/android-icon-background.png` (1024×1024 `#ffffff`).
  - Themed Icon: `assets/android-icon-monochrome.png` (1024×1024 white silhouette for Android 13+ Material You).
- **Splash Screen:** `assets/splash-icon.png` (1024×1024 combination mark proportioned inside the Android 12+ 160dp circular safe zone with width ratio ~39%, so the full wordmark "CampusOne" from "C" to "e" is never clipped).
- **In-App Transparent PNGs:** `assets/logo.png` (full mark), `assets/logo-mark.png` (emblem only), `assets/logo-text.png` (wordmark only), `assets/favicon.png` (64×64).
- **Native Android Prebuilds (`android/app/src/main/res/`):**
  - Drawables: `drawable-*/splashscreen_logo.png` across mdpi (288×288, logo 112px), hdpi (432×432, logo 169px), xhdpi (576×576, logo 225px), xxhdpi (864×864, logo 338px), xxxhdpi (1152×1152, logo 450px) generated by `scripts/gen-icons.mjs`.
  - Mipmaps: `mipmap-*/ic_launcher.webp`, `ic_launcher_round.webp`, `ic_launcher_foreground.webp`, `ic_launcher_background.webp`, `ic_launcher_monochrome.webp` across all 5 densities.
  - Background colors: `values/colors.xml` (`splashscreen_background`, `iconBackground` set to `#ffffff`).

### 15.3 In-App UI Components
- `src/components/ui/Logo.tsx`: `LogoMark` renders `assets/logo-mark.png` with dynamic `size` and elevation `shadow`. Also exports `LogoFull` and `LogoText`.
- `Brand` component in `LandingScreen.tsx` wraps `LogoMark`, automatically providing the new logo to `LandingScreen`, `LoginScreen`, `RegisterScreen`, `OnboardingScreen`, `ResetPasswordScreen`, `VerifyEmailScreen`, and `TopBar`.

---

## 16. Unified Brand Identity & Memory Synchronization Mandate

### 16.1 CampusOne Brand Identity
- **Unified Branding:** Both web and mobile applications are officially branded **CampusOne**.
- **Visual Identity:** Two-tone wordmark (`Campus` in primary text, `One` in emerald green `text-emerald-400` / `#34d399`), paired with the compact tagline `"Full campus in one app"`.
- **Academic Utilities & Study Hub:** Centralized `AcademicTools.jsx` at `#/tools`, simplified student view on `#/study-hub`, and compact, text-focused AI assistant chatbot interface.
- **Announcement Banner Photo Rule:** An announcement (or event) cannot be displayed in the hero carousel banner unless it has an attached photo. Colored background gradients are strictly eliminated behind banner slides in favor of neutral backdrops.

### 16.2 Memory Synchronization Rule
Whenever the user instructs to "update memorys" (or "update memories"), the agent MUST synchronously update ALL memory references across the workspace:
1. `AGENTS.md` and `agent.md`
2. `CLAUDE.md`

---

## 17. Google Play Store Readiness & Institutional Audit Standards

### 17.1 AndroidManifest Permissions & Queries
- **Forbidden Unused Permissions:** `RECORD_AUDIO` and `SYSTEM_ALERT_WINDOW` must never be present in `android/app/src/main/AndroidManifest.xml`. Google Play Console flags them as high-risk policy violations for campus companion apps.
- **Intent Queries:** `<queries>` block in `AndroidManifest.xml` must declare `intent.action.DIAL` (`tel:`) and `intent.action.SENDTO` (`mailto:`) for deterministic external resolution on Android 11+ (API 30+).

### 17.2 Academic Scrutiny & Brand Consistency
- **Varsity Code Identifier:** `UNIVERSITY_NAME = 'BUBT'` in `src/constants/app.ts` (strictly never placeholder or other varsity codes like `'DIU'`).
- **Exported Document Footers:** Generated PDFs and cover pages must output `Generated by CampusOne` in `CoverPageFormScreen.tsx`.
- **Zero AI Tells:** 0 em-dashes `-` in user-facing microcopy/i18n; no ASCII box-drawing comments (`// ---`); no AI header comments (`// Matches design...`).
- **Theme Polish:** `pillBg(fgHex, isDark)` with default `isDark = false` applied across all status badges and pills, ensuring zero blinding pastels in dark mode.

---

## 18. Navigation & Screen Information Architecture (Explore & Tools Placement)

### 18.1 Home Screen Integrity (`HomeScreen.tsx`)
- **Zero Redundant Notification Clutter:** Notifications belong strictly in the dedicated top-right **Bell Icon** (with live unread badge count) linking to `NotificationsScreen`. Redundant notification widgets—specifically the legacy top blue Spotlight banner (`1 new alert / From reports, clubs & more`) and the inline `RECENT ALERTS` card list—are permanently eliminated from the Home screen.
- **Home Screen Flow (Student):**
  1. TopBar (Avatar, Greeting, Language switch, Theme toggle, Bell Icon with live unread badge).
  2. Quick Actions row (`Reports`, `Bus`, `Study`, `Medical`) positioned cleanly at the top (`marginTop: 14`).
  3. My Reports (`+ New Report` / `See All`).
  4. Campus Today (`CampusToday.tsx` live transit, prayer times, notices, events, and urgent blood request carousel).
- **Quick Actions Row:** Strictly contains the 4 core campus actions: `Reports`, `Bus`, `Study`, and `Medical`.
- **Zero Misplaced Tool Promos:** Document tools (PDF Maker, Cover Page Generator) must never be inserted on the Home screen.

### 18.2 Settings Screen Scope (`SettingsScreen.tsx`)
- **Settings Only:** Settings is strictly reserved for user account management and app preferences (`Dark Mode`, `Language`, `Notifications`, `Share App`, `About`, `Change Password`, `Sign Out`).
- **Zero Utility Dumps:** Utility tools or document generators must never be embedded inside Settings.

### 18.3 Explore Screen Categories & Accordion UX (`ExploreScreen.tsx` & `CollapsibleSection.tsx`)
- **Categorization:** High-level grouping matches the web navigation:
  - **Academics:** Study Hub, Class Routines, Academic Calendar, Faculty, Cover Page Generator, CGPA Calculator, and PDF Maker.
  - **Campus Life:** Clubs, Events, Announcements, Prayer Times, Jobs & Internships.
  - **Services:** Medical Center, Bus Schedule, Lost & Found.
  - **Community:** Student Marketplace, Ride Share, Blood Donation, Student Directory.
  - **Top Pinned Cards:** AI Assistant and Campus Issues.
- **Default State (Collapsed):** All categories start **collapsed by default** (`defaultOpen = false`). When the user taps the Explore tab, only the category headers are visible, preventing an overwhelming 20+ item wall.
- **Accordion Behavior:** Tapping any category smoothly expands it and closes other open categories, keeping the screen compact and matching the web application (`AppShell.jsx`) 1:1. Tapping an open category collapses it back.
- **Admin Dashboard Integrity:** `AdminDashboardScreen.tsx` explicitly sets `defaultOpen={true}` on its single Manage section to maintain visibility on the dashboard.

---

## 19. Admin & Staff Operations Architecture (Full Audit Reference)

### 19.1 Staff Workflow & Dispatch Mechanics
- **Staff Home Routing:** Role `'staff'` lands directly on `StaffDashboardScreen.tsx` with live workload counters (`Assigned`, `In Progress`, `Resolved`).
- **Issue Lifecycle Actions:**
  - `Start Work`: Optimistically updates issue status from `Open` to `In Progress`.
  - `Mark Resolved`: Optimistically updates status to `Resolved`.
  - `Decline`: Prompts confirmation and executes `decline_report(reportId)` RPC, atomically removing `assigned_staff_id` and reverting status to `Open` for admin re-dispatch.
- **Cross-RLS Reporter Resolution:** Staff queries use `fetchPeople` via `directory_profiles()` to retrieve student reporter names without hitting `profiles` RLS blockades.
- **Maintenance-Focused Explore:** Staff accounts are filtered to maintenance-relevant sectors (`bus`, `prayer`, `announce`, `medical`, `market`, `ride`, `blood`). Academic tools, student directories, anonymous boards, and chatbot are excluded.

### 19.2 Administrator Operations & Security Rules
- **Admin Home Routing:** Role `'admin'` lands on `AdminDashboardScreen.tsx` with high-level triage counters (`Open`, `In Progress`, `Resolved`).
- **Smart Trade-Matching Dispatch:** Reports are classified into trades (`Electrical`, `Plumbing`, `Cleanliness`, `IT / Network`, `Furniture`, `Safety / Security`, `Other`). The assignment modal sorts staff whose `expertise` matches the report trade to the top, flags them with a `Match` pill, and displays their active workload count.
- **7 Core Management Hubs:**
  - `AllReportsScreen`: Filterable, searchable catalog of all campus infrastructure reports.
  - `ManageStaffScreen`: Staff trade management and in-app staff/admin account creation.
  - `ManageUsersScreen`: Student-to-executive elevation (CR / President) and staff/admin role cycling.
  - `AnnouncementsScreen`: Campus-wide broadcast announcements with priority and attachments.
  - `ManageFacultyScreen`: Teacher profile patching, contact details, research tags, and photos.
  - `StudyHubScreen`: Academic catalogue management, intake/section provisioning, and CR review.
  - `ManageClubsScreen`: Club creation, status toggle, and atomic presidential assignment (`club_set_president` RPC).

---

## 20. Blood Donation Life-Saving Engine & Clinical Architecture

### 20.1 Clinical Standards & Safety
- **Gender-Aware Medical Cooldown (WHO Standard):** Enforces a 90-day recovery window for male donors and a 120-day recovery window for female donors to preserve iron reserves and prevent microcytic anemia (`DONATION_WAIT_DAYS_MALE = 90`, `DONATION_WAIT_DAYS_FEMALE = 120` in `src/utils/blood.ts`).
- **Zero-Migration Gender Storage:** Donor gender preference is persisted via `AsyncStorage` (`@donor_gender_${user.id}`), keeping the client fully type-safe without modifying the live database schema.

### 20.2 Native Recharged Push Alarms (`bloodReminder.ts`)
- **AlarmManager Integration:** Automatically schedules on-device notifications via `expo-notifications` (`scheduleNotificationAsync`) using `BLOOD_RECHARGE_NOTIFICATION_ID`.
- **Zero Backend Cost:** Operates 100% on-device, incurring $0 in backend compute or FCM costs, and triggers deterministically even when offline.
- **Trigger Points:** Armed upon donor registration/profile update and whenever the donor marks donation via `markDonatedToday()`.

### 20.3 Personal Donation & Lives Saved Impact Tracker
- **Lifetime Recognition:** Backed by `blood_pledges.fulfilled_at` counted in `getBloodFeed()` (`myDonationCount`).
- **UI Presentation:** Displays an impact badge (`🏅 X donations recorded · Up to Y lives impacted`) on the donor status card, celebrating lifetime contribution (1 whole blood unit impacts up to 3 lives).

### 20.4 Hospital / Area Proximity Filtering
- **Dhaka Transit Optimization:** Filters feed and donor catalog by high-volume hospital corridors (`All Areas`, `Mirpur (Near Campus)`, `Kurmitola`, `DMCH / Central`, `Dhanmondi`, `Uttara`), helping users find the closest eligible donor in Dhaka traffic.

### 20.5 Dengue Platelet Mode (Apheresis)
- **Clinical Apheresis Protocol:** Platelet donors replenish cells within 72 hours, allowing safe donation every 14 days.
- **Request Tagging:** `BloodRequestScreen.tsx` provides a dedicated `Dengue Platelet (Apheresis)` toggle, tagging the request with `[Platelets]`.
- **Feed UI:** Displays an amber `⚡ Platelet Emergency` badge on matching requests.

### 20.6 Targeted Cross-Compatibility Notification Engine
- **Migration:** `supabase/migrations/20261010000000_blood_compatibility_notifications.sql`.
- **Compatibility Function:** `compatible_donor_groups(p_group)` maps clinical recipient blood groups to eligible donor types (e.g. A+ receives from A+, A-, O+, O-; AB+ receives from all 8 groups; O- receives only O-).
- **Trigger:** `trg_notify_blood_request` alerts all compatible, currently-eligible donors, factoring in the 14-day recovery window for platelet requests.
- **SecOps Compliance:** Explicitly revokes anon execution permissions on all database functions.

### 20.7 360° Forensic Audit, Security Hardening & Web Parity
- **IDOR Remediation (`donor_contact` RPC):**
  - Patched security vulnerability where `donor_contact(p_user_id)` exposed contact details without verifying donor registry status. Added strict inner join on `public.donors` so non-donors' numbers cannot be harvested.
  - Returns `table(name text, whatsapp text)` ensuring full schema parity with the web client.
  - Explicitly revoked execute permissions from `anon` and `public`; granted exclusively to `authenticated`.
  - Migration: `supabase/migrations/20261011000000_blood_security_and_parity_fix.sql` (pushed to Supabase).
- **`blood_pledges` Security Hardening:**
  - Insert RLS policy checks caller's presence in `public.donors` (`donor_id = auth.uid() and exists (select 1 from public.donors where user_id = auth.uid())`). Prevents non-donors from harvesting requester contact numbers by submitting unauthorized pledges.
- **Query Performance & Indexing:**
  - Added partial index `blood_requests_active_created_idx` on `public.blood_requests(created_at desc) where fulfilled_at is null` for instantaneous feed queries.
- **Timezone Drift Remediation (Dhaka UTC+6):**
  - Fixed midnight calendar math in `donorEligibility()` using `Date.UTC(y, m - 1, d)` and `localToday()` to eliminate 1-day drift during 00:00-06:00 Dhaka hours.
  - Aligned on-device recharge push alarms in `bloodReminder.ts` to 10:00 AM daytime Dhaka time (04:00 AM UTC).
- **Cross-Group Biological Compatibility (`isBloodCompatible`):**
  - Replaced strict string equality with biological compatibility rules across mobile (`src/utils/blood.ts`) and web (`fixit-campus/src/screens/blood/Blood.jsx`). Universal donors (e.g. O- donating to all groups; O+ donating to A+, B+, AB+, O+) can respond and pledge ("I can donate").
- **Web Student Dashboard Parity:**
  - In `fixit-campus/src/screens/student/StudentDashboard.jsx`, corrected filter from invalid columns (`b.urgency === "Immediate" || b.status === "open"`) to `b.urgency === "Urgent" || b.urgency === "Today"` and properly mapped `b.group` and `b.createdAt`.
- **Android 15 Edge-to-Edge & Exact Selection:**
  - In `AreaPickerModal.tsx`, added `useSafeAreaInsets` bottom padding to clear the gesture pill in edge-to-edge mode.
  - Fixed selection check to exact match (`selectedArea.trim().toLowerCase() === item.name.trim().toLowerCase()`), preventing all 8 Mirpur variations from checking simultaneously.
- **Cache Invalidation Lifecycle:**
  - Automated invalidation of `CacheKeys.BLOOD_FEED(userId)` and `CacheKeys.HOME_STATUS(userId)` upon request posting, donor registration/updates, and request fulfillment.

---

## 21. Study Hub 6-Tier Academic Navigation & Workflow

### 21.1 Academic Hierarchy & Department Scoping Policy
- **Student Department Scoping Rule:** In Study Hub, students cannot see or browse other departments. All study materials, notes, questions, and section rooms are strictly department-scoped (matching Migration 0051 `study_can_view` security policy).
- When a student navigates to Study Hub (`/study-hub`), they jump directly into their own enrolled department's archive (Semesters 1-12), with quick-access to their enrolled section at the top. Direct URL attempts to view other departments are blocked by an access guard (`Department Restricted`).
- For Admin and Staff roles, the university-wide department directory (`/study-hub/browse`) remains accessible.

Study Hub uses a 6-tier academic progression pipeline for discovery and resource sharing:
1. **Student Department Hub (`/study-hub` or `/study-hub/dept/:deptId`):** The student's enrolled department archive with Semesters 1 through 12, plus active section quick-launch tile and Pinned Notices.
2. **Semester Directory (`/study-hub/dept/:deptId`):** Semesters 1 through 12 (covering 4 years of undergraduate study). Calculates senior and completed intakes dynamically based on the department's latest intake batch (`maxIntake`).
3. **Completed Intakes Feed (`/study-hub/dept/:deptId/semester/:semesterNum`):** Lists all senior batches that completed or are currently in that specific semester. Displays alumni/senior status badges (`Graduated Alumni`, `Completed · Now Sem X`, `Current Intake`).
4. **Sections Directory (`/study-hub/dept/:deptId/semester/:semesterNum/intake/:intakeId` or `/study-hub/intake/:intakeId`):** Section study rooms created for that intake. If no sections exist, displays a friendly empty state with action to request section creation or join by code.
5. **Courses Directory (`/study-hub/section/:sectionId`):** Courses/subjects added to the section. Displays notes, slides, questions, and books count summary per course. If empty, provides an empty state with action for CR/Editor to add the first course.
6. **Course Resource Workspace (`/study-hub/section/:sectionId/course/:courseId`):** 4 primary tabs:
   - **Class Notes:** Lecture notes, lab manuals, assignments, and study guides.
   - **CT Questions:** Class test and exam papers (CT 1, CT 2, Midterm, Final) with CR verification badge.
   - **Books:** Textbooks, reference books, syllabuses (file uploads or external links).
   - **Slides:** Presentation decks, PPT/PPTX slide decks, and instructor PDFs.

### 21.2 Resource Categorization & Upload Flow
- Class Notes upload uses `UploadFileModal` with type restricted to note categories (`Class Note`, `Assignment`, `Lab Manual`, `Reference`).
- Lecture Slides upload uses `UploadSlideModal`, automatically tagging items with `type: "Lecture Slide"` and storing in the private `study-materials` bucket.
- Question papers are stored in `study_question_bank` with exam type tags and CR verification toggles.
- Textbooks and syllabuses are stored in `study_books`.

---

## 22. Lost & Found Varsity Architecture & Ergonomics (Mobile Parity)

### 22.1 Hero Action Bar & Header Ergonomics (`LostFoundBrowseScreen.tsx`)
- **Prohibition:** Eliminates cramped corner `[+]` icon from `SubBar.rightSlot`.
- **Hero Action Bar:** Positioned directly below the header in the primary thumb strike zone. 44dp height, `borderRadius: 12`, `SectorColors.lostfound` (`#c77d1a`) background, 13.5px bold white text with `plus-circle` icon: `"+ Report Lost or Found Item"`.
- **Role Scoping:** Only displayed for students (`isStudent`), matching campus permission rules.

### 22.2 Unified Segmented Track Switcher & Native Spring Animation (`LostFoundBrowseScreen.tsx`)
- **Native Spring Animated Indicator:** Floating surface pill with subtle elevation and accent border that glides smoothly across the track under the user's finger using native 60fps driver (`Animated.spring`).
- **Dynamic Thematic Color Identity per Tab:**
  - `All`: Sector Amber (`#c77d1a`) text and soft badge tint.
  - `Lost`: Vibrant Crimson (`#d63d35` / `C.danger`) text and badge tint indicating missing items.
  - `Found`: Fresh Emerald (`#16a34a` / `C.success`) text and badge tint indicating recovered items.
  - `My Posts`: Royal Violet (`#8b5cf6`) text and badge tint for personal reports.
- **Live Badge Counters:** Real-time dynamic count chips per tab tracking active items with themed colors.

### 22.3 Unified Single-Row Search & Bottom Sheet Filter Modal (`LostFoundBrowseScreen.tsx`)
- **Zero Loose Chips Clutter:** Completely eliminates cluttered horizontal scrolling category chips and loose status pills from the main feed screen.
- **Single 44dp Row:** Search input on the left (`flex: 1`, search icon, full-height `TextInput`, instant clear `✕`) paired side-by-side with a prominent 44dp `Filters` button on the right (`minWidth: 96`, `flexShrink: 0`, matching `BloodScreen` search + area trigger architecture).
- **Active Filter Pill:** When filters are active (e.g. `category !== 'All'` or `status !== 'Open'`), the filter button highlights in sector amber (`${SectorColors.lostfound}18`), displays a filter count badge (e.g. `1`), and opens the modal to adjust or reset.
- **Filter Bottom Sheet Modal:** Tapping `Filters` opens a sleek bottom sheet organized into two distinct sections:
  - **STATUS:** Symmetrical card/bar rows for `Active (Open only)` (default), `Resolved only`, and `All (Active & Resolved)` with squircle status icons (`clock`, `check-circle`, `layers`), descriptive hints, and real-time status counts matching category rows 1:1.
  - **CATEGORY:** `All Categories`, `Personal`, `Electronics`, `Documents`, and `Other` with semantic squircle icon boxes, descriptive hints, and real-time category counts.
  - **Sheet Actions:** Equal 50/50 split buttons: styled soft-crimson `Reset` button (`C.dangerBg`, border, `rotate-ccw` icon) paired with solid sector-amber `Apply Filters` (check icon).
- **Feed Direct Placement:** The item card feed begins immediately beneath the single search/filter row with clean visual hierarchy.

### 22.4 Full-Screen Photo Viewer (`LostFoundDetailScreen.tsx`)
- **Tap-to-View Modal:** Tapping the 190dp hero image card opens a full-screen image modal (`rgba(0,0,0,0.94)` background, close button `✕`, title header, and `resizeMode="contain"` uncropped view), allowing students to inspect fine details like student ID numbers, serial codes, marks, or room numbers.
- **Zoom Hint Badge:** Anchored `Tap to view full photo` pill with `maximize-2` icon on the hero banner.

### 22.5 Post Item Form Ergonomics (`PostItemFormScreen.tsx`)
- **High-Contrast Type Selector:** Soft crimson tint for `Lost` (`C.dangerBg`, border `C.danger`) and soft emerald tint for `Found` (`C.successBg`, border `C.success`).
- **Symmetrical 2×2 Category Grid:** Balanced 2-column cards with squircle icon boxes and active borders.
- **Camera & Gallery Photo Picker:** Action sheet supporting both direct camera capture (`takePhotoWithCamera`) and media library selection (`pickFromGallery`).
- **Campus Location Quick Chips:** 1-tap campus location chips (`Library`, `Cafeteria`, `Building 2`, `Room 402`, `Exam Hall`, `Mosque`, `Computer Lab`, `Campus Grounds`).
- **Smart Pre-Post Match Banner:** Amber alert card with lightbulb icon alerting students if a matching item was already reported before submission.
- **Dynamic Action Button:** Dynamic type-aware colors and labels (`Post Lost Report` in crimson vs `Post Found Item` in emerald).

### 22.6 Complete 360-Degree Bug Audit & Robustness Hardening (Mobile & DB Parity)
- **Unicode Indic / Bengali Pre-Post Matching (`lostFoundMatch.ts`):**
  - Uses `/[^\p{L}\p{M}\p{N}]+/u` token splitting to support Indic script without severing vowel marks (`\p{M}`) from base consonants (`\p{L}`).
  - Lowered minimum token length threshold to >= 2 characters to match short terms (e.g., "ID", "বই").
  - Explicitly filters out 0-score items (`filter(x => x.score > 0)`) in `rankMatches()` to eliminate false-positive suggestions.
- **Item Owner Controls & SWR Cache Synchronization (`LostFoundDetailScreen.tsx`):**
  - Added dedicated Edit Post action routing directly to `PostItemFormScreen` with pre-filled state.
  - Implemented 1-tap `Mark as Resolved` and soft-delete (`deleted_at = now()`) with confirmation alerts and immediate optimistic SWR cache updates (`CacheKeys.LOST_FOUND`).
  - Replaced isolated `timeAgo` helper with standardized `formatRelativeTime(iso)`.
  - Added dedicated `LoadError` retry boundary distinguishing 404 (`PGRST116`) from network errors.
- **Claimant Lifecycle, Anti-Lockout & Race Prevention:**
  - Separated `myActiveClaim` (`'Pending' | 'Approved'`) from `myRejectedClaim` (`'Rejected'`) so claimants whose submissions are rejected are no longer locked out and can re-submit with clarified details.
  - Handled duplicate constraint error `23505` with friendly guidance.
  - Automatic storage rollback: cleans up uploaded proof from private `proofs` bucket if the subsequent database insert fails.
  - Row-level decision locks (`decidingClaimId`) preventing concurrent double-tap race conditions on claim approval/rejection.
  - Secured proof photo viewer to ensure only authenticated Supabase Storage URLs are opened.
- **Android 15 Edge-to-Edge & Ergonomics:**
  - Added `useSafeAreaInsets` bottom padding to photo picker and filter modals (`Math.max(insets.bottom, 18)`).
  - Configured `keyboardShouldPersistTaps="handled"` on horizontal location scroll views.
  - Guaranteed >= 42-44dp touch targets across all filter chips and action buttons.
- **Database Moderation Migration (`20261010010000_lost_found_security_and_moderation.sql`):**
  - Added `guard_item_update` trigger on `lost_found_items` to protect immutable fields and prevent reopening resolved items with approved claims.
  - Updated RLS policies (`items_select`, `items_update`) to enable admin moderation.
  - Sanitized push notification lockscreen text to prevent leaking private item details.

---

## 23. Native Spring Animated Segmented Track Pattern

### 23.1 Design Principles & Visual Standard
Segmented tab switcher tracks are used throughout CampusOne to toggle between core data feeds (e.g. Lost & Found tabs, Blood Requests vs Donors, Job types, Routine categories). To eliminate static transitions and give every tab its own distinctive institutional personality:
- **Zero-Latency Sliding Pill:** An elevated floating indicator glides fluidly beneath active options with physical spring dynamics (`Animated.spring`).
- **Dynamic Thematic Color Identity:** Rather than a uniform monochrome highlight, each tab defines its own semantic foreground and soft background tint (e.g. Danger Crimson for requests/lost, Success Emerald for recovered/donors/open, Violet for personal/my posts, Sector Accents for general feeds).
- **Responsive Geometry:** Automatically adapts to 2, 3, or 4 tab segments using layout callbacks (`onLayout`).

### 23.2 Mathematical Specification & Spring Physics
- **Track Padding:** `TRACK_PADDING = 3`
- **Inner Track Width:** `innerTrackWidth = Math.max(0, trackWidth - TRACK_PADDING * 2)`
- **Dynamic Segment Width:** `tabWidth = innerTrackWidth > 0 ? innerTrackWidth / N : 0` (where `N` is the number of tabs)
- **Native Translation:**
  ```tsx
  const translateX = animIndex.interpolate({
    inputRange: [0, 1, ..., N - 1],
    outputRange: [0, tabWidth, ..., tabWidth * (N - 1)],
  });
  ```
- **Physics Calibration:**
  ```tsx
  Animated.spring(animIndex, {
    toValue: activeIndex,
    tension: 68,
    friction: 10,
    useNativeDriver: true,
  }).start();
  ```
- **Elevated Indicator Design Tokens:**
  - `position: 'absolute'`, `top: 3`, `left: 3`, `bottom: 3`
  - `borderRadius: 11`, `borderWidth: 1.5`, `elevation: 2`
  - `shadowColor: '#000'`, `shadowOffset: { width: 0, height: 1.5 }`, `shadowOpacity: 0.12`, `shadowRadius: 3`
  - `backgroundColor: C.surface`, `borderColor: isDark ? `${cfg.fg}55` : `${cfg.fg}35``
- **Badge Counters:** Live count badges dynamically light up in the active tab's soft background tint (`${cfg.fg}18` or `rgba(..., 0.18)`) and text color (`cfg.fg`). Inactive badges render subtle neutral borders/surfaces.

### 23.3 Comprehensive CampusOne Segmented Track Catalog
The following screens contain segmented control bars slated for this animated pattern:
1. **Lost & Found (`LostFoundBrowseScreen.tsx`):** `All` (Sector Amber) · `Lost` (Crimson) · `Found` (Emerald) · `My Posts` (Violet) [Implemented].
2. **Blood Donation (`BloodScreen.tsx`):** `Requests` (Blood Crimson `#d63d35`) vs `Donors` (Medical Emerald `#16a34a`) [Implemented].
3. **Home Community Updates (`HomeCommunityUpdates.tsx`):** `All` (Brand Blue `#2563eb`) · `Notices` (Announce Orange `#ea580c`) · `Clubs` (Emerald `#059669`) · `Events` (Violet `#8b5cf6`) [Implemented].
4. **Student Jobs (`JobsBrowseScreen.tsx`):** `Open` (Emerald) · `Closing Soon` (Amber) · `Expired` (Slate) · `Saved` (Rose/Pink) (4 tabs).
5. **Marketplace (`MarketScreen.tsx`):** `All Listings` (Slate/Brand) vs `My Listings` (Market Amber) (2 tabs).
6. **Campus Rides (`RidesScreen.tsx`):** `All` (Ride Cyan) · `To Campus` (Emerald) · `From Campus` (Royal Blue) (3 tabs).
7. **Campus Events (`EventsBrowseScreen.tsx`):** `Upcoming` (Violet) vs `Past` (Muted Slate) (2 tabs).
8. **Class & Exam Routines (`RoutinesBrowseScreen.tsx`):** `Class Routines` (Indigo) vs `Exam Routines` (Orange) (2 tabs).
9. **Study Hub Course Details (`CourseDetailScreen.tsx`):** `Materials` (Amber) · `Questions` (Blue) · `Books` (Emerald) · `Saved` (Violet) (4 tabs).
10. **Campus Issues & Reports (`CampusIssuesScreen.tsx`, `MyReportsScreen.tsx`, `AssignedToMeScreen.tsx`, `AllReportsScreen.tsx`):** Status switchers (`All` · `Open` · `In Progress` · `Resolved`).
11. **Notifications (`NotificationsScreen.tsx`):** `All` (Slate) vs `Unread` (Crimson) (2 tabs).
12. **Club Details (`ClubDetailScreen.tsx`):** `Feed` (Club Accent) vs `Members` (Indigo) (2 tabs).
13. **Admin Management (`ManageStaffScreen.tsx` & `JobsModerateScreen.tsx`):** `Staff` vs `Admins` (2 tabs), `Reported` vs `Removed` (2 tabs).

---

## 24. Student Directory Architecture & Bug-Hunting Hardening

### 24.1 Architecture & Core Components
- **Screens:** `DirectoryScreen.tsx`, `StudentProfileScreen.tsx` (Mobile) and `StudentDirectory.jsx` (Web).
- **Services:** `connectionsService.ts`, `peopleService.ts` (Mobile) and `store.jsx` (Web).
- **Database Functions & Triggers:**
  - `student_directory()` RPC: Returns visible students (`id <> uid`) with cohort info, `is_cr`, `blood_group`, `status`, and conditionally revealed `email` and `whatsapp`.
  - `student_profile_detail(p_target_id)` RPC: Single-student profile lookup bypassing full directory table scan.
  - `disconnect_student(p_target_id)` RPC: Mutual atomic removal of accepted connections.
  - `trg_notify_connection_event`: Automatic trigger on `connections` table fanning events out to in-app notifications and FCM push (`connection_request`, `connection_accepted`).
  - `connections_delete` RLS: Allows mutual deletion when `status IN ('pending', 'accepted')`.

### 24.2 360° Hardening & Bug Fixes
1. **Dynamic Route Param Integration:** `DirectoryScreen` accepts `route.params.tab` and `route.params.initialTab`, automatically switching to the requested tab with spring animation on notification press or deep link.
2. **Notification Deep Link Targeting:** `notifTarget.ts` routes `connection_request` directly to `{ tab: 'requests' }` and `connection_accepted` to `{ tab: 'connections' }`.
3. **Requests Tab Priority Sorting:** Urgent incoming connection requests (`connState === 'incoming'`) always sort to the top of the Requests tab ahead of pending outgoing requests.
4. **Multi-Token Composite Search:** Search queries are tokenized by whitespace (`q.split(/\s+/)`), matching across name, department, intake, section, intake-section combo, blood group, student ID, and CR badges on both mobile and web.
5. **Instant Filter Reset:** Single-tap "Clear filters" action rendered inside empty states whenever search query, department, or classmates filter is active.
6. **StudentProfile Param Fallback & Offline Resilience:** `StudentProfileScreen` supports `route.params?.student?.id ?? route.params?.studentId ?? route.params?.id`, displays loading spinner on cold lookup, gracefully renders empty state if hidden or deleted, and provides offline protection with `OfflineBanner`.
7. **Cache Mutation Sync:** `syncDirectoryCache` in `connectionsService.ts` ensures `CacheKeys.DIRECTORY(uid)` in `AsyncStorage` updates immediately upon connect, cancel, accept, decline, and disconnect.
8. **Web Parity:** `StudentDirectory.jsx` and `store.jsx` synchronize DM roster upon accept/disconnect via `loadMessages()` and match tokenized search filtering.

