# Master Specification: Transferring Mobile Phone Design & Functionality to Web (CampusOne)

This document serves as the single comprehensive specification and engineering blueprint for transforming the mobile viewport of **CampusOne Web** (`CampusOneWeb`) to achieve a **100% pixel-and-behavior-identical match** with the **CampusOne Android Mobile App** (`CampusOne`). 

When a student, faculty member, or staff opens the website on a mobile phone browser, the layout, navigation hierarchy, component rhythms, interactive modals, and tactile feedback will be indistinguishable from the native Android application.

---

## 1. Executive Principles & Architectural Alignment

### 1.1 Zero Database Changes
Both the Web application (`CampusOneWeb`) and the Mobile application (`CampusOne`) already run on the exact same Supabase backend:
- **Project Ref:** `xhgpxvyqrufbbuivttmi` (Region: `ap-south-1` / Mumbai)
- **Shared Schema:** Identical database tables (`listings`, `rides`, `donors`, `blood_requests`, `blood_pledges`, `reports`, `study_sections`, `study_courses`, `clubs`, `events`, `announcements`, `jobs`, `profiles`).
- **Shared Business Logic:** Contact reveal RPCs (`listing_contact`, `ride_contact`, `donor_contact`), background triggers, and storage buckets (`photos`, `reports`, `study-files`).
- **Scope:** Zero SQL migrations or database alterations are required. The entire transformation is pure frontend design, component ergonomics, navigation routing, and responsive CSS token alignment.

### 1.2 Desktop vs. Mobile Isolation Strategy
- **Desktop (Viewport $\ge$ 1280px / `xl`):** Remains 100% intact with the floating navigation capsule, `MegaMenu` multi-level dropdowns, desktop dashboard banners, and wide-screen layouts.
- **Mobile (Viewport < 1280px or mobile devices):** Completely switches to the native mobile app shell, adopting the 60 px headers, the flat midnight navy bottom navigation bar, the 58/72 ergonomic scale, native bottom sheet modals, and mobile card layouts.

---

## 2. Universal Ergonomic Standards: The 58 / 72 System

The native mobile app strictly enforces the **58 / 72 System** across all 19 feature sectors (`DESIGN.md`). Web components must adopt these exact dimensional tokens on mobile viewports:

```
┌────────────────────────────────────────────────────────┐
│  1. CONTROLS, TABS, SEARCH, AND CTAs        ── 58 px   │
├────────────────────────────────────────────────────────┤
│  2. CONTENT CARDS, FEED ROWS, AND LIST ROWS ── 72 px   │
└────────────────────────────────────────────────────────┘
```

### 2.1 Standard A: 58 px Universal Control Bar
- **Outer Height:** Fixed `58px` (`h-[58px]`).
- **Corner Radius:** `16px` (`rounded-2xl`).
- **Border:** `1px` solid `var(--border)`.
- **Applied Controls:**
  1. **Segmented Switcher Tabs (`SegmentedTabs.jsx`):**
     - Outer container: `height: 58px`, `borderRadius: 16px`, `padding: 4px`, background `var(--surface-2)`.
     - Sliding indicator pill: `height: 50px`, `borderRadius: 12px`, background `var(--surface)`, subtle elevation shadow.
     - Label: `13.5px`, bold active / medium inactive.
     - Counter badge pill: `height: 22px`, `minWidth: 20px`, `borderRadius: 999px`, font `11px`, bold white text on `#ef4444`.
  2. **Search Inputs:**
     - Container: `height: 58px`, `borderRadius: 16px`, `paddingHorizontal: 16px`, background `var(--surface-2)`.
     - Icon: 18px search glyph. Text: 14.5px, medium weight.
  3. **Dual Sub-Filter Bars & Dropdown Triggers:**
     - Buttons: `height: 58px`, `borderRadius: 16px`, `paddingHorizontal: 14px`.
  4. **Primary Action CTAs & Form Submission Buttons:**
     - Connect, Submit, Create, Offer, Sell, Join: `height: 58px`, `borderRadius: 16px`, font `14.5px`, bold.
  5. **Emergency Action Buttons:**
     - "Request Blood" / "Report Campus Issue": `height: 58px`, `borderRadius: 16px`, prominent danger/brand fills.
  6. **Google Sign-In Button (`GoogleButton.jsx`):**
     - `height: 58px`, `borderRadius: 16px`, 1.5px border, white 28×28px G-box with authentic multi-color SVG Google logo.

