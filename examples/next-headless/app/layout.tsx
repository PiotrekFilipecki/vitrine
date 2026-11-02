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
  title: { default: 'Store · a VITRINE headless demo', template: '%s · Store' },
  description:
    'A made-up shop on Next.js 16: product cards behind reeded glass, a pre-order card that frosts until its release date and a loupe on the product page. vitrine-shaders/react over the Storefront API or repo fixtures.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const source = catalogSource();
  return (
    <html lang="en" className={archivo.variable}>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <header className="bar">
          <Link className="wordmark" href="/">
            Store
          </Link>
          <nav aria-label="Main">
            <Link href="/#objects">Objects</Link>
            <Link href="/#pre-order">Pre-order</Link>
            <span className="cart">Cart (0)</span>
          </nav>
        </header>
        <main id="main">{children}</main>
        <footer>
          <p className="footer__credits">
            Store is made up: names, prices and copy are invented for this demo, and the pre-order date is
            always nine days from today.{' '}
            {source === 'storefront'
              ? 'Catalogue from the Storefront API of the dev store, revalidated every 5 minutes.'
              : 'Catalogue and photographs from the repo (Unsplash License, examples/fixtures/CREDITS.md).'}
          </p>
          <p className="footer__about">
            <a href="https://github.com/PiotrekFilipecki/vitrine">VITRINE</a>, open source (Apache-2.0).{' '}
            <a href="https://shaders.paper.design">Powered by Paper Shaders</a>.
          </p>
        </footer>
      </body>
    </html>
  );
}
