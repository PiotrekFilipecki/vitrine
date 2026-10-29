import 'server-only';
import { fixtureProducts } from './fixtures';
import { storefrontConfigured, storefrontProduct, storefrontProducts } from './shopify';

export interface ProductImage {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
}

export interface Product {
  handle: string;
  title: string;
  /** Catalogue code (NIWWTS: PC-008, AR-001…). From the `custom.code` metafield on a store, from fixtures otherwise. */
  code: string | null;
  productType: string;
  description: string;
  price: { amount: string; currencyCode: string };
  image: ProductImage;
}

export type CatalogSource = 'fixtures' | 'storefront';

export function catalogSource(): CatalogSource {
  return storefrontConfigured() ? 'storefront' : 'fixtures';
}

export async function getProducts(first = 24): Promise<Product[]> {
  if (catalogSource() === 'storefront') return storefrontProducts(first);
  const items = fixtureProducts();
  // 24 cards from 12 fixtures, like examples/static: the grid is the test, the catalogue is the content.
  const out: Product[] = [];
  while (out.length < first && items.length) out.push(items[out.length % items.length]!);
  return out;
}

export async function getProduct(handle: string): Promise<Product | null> {
  if (!/^[a-z0-9][a-z0-9-]{0,99}$/.test(handle)) return null;
  if (catalogSource() === 'storefront') return storefrontProduct(handle);
  return fixtureProducts().find((p) => p.handle === handle) ?? null;
}

export function formatPrice(p: Product['price']): string {
  const n = Number(p.amount);
  const amount = Number.isInteger(n) ? String(n) : n.toFixed(2);
  return `${amount} ${p.currencyCode}`;
}

/** Artwork titles are written with underscores in the NIWWTS catalogue; cards show them with spaces, like the shop does. */
export function displayTitle(title: string): string {
  return title.replace(/_/g, ' ');
}
