import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { catalogSource } from '@/lib/catalog';
import './globals.css';

// Archivo from the repo (OFL, examples/fonts/archivo): the build needs no network, CI included.
const archivo = localFont({
  src: '../../fonts/archivo/archivo-latin-wdth-wght.woff2',
  weight: '400 700',
  style: 'normal',
  display: 'swap',
  variable: '--font-archivo',
  declarations: [{ prop: 'font-stretch', value: '62% 125%' }],
  adjustFontFallback: 'Arial',
});

export const metadata: Metadata = {
  title: { default: 'NIWWTS No.06 · VITRINE headless demo', template: '%s · NIWWTS No.06' },
  description:
    'Paper Shaders on a headless Shopify storefront: Next.js 16 App Router, Storefront API, <vitrine-shader> via vitrine-shaders/react. The server sends plain images; the print arrives after hydration.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const source = catalogSource();
  return (
    <html lang="en" className={archivo.variable}>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <header className="masthead">
          <Link className="masthead__brand" href="/">
            NIWWTS
          </Link>
          <p className="masthead__issue">Edition No.06 — Prints &amp; Tees</p>
          <p className="masthead__note">
            VITRINE demo · <code>vitrine-shaders/react</code> on Next.js 16
          </p>
        </header>
        <main id="main">{children}</main>
        <footer className="colophon">
          <p>
            VITRINE · Apache-2.0 · <a href="https://shaders.paper.design">Powered by Paper Shaders</a>
          </p>
          <p>
            Works © Piotr Filipecki / NIWWTS ·{' '}
            {source === 'storefront'
              ? 'Catalogue from the Storefront API of the dev store, revalidated every 5 minutes.'
              : 'Catalogue from repo fixtures: no store configured (see .env.example).'}
          </p>
        </footer>
      </body>
    </html>
  );
}
