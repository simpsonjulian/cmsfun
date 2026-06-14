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

## Deploying to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket.
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Add the environment variables in **Project Settings → Environment Variables**:
   - `CONTENTFUL_SPACE_ID`
   - `CONTENTFUL_ACCESS_TOKEN`
   - `CONTENTFUL_ENVIRONMENT` (optional, defaults to `master`)
4. Deploy. Vercel runs `next build`, producing the static pages.

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
