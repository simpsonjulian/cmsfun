import Image from 'next/image';
import Link from 'next/link';
import { getAllVehicles } from '@/lib/contentful';

// Statically generated at build time (SSG). No request-time data fetching.
export const dynamic = 'force-static';

export default async function HomePage() {
  const vehicles = await getAllVehicles();

  return (
    <>
      <section className="intro">
        <h1>Our Vehicles</h1>
        <p>A collection of vehicles, managed in Contentful and rendered as static pages.</p>
      </section>

      <ul className="grid">
        {vehicles.map((vehicle) => (
          <li key={vehicle.slug} className="card">
            <Link href={`/vehicles/${vehicle.slug}`} className="card-link">
              {vehicle.imageUrl && (
                <div className="card-image">
                  <Image
                    src={vehicle.imageUrl}
                    alt={vehicle.imageAlt}
                    fill
                    sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              )}
              <div className="card-body">
                <h2>{vehicle.name}</h2>
                <p>{vehicle.description}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
