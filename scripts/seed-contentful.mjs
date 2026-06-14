// One-time seed: pushes the demo vehicles into Contentful via the Management API.
//
// It is idempotent — it creates the `vehicle` content type if missing and skips
// any vehicle whose slug already exists, so it is safe to re-run.
//
// Requires (read from .env.local via `npm run seed`):
//   CONTENTFUL_SPACE_ID          your space id
//   CONTENTFUL_MANAGEMENT_TOKEN  a Content Management API token (Personal Access Token)
//   CONTENTFUL_ENVIRONMENT       optional, defaults to "master"

import contentfulManagement from 'contentful-management';

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const ENVIRONMENT_ID = process.env.CONTENTFUL_ENVIRONMENT || 'master';

if (!SPACE_ID || !MANAGEMENT_TOKEN) {
  console.error(
    'Missing CONTENTFUL_SPACE_ID and/or CONTENTFUL_MANAGEMENT_TOKEN.\n' +
      'Add them to .env.local, then run `npm run seed`.'
  );
  process.exit(1);
}

// The content to externalise. Mirrors lib/sample-data.ts; edit freely in
// Contentful afterward — this script only seeds the initial entries.
const vehicles = [
  {
    name: 'Tesla Model 3',
    slug: 'tesla-model-3',
    description:
      'A compact electric sedan with a minimalist interior, long range, and access to a fast-charging network. Quick, quiet, and software-driven.',
    imageUrl:
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'White Tesla Model 3 parked on a road',
  },
  {
    name: 'Ford Mustang',
    slug: 'ford-mustang',
    description:
      'An American muscle car icon. Aggressive styling, a throaty V8 option, and decades of motorsport heritage behind the galloping pony badge.',
    imageUrl:
      'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Yellow Ford Mustang on display',
  },
  {
    name: 'Toyota Land Cruiser',
    slug: 'toyota-land-cruiser',
    description:
      'A legendary full-size off-roader built for reliability and rough terrain. Body-on-frame toughness with everyday comfort.',
    imageUrl:
      'https://images.unsplash.com/photo-1633507106985-67d22a51fdd9?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Toyota Land Cruiser on a dirt trail',
  },
  {
    name: 'Porsche 911',
    slug: 'porsche-911',
    description:
      'A rear-engined sports car with timeless silhouette and razor-sharp handling. The benchmark every other sports car is measured against.',
    imageUrl:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Silver Porsche 911 on a coastal road',
  },
];

async function ensureContentType(environment) {
  try {
    await environment.getContentType('vehicle');
    console.log('• Content type "vehicle" already exists — skipping.');
    return;
  } catch {
    // Not found — create it below.
  }

  console.log('• Creating content type "vehicle"...');
  const contentType = await environment.createContentTypeWithId('vehicle', {
    name: 'Vehicle',
    displayField: 'name',
    fields: [
      { id: 'name', name: 'Name', type: 'Symbol', required: true },
      {
        id: 'slug',
        name: 'Slug',
        type: 'Symbol',
        required: true,
        validations: [{ unique: true }],
      },
      { id: 'description', name: 'Description', type: 'Text', required: true },
      { id: 'photo', name: 'Photo', type: 'Link', linkType: 'Asset', required: false },
    ],
  });
  await contentType.publish();
  console.log('  published.');
}

async function uploadPhoto(environment, locale, vehicle) {
  let asset = await environment.createAsset({
    fields: {
      title: { [locale]: vehicle.imageAlt },
      file: {
        [locale]: {
          contentType: 'image/jpeg',
          fileName: `${vehicle.slug}.jpg`,
          upload: vehicle.imageUrl,
        },
      },
    },
  });

  asset = await asset.processForAllLocales();
  // Re-fetch to get the version bumped by processing, then publish.
  asset = await environment.getAsset(asset.sys.id);
  await asset.publish();
  return asset.sys.id;
}

async function slugExists(environment, slug) {
  const existing = await environment.getEntries({
    content_type: 'vehicle',
    'fields.slug': slug,
    limit: 1,
  });
  return existing.items.length > 0;
}

async function main() {
  const client = contentfulManagement.createClient({ accessToken: MANAGEMENT_TOKEN });
  const space = await client.getSpace(SPACE_ID);
  const environment = await space.getEnvironment(ENVIRONMENT_ID);

  const locales = await environment.getLocales();
  const locale = (locales.items.find((l) => l.default) || locales.items[0]).code;
  console.log(`Using space ${SPACE_ID}, environment ${ENVIRONMENT_ID}, locale ${locale}.\n`);

  await ensureContentType(environment);

  for (const vehicle of vehicles) {
    if (await slugExists(environment, vehicle.slug)) {
      console.log(`• "${vehicle.name}" (${vehicle.slug}) already exists — skipping.`);
      continue;
    }

    console.log(`• Seeding "${vehicle.name}"...`);
    const photoId = await uploadPhoto(environment, locale, vehicle);

    const entry = await environment.createEntry('vehicle', {
      fields: {
        name: { [locale]: vehicle.name },
        slug: { [locale]: vehicle.slug },
        description: { [locale]: vehicle.description },
        photo: {
          [locale]: { sys: { type: 'Link', linkType: 'Asset', id: photoId } },
        },
      },
    });
    await entry.publish();
    console.log('  published.');
  }

  console.log('\nDone. Set CONTENTFUL_SPACE_ID + CONTENTFUL_ACCESS_TOKEN (delivery) and redeploy.');
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message || err);
  process.exit(1);
});
