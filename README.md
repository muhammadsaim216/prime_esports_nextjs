# Prime Esports — Next.js Edition

This is the full Next.js 16 (App Router) conversion of the original Vite + React "Prime Esports" application.

## Stack
- Next.js 16 (App Router, Turbopack)
- TypeScript
- Tailwind CSS v3
- Supabase (auth + database, same backend/schema as before)
- shadcn/ui component library
- React Hook Form + Zod validation

## Getting Started

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## Environment Variables

Create `.env.local` (already included with the original project's Supabase credentials):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Project Structure

- `app/(public)/...` — Public marketing site (home, teams, scrims, tryouts, blogs, legal pages, auth)
- `app/dashboard/...` — Logged-in player dashboard (protected route)
- `app/admin/...` — Org admin console (protected, admin-only)
- `app/admin-setup` — First-run admin/org setup wizard
- `app/super-admin` — Platform-level super admin console
- `components/ui/` — shadcn/ui primitives
- `components/layout/` — Header, Footer, Announcement ticker
- `context/AuthContext.tsx` — Supabase auth provider (replaces old useAuth hook)
- `lib/supabase.ts` — Supabase client
- `components/auth/ProtectedRoute.tsx` — Client-side route guard for dashboard/admin layouts

## SEO

- Per-route metadata via Next.js Metadata API (`export const metadata` / `generateMetadata`)
- Dynamic `sitemap.xml` (`app/sitemap.ts`) pulling teams + published news from Supabase
- `robots.txt` (`app/robots.ts`) disallowing admin/dashboard routes
- Open Graph + Twitter card tags in root layout
- JSON-LD structured data (SportsOrganization) on the homepage
- Server-rendered metadata for dynamic team/blog/org pages (title, description, OG tags pulled from DB)

## Notes on the Conversion

- All client-side data-fetching (Supabase) is preserved as Client Components (`"use client"`), since this app's auth and most pages are highly interactive (forms, real-time dialogs, modals).
- Dynamic detail pages (team, blog post, org) use a server-component wrapper that calls `generateMetadata` (for SEO) and renders a client component for the interactive UI — best of both worlds.
- `react-router-dom` → replaced with Next.js `next/link` and `next/navigation` (`useRouter`, `usePathname`).
- The old `ProtectedRoute` / `SuperAdminRoute` components are replaced by a single reusable `ProtectedRoute` client component used inside the `dashboard` and `admin` route-group layouts, so every nested page is automatically protected without per-page boilerplate.
- The advanced rich block-based Blog/Announcement editor (`AdminBlogEditor.tsx`, 600+ lines) was intentionally simplified to a standard textarea-based editor in `app/admin/news`, preserving full CRUD + publish functionality without the custom WYSIWYG block builder.
