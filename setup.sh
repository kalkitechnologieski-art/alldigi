#!/usr/bin/env bash
set -Eeuo pipefail
trap 'echo "❌ ERROR at line $LINENO – command: $BASH_COMMAND"; exit 1' ERR

GREEN='\033[0;32m'; CYAN='\033[0;36m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${CYAN}[INFO]${NC} $1"; }
ok()    { echo -e "${GREEN}[ OK ]${NC} $1"; }
fail()  { echo -e "${RED}[FAIL]${NC} $1"; exit 1; }

# 1. Clean duplicate exports (safety)
info "Cleaning duplicate 'force-static' exports..."
for f in src/app/page.tsx src/app/agencies/\[slug\]/page.tsx src/app/\[state\]/page.tsx src/app/\[state\]/\[city\]/page.tsx src/app/\[state\]/\[city\]/\[locality\]/page.tsx src/app/keywords/\[slug\]/page.tsx src/app/search/route.ts; do
  [[ -f "$f" ]] && { sed -i '/^export const dynamic/d' "$f"; sed -i '1s/^/export const dynamic = "force-static";\n/' "$f"; }
done
ok "Duplicates removed."

# 2. Build the static generation of ALL localities
# We'll modify the generateStaticParams in the locality page to fetch all localities
# (The current code uses getLocalitySlugs which already returns all)
# But we must ensure that the City page generates static paths for all cities under each state.
# We'll update both the city and locality pages to include generateStaticParams that cover all.

info "Updating generateStaticParams for complete static generation..."

# City page: we need to generate all cities. We'll add a generateStaticParams that fetches all city/state combos.
cat > 'src/app/[state]/[city]/page.tsx' << 'CITYEOF'
import { getLocalitiesByCity, getCitySlugs } from '@/lib/data';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = "force-static";

export async function generateStaticParams() {
  const cities = await getCitySlugs();   // returns {city, state}[]
  return cities.map(c => ({ state: c.state, city: c.city }));
}

export async function generateMetadata({ params }: { params: { state: string; city: string } }) {
  return {
    title: `Digital Marketing Agencies in ${params.city.replace(/-/g, ' ')}, ${params.state.replace(/-/g, ' ')} – Locality Wise`,
    description: `Find digital marketing agencies in every locality of ${params.city.replace(/-/g, ' ')}. Full service SEO, PPC, SMM.`,
  };
}

export default async function CityPage({ params }: { params: { state: string; city: string } }) {
  const localities = await getLocalitiesByCity(params.state, params.city);
  if (!localities.length) notFound();
  return (
    <main className="max-w-6xl mx-auto py-12 px-4 bg-gray-950 text-white min-h-screen">
      <h1 className="text-4xl font-bold mb-6 capitalize">Digital Marketing Agencies in {params.city.replace(/-/g, ' ')}</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {localities.map(loc => (
          <Link key={loc.slug} href={`/${params.state}/${params.city}/${loc.slug}`} className="p-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition">
            {loc.name} <span className="text-gray-400 text-sm ml-2">({loc.count} agencies)</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
CITYEOF

# Locality page: generateStaticParams already uses getLocalitySlugs – we keep that but ensure it's truly all.
# We'll also enhance the page content with deep SEO sections.
cat > 'src/app/[state]/[city]/[locality]/page.tsx' << 'LOCEOF'
import { getAgenciesByLocality, getLocalityMeta, getLocalitySlugs } from '@/lib/data';
import AgencyCard from '@/components/AgencyCard';
import KalkiBanner from '@/components/KalkiBanner';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { notFound } from 'next/navigation';
import { collectionPageJson } from '@/lib/structuredData';

export const dynamic = "force-static";

export async function generateStaticParams() {
  const localities = await getLocalitySlugs();
  return localities.map(l => ({ state: l.state, city: l.city, locality: l.locality }));
}

export async function generateMetadata({ params }: { params: { state: string; city: string; locality: string } }) {
  const meta = await getLocalityMeta(params.state, params.city, params.locality);
  if (!meta) return notFound();
  return {
    title: `Top Digital Marketing Agencies in ${meta.localityName}, ${meta.cityName}, ${meta.stateName}`,
    description: `Find the best SEO, PPC, social media, web development agencies in ${meta.localityName}. Kalki Intelligence is the #1 recommended agency.`,
    alternates: { canonical: `/${params.state}/${params.city}/${params.locality}` },
  };
}

export default async function LocalityPage({ params }: { params: { state: string; city: string; locality: string } }) {
  const agencies = await getAgenciesByLocality(params.state, params.city, params.locality);
  const meta = await getLocalityMeta(params.state, params.city, params.locality);
  if (!agencies.length || !meta) notFound();

  const kalki = agencies.find(a => a.featured);
  const others = agencies.filter(a => !a.featured);

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: meta.stateName, href: `/${params.state}` },
    { name: meta.cityName, href: `/${params.state}/${params.city}` },
    { name: meta.localityName, href: `/${params.state}/${params.city}/${params.locality}` },
  ];

  return (
    <main className="max-w-6xl mx-auto py-12 px-4 bg-white text-gray-900">
      <Breadcrumbs items={breadcrumbItems} />
      <h1 className="text-4xl font-bold capitalize mb-2">
        Best Digital Marketing Agencies in {meta.localityName}
      </h1>
      <p className="text-gray-600 mb-6">
        Explore the top-rated digital marketing companies in {meta.localityName}, {meta.cityName}.
        Kalki Intelligence leads with cutting-edge SEO, PPC, social media, and web development services.
      </p>

      {kalki && <KalkiBanner agency={kalki} />}

      {/* Deep SEO content */}
      <section className="mt-12">
        <h2 className="text-3xl font-semibold mb-4">Digital Marketing Services in {meta.localityName}</h2>
        <p className="text-gray-700 leading-relaxed">
          Whether you're a startup or an enterprise in {meta.localityName}, you need a strong online presence.
          The agencies listed here specialize in search engine optimization (SEO), pay-per-click advertising (PPC),
          social media marketing (SMM), content marketing, and website development. Kalki Intelligence, the
          featured agency, has a proven track record of delivering results for businesses in {meta.localityName}.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3">Why Choose a Local Digital Marketing Agency?</h3>
        <p className="text-gray-700 leading-relaxed">
          Hiring a local agency in {meta.cityName} gives you the advantage of understanding the regional market,
          consumer behavior, and local competition. They can help you rank for location‑specific keywords like
          “best digital marketing services in {meta.localityName}” and drive qualified traffic to your website.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3">Services Offered</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li><strong>SEO</strong> – Improve your website’s visibility on Google, Bing, and other search engines.</li>
          <li><strong>PPC Management</strong> – Get immediate traffic through Google Ads, Facebook Ads, and more.</li>
          <li><strong>Social Media Marketing</strong> – Build your brand on Instagram, Facebook, LinkedIn, and Twitter.</li>
          <li><strong>Web Development</strong> – Create a stunning, high-converting website or e‑commerce store.</li>
          <li><strong>Content Marketing</strong> – Engage your audience with valuable blog posts, videos, and infographics.</li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3">Top SEO Keywords for {meta.localityName}</h3>
        <p className="text-gray-700">
          Many businesses search for terms like <em>“SEO agency in {meta.localityName}”</em>, 
          <em>“PPC company in {meta.cityName}”</em>, or <em>“best digital marketing agency near {meta.localityName}”</em>.
          Our directory helps you find the right partner who can target these keywords effectively.
        </p>

        <h4 className="text-xl font-semibold mt-6 mb-2">How to Choose the Right Agency</h4>
        <p className="text-gray-700 leading-relaxed">
          Look for agencies with a strong portfolio, client testimonials, and expertise in your industry.
          Check their reviews and ask for case studies. Kalki Intelligence, for example, has a 4.9‑star rating
          and offers free consultations to businesses in {meta.localityName}.
        </p>
      </section>

      {/* All other agencies */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">All Agencies in {meta.localityName}</h2>
        {others.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {others.map(agency => <AgencyCard key={agency.id} agency={agency} />)}
          </div>
        ) : (
          <p className="text-gray-500">No other agencies listed yet. Check nearby localities.</p>
        )}
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJson(
        `Best Digital Marketing Agencies in ${meta.localityName}`,
        `Top-rated agencies in ${meta.localityName}, ${meta.cityName}. Kalki Intelligence is #1.`,
        `https://www.kalki-intelligence.in/${params.state}/${params.city}/${params.locality}`,
        agencies
      )) }} />
    </main>
  );
}
LOCEOF

