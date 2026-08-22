// End-to-end proof: edit a vehicle in Contentful -> publish -> poll the live
// site until the change appears. Exercises the whole pipeline:
//   CMS write -> Contentful webhook -> Vercel deploy hook -> build -> live HTML.
//
// Usage:
//   npm run verify:e2e -- https://your-prod-url.vercel.app
//
// Reads from .env.local (via the npm script):
//   CONTENTFUL_SPACE_ID, CONTENTFUL_MANAGEMENT_TOKEN, CONTENTFUL_ENVIRONMENT
// Optional, if Vercel Deployment Protection covers production:
//   VERCEL_AUTOMATION_BYPASS_SECRET  (sent as x-vercel-protection-bypass header)

import contentfulManagement from 'contentful-management';

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const ENVIRONMENT_ID = process.env.CONTENTFUL_ENVIRONMENT || 'master';
const BYPASS = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

const PROD_URL = (process.argv[2] || '').replace(/\/$/, '');

if (!SPACE_ID || !MANAGEMENT_TOKEN) {
  console.error('Missing CONTENTFUL_SPACE_ID / CONTENTFUL_MANAGEMENT_TOKEN in .env.local.');
  process.exit(1);
}
if (!PROD_URL) {
  console.error('Usage: npm run verify:e2e -- https://your-prod-url.vercel.app');
  process.exit(1);
}

const TIMEOUT_MS = 8 * 60 * 1000; // give the rebuild up to 8 minutes
const POLL_MS = 10 * 1000;
const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

async function fetchPage(url) {
  const headers = BYPASS ? { 'x-vercel-protection-bypass': BYPASS } : {};
  const res = await fetch(url, { headers, cache: 'no-store' });
  return { status: res.status, body: await res.text() };
}

async function main() {
  const client = contentfulManagement.createClient({ accessToken: MANAGEMENT_TOKEN });
  const space = await client.getSpace(SPACE_ID);
  const environment = await space.getEnvironment(ENVIRONMENT_ID);

  const locales = await environment.getLocales();
  const locale = (locales.items.find((l) => l.default) || locales.items[0]).code;

  // Grab the first vehicle and stamp a unique marker into its description.
  const found = await environment.getEntries({
    content_type: 'vehicle',
    order: ['fields.name'],
    limit: 1,
  });
  let entry = found.items[0];
  if (!entry) {
    console.error('No "vehicle" entries found. Run `npm run seed` first.');
    process.exit(1);
  }

  const slug = entry.fields.slug[locale];
  const marker = `e2e-${Date.now()}`;
  const current = (entry.fields.description[locale] || '').replace(/\s*\[e2e-\d+\]\s*$/, '');
  entry.fields.description[locale] = `${current} [${marker}]`;

  console.log(`Stamping "${entry.fields.name[locale]}" (${slug}) with marker [${marker}]...`);
  entry = await entry.update();
  await entry.publish();
  console.log('Published. Now polling the live site for the marker.\n');

  const target = `${PROD_URL}/vehicles/${slug}`;
  const start = Date.now();
  let attempt = 0;

  while (Date.now() - start < TIMEOUT_MS) {
    attempt += 1;
    const elapsed = Math.round((Date.now() - start) / 1000);
    try {
      const { status, body } = await fetchPage(target);
      if (status === 200 && body.includes(marker)) {
        console.log(`\n✅ SUCCESS after ${elapsed}s — marker is live at:\n   ${target}`);
        console.log('The full Contentful -> webhook -> deploy hook -> SSG pipeline works.');
        return;
      }
      const note =
        status === 401 || status === 403
          ? ` (HTTP ${status} — production may be behind Deployment Protection; set VERCEL_AUTOMATION_BYPASS_SECRET)`
          : ` (HTTP ${status}, marker not present yet)`;
      console.log(`  attempt ${attempt} @ ${elapsed}s: rebuilding...${note}`);
    } catch (err) {
      console.log(`  attempt ${attempt} @ ${elapsed}s: ${err.message}`);
    }
    await sleep(POLL_MS);
  }

  console.error(
    `\n❌ Timed out after ${Math.round(TIMEOUT_MS / 1000)}s. The marker never appeared.\n` +
      'Check: Contentful -> Settings -> Webhooks (did it fire? response code?) and\n' +
      'Vercel -> Deployments (did a "Deploy Hook" build start and succeed?).'
  );
  process.exit(1);
}

main().catch((err) => {
  console.error('\nVerification failed:', err.message || err);
  process.exit(1);
});