### 2.2 Standard B: 72 px Universal Content & Card Row
- **Outer Height:** `72px` (`min-h-[72px]` or fixed `h-[72px]`).
- **Corner Radius:** `16px` (`rounded-2xl`).
- **Border:** `1px` solid `var(--border)`.
- **Padding:** `12px` to `14px` horizontal and vertical.
- **Thumbnail / Icon Box:** `44 × 44 px` with `13px` radius (or `48 × 48 px` with `12px` radius for image previews).
- **Typography:** Title `14.5px` (Bold, clamped to 1 line `truncate`), Subtitle `11.5px` (Medium, clamped to 1 line `truncate`).
- **Applied Components:**
  - Status Strips on Home.
  - Explore Screen Category Child Bars.
  - Student Directory Rows.
  - Blood Donor Rows & Blood Request Cards.
  - Lost & Found Feed Rows (`LFCard`).
  - Community Updates & Notice Feed Rows.
  - Frequent Tool Shortcut Cards.
  - Handover Meetup Location Cards.

### 2.3 Global Layout & Spacing Tokens
- **Screen Gutters:** Exactly `16px` horizontal padding (`px-4`).
- **Item Gaps:** `10px` to `12px` vertical gap between list cards (`space-y-2.5` / `gap-2.5`).
- **Card Margins:** `10px` to `11px` bottom margin.

---

## 3. Shell & Navigation Architecture Overhaul (`AppShell.jsx`)

### 3.1 Header Transformation: Replacing 44px Header with 60px TopBar & SubBar
On mobile viewports, the legacy 44px (`h-11`) header with the hamburger drawer button is completely replaced by two dedicated 60px headers:

#### 1. Root Tab TopBar (`<TopBar />`) — For Root Tabs (Home, Study Hub, Messages, Explore, Settings)
- **Height:** Fixed `60px` (`h-[60px]`).
- **Background:** `var(--surface)` with hairline bottom border `var(--border)`.
- **Left Slot:**
  - Houses the authentic 32×32px vector `LogoMark`.
  - **Beside-Logo Single Title or Brandmark:**
    - On **Home Tab:** Displays `Campus` (`19px`, `var(--text)`, ExtraBold) and `One` (`19px`, `#34d399` in dark / `#059669` in light) accompanied by a dynamic Role Badge (`ADMIN` or `STAFF`).
    - On **Other Root Tabs:** Displays the single localized title (`Study Hub`, `Messages`, `Explore`, `Settings`) in `18.5px` ExtraBold (`var(--text)`) with zero subtitle clutter.
- **Right Slot:** Dedicated 40×40px tactile icon button (`var(--surface-2)`, `border: 1px solid var(--border)`, `borderRadius: 14px`) housing the notification bell with red unread count badge.

#### 2. Child Screen SubBar (`<SubBar />`) — For All Internal Sub-Routes
- **Height:** Fixed `60px` (`h-[60px]`).
- **Bilateral Symmetry Standard:**
  - **Left Side:** 40×40px tactile icon button (`rounded-2xl`, `border`, `bg-surface-2`) housing a 20px back arrow (`arrowL` / `ArrowLeft`). Navigates `window.history.back()`.
  - **Center:** Clamped 1-line centered title (`16.5px`, bold, `text-center`, `truncate`).
  - **Right Side:** 40×40px alignment box housing the 28×28px `LogoMark` or a custom contextual action button (such as Filter, Add, or Call).

#### 3. Complete Elimination of the Slide-In Hamburger Drawer on Mobile
- The sliding hamburger drawer is retired on mobile. All services are directly accessible via the 5 bottom tabs and the new in-app `Explore` screen.

---

### 3.2 Bottom Navigation Bar: Midnight Navy Flat-Top Standard

The current web mobile navigation features a center cradle dip and an elevated 3D Cosmic Glass AI Orb. The mobile app eliminated the center notch cradle in favor of a sleek, flat-top design with an electric blue capsule highlight.

#### 1. 1-Piece Continuous SVG Backdrop
- **Gradient Stops:** Linear vertical gradient from `#0f2862` (top) to `#0a1b42` (bottom).
- **Top Rim Highlight Stroke:** `1px` continuous crisp stroke in `rgba(255, 255, 255, 0.16)`.
- **Top Geometry:** Flat top edge across all tabs with `20px` rounded outer shoulders (`r = 20px`). Zero center valley dip.
- **Height:** `62px` + safe-area inset bottom padding.

#### 2. Role-Adaptive Tab Distribution
- **Students (5 Tabs):**
  1. `Home` (`/dashboard`, icon: `home` / `Home`)
  2. `Study Hub` (`/study-hub`, icon: `book-open` / `BookOpen`)
  3. `Messages` (`/messages`, icon: `message-circle` / `MessageCircle`, with dynamic red unread count badge)
  4. `Explore` (`/explore`, icon: `grid` / `Grid`)
  5. `Settings` (`/settings`, icon: `settings` / `Settings`)
