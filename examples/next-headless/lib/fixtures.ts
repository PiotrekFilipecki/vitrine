import fixtures from '../public/fixtures/fixtures.json';
import type { Product } from './catalog';

interface FixtureItem {
  file: string;
  type: 'tee' | 'print';
  code: string;
  title: string;
  series: string;
  finish: string;
  width: number;
  height: number;
}

const BLURB: Record<FixtureItem['type'], string> = {
  tee: 'Heavyweight tee, screen-printed in one pass. Edition No.06.',
  print: 'Giclée print on 300 g matte paper, signed. Edition No.06.',
};

export function fixtureProducts(): Product[] {
  const data = fixtures as { prices: Record<string, Record<string, number>>; items: FixtureItem[] };
  return data.items.map((it) => {
    const minor = data.prices[it.type]?.['PLN'] ?? 0;
    const kind = it.type === 'tee' ? 'tee' : 'print';
    return {
      handle: `${it.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')}-${kind}`,
      title: it.title,
      code: it.code,
      productType: it.type === 'tee' ? 'T-shirt' : 'Print',
      description: `${it.series}. ${BLURB[it.type]}`,
      price: { amount: (minor / 100).toFixed(2), currencyCode: 'PLN' },
      image: {
        url: `/fixtures/${it.file}`,
        altText: `${it.title.replace(/_/g, ' ')} — NIWWTS ${kind}, edition No.06`,
        width: it.width,
        height: it.height,
      },
    };
  });
}

export const EDITORIAL = {
  url: '/fixtures/piece-el-funkador.webp',
  altText: 'EL FUNKADOR, 2026, halftone collage still',
  width: 1100,
  height: 720,
};
