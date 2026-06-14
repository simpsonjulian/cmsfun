# Vehicle Showcase

A small demo of serving external content with a headless CMS. It renders a
collection of **vehicles** (photo, name, description) from
[Contentful](https://www.contentful.com/), built with **Next.js** (App Router)
and deployed on **Vercel**.

Pages are **statically generated (SSG)** at build time — the home grid and every
vehicle detail page are pre-rendered, so no CMS calls happen at request time.

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

> **No Contentful account needed to try it.** If `CONTENTFUL_SPACE_ID` /
> `CONTENTFUL_ACCESS_TOKEN` are not set, the app falls back to built-in sample
> data (see `lib/sample-data.ts`).

## Connecting Contentful

1. Create a free space at [contentful.com](https://www.contentful.com/).
2. Copy `.env.local.example` to `.env.local`:

   ```bash
   cp .env.local.example .env.local
   ```

3. Fill in `.env.local` with your **Space ID**, a **Content Delivery API** token
   (read-only, used by the app), and a **Content Management API** token
   (write access, used only by the seed script in the next step). All are under
   *Settings → API keys* in Contentful.

### Seed the content model + demo vehicles

Instead of clicking through the Contentful UI, run the one-time seed script. It
creates the `vehicle` content type and uploads/publishes the four demo vehicles
(photos included). It's idempotent, so re-running skips anything that exists.

```bash
npm run seed
```

The `vehicle` content type it creates:

| Field id      | Type                | Notes                  |
| ------------- | ------------------- | ---------------------- |
| `name`        | Short text (Symbol) | Display name           |
| `slug`        | Short text, unique  | Used in the URL        |
| `description` | Long text (Text)    | Plain-text description |
| `photo`       | Media (one asset)   | A single image         |

After seeding, restart the dev server — it now reads live content from
Contentful. To pick up later content edits you re-run the build
(`npm run build`), since pages are static.

## Deploying to Vercel (CLI)

Requires the [Vercel CLI](https://vercel.com/docs/cli) (`npm i -g vercel`).

```bash
# 1. Authenticate (opens a browser; skips if already logged in)
vercel login

# 2. Create a brand-new Vercel project named "cmsfun"
vercel project add cmsfun

# 3. Link this directory to that project (auto-detects Next.js)
vercel link --project cmsfun --yes

# 4. Add Contentful credentials to the Production environment
#    (each prompts for the value, so secrets stay out of shell history)
vercel env add CONTENTFUL_SPACE_ID production
vercel env add CONTENTFUL_ACCESS_TOKEN production
vercel env add CONTENTFUL_ENVIRONMENT production   # optional; enter "master"

# 5. Deploy to production
vercel --prod
```

Notes:

- Skipping step 4 still deploys successfully — it shows the built-in sample data,
  which is a quick way to smoke-test the deploy.
- Run plain `vercel` (without `--prod`) any time for a throwaway preview URL.
- Linking creates a `.vercel/` directory; it's already git-ignored.

To rebuild automatically when content changes, add a
[Contentful webhook](https://www.contentful.com/developers/docs/concepts/webhooks/)
pointing at a [Vercel Deploy Hook](https://vercel.com/docs/deploy-hooks) — or use
the official Contentful Vercel app, which wires this up for you.

## Content preview (Draft Mode)

The Contentful Vercel app can show **unpublished** edits in-context via Next.js
Draft Mode. This is already implemented:

- `app/api/enable-draft/route.ts` — the [toolkit](https://www.contentful.com/developers/docs/tools/vercel/vercel-nextjs/)
  handler the Contentful app calls to turn Draft Mode on.
- `app/api/disable-draft/route.ts` — turns it back off.
- Pages read `draftMode()` and fetch from Contentful's **Preview API** when it's
  enabled (`lib/contentful.ts`).

To enable it on Vercel:

1. Set `CONTENTFUL_PREVIEW_ACCESS_TOKEN` (a Content Preview API token) in the
   project's env vars — the Contentful app usually adds this automatically.
2. Turn on **Protection Bypass for Automation** in *Vercel → Settings →
   Deployment Protection* (the handler uses its token to authorize preview).
3. In the Contentful app's setup, pick `/api/enable-draft` as the Draft Mode route.

Production stays statically generated (published content); pages only render
dynamically when the Draft Mode cookie is present.

## Project structure

```
app/
  layout.tsx                 Shared shell (header/footer) + global metadata
  page.tsx                   Home: static grid of all vehicles
  vehicles/[slug]/page.tsx   Static detail page per vehicle (generateStaticParams)
  api/enable-draft/route.ts  Draft Mode on (Contentful preview)
  api/disable-draft/route.ts Draft Mode off
  not-found.tsx              404
  globals.css                Styling
lib/
  contentful.ts              Delivery + preview clients, typed data fetching
  sample-data.ts             Offline fallback content
scripts/
  seed-contentful.mjs        One-time content seeder (`npm run seed`)
```