- **Admin (4 Tabs):** `Home` (`/admin`) | `Study Hub` (`/study-hub`) | `Explore` (`/explore`) | `Settings` (`/settings`)
- **Staff (3 Tabs):** `Home` (`/staff`) | `Explore` (`/explore`) | `Settings` (`/settings`)

#### 3. Active Tab Capsule Pill Highlight
- **Active State:**
  - Icon is enclosed in an electric blue translucent capsule pill: `width: 48px`, `height: 28px`, `borderRadius: 14px`, `backgroundColor: rgba(96, 165, 250, 0.20)`, `borderColor: rgba(96, 165, 250, 0.35)`.
  - Typography: `10.5px`, Plus Jakarta Sans Bold, `#60a5fa`.
  - Active dot below the label is eliminated.
- **Inactive State:**
  - Soft muted slate `rgba(148, 163, 184, 0.50)`, Plus Jakarta Sans Medium.

---

## 4. Native Bottom Sheet Modal Architecture Standard

On the mobile phone app, secondary forms, pickers, and detail views never render as centered desktop dialog boxes. On web mobile viewports, all modals must transform into **Native Bottom Sheets**:
- **Positioning:** Fixed to viewport bottom: `fixed inset-x-0 bottom-0 z-50`.
- **Backdrop:** Semi-transparent scrim: `bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs`.
- **Sheet Container:**
  - Top rounded corners: `rounded-t-[24px]`.
  - Max height: `max-h-[85vh]` or `max-h-[90vh]` with internal smooth scrolling (`overflow-y-auto`).
  - Top Drag Indicator Bar: `width: 40px`, `height: 4px`, `borderRadius: 999px`, background `var(--border)`, centered at top with `my-2.5`.
  - Header: 60px height with sheet title (`16.5px` bold) and right close `X` button (`36×36px` pill).
- **Dismissal:** Tap on backdrop, press Escape key, or tap the close button.

---

## 5. Universal Interactive Contact Sheet (`ContactSheet.jsx`)

Used universally across Blood Donation, Campus Rides, Marketplace, and Student Directory for 1-tap contact reveal:
- **Presentation:** Native Bottom Sheet with 40×4px grab handle.
- **Header:** 54×54px Avatar, Full Name (`17px` bold), Role/Intake subtitle (`12px` muted), close `X` button.
- **Phone Display Card (72 px):**
  - Height: `72px`, background `var(--surface-2)`, border `var(--border)`.
  - Phone icon, bold phone number text (`15.5px`).
  - "Copy" button: copies clean digits to clipboard, triggers floating Toast (`"Phone number copied to clipboard"`).
- **Direct 1-Tap Communication CTAs (58 px):**
  - **WhatsApp Button:** 58 px height, `#25D366` green background, WhatsApp icon, opens `https://wa.me/...`.
  - **CampusOne Chat Button:** 58 px height, Brand Blue, opens in-app direct chat thread (`/messages/:threadId`).
  - **Call Phone Button:** 58 px height, `#10B981` emerald background, opens `tel:...` dialer.
  - **Send Email Button:** 58 px height, `#8B5CF6` purple background, opens `mailto:...`.

---

## 6. Authentication & Onboarding Flow Parity

### 6.1 Sign In (`LoginScreen.tsx` vs `Login.jsx`)
- **Header:** 60 px `SubBar` with back arrow, centered "Sign In", logo on right.
- **Quick Domain Chips:**
  - Directly above the email input: two 1-tap pills (`@bubt.edu.bd` and `@gmail.com`).
  - Tapping auto-completes or appends the university domain.
- **58 px Form Inputs:**
  - Email input (`58px` height, `16px` radius).
  - Password input (`58px` height, `16px` radius) with toggle visibility eye icon.
- **58 px Primary CTA:** "Sign In" button (`bg-brand`, bold white text).
- **58 px Google Button (`GoogleButton.jsx`):**
  - "Continue with Google" (`58px` height, `16px` radius, 1.5px border).
  - Authentic multi-color SVG Google 'G' glyph in white 28×28px bounding box.
  - `OrDivider`: Horizontal hairline with center pill ("or").
- **Footer:** "Forgot Password?" link and "Don't have an account? Sign Up" navigation.

