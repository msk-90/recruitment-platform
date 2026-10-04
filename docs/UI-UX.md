# UI/UX Design Document
## Recruitment & Talent Management Platform

**Version:** 1.0
**Date:** Day 2
**Stack:** MERN (MongoDB, Express, React, Node.js) + Tailwind CSS
**Author:** Muhammad Saad Khan

---

## 1. Design Principles

- **Clarity first** — recruiters should find candidates in < 3 clicks
- **Role-based UI** — Recruiter and Candidate see different nav/dashboards
- **Consistency** — same spacing, colors, and components everywhere
- **Responsive** — mobile (375px) → tablet (768px) → desktop (1280px+)
- **Accessibility** — WCAG AA contrast, keyboard-navigable forms, ARIA labels
- **Feedback** — every action shows loading / success / error state

---

## 2. Design System

### 2.1 Color Palette

| Token            | Hex       | Usage                          |
|------------------|-----------|--------------------------------|
| `primary`        | `#2563EB` | Buttons, links, active nav     |
| `primary-hover`  | `#1D4ED8` | Hover state                    |
| `secondary`      | `#0F172A` | Headings, primary text         |
| `muted`          | `#64748B` | Secondary text, labels         |
| `success`        | `#16A34A` | Hired, shortlisted badges      |
| `warning`        | `#F59E0B` | Interview, pending badges      |
| `danger`         | `#DC2626` | Rejected, delete actions       |
| `info`           | `#0EA5E9` | Applied, neutral badges        |
| `background`     | `#F8FAFC` | App background                 |
| `card`           | `#FFFFFF` | Cards, modals                  |
| `border`         | `#E2E8F0` | Dividers, input borders        |

### 2.2 Typography

- **Font family:** `Inter` (fallback: `system-ui, sans-serif`)
- **Scale:**

| Element      | Size | Weight | Line Height |
|--------------|------|--------|-------------|
| H1 (page)    | 32px | 700    | 1.2         |
| H2 (section) | 24px | 600    | 1.3         |
| H3 (card)    | 18px | 600    | 1.4         |
| Body         | 16px | 400    | 1.6         |
| Small/Label  | 14px | 500    | 1.4         |
| Caption      | 12px | 400    | 1.4         |

### 2.3 Spacing

4px scale: `4, 8, 12, 16, 24, 32, 48, 64`
Tailwind: `p-1, p-2, p-3, p-4, p-6, p-8, p-12, p-16`

### 2.4 Radius & Shadow

- **Radius:** `rounded-lg` (8px) for cards, `rounded-md` (6px) for buttons/inputs
- **Shadow:** `shadow-sm` for cards, `shadow-md` for modals/dropdowns

### 2.5 Component Styles (Tailwind)

**Button — Primary**
```
bg-blue-600 hover:bg-blue-700 text-white font-medium
px-4 py-2 rounded-md transition
```

**Button — Secondary**
```
bg-white border border-slate-300 hover:bg-slate-50
text-slate-700 font-medium px-4 py-2 rounded-md
```

**Input**
```
w-full px-3 py-2 border border-slate-300 rounded-md
focus:ring-2 focus:ring-blue-500 focus:border-blue-500
```

**Card**
```
bg-white rounded-lg shadow-sm border border-slate-200 p-6
```

**Badge — Status**
```
inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
```
- Applied → `bg-blue-100 text-blue-700`
- Shortlisted → `bg-amber-100 text-amber-700`
- Interview → `bg-purple-100 text-purple-700`
- Hired → `bg-green-100 text-green-700`
- Rejected → `bg-red-100 text-red-700`

---

## 3. User Roles & Access

| Role      | Access                                                        |
|-----------|---------------------------------------------------------------|
| Recruiter | Dashboard, Jobs CRUD, Applicants, Candidate Detail, Profile   |
| Candidate | Job List, Job Detail, Apply, My Applications, Profile         |
| Admin*    | All + user management (future scope)                          |

---

## 4. Navigation Structure

