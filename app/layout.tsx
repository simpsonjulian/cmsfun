import type { Metadata } from 'next';
import Link from 'next/link';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vehicle Showcase',
  description: 'A demo collection of vehicles served from Contentful via Next.js SSG.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link href="/" className="site-title">
            🚗 Vehicle Showcase
          </Link>
        </header>
        <main className="container">{children}</main>
        <footer className="site-footer">
          <p>Built with Next.js &amp; Contentful · Statically generated</p>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