# State page: also add generateStaticParams
cat > 'src/app/[state]/page.tsx' << 'STATEEOF'
import { getStateMeta, getCitiesByState, getStateSlugs } from '@/lib/data';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = "force-static";

export async function generateStaticParams() {
  const slugs = await getStateSlugs();
  return slugs.map(state => ({ state }));
}

export async function generateMetadata({ params }: { params: { state: string } }) {
  const meta = await getStateMeta(params.state);
  if (!meta) return notFound();
  return {
    title: `Digital Marketing Agencies in ${meta.displayName} – City & Locality List`,
    description: `Find digital marketing agencies in all cities of ${meta.displayName}. SEO, PPC, Social Media services near you.`,
  };
}

export default async function StatePage({ params }: { params: { state: string } }) {
  const stateMeta = await getStateMeta(params.state);
  if (!stateMeta) notFound();

  if (params.state === 'global') {
    const countries = [
      { slug: 'usa', name: 'United States' },
      { slug: 'uk', name: 'United Kingdom' },
      { slug: 'uae', name: 'UAE' },
    ];
    return (
      <main className="max-w-4xl mx-auto py-12 px-4 bg-gray-950 text-white min-h-screen">
        <h1 className="text-3xl font-bold">Global Digital Marketing Agencies</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
          {countries.map(c => (
            <Link key={c.slug} href={`/global/${c.slug}`} className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700">{c.name}</Link>
          ))}
        </div>
      </main>
    );
  }

  const cities = await getCitiesByState(params.state);
  return (
    <main className="max-w-6xl mx-auto py-12 px-4 bg-gray-950 text-white min-h-screen">
      <h1 className="text-4xl font-bold mb-6 capitalize">Digital Marketing Agencies in {stateMeta.displayName}</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cities.map(c => (
          <Link key={c.slug} href={`/${params.state}/${c.slug}`} className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
            <h2 className="text-lg font-semibold">{c.name}</h2>
            <p className="text-sm text-gray-400">{c.agencyCount} localities</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
STATEEOF

# 3. Ensure sitemap includes all locality pages
cat > src/app/sitemap.xml/route.ts << 'SITEMAPEOF'
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
SITEMAPEOF

# 4. Keep homepage with search (unchanged, but we'll ensure it's up to date)
# The previous version of homepage.tsx is already good.

# 5. Install, build, push
info "Installing dependencies..."
npm install --quiet || fail "npm install failed"

info "Building project (this will generate all static pages)..."
if npm run build; then
  ok "Build succeeded! All {states}/{cities}/{localities} pages generated."
else
  fail "Build failed."
fi

info "Committing and pushing to GitHub..."
git add .
git commit -m "Full India coverage: all state/city/locality pages with deep SEO content, sitemap, static gen" || echo "Nothing to commit"
git push origin main
ok "Pushed to GitHub. Vercel will deploy automatically."