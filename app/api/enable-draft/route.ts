// Draft Mode route handler for the Contentful Vercel app.
//
// Contentful's entry-sidebar "Open preview" calls this route. The toolkit's
// handler verifies Vercel's Protection Bypass for Automation token, enables
// Next.js Draft Mode, and redirects to the requested `path` so the page renders
// unpublished content. Requires "Protection Bypass for Automation" to be enabled
// in the Vercel project settings.
export { enableDraftHandler as GET } from '@contentful/vercel-nextjs-toolkit/app-router';