### 6.2 Sign Up & Onboarding (`RegisterScreen.tsx`, `VerifyEmailScreen.tsx`, `RolePendingScreen.tsx`)
- **Register Form:** Full name, University email, Student ID (digits only with automated hyphenation), Department dropdown (72 px), Password & Confirmation (58 px).
- **Email Verification:** 6-digit verification code input cells with resend timer countdown.
- **Role Pending State (`RolePendingScreen.tsx`):**
  - 96 px status hero card for newly registered Staff or Admin accounts awaiting master team approval.

---

## 7. Missing In-App Routes to Implement on Web

### 7.1 Authenticated Explore Hub (`/explore`)
Web currently has explore views only for unauthenticated landing routes (`/explore/bus`, `/explore/faculty`, etc.). The authenticated phone app features `ExploreScreen.tsx` as its central directory engine:

1. **Header:** Root `TopBar` with title "Explore".
2. **Quick Access Cards:**
   - **Fixi AI Assistant:** 72 px card, electric blue icon box (`message-circle`), title "AI Assistant", subtitle "Ask questions, get help with campus life", chevron right. Navigates to `/chatbot`.
   - **Campus Issues Board:** 72 px card, danger icon box (`alert-triangle`), title "Campus Issues", subtitle "Public student issues and community votes", chevron right. Navigates to `/campus-issues`.
3. **4 Top-Level Collapsible Accordion Sections:**
   - **Academics (`#2ba0c9` / Cyan):**
     - Header: 72 px card, study icon, title "Academics", subtitle "Notes, routines, annex & tools", stacked stat block `8 TOOLS`.
     - Children: Study Hub, Class Routines, Academic Calendar, Faculty Directory, Cover Page, Annex Portal, CGPA Calculator, PDF Maker.
   - **Campus Life (`#e0568a` / Rose):**
     - Header: 72 px card, clubs icon, title "Campus Life", subtitle "Clubs, events, prayer & jobs", stacked stat block `5 SERVICES`.
     - Children: Clubs, Events, Announcements, Prayer Times, Jobs & Internships.
   - **Services (`#4f6bed` / Electric Blue):**
     - Header: 72 px card, medical icon, title "Services", subtitle "Clinic, bus routes & lost items", stacked stat block `3 SERVICES`.
     - Children: Medical Center, Bus Schedule, Lost & Found.
   - **Community (`#2e9e63` / Emerald):**
     - Header: 72 px card, market icon, title "Community", subtitle "Market, rides, blood & directory", stacked stat block `4 HUBS`.
     - Children: Student Marketplace, Campus Rides, Blood Donation, Student Directory.
4. **Child Row Standard (`styles.childBar`):**
   - Fixed `72px` outer height, `16px` border radius, `1px` border.
   - **4.5 px Left Accent Spine:** `border-l-[4.5px]` tinted in the sector's vibrant accent color.
   - Authentic 42×42px sector vector icon, 1-line bold title, 1-line subtitle, right chevron.

---

### 7.2 Dedicated Settings Hub (`/settings`)
Web currently lacks a consolidated settings screen. Mobile implements `SettingsScreen.tsx`:

1. **Header:** Root `TopBar` with title "Settings".
2. **Profile Identity Hero Card (96 px):**
   - Height: Fixed `96px`, padding `16px`, background `var(--surface)`.
   - Left: 54×54px Avatar.
   - Center: Full Name (`17px`, bold), Student ID + Intake/Section meta (`12px`), Role Badge pill (`22px` height).
   - Right: "View Profile" link with right chevron.
3. **Appearance Group:**
   - **Theme Switcher:** Single-line 58 px card (`[Moon Icon] [Dark Mode] [LiquidToggle]`).
   - **Language Switcher:** Single-line 58 px card (`[Globe Icon] [বাংলা ভাষা / English] [LiquidToggle]`).
4. **Notifications Group:**
   - Single-line 58 px card with master notifications switch and link to `/notifications/settings`.
5. **Data & Storage Group:**
   - Offline Data Sync switch.
   - Storage Cache counter (`X MB cached`) with "Clear App Cache" action.
6. **Security Group:**
   - Change Password trigger opening modal.
7. **About & University Group:**
   - BUBT institutional info, version `v2.4.0 (Build 56)`, developer team credits.
8. **Account Actions:**
   - 58 px Secondary "Sign Out" button.
   - 58 px Destructive "Delete Account" button with confirmation dialog.

---

## 8. Interactive Map Engine & Real-Time Proximity Architecture

Consolidated into one single universal mapping and direction modal standard across Marketplace, Blood Donation, Campus Rides, and Lost & Found:

