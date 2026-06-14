import {
  createClient,
  type Asset,
  type Entry,
  type EntryFieldTypes,
  type EntrySkeletonType,
} from 'contentful';
import { sampleVehicles } from './sample-data';

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
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;

const client =
  space && accessToken
    ? createClient({
        space,
        accessToken,
        environment: process.env.CONTENTFUL_ENVIRONMENT || 'master',
      })
    : null;

function mapEntry(entry: Entry<VehicleSkeleton, undefined, string>): Vehicle {
  const { name, slug, description, photo } = entry.fields;
  const asset = photo as Asset<undefined, string> | undefined;
  const file = asset?.fields.file;
  const image = file?.details.image;

  return {
    name,
    slug,
    description,
    // Contentful asset URLs are protocol-relative (`//images.ctfassets.net/...`).
    imageUrl: file?.url ? `https:${file.url}` : '',
    imageAlt: (asset?.fields.title as string) || name,
    imageWidth: image?.width ?? 1200,
    imageHeight: image?.height ?? 800,
  };
}

/** Fetch every vehicle, sorted by name. Falls back to sample data when unconfigured. */
export async function getAllVehicles(): Promise<Vehicle[]> {
  if (!client) return sampleVehicles;

  const entries = await client.getEntries<VehicleSkeleton>({
    content_type: 'vehicle',
    order: ['fields.name'],
  });

  return entries.items.map(mapEntry);
}

/** Fetch a single vehicle by slug, or null if it does not exist. */
export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  if (!client) {
    return sampleVehicles.find((v) => v.slug === slug) ?? null;
  }

  const entries = await client.getEntries<VehicleSkeleton>({
    content_type: 'vehicle',
    'fields.slug': slug,
    limit: 1,
  });

  const item = entries.items[0];
  return item ? mapEntry(item) : null;
}
