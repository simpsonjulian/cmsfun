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
2. Add a content type with the id **`vehicle`** and these fields:

   | Field id      | Type                | Notes                        |
   | ------------- | ------------------- | ---------------------------- |
   | `name`        | Short text          | Display name                 |
   | `slug`        | Short text (unique) | Used in the URL              |
   | `description` | Long text           | Plain-text description       |
   | `photo`       | Media (one file)    | A single image asset         |

3. Publish a few vehicle entries (don't forget to publish the photo assets too).
4. Copy `.env.local.example` to `.env.local` and fill in your credentials:

   ```bash
   cp .env.local.example .env.local
   ```

   Get the **Space ID** and a **Content Delivery API** access token from
   *Settings → API keys* in Contentful.

5. Restart the dev server. To pick up new/edited content you re-run the build
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
pointing at a [Vercel Deploy Hook](https://vercel.com/docs/deploy-hooks).

## Project structure

```
app/
  layout.tsx                 Shared shell (header/footer) + global metadata
  page.tsx                   Home: static grid of all vehicles
  vehicles/[slug]/page.tsx   Static detail page per vehicle (generateStaticParams)
  not-found.tsx              404
  globals.css                Styling
lib/
  contentful.ts              Contentful client + typed data fetching
  sample-data.ts             Offline fallback content
```