### 8.1 Core Mapping Standards (`DirectionMapModal.jsx`, `HospitalMapModal.jsx`, `RideRouteMapModal.jsx`)
- **Presentation:** 84% Bottom Sheet on mobile view with 60 px SubBar and close `✕` button.
- **Engine:** MapLibre GL JS / Leaflet running vector tiles from OpenFreeMap (`tiles.openfreemap.org/styles/liberty` in light, `tiles.openfreemap.org/styles/dark` in dark).
- **Live Road Routing via OSRM:**
  - Queries `https://router.project-osrm.org/route/v1/driving/{lng1},{lat1};{lng2},{lat2}?overview=full&geometries=geojson`.
  - Renders authentic highway polyline: 8px dark casing layer underneath a 5.5px core electric blue road polyline (`#2563eb`).
- **Live Device GPS Proximity:**
  - Queries `navigator.geolocation.getCurrentPosition()`.
  - Calculates geodesic distance using Haversine formula (`X km away · ~Y min drive/walk`).
  - Displays pulsating blue GPS dot at user's current coordinates.
- **Floating Trip Summary Banner:** Frosted glass pill showing duration (`28 min`), distance (`20.2 km`), and ETA clock time.
- **1-Tap Google Maps Voice Navigation CTA (58 px):**
  - Universal 58 px button launching external Google Maps:
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(poiAddress)}`.

---

## 9. Screen-by-Screen Detailed Parity Blueprint

### 9.1 Home Dashboard (`HomeScreen.tsx` vs `StudentDashboard.jsx`)
1. **TopBar (60 px):** Vector Logo + `Campus` + green `One` + role badge pill + Bell with unread badge.
2. **Hero Auto-Changing Banner:**
   - Rounded `16px` banner, full background image, dark gradient overlay (`from-black/90 via-black/55 to-black/25`), title, subtitle, line indicators.
3. **Campus Pulse Status Strips (72 px):**
   - 72 px height, neutral surface.
   - Left Navigation Pill (`width: 100px`, `height: 48px`, bold category title, right chevron, border-right separator).
   - Right Metrics Row: 3 metric columns separated by vertical divider lines (e.g. Bus: *Next Route*, *Departure Time*, *Countdown*; Prayer: *Current*, *Next*, *Time*; Reports: *Open*, *In Progress*, *Resolved*).
   - Customization modal sheet (select 3 from 19 campus features).
4. **Frequently Used Tools (72 px):**
   - Section header with zap icon, "FREQUENTLY USED", and "Customize" pill.
   - 4 horizontal 72 px shortcut cards (`flex: 1` each), 34×34 px icon box, 1-line title.
   - Customization modal sheet (select 4 tools).
5. **Community Updates Feed:**
   - 58 px `SegmentedTabs`: Notices | Clubs | Events.
   - 72 px cards with 48×48 px thumbnail, category badge, title, relative date.
   - 58 px bottom action button: "View All Campus Notices" / "Browse All Clubs" / "View All Campus Events".

---

### 9.2 Blood Donation (`BloodScreen.tsx` vs `Blood.jsx`)
1. **Header:** 60 px `SubBar` with back arrow, centered "Blood Donation", logo right.
2. **Controls:**
   - Top 58 px Emergency Request Blood CTA button (`#ef4444`).
   - 58 px `SegmentedTabs`: "Requests" vs "Donors".
   - 58 px Search & Area Picker trigger.
3. **AreaPickerModal:**
   - Explore-style collapsible area bars (72 px) with hospital counts.
   - Child hospital cards (72 px) with 4.5 px crimson left spine (`#ef4444`).
4. **Request Cards (72 px+):**
   - Custom `RequestBloodBadge` (`A+`, `BLOOD` or `PLATELETS`).
   - Patient name, required units, hospital, area.
   - Interactive Hospital Row with map-pin icon and right hint badge `Map ↗`. Tapping opens `HospitalMapModal`.
   - 58 px Primary CTA: "I Can Help" pledge button / "Call Requester" / "Manage Responses".
5. **HospitalMapModal:**
   - Live turn-by-turn OSRM road routing polyline.
   - Live GPS geodesic distance from current position.
   - Symmetrical upright crosshairs recenter control.
   - 58 px Floating CTA to launch native Google Maps directions.
6. **Donor Cards (72 px):**
   - 44×44 px Avatar, donor name, verified blood badge, area.
   - Eligibility indicator: Recharged (`success`) vs Waiting `X days` (`warn`).
   - Direct WhatsApp / Phone call sheet reveal (`ContactSheet.jsx`).
7. **Forms:**
   - Unified 72 px Hospital / Location selector card.
   - 72 px Units Stepper Card ("1 Bag Needed", stepper buttons).

---

