import catalog from '../public/fixtures/catalog.json';
import type { Product } from './catalog';

interface CatalogItem {
  id: string;
  handle: string;
  title: string;
  note: string;
  price: number;
  currency: string;
  alt: string;
  description: string;
  spec: string;
  width: number;
  height: number;
}

const DAY = 86_400_000;
/** Same as examples/static/demo.js: the demo pre-order always ships nine days from today, 10:00 UTC. */
export function demoReleaseDate(now = Date.now()): string {
  return new Date(Math.floor((now + 9 * DAY) / DAY) * DAY + 10 * 3_600_000).toISOString().replace('.000', '');
}

export function fixtureProducts(): Product[] {
  const data = catalog as { preorder: string; products: CatalogItem[] };
  return data.products.map((it) => ({
    id: it.id,
    handle: it.handle,
    title: it.title,
    note: it.note,
    description: it.description,
    spec: it.spec,
    price: { amount: it.price.toFixed(2), currencyCode: it.currency },
    releaseDate: it.id === data.preorder ? demoReleaseDate() : null,
    image: { url: `/fixtures/products/${it.id}.webp`, altText: it.alt, width: it.width, height: it.height },
  }));
}
