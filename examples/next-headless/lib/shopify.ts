import 'server-only';
import type { Product } from './catalog';

/**
 * Storefront API client. Server Components only (`server-only`): the token is the *public* Storefront token,
 * but it still never reaches the browser bundle. Variables go through GraphQL variables, never string
 * interpolation. Responses are cached by Next for `REVALIDATE` seconds.
 */
const REVALIDATE = 300;

const IMAGE = `featuredImage { url altText width height }`;
const PRODUCT = `
  id handle title productType description
  releaseDate: metafield(namespace: "custom", key: "release_date") { value }
  priceRange { minVariantPrice { amount currencyCode } }
  ${IMAGE}
`;

interface StorefrontProduct {
  id: string;
  handle: string;
  title: string;
  productType: string;
  description: string;
  releaseDate: { value: string } | null;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  featuredImage: Product['image'] | null;
}

export function storefrontConfigured(): boolean {
  return Boolean(process.env['SHOPIFY_STORE_DOMAIN'] && process.env['SHOPIFY_STOREFRONT_PUBLIC_TOKEN']);
}

async function storefront<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const domain = process.env['SHOPIFY_STORE_DOMAIN'] ?? '';
  const token = process.env['SHOPIFY_STOREFRONT_PUBLIC_TOKEN'] ?? '';
  const version = process.env['SHOPIFY_API_VERSION'] ?? '2026-10';
  if (!/^[a-z0-9-]+\.myshopify\.com$/.test(domain)) {
    throw new Error('SHOPIFY_STORE_DOMAIN must look like my-store.myshopify.com');
  }
  const res = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'X-Shopify-Storefront-Access-Token': token },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) throw new Error(`Storefront API ${res.status}`);
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) throw new Error(`Storefront API: ${json.errors.map((e) => e.message).join('; ')}`);
  if (!json.data) throw new Error('Storefront API: empty response');
  return json.data;
}

function toProduct(p: StorefrontProduct): Product {
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    note: p.productType,
    description: p.description,
    spec: null,
    // ADR-0003: the release date of a pre-order lives in the custom.release_date metafield (Date or Date and time).
    releaseDate: p.releaseDate?.value ?? null,
    price: p.priceRange.minVariantPrice,
    image: p.featuredImage ?? { url: '', altText: null, width: null, height: null },
  };
}

export async function storefrontProducts(first: number): Promise<Product[]> {
  const data = await storefront<{ products: { nodes: StorefrontProduct[] } }>(
    `query VitrineProducts($first: Int!) { products(first: $first, sortKey: TITLE) { nodes { ${PRODUCT} } } }`,
    { first: Math.min(Math.max(1, first), 50) }
  );
  return data.products.nodes.filter((p) => p.featuredImage).map(toProduct);
}

export async function storefrontProduct(handle: string): Promise<Product | null> {
  const data = await storefront<{ product: StorefrontProduct | null }>(
    `query VitrineProduct($handle: String!) { product(handle: $handle) { ${PRODUCT} } }`,
    { handle }
  );
  // A product without a featured image has nothing to print; the catalogue filters these out too.
  return data.product?.featuredImage ? toProduct(data.product) : null;
}