### 9.3 Campus Rides (`RidesScreen.tsx` vs `Rides.jsx`)
1. **Header:** 60 px `SubBar` with back arrow, centered "Campus Rides", logo right.
2. **Controls:**
   - Top 58 px "Offer a Ride" CTA button.
   - 58 px `SegmentedTabs`: "To BUBT" | "From BUBT" | "My Rides".
   - 58 px Search bar.
3. **Ride Cards:**
   - Driver role badge with steering wheel icon (`steering`) vs Passenger hailing hand (`hand-back-right`).
   - Vehicle badges: Rickshaw (`rickshaw`), Bike (`motorbike`), CNG (`taxi`), Car (`car-side`).
   - **Uber Connected Route Timeline Spine:**
     - 🟢 Pickup Point (emerald dot + zone title).
     - 📍 Meeting Landmark Callout (attached to spine).
     - 🔴 Destination (crimson dot + zone title).
   - Seats available badge + Fare pill (`Tk XX`).
4. **RideDetailScreen:**
   - 84% bottom-sheet modal.
   - Live GPS distance from pickup spot (`241m from you · ~3 min walk`).
   - Interactive `RideRouteMapModal` with road route polyline.
   - Seats selector stepper, passenger booking request, driver contact sheet.

---

### 9.4 Student Marketplace (`MarketScreen.tsx` vs `Marketplace.jsx`)
1. **Header:** 60 px `SubBar` with back arrow, centered "Marketplace", logo right.
2. **Controls:**
   - Top 58 px "Sell an Item" CTA button.
   - 58 px `SegmentedTabs`: "All Items" | "My Listings" | "Saved".
   - 58 px Dual Control Bar: Category picker trigger + Filter trigger.
   - 58 px Search bar.
3. **Category Picker Modal:**
   - 72 px category selection cards with category vector icons and item counts.
4. **2-Column Mobile Item Grid:**
   - Photo container with fixed aspect ratio.
   - Status pill ("Available" / "Sold").
   - Price in emerald bold text (`৳ XXX`).
   - Title clamped to 1 line (`truncate`).
   - Handover spot with map-pin icon.
   - Seller avatar, name, and favorite heart button.
5. **MarketDetailScreen:**
   - Full photo carousel.
   - Handover spot card with live GPS distance (`X km away · Tap for directions`).
   - 1-Tap `DirectionMapModal` (MapLibre vector tiles, OSRM route, Google Maps launch).
   - Seller profile card and contact reveal modal (`listing_contact(p_code)` RPC).

---

### 9.5 Lost & Found (`LostFoundBrowseScreen.tsx` vs `LostFoundBrowse.jsx`)
1. **Header:** 60 px `SubBar` with back arrow, centered "Lost & Found", logo right.
2. **Controls:**
   - Top 58 px "Report Lost Item" CTA button.
   - 58 px `SegmentedTabs`: "Lost Items" | "Found Items" | "My Posts".
   - 58 px Search bar & Filter sheet modal.
3. **Feed Cards (`LFCard`, 72 px+):**
   - Left thumbnail image or category icon box (44×44 px).
   - Item title, location with pin, relative date.
   - Type dot badge (Lost: Red / Found: Green).
   - Category chip and Resolved checkmark badge.
4. **LostFoundDetailScreen:**
   - Image preview, item handover spot on map, pre-post matching.
   - Claim flow with proof image upload.
   - Claim withdrawal danger pill button.

---

### 9.6 Study Hub (`StudyHubScreen.tsx` vs `StudyHub.jsx`)
1. **Header:** 60 px `SubBar` (or root `TopBar` when navigated from tab).
2. **Personas:**
   - Not Joined: Department section directory, join code input (58 px), CR request form.
   - Approved Member / CR: Full section workspace.
3. **Controls:**
   - 58 px `SegmentedTabs`: "Courses" vs "Archive".
   - 72 px Section Header Card (Intake, Section, CR badge, Public/Private status, join code copy).
4. **Course Rows (72 px):**
   - Course code badge, course name, counts (Materials, CT Questions, Textbooks).
5. **Course Detail Screen (`CourseDetailScreen.jsx`):**
   - 3 Category switcher tabs: Notes | CT Questions | Textbooks.
   - Download file action with signed URL generator.
   - CR Modals: Leave Section (with mandatory CR transfer dropdown) and Add Course.

---

### 9.7 Bus Schedule (`BusScreen.tsx` vs `Bus.jsx`)
1. **Header:** 60 px `SubBar` with back arrow, centered "Bus Schedule", logo right.
2. **Top Transit Cards:**
   - Metro Rail transit card and Transport Desk Hotline button (`tel:...`).
