# Logger

A personal engineering work-log tracker. Record the features, bugs, and improvements
you build at work, then mine them later for resume bullets and interview prep — and
optionally share a public, read-only portfolio of your work with anyone, no login
required.

## Features

- **Embedded auth** via Clerk (sign-in/sign-up rendered in-app, not a hosted redirect)
- **Entry log**: title, type (Feature / Bug Fix / Improvement / Tech Debt / Other, each
  with its own badge color), date, problem context, what you did, tech tags, impact,
  challenges/decisions, and an optional ticket/reference link
- **Rich text editing**: a Tiptap-based editor (bold, italic, inline code, code
  blocks, lists) for the long-form fields, stored as Markdown and rendered back
  with `react-markdown` on entry detail pages, cards, and the public portfolio
- **Dashboard**: search, filter by type/tech tag, sort by date, paginated (Previous/Next)
- **Stats**: total entries, counts by type, most-used tech tags
- **Resume bullet export**: one-click copy-to-clipboard bullet per entry, plus a
  bulk Markdown export of filtered/all entries
- **Profile**: name, experience, location, skills, bio, GitHub/LinkedIn/website links,
  and resume upload (PDF/Word)
- **Public portfolio**: opt individual entries into a public, read-only page at
  `/u/{username}` — no account needed to view it. Per-entry visibility is off by
  default; a separate "public summary" field lets you write a portfolio-friendly
  description instead of exposing your raw private notes
- **Dark mode**, mobile-first responsive layout with a floating quick-add button

Every entry and profile record is scoped to its owner (Clerk user ID) and enforced
at the API layer, not just hidden in the UI.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) + TypeScript
- [Clerk](https://clerk.com) for authentication (embedded components)
- [Prisma 7](https://www.prisma.io) + PostgreSQL ([Neon](https://neon.tech) /
  Vercel Postgres), via the `@prisma/adapter-pg` driver adapter
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) for resume storage
- [Tiptap](https://tiptap.dev) (`tiptap-markdown`) for rich-text entry fields,
  [react-markdown](https://github.com/remarkjs/react-markdown) for rendering them
- [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
  (built on [Base UI](https://base-ui.com))
- Deployed on [Vercel](https://vercel.com)

## Prerequisites

- Node.js 20+ and [pnpm](https://pnpm.io)
- A [Clerk](https://clerk.com) account
- A PostgreSQL database — [Neon](https://neon.tech) or Vercel Postgres both work
- A [Vercel](https://vercel.com) account (for Blob storage and deployment)

## Local setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure Clerk

1. Create an application at [dashboard.clerk.com](https://dashboard.clerk.com).
2. Under **Configure → SSO connections**, enable the sign-in methods you want
   (Email is enough to get started).
3. Under **Configure → Attack protection**, if you plan to test locally and hit
   sign-up getting stuck on a spinner, turn off **Bot sign-up protection** — it
   can hang on `localhost` in development.
4. Copy the **Publishable key** and **Secret key** from **API Keys**.

### 3. Provision a database

Either works — both give you a standard `postgresql://` connection string:

- **Neon**: create a project at [neon.tech](https://neon.tech), then copy the
  pooled (`DATABASE_URL`) and direct (`DATABASE_URL_UNPOOLED`) connection strings
  from the dashboard.
- **Vercel Postgres**: from a Vercel project's **Storage** tab, create a Postgres
  database (this also provisions on Neon under the hood) and copy the same two
  values from its quickstart snippet.

### 4. Provision Vercel Blob (for resume uploads)

From any Vercel project's **Storage** tab, create a **Blob** store, then copy
`BLOB_READ_WRITE_TOKEN` from its quickstart snippet.

### 5. Set environment variables

Copy `.env.example` to `.env.local` and fill in the values from the steps above:

```bash
cp .env.example .env.local
```

| Variable | Where it comes from |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk → API Keys |
| `CLERK_SECRET_KEY` | Clerk → API Keys |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `..._SIGN_UP_URL` | Leave as `/sign-in` / `/sign-up` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` / `..._SIGN_UP_...` | Leave as `/dashboard` |
| `DATABASE_URL` | Pooled Postgres connection string |
| `DATABASE_URL_UNPOOLED` | Direct (non-pooled) Postgres connection string |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob store quickstart |

### 6. Run migrations

```bash
pnpm exec prisma migrate dev
```

This also generates the Prisma Client (into `src/generated/prisma`, gitignored —
it's regenerated on every install via the `postinstall` script).

### 7. Start the dev server

```bash
pnpm dev
```

Visit [localhost:3000](http://localhost:3000).

## Deploying to Vercel

1. Push the repo to GitHub and import it into Vercel.
2. Add every variable from the table above to the project's **Environment
   Variables** (Settings → Environment Variables), scoped to **Production** (and
   Preview/Development if you want those to work too). `NEXT_PUBLIC_*` variables
   are baked in at build time — if you add or change one after a deploy, you need
   to **redeploy** for it to take effect, not just save the setting.
3. Vercel runs `pnpm install` (triggering the `postinstall` script, which runs
   `prisma generate`) and then `pnpm run build` automatically — no custom build
   command needed.
4. Run `prisma migrate deploy` against your production database before or after
   the first deploy (locally, with production env vars, or via a one-off script)
   to apply any migrations that haven't run yet.
5. If you want the public `/u/[username]` portfolio pages to actually be public,
   make sure **Settings → Deployment Protection** isn't gating Production
   deployments — that's a Vercel-level login wall separate from the app's own
   Clerk auth, and it'll block anonymous visitors from your public pages.

## Project structure

```
src/
  app/
    page.tsx                    # Landing page (adapts to signed-in/out)
    sign-in/, sign-up/           # Embedded Clerk auth pages
    (app)/                       # Authenticated app shell + pages
      dashboard/
      entries/new/, entries/[id]/, entries/[id]/edit/
      profile/
    u/[username]/                # Public, unauthenticated portfolio page
    api/
      entries/, entries/[id]/, entries/stats/
      profile/, profile/resume/, profile/username-availability/
      u/[username]/resume/       # Public resume download proxy
  components/                    # Shared UI (entry form/card, profile, etc.)
  components/rich-text-editor.tsx # Tiptap-based Markdown editor for entry fields
  components/markdown-content.tsx # Renders stored Markdown back to HTML
  components/ui/                 # shadcn/ui primitives
  lib/                           # Prisma client, validation schemas, helpers
  lib/markdown.ts                # Strips Markdown to plain text (bullets/previews)
  lib/entry-type-styles.ts       # Entry type labels + per-type badge colors
  proxy.ts                       # Clerk middleware — route protection allowlist
prisma/
  schema.prisma
  migrations/
```

## Notes

- All API routes under `/api` enforce their own auth check (`requireUserId()` in
  `src/lib/api-helpers.ts`) rather than relying on middleware, so they always
  return a clean `401` JSON response instead of an unpredictable redirect.
- Prisma 7 requires a driver adapter at runtime (`@prisma/adapter-pg`); see
  `src/lib/prisma.ts` for the singleton client setup.
- Resumes are stored as **private** Vercel Blob objects and served through
  authenticated (or, for public profiles, username-scoped) proxy routes — never
  linked to directly.
