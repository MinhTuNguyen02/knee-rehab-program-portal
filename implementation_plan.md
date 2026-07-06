# Day 8 - Clinical Portal Frontend: Dashboard + Leads Management

## Background

Building the **knee-rehab-program-portal** - an admin clinical portal for managing patient assessments and leads. The Next.js 16 project exists but only has the default template. The backend API (NestJS on port 3001) is already running with all endpoints:

- `POST /auth/login` - Returns `{ access_token, email, role }`
- `GET /dashboard/stats` - Returns `{ totalSubmissions, totalOptedIn, byZone: { green, amber, red } }` (Protected)
- `GET /leads?page=&limit=&zone=` - Paginated leads with zone filter (Protected)
- `GET /leads/:id` - Lead detail with assessment history (Protected)
- `GET /assessments?page=&limit=&zone=&source=` - Paginated assessments (Protected)
- `GET /assessments/:id` - Assessment detail (Protected)

### Design Read (per SKILL.md Section 0.B)

**"Reading this as: B2B clinical admin portal/dashboard for healthcare professionals, with a trust-first, clean, functional language, leaning toward Tailwind v4 + Geist + restrained motion."**

> [!NOTE]
> Per the design-taste-frontend SKILL.md Section 13, dashboards, dense product UI, admin panels, and data tables are **out of scope** for the landing-page aesthetic skill. The skill explicitly says: "If the brief is one of the above, say so explicitly, point to the right tool, and only apply this skill's marketing-page parts to the surfaces where they apply." We will use the skill's **general engineering standards** (typography, color, accessibility, performance) but not its landing-page-specific layout rules (hero constraints, bento grids, eyebrow limits, etc.).

### Dials (Section 1)

- `DESIGN_VARIANCE: 4` - Trust-first clinical, predictable layout
- `MOTION_INTENSITY: 3` - Static with subtle hover/active states only
- `VISUAL_DENSITY: 6` - Data-rich but not cockpit-dense

---

## Proposed Changes

The implementation is split into **5 phases**, each buildable and testable independently.

---

### Phase 1: Foundation - Design System, Auth Infrastructure, Layout Shell

Set up the core design tokens, authentication flow (login page + JWT cookie storage), and the app shell (sidebar navigation + top bar).