3. **Direction Switcher:**
   - 58 px `SegmentedTabs`: "To Campus" vs "From Campus".
4. **Bus Route Cards (72 px):**
   - Route name, next departure countdown pill, active cycle progress bar, weekend badges (`Sat: HH:MM AM`), full schedule timetable modal.

---

### 9.8 Prayer Times (`PrayerScreen.tsx` vs `Prayer.jsx`)
1. **Header:** 60 px `SubBar` with back arrow, centered "Prayer Times", logo right.
2. **Hero Card:**
   - Current / Next prayer countdown banner, sunrise and sunset times, active prayer interval progress bar.
3. **5 Daily Salah Cards (72 px):**
   - Fajr, Dhuhr, Asr, Maghrib, Isha + Friday Jummah with Azan and Jamaat times.
4. **Campus Musallah Directory:**
   - Building 1 and Building 2 Musallah cards with floor details and ablution room guidance.

---

### 9.9 Student Directory & Profile (`DirectoryScreen.tsx` & `StudentProfileScreen.tsx`)
1. **Student Directory:**
   - 60 px `SubBar`.
   - 58 px Search bar + 72 px Department Picker trigger card.
   - 72 px Student Row Cards (44×44 px Avatar, full name, intake, section, Connect button).
2. **StudentProfileScreen:**
   - 72 px Identity Hero Card (Avatar, Name, Intake/Sec, Blood Group, CR badge).
   - **Mutually Connected:** 72 px 1-tap direct communication cards (CampusOne Chat, WhatsApp, Call Phone, Send Email).
   - **Pending Outgoing:** 72 px Amber status card + 58 px "Cancel Connection Request" button.
   - **Unconnected:** 72 px Shield Privacy card + 58 px "Send Connection Request" CTA.

---

### 9.10 Messages & Direct Chat (`MessagesHome.tsx` & `MessageThread.tsx`)
1. **MessagesHome:**
   - Root `TopBar` with title "Messages".
   - Full-width 72 px thread row cards (Avatar, Name, last snippet, timestamp, unread badge).
2. **MessageThread:**
   - Bilateral 60 px `SubBar` with contact avatar, name, and direct phone call shortcut button.
   - Chat message bubbles with timestamp, sent/read receipts.
   - 58 px bottom input bar with send button.

---

### 9.11 Campus Maintenance & Issues (`CampusIssuesScreen.tsx`, `MyReportsScreen.tsx`, `ReportDetailScreen.tsx`)
1. **Campus Issues Public Board:**
   - 60 px `SubBar` with back button.
   - Search bar + status tabs (All, Open, In Progress, Resolved).
   - Anonymous report cards with "Me Too" vote button.
2. **My Reports Screen:**
   - 58 px "Report an Issue" CTA.
   - 72 px Report cards with status badge (Open: Amber, In Progress: Info Blue, Resolved: Green).
3. **Report Detail Screen:**
   - Visual vertical progress timeline track: Submitted $\rightarrow$ Assigned $\rightarrow$ In Progress $\rightarrow$ Resolved.
   - Trade badge, photo before/after slider, staff notes.

---

### 9.12 Role Dashboards (Staff & Admin)
1. **Staff Dashboard (`StaffDashboardScreen.tsx`):**
   - 3 Bottom Tabs: `Home` (`/staff`), `Explore` (`/explore`), `Settings` (`/settings`).
   - Home: Stats cards (Assigned to Me, In Progress, Completed).
   - Quick advance status buttons ("Start Work", "Mark Resolved" with proof photo upload).
   - Decline report modal with reason selector.
2. **Admin Dashboard (`AdminDashboardScreen.tsx`):**
   - 4 Bottom Tabs: `Home` (`/admin`), `Study Hub` (`/study-hub`), `Explore` (`/explore`), `Settings` (`/settings`).
   - Home: Stat overview cards (Total Reports, Open, In Progress, Resolved).
   - Report Triage table with trade/staff assignment modal.
   - Direct shortcuts to Manage Users, Manage Faculty, Emergency Dashboard Banners, and System Logs.

---

### 9.13 Legal & University Policies (`PrivacyPolicyScreen.tsx`, `TermsScreen.tsx`)
- 60 px `SubBar` with back button.
- Clean typography container (`max-w-2xl px-4 py-4`) detailing data protection, university compliance, and security policies.

---

## 10. System Feedback & Micro-Interactions

### 10.1 Offline Banner (`OfflineBanner.jsx`)
- Fixed bar rendered directly below the 60 px TopBar/SubBar when network connectivity is lost.
- Appearance: `36px` height, `var(--surface-2)`, `var(--border)`, amber cloud-off icon (`var(--warn)`), text: *"Showing saved data · Offline mode"*, right "Sync" retry button.

