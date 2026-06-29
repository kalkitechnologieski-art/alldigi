import type { Metadata } from 'next';
export function baseMeta({ title, description, canonical }: { title: string; description: string; canonical: string }): Metadata {
  return {
    title, description,
    metadataBase: new URL('https://www.kalki-intelligence.in'),
    alternates: { canonical },
    openGraph: { title, description, url: canonical, siteName: 'Kalki Intelligence', locale: 'en_IN', type: 'website' },
  };
}
