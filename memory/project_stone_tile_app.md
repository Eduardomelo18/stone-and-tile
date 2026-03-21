---
name: Stone & Tile Care Business App
description: Full-stack business control app built for the stone and tile care company - tracks jobs, costs, profits, overheads, clients, calendar
type: project
---

Complete business control app built and running. Full build succeeded at Next.js 16.2.1.

**Why:** Owner needs to track exact cost per job, profit per job, and net business profit after overheads. This is the core business problem.

**Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4, Supabase (PostgreSQL), TypeScript.

**Structure:**
- `lib/types.ts` — all TypeScript interfaces
- `lib/supabase.ts` — lazy Supabase client (browser + server)
- `lib/calculations.ts` — all profit/cost formulas
- `supabase/schema.sql` — full DB schema (run in Supabase SQL editor)
- `supabase/seed.sql` — sample staff, clients, expenses
- `components/Sidebar.tsx` — responsive nav (mobile + desktop)
- `app/(app)/layout.tsx` — app shell with sidebar
- All pages under `app/(app)/`

**Routes (17 total):**
- Pages: /, /dashboard, /jobs, /jobs/new, /jobs/[id], /calendar, /clients, /clients/[id], /expenses, /reports, /settings
- API: /api/dashboard, /api/jobs, /api/jobs/[id], /api/jobs/[id]/costs, /api/jobs/[id]/labour, /api/jobs/[id]/materials, /api/jobs/[id]/sealers, /api/jobs/[id]/travel, /api/jobs/[id]/equipment, /api/jobs/[id]/other-costs, /api/clients, /api/clients/[id], /api/expenses, /api/expenses/[id], /api/staff, /api/staff/[id]

**Setup required:** Copy .env.local.example to .env.local and fill in Supabase credentials. Run schema.sql then seed.sql in Supabase SQL editor.

**How to apply:** This is the primary project. Reference this context when user asks about features, bugs, or changes to the app.