### Recruiter Navbar
```
[🧑‍💼 HireHub]   Dashboard · Jobs · Candidates        [🔔] [👤 Profile ▼]
```

### Candidate Navbar
```
[🧑‍💼 HireHub]   Jobs · My Applications               [🔔] [👤 Profile ▼]
```

### Mobile
Hamburger menu → slide-in drawer with same links.

---

## 5. Screen Designs

### 5.1 Login / Register

**Layout:** Centered card on gradient background (`from-blue-50 to-slate-100`)

**Elements:**
- Logo + tagline
- Role tabs: `Recruiter | Candidate`
- Inputs: Email, Password
- Primary button: "Sign In"
- Link: "New here? Create an account"

**States:** idle, loading (button spinner), error (red text under input), success (redirect)

```
┌─────────────────────────────────────┐
│         [ Logo: HireHub ]           │
│         Welcome back                │
│                                     │
│   [ Recruiter ]  [ Candidate ]      │
│                                     │
│   Email                             │
│   [___________________________]     │
│                                     │
│   Password                          │
│   [___________________________]     │
│                                     │
│   [        Sign In         ]        │
│                                     │
│   New here?  Register               │
└─────────────────────────────────────┘
```

---

### 5.2 Dashboard

**Recruiter Dashboard:**
- Header: "Welcome back, {name} 👋"
- 4 stat cards: Active Jobs · Total Applicants · Shortlisted · Hired
- Line chart: Applications over last 30 days
- Donut chart: Pipeline breakdown
- Table: Recent Applications

**Candidate Dashboard:**
- 3 stat cards: Applications Sent · In Review · Interviews
- List: My Applications
- CTA: "Browse Jobs"

```
┌──────────────────────────────────────────────────────────┐
│ Navbar                                                   │
├──────────────────────────────────────────────────────────┤
│ Welcome back, Saad 👋                                    │
│                                                          │
│ [12 Active Jobs] [48 Applicants] [15 Shortlisted] [5 Hired] │
│                                                          │
│ ┌────────────────────┐   ┌────────────────────┐          │
│ │ Applications (30d) │   │ Pipeline Breakdown │          │
│ │   [line chart]     │   │   [donut chart]    │          │
│ └────────────────────┘   └────────────────────┘          │
│                                                          │
│ Recent Applications                                      │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Ali Khan   · Frontend Dev · Shortlisted   [View]     │ │
│ │ Sara Ahmed · Backend Dev  · Applied       [View]     │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

### 5.3 Jobs Page

**Recruiter view:**
- Header: "Jobs" + `[+ Create Job]`
- Filters: Search input · Status dropdown · Type dropdown
- Job cards: title, location, type, salary, applicant count, status badge, `[Edit] [Delete]`

**Candidate view:**
- Same list, no Edit/Delete
- Each card has `[View Details]` → Job Detail page
- Apply button on detail page

```
┌──────────────────────────────────────────────────────────┐
│ Jobs                                    [+ Create Job]   │
├──────────────────────────────────────────────────────────┤
│ 🔍 [Search...]   [Status ▼]   [Type ▼]                   │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Frontend Developer                     ● Open        │ │
│ │ Remote · Full-time · $60k–80k                        │ │
│ │ 14 applicants                    [Edit] [Delete]     │ │
│ └──────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Backend Engineer                       ● Closed      │ │
│ │ On-site · Full-time · $70k–90k                       │ │
│ │ 22 applicants                    [Edit] [Delete]     │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

**Empty state:** illustration + "No jobs yet. Create your first job."

---

### 5.4 Candidates Page

**A) Applicants List (per job):**
- Header: "Applicants for: {job title} ({count})"
- Status filter tabs: All · Applied · Shortlisted · Interview · Hired · Rejected
- Applicant cards: avatar, name, email, skills, years, `[Shortlist] [Reject] [View]`

**B) Candidate Detail:**
- Header: back arrow + name + role + experience
- Contact: email, phone
- Skills: chip list
- Applied for: job title + status badge
- Actions: `[Move to Interview] [Hire] [Reject]`
- Resume: `[📄 Download CV]`
- Cover letter: text block