#### [MODIFY] [globals.css](file:///home/intern-nmtu3/nmtu-batch52/knee-rehab-program-portal/app/globals.css)
- Define CSS custom properties for the design system: colors (zinc/slate neutrals, emerald accent), spacing scale, border-radius scale
- Zone colors: green (#10B981), amber (#F59E0B), red (#EF4444) per Context.md spec
- Dark mode tokens via `prefers-color-scheme`

#### [MODIFY] [layout.tsx](file:///home/intern-nmtu3/nmtu-batch52/knee-rehab-program-portal/app/layout.tsx)
- Update metadata (title: "Clinical Portal - Knee Rehab Program")
- Keep Geist + Geist Mono fonts (already set up, matches skill recommendation)

#### [NEW] `app/login/page.tsx`
- Email + password login form
- Calls `POST /auth/login` via the API
- On success: stores JWT token in an httpOnly cookie via a Server Action (or Route Handler)
- Error handling: inline error messages for invalid credentials
- Clean, trust-first design: centered card, clear labels, accessible form

#### [NEW] `app/api/auth/login/route.ts`
- Next.js Route Handler to proxy login and set httpOnly cookie with JWT token
- This avoids exposing JWT directly to client JavaScript

#### [NEW] `app/api/auth/logout/route.ts`
- Route Handler to clear the auth cookie

#### [NEW] `middleware.ts`
- Next.js middleware at project root
- Checks for auth cookie on protected routes (`/dashboard`, `/leads`, `/assessments`)
- Redirects to `/login` if not authenticated

#### [NEW] `lib/api.ts`
- API client utility: wraps `fetch` with base URL from `NEXT_PUBLIC_API_URL`
- `fetchWithAuth(url, options)` - attaches JWT token from cookie
- Error handling helpers

#### [NEW] `lib/auth.ts`
- Server-side auth utilities: `getToken()`, `isAuthenticated()`
- Read JWT from cookies using `next/headers`

#### [NEW] `app/(portal)/layout.tsx`
- Route group layout for authenticated pages
- Sidebar navigation (Dashboard, Leads, Assessments)
- Top bar with user email display and logout button
- Responsive: sidebar collapses to hamburger on mobile

---

### Phase 2: Dashboard Page - KPI Cards + Recent Activity

#### [NEW] `app/(portal)/dashboard/page.tsx`
- Server Component that fetches `GET /dashboard/stats`
- Displays 4 KPI cards:
  - Total Submissions (count)
  - Opted-In Patients (count)
  - Zone Distribution (green/amber/red counts)
  - Conversion Rate (totalOptedIn / totalSubmissions %)
- Recent submissions section: fetches `GET /assessments?limit=5` for a quick preview table
- Zone distribution visual: simple horizontal bar or colored segments (no recharts dependency for now)

#### [NEW] `components/KPICard.tsx`
- Reusable card: label, value (large display), optional delta/trend indicator
- Color-coded border or accent based on context
- Uses Geist Mono for numeric values

#### [NEW] `components/ZoneBadge.tsx`
- Small badge component for zone display (Green/Amber/Red)
- Uses the zone colors from design tokens

---

### Phase 3: Leads Table Page - Sort, Filter, Search, Pagination

#### [NEW] `app/(portal)/leads/page.tsx`
- Client Component (needs interactivity for sort/filter/search)
- Fetches `GET /leads` with query params
- Table columns: Name (firstName + lastName), Email, Zone, Score, Knee Side, Date
- Features:
  - **Search**: text input filtering by name/email (client-side for simplicity, sends to API if server-side needed)
  - **Filter**: zone dropdown (All / Green / Amber / Red)
  - **Sort**: clickable column headers (name, date, zone) - client-side sort
  - **Pagination**: 20 per page, prev/next buttons with page indicator

#### [NEW] `components/DataTable.tsx`
- Reusable table component with sort indicators on headers
- Responsive: horizontal scroll on small screens
- Row hover states, zebra striping

#### [NEW] `components/SearchBar.tsx`
- Search input with icon (from @phosphor-icons/react)
- Debounced input to avoid excessive re-renders

#### [NEW] `components/ZoneFilter.tsx`
- Dropdown/select for filtering by zone
- Options: All, Green, Amber, Red (with colored indicators)

#### [NEW] `components/Pagination.tsx`
- Page navigation: Previous / page numbers / Next
- Shows "Page X of Y" and total count

---

### Phase 4: Lead Detail Page

#### [NEW] `app/(portal)/leads/[id]/page.tsx`
- Dynamic route: shows full patient info + assessment history
- Server Component fetching `GET /leads/:id`
- Sections:
  - **Patient Info**: name, email, mobile, age, gender, knee side, consent status, notification prefs
  - **Assessment History**: table of linked assessments (displayId, pain, function, score, zone, date)
- Back button to return to leads list

---

### Phase 5: Assessments Table Page + Polish

#### [NEW] `app/(portal)/assessments/page.tsx`
- Similar structure to Leads table
- All submissions (anonymous + opted-in)
- Columns: Display ID, Pain, Function, Score, Zone, Source, Entry Type, Date, Linked Patient
- Zone filter, pagination
- Click row to view assessment detail or linked lead

#### General Polish
- Loading skeletons for all data-fetching pages
- Empty states (no data yet illustrations)
- Error boundaries
- Mobile responsive testing
- Logout functionality verified

---

## Dependencies to Install

```bash
npm install @phosphor-icons/react
```

No other dependencies needed. We use:
- **Tailwind v4** (already installed)
- **Geist + Geist Mono** fonts (already installed via `next/font`)
- **Native fetch** for API calls
- **No chart library** (simple CSS-based zone visualization)

---

## Open Questions

> [!IMPORTANT]
> **API URL**: The `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:3001`. The backend is running on port 3001. Is this correct, or should it be port 3000?

> [!IMPORTANT]
> **Search behavior**: Should search be client-side (filter already-fetched data) or server-side (send search query to API)? The current API doesn't have a search parameter for leads. I'll implement client-side search first. If you want server-side, we'd need to add a `search` query param to the backend.

---

## Verification Plan

### Automated Tests
- `npm run build` - verify the portal builds without errors
- `npm run lint` - verify no lint errors

### Manual Verification
- Login flow: email + password -> access dashboard -> verify redirect works
- Dashboard: KPI cards show real data from the database
- Leads table: sort by name/date/zone, filter by zone, search by name/email, pagination works
- Lead detail: click a lead -> see full patient info + assessment history
- Assessments table: all submissions visible with filters
- Logout: clears session, redirects to login
- Mobile: sidebar collapses, tables scroll horizontally
- Protected routes: accessing `/dashboard` without login redirects to `/login`