### 10.2 Skeleton Loaders (`SkeletonList.jsx`)
- During data loading, replaces blank screens or generic spinners with 5 pulsing placeholder rows matching the 72 px card geometry (44×44 px thumbnail box + two staggered lines).

### 10.3 Floating Toast System (`ToastProvider.jsx`)
- Bottom-anchored floating pill positioned at `bottom: 84px` (sitting cleanly above the bottom navigation bar).
- Success (green checkmark), Danger (red alert), Info (blue icon).
- Auto-dismisses in 3000ms.

### 10.4 Liquid Toggle Switch (`LiquidToggle.jsx`)
- Cohesive fluid droplet thumb with squash-and-stretch volume preservation.
- Default track `52 × 32 px` (radius `16px`), thumb `24 × 24 px` (radius `12px`), travel `20px`.

---

## 11. Implementation Phases (Execution Order)

```
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: Responsive Shell, 60px TopBar & SubBar, Flat Bottom Nav Bar  │
├────────────────────────────────────────────────────────────────────────┤
│ PHASE 2: Create Missing Core Routes (/explore & /settings)             │
├────────────────────────────────────────────────────────────────────────┤
│ PHASE 3: 58/72 Standard Component Primitives & Bottom Sheet Engine    │
├────────────────────────────────────────────────────────────────────────┤
│ PHASE 4: Home Dashboard 1:1 Parity (Hero Banner, Strips, Frequent Tools)│
├────────────────────────────────────────────────────────────────────────┤
│ PHASE 5: Core Services Parity (Blood, Rides, Market, Lost & Found)     │
├────────────────────────────────────────────────────────────────────────┤
│ PHASE 6: Academics, Directory, Messages, and Role Dashboards          │
├────────────────────────────────────────────────────────────────────────┤
│ PHASE 7: Viewport Verification Gate & Zero-Regression Testing          │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Phase 1 — Shell & Navigation (`AppShell.jsx`):**
   - Detect mobile viewport `< 1280px`.
   - Mount 60 px `TopBar` for root tabs and 60 px `SubBar` for child routes.
   - Completely disable the mobile slide-in hamburger drawer.
   - Render the 1-piece flat-top midnight navy bottom nav bar with active electric blue capsule pill and 5 student tabs: `Home`, `Study Hub`, `Messages`, `Explore`, `Settings`.
2. **Phase 2 — Core Missing Routes:**
   - Add `/explore` route using the 4-category accordion layout from `ExploreScreen.tsx`.
   - Add `/settings` route using the unified profile hero and liquid toggles from `SettingsScreen.tsx`.
3. **Phase 3 — 58/72 Primitives & Bottom Sheets:**
   - Build reusable `SegmentedTabs.jsx` (58 px outer height, 50 px sliding pill, count badge).
   - Build reusable `ContentCardRow.jsx` (72 px outer height, 44×44 px icon/avatar, clamped 1-line text).
   - Build `BottomSheet.jsx` (drag handle, backdrop dismiss, rounded top corners).
4. **Phase 4 — Home Dashboard:**
   - Align `StudentDashboard.jsx` to render the auto-changing hero banner, 72 px Status Strips (100 px left pill + 3-col stats), 4 horizontal 72 px Frequent Tools, and 58 px SegmentedTabs Community Updates.
5. **Phase 5 — High-Impact Services:**
   - Blood Donation: 58 px CTAs, `HospitalMapModal`, 72 px donor rows.
   - Campus Rides: Uber timeline route spine, `RideRouteMapModal`.
   - Marketplace: 2-column item grid, 58 px dual control bar, `DirectionMapModal`.
   - Lost & Found: 72 px `LFCard` rows, proof claim flow.
6. **Phase 6 — Academics, Directory & Messages:**
   - Study Hub: 58 px SegmentedTabs, 72 px course rows, CR leave/transfer modal.
   - Directory: 72 px student rows, Student Profile 1-tap communication cards.
   - Messages: Single-screen list to single-screen chat thread with SubBar.
   - Role Dashboards: Staff assigned task triage and Admin report management.
7. **Phase 7 — Verification & Release:**
   - Test across iPhone (390px, 428px) and Android (360px, 412px) viewports.
   - Ensure zero text clipping, zero horizontal overflow, and identical desktop experience on $\ge$ 1280px screens.

---

*This document is the authoritative design and technical specification for the CampusOne Web mobile transformation. All future development on mobile parity must reference and adhere to the tokens and structures defined herein.*
