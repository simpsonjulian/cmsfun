import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';
import type { Metadata } from 'next';
import { getAllVehicles, getVehicleBySlug } from '@/lib/contentful';

// SSG: pre-render one static page per published vehicle slug at build time.
// dynamicParams stays on (the default) so Draft Mode can preview brand-new,
// not-yet-published entries whose slug isn't in the build-time set. In
// production an unknown slug just resolves to a 404 via notFound() below.

export async function generateStaticParams() {
  const vehicles = await getAllVehicles();
  return vehicles.map((vehicle) => ({ slug: vehicle.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { isEnabled } = await draftMode();
  const vehicle = await getVehicleBySlug(slug, isEnabled);
  if (!vehicle) return { title: 'Vehicle not found' };

  return {
    title: `${vehicle.name} · Vehicle Showcase`,
    description: vehicle.description,
  };
}

export default async function VehiclePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { isEnabled } = await draftMode();
  const vehicle = await getVehicleBySlug(slug, isEnabled);

  if (!vehicle) notFound();

  return (
    <article className="detail">
      <Link href="/" className="back-link">
        ← Back to all vehicles
      </Link>

      {vehicle.imageUrl && (
        <div className="detail-image">
          <Image
            src={vehicle.imageUrl}
            alt={vehicle.imageAlt}
            width={vehicle.imageWidth}
            height={vehicle.imageHeight}
            sizes="(max-width: 900px) 100vw, 900px"
            priority
          />
        </div>
      )}

      <h1>{vehicle.name}</h1>
      <p className="detail-description">{vehicle.description}</p>
    </article>
  );
}