```
┌──────────────────────────────────────────────────────────┐
│ Applicants for: Frontend Developer (14)                  │
├──────────────────────────────────────────────────────────┤
│ [All] [Applied] [Shortlisted] [Interview] [Hired] [✗]    │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ 👤 Ali Khan              ali@mail.com                │ │
│ │ React, Node · 3 yrs  [Shortlist][Reject][View]       │ │
│ └──────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ 👤 Sara Ahmed            sara@mail.com               │ │
│ │ Vue, Python · 2 yrs  [Shortlist][Reject][View]       │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

### 5.5 Profile Page

- Avatar + `[Upload Photo]`
- Fields: Full Name · Email · Phone · Role (read-only)
- Recruiter-only: Company · Position
- Candidate-only: Skills (chip input) · Resume upload · Bio
- Actions: `[Save Changes]` · `[Change Password]`

```
┌──────────────────────────────────────────────────────────┐
│ My Profile                                               │
├──────────────────────────────────────────────────────────┤
│ ┌────────┐                                               │
│ │ Avatar │  [Upload Photo]                              │
│ └────────┘                                               │
│                                                          │
│ Full Name   [Saad Khan_____________________]             │
│ Email       [saad@company.com______________]             │
│ Role        [Recruiter ▼]  (read-only)                   │
│ Company     [TechCorp_____________________]              │
│ Phone       [+92 300 1234567_______________]             │
│                                                          │
│ [ Save Changes ]   [ Change Password ]                   │
└──────────────────────────────────────────────────────────┘
```

---

## 6. Reusable Components (React + Tailwind)

| Component      | Purpose                                |
|----------------|----------------------------------------|
| `Navbar`       | Top navigation, role-aware             |
| `Button`       | primary / secondary / danger variants  |
| `Input`        | text, email, password with error state |
| `Select`       | dropdowns for filters                  |
| `Card`         | wrapper for job/applicant cards        |
| `Badge`        | status indicator                       |
| `Modal`        | create job, confirm delete             |
| `Table`        | recent applications, candidate list    |
| `StatCard`     | dashboard metric card                  |
| `EmptyState`   | illustration + message                 |
| `Loader`       | spinner for async actions              |
| `Toast`        | success/error notifications            |

---

## 7. User Flow

```
Landing → Login → [Recruiter | Candidate]

Recruiter:
  Dashboard → Jobs → Create Job
            → Applicants → Candidate Detail → Update Status

Candidate:
  Jobs → Job Detail → Apply → My Applications → Track Status

Both:
  Navbar → Profile → Edit → Save
```

---

## 8. Responsive Breakpoints

| Breakpoint | Width      | Layout Changes                        |
|------------|------------|---------------------------------------|
| Mobile     | < 640px    | 1-column, hamburger nav, stacked cards|
| Tablet     | 640–1024px | 2-column grid, condensed nav          |
| Desktop    | > 1024px   | 3–4 column grid, full navbar          |

---

## 9. Accessibility

- All inputs have `<label>` + `aria-label`
- Focus rings visible on all interactive elements
- Color contrast ≥ 4.5:1 for text
- Keyboard navigable (Tab order logical)
- Alt text on all images/avatars

---

## 10. Deliverables Checklist

- [x] Design system (colors, typography, spacing)
- [x] Component library (Tailwind classes)
- [x] Wireframes: Login, Dashboard, Jobs, Candidates, Profile
- [x] User flow diagram
- [x] Responsive breakpoints
- [x] Accessibility guidelines

---

## 11. Next Steps (Day 3+)

- Day 3: Backend setup — Express + MongoDB connection
- Day 4: Auth module (register/login + JWT)
- Day 5: Job CRUD API
- Day 6: Application + Candidate APIs
- Day 7: Frontend scaffolding (React + Tailwind + Router)
- Day 8+: Build pages against the above designs

---

**End of Document**