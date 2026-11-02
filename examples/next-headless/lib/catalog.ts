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
  /** Fixture id (photo file name) or the store handle. */
  id: string;
  handle: string;
  title: string;
  /** One line under the name: material or variant. From fixtures, or the product type on a store. */
  note: string;
  description: string;
  spec: string | null;
  price: { amount: string; currencyCode: string };
  /** ISO date of the release for a pre-order product (`custom.release_date` metafield on a store), else null. */
  releaseDate: string | null;
  image: ProductImage;
}

export type CatalogSource = 'fixtures' | 'storefront';

export function catalogSource(): CatalogSource {
  return storefrontConfigured() ? 'storefront' : 'fixtures';
}

export async function getProducts(first = 12): Promise<Product[]> {
  if (catalogSource() === 'storefront') return storefrontProducts(first);
  return fixtureProducts().slice(0, first);
}

export async function getProduct(handle: string): Promise<Product | null> {
  if (!/^[a-z0-9][a-z0-9-]{0,99}$/.test(handle)) return null;
  if (catalogSource() === 'storefront') return storefrontProduct(handle);
  return fixtureProducts().find((p) => p.handle === handle) ?? null;
}

export function formatPrice(p: Product['price']): string {
  const n = Number(p.amount);
  const amount = Number.isInteger(n) ? String(n) : n.toFixed(2);
  return p.currencyCode === 'EUR' ? `€ ${amount}` : `${amount} ${p.currencyCode}`;
}

export function releaseLabel(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${d.toLocaleString('en-GB', { month: 'long', timeZone: 'UTC' })}`;
}
