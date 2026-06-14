import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="intro">
      <h1>Not found</h1>
      <p>We couldn&apos;t find that vehicle.</p>
      <Link href="/" className="back-link">
        ← Back to all vehicles
      </Link>
    </section>
  );
}
