import { getStateSlugs, getCitySlugs, getLocalitySlugs, getAgencySlugs, getKeywordSlugs } from '@/lib/data';
export const revalidate = 86400;

export async function GET() {
  const baseUrl = 'https://www.kalki-intelligence.in';
  const states = await getStateSlugs();
  const cities = await getCitySlugs();
  const localities = await getLocalitySlugs();  // ALL localities
  const agencies = await getAgencySlugs();
  const keywords = await getKeywordSlugs();

  const urls = [
    { loc: `${baseUrl}/`, priority: 1.0 },
    { loc: `${baseUrl}/global`, priority: 0.9 },
    ...states.map(s => ({ loc: `${baseUrl}/${s}`, priority: 0.8 })),
    ...cities.map(c => ({ loc: `${baseUrl}/${c.state}/${c.city}`, priority: 0.7 })),
    ...localities.map(l => ({ loc: `${baseUrl}/${l.state}/${l.city}/${l.locality}`, priority: 0.6 })),
    ...agencies.map(a => ({ loc: `${baseUrl}/agencies/${a}`, priority: 0.5 })),
    ...keywords.map(k => ({ loc: `${baseUrl}/keywords/${k}`, priority: 0.5 })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls.map(u => `<url><loc>${u.loc}</loc><priority>${u.priority}</priority></url>`).join('\n')}
    </urlset>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
