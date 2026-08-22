import {
  createClient,
  type Asset,
  type Entry,
  type EntryFieldTypes,
  type EntrySkeletonType,
} from 'contentful';

/**
 * Shape of the "vehicle" content type as authored in Contentful.
 *
 * Content model (content type id: `vehicle`):
 *   - name        Short text
 *   - slug        Short text  (unique, used for the detail page URL)
 *   - description Long text
 *   - photo       Media (single image asset)
 */
export type VehicleSkeleton = EntrySkeletonType<
  {
    name: EntryFieldTypes.Symbol;
    slug: EntryFieldTypes.Symbol;
    description: EntryFieldTypes.Text;
    photo: EntryFieldTypes.AssetLink;
  },
  'vehicle'
>;

/** Plain, view-ready vehicle used throughout the app. */
export interface Vehicle {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
}

const space = process.env.CONTENTFUL_SPACE_ID;
const deliveryToken = process.env.CONTENTFUL_ACCESS_TOKEN;
const previewToken = process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN;
const environment = process.env.CONTENTFUL_ENVIRONMENT || 'master';

function makeClient(preview: boolean) {
  const accessToken = preview ? previewToken : deliveryToken;
  if (!space || !accessToken) return null;
  return createClient({
    space,
    accessToken,
    environment,
    // The Preview API serves draft (unpublished) content from a different host.
    host: preview ? 'preview.contentful.com' : undefined,
  });
}

const deliveryClient = makeClient(false);
const previewClient = makeClient(true);

// When previewing, prefer the preview client but fall back to delivery if no
// preview token is configured. There is no sample-data fallback: if Contentful
// is not configured we throw, so a misconfigured build/deploy fails loudly
// rather than silently serving placeholder content.
function getClient(preview: boolean) {
  const client = preview ? previewClient ?? deliveryClient : deliveryClient;
  if (!client) {
    throw new Error(
      'Contentful is not configured. Set CONTENTFUL_SPACE_ID and ' +
        'CONTENTFUL_ACCESS_TOKEN (Content Delivery API token) in the ' +
        'environment. See README.md → "Connecting Contentful".'
    );
  }
  return client;
}

function mapEntry(entry: Entry<VehicleSkeleton, undefined>): Vehicle {
  const { name, slug, description, photo } = entry.fields;
  const asset = photo as Asset<undefined> | undefined;
  const file = asset?.fields.file;
  const image = file?.details.image;

  return {
    name,
    slug,
    description,
    // Contentful asset URLs are protocol-relative (`//images.ctfassets.net/...`).
    imageUrl: file?.url ? `https:${file.url}` : '',
    imageAlt: asset?.fields.title || name,
    imageWidth: image?.width ?? 1200,
    imageHeight: image?.height ?? 800,
  };
}

/** Fetch every vehicle, sorted by name. Throws if Contentful is not configured. */
export async function getAllVehicles(preview = false): Promise<Vehicle[]> {
  const client = getClient(preview);

  const entries = await client.getEntries<VehicleSkeleton>({
    content_type: 'vehicle',
    order: ['fields.name'],
  });

  return entries.items.map(mapEntry);
}

/** Fetch a single vehicle by slug, or null if it does not exist. */
export async function getVehicleBySlug(
  slug: string,
  preview = false
): Promise<Vehicle | null> {
  const client = getClient(preview);

  const entries = await client.getEntries<VehicleSkeleton>({
    content_type: 'vehicle',
    'fields.slug': slug,
    limit: 1,
  });

  const item = entries.items.at(0);
  return item ? mapEntry(item) : null;
}
