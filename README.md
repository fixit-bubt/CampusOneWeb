# CampusOne Web — All-in-One Campus Companion (BUBT)

CampusOne is a responsive campus mobile & web companion designed for the Bangladesh University of Business & Technology (BUBT) community. It provides integrated tools for students, faculty, and administrative staff, with dedicated dashboards for **Students**, **Staff**, and **Admins**.

Built with **React + Vite + Tailwind CSS** on the frontend and **Supabase** (PostgreSQL 15 + Auth + Row-Level Security + Storage + Edge Functions) on the backend.

- **Live Website:** https://campusonebubt.vercel.app
- **Stack:** React 18, Vite 6, Tailwind CSS, Lucide Icons, Supabase, Vercel
- **Backend:** Shared Supabase database powering both CampusOne Web and CampusOne Android

---

## Features & Services

1. **Campus Maintenance & Issues:** Report infrastructure problems on campus, track live status (Open → In Progress → Resolved), and assign trades directly to maintenance staff.
2. **Lost & Found:** Post lost or found items, claim with proof photos, pre-post matching, and private contact exchange upon claim approval.
3. **Study Hub:** Department, intake, and section-specific notes, routines, file uploads, bookmarks, and CR section moderation.
4. **Student Marketplace:** Buy and sell academic books, electronics, calculators, and study supplies with secure seller contact reveal.
5. **Campus Rides:** University peer-to-peer ride sharing, route planning, seat reservation, and driver contact verification.
6. **Blood Donation Network:** Donor registry, 90-day biological wait enforcement, urgent campus blood appeals, and volunteer pledges.
7. **Clubs & Communities:** Student club directories, membership requests, executive roles, and campus club updates.
8. **Events & Announcements:** Academic schedules, campus hackathons, seminars, RSVP management, and administrative notices.
9. **Student Jobs & Internships:** On-campus recruitment, student internships, application tracking, and deadlines.
10. **Campus Directories:** Student directory with connection requests and complete BUBT faculty & staff directory.
11. **Campus Transit & Prayer:** Live BUBT bus route departure schedules and campus masjid prayer / jamat timings.
12. **Academic Tools:** Real-time BUBT CGPA calculator, on-device client PDF merger/rotator/organizer, and BUBT Annex portal access.
13. **AI Campus Assistant:** Gemini-powered campus chatbot grounded in real university schedules, routines, and directories via Supabase Edge Functions.

---

## Project Structure

```
CampusOneWeb/
├─ index.html
├─ vite.config.js · tailwind.config.js · postcss.config.js
├─ .env.example
├─ src/
│  ├─ main.jsx                  # Application entry point
│  ├─ App.jsx                   # Routes and role guards (RequireAuth / RequireRole)
│  ├─ index.css                 # Tailwind directives + theme tokens
│  ├─ lib/
│  │  ├─ supabase.js            # Supabase JS client
│  │  ├─ router.jsx             # Hash router + <Link> navigation
│  │  └─ helpers.js             # Formatter helpers & category maps
│  ├─ data/
│  │  └─ store.jsx              # Central state and Supabase data layer
│  ├─ components/               # Reusable UI system, AppShell navigation, layout
│  └─ screens/
│     ├─ public/                # Landing, Explore, Login, Register, Onboarding
│     ├─ student/               # Student dashboard, directory, campus issues
│     ├─ staff/                 # Staff dashboard, assigned maintenance tasks
│     ├─ admin/                 # Admin dashboard, user management, faculty editor
│     ├─ studyhub/              # Notes, materials, CR intake moderation
│     ├─ marketplace/           # Listings, buy/sell student items
│     ├─ rides/                 # Peer-to-peer ride sharing
│     ├─ blood/                 # Blood donors, urgent requests, pledges
│     ├─ clubs/                 # Clubs, executives, community posts
│     ├─ events/                # Campus events, registrations, RSVP
│     ├─ jobs/                  # Student jobs, bookmarks, applications
│     ├─ bus/ · prayer/         # Bus routes and prayer timings
│     ├─ faculty/               # BUBT faculty directory & profiles
│     ├─ pdfmaker/              # Client-side PDF tools (pdf-lib + pdf.js)
│     ├─ cgpa/                  # BUBT grading scale CGPA calculator
│     ├─ chatbot/               # AI campus assistant (Gemini proxy)
│     └─ annex/                 # BUBT Annex portal webview
└─ supabase/migrations/         # PostgreSQL schema, RLS policies, triggers
```

---

## Running Locally

```bash
npm install
npm run dev      # Local dev server (http://localhost:5173)
npm run build    # Production build
npm run preview  # Preview production build locally
```

### Environment Configuration

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-publishable-key>
```

---

## Deployment

The web app is deployed on **Vercel**:
- Set the Build Command to `npm run build` and Output Directory to `dist`.
- Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel Project Settings → Environment Variables.
- Ensure your Vercel domain is added to Supabase Auth → URL Configuration → Redirect URLs.

---

© 2026 CampusOne · Bangladesh University of Business & Technology
