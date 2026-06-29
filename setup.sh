#!/usr/bin/env bash
set -euo pipefail

echo "Installing framer-motion for animations..."
npm install framer-motion

echo "Generating localities.json for client-side search..."
cat > prisma/generate-localities-json.ts << 'GENEOF'
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  // Get all localities with their city and state slugs
  const localities = await prisma.locality.findMany({
    select: {
      name: true,
      slug: true,
      city: {
        select: {
          name: true,
          slug: true,
          state: {
            select: { name: true, slug: true }
          }
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  const output = localities.map(l => ({
    locality: l.name,
    localitySlug: l.slug,
    city: l.city.name,
    citySlug: l.city.slug,
    state: l.city.state.name,
    stateSlug: l.city.state.slug
  }));

  const dir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'localities.json'), JSON.stringify(output));
  console.log(`Generated localities.json with ${output.length} entries.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
GENEOF

echo "Updating build script to generate localities.json..."
node -e "
  const pkg = require('./package.json');
  if (!pkg.scripts.build.includes('generate-localities-json')) {
    pkg.scripts.build = pkg.scripts.build.replace(
      'npx ts-node prisma/generate-agency-json.ts',
      'npx ts-node prisma/generate-agency-json.ts && npx ts-node prisma/generate-localities-json.ts'
    );
    require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
  }
"

echo "Creating the new HeroSearch with client-side locality lookup..."
cat > src/components/HeroSearch.tsx << 'HEROEOF'
'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface LocalityEntry {
  locality: string;
  localitySlug: string;
  city: string;
  citySlug: string;
  state: string;
  stateSlug: string;
}

export default function HeroSearch() {
  const [query, setQuery] = useState('');
  const [localities, setLocalities] = useState<LocalityEntry[]>([]);
  const [suggestions, setSuggestions] = useState<LocalityEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load the full locality list on mount
  useEffect(() => {
    fetch('/localities.json')
      .then(r => r.json())
      .then(data => setLocalities(data))
      .catch(console.error);
  }, []);

  // Filter suggestions as user types
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    const q = query.toLowerCase();
    const filtered = localities.filter(
      l => l.locality.toLowerCase().includes(q) ||
           l.city.toLowerCase().includes(q) ||
           l.state.toLowerCase().includes(q)
    ).slice(0, 8); // limit to 8 suggestions
    setSuggestions(filtered);
  }, [query, localities]);

  // Redirect to the correct URL when a suggestion is selected
  const handleSelect = (item: LocalityEntry) => {
    setIsLoading(true);
    // Build the URL: prefer locality if available, otherwise city
    const url = item.localitySlug
      ? `/${item.stateSlug}/${item.citySlug}/${item.localitySlug}`
      : `/${item.stateSlug}/${item.citySlug}`;
    router.push(url);
    // Reset UI
    setQuery('');
    setSuggestions([]);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl shadow-blue-500/20 hover:border-blue-400/50 transition-all duration-300">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search a city, locality, or state..."
          className="flex-1 bg-transparent px-4 py-3 text-white placeholder-gray-400 outline-none text-lg"
          aria-label="Search location"
        />
        {isLoading && (
          <div className="pr-3">
            <svg className="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
          </div>
        )}
        <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/25">
          Search
        </button>
      </div>

      {/* Animated suggestions dropdown */}
      <div className={`absolute top-20 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl shadow-black/50 z-50 max-h-80 overflow-y-auto transition-all duration-300 origin-top ${suggestions.length > 0 ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'}`}>
        {suggestions.map((item, i) => (
          <button
            key={i}
            onClick={() => handleSelect(item)}
            className="block w-full text-left p-4 hover:bg-white/5 border-b border-gray-800 last:border-0 transition-colors"
          >
            <span className="text-white font-medium">{item.locality || item.city}</span>
            <span className="text-gray-400 text-sm ml-2">
              {item.city}, {item.state}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
HEROEOF

echo "Updating homepage to use the new HeroSearch..."
cat > src/app/page.tsx << 'HOMEEOF'
export const dynamic = "force-static";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSearch from '@/components/HeroSearch';
import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-950 text-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-32 px-4">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          </div>
          <div className="relative z-10 max-w-5xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Find Top Digital Marketing Agencies
            </h1>
            <p className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto">
              Discover the best agencies in any Indian city or locality. Instant search, detailed listings.
            </p>
            <div className="mt-12">
              <HeroSearch />
            </div>
            <div className="mt-8 text-gray-400 text-sm">
              Try: “Andheri”, “Connaught Place”, “Jaipur”, or “Mumbai”
            </div>
          </div>
        </section>

        {/* Quick links to popular states */}
        <section className="max-w-6xl mx-auto py-20 px-4">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Popular Destinations
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['delhi', 'maharashtra', 'uttar-pradesh', 'madhyapradesh', 'rajasthan'].map(state => (
              <Link key={state} href={`/${state}`} className="group p-6 bg-gray-900 rounded-2xl border border-gray-800 hover:border-blue-500/50 transition text-center">
                <span className="text-lg font-semibold capitalize group-hover:text-blue-400 transition">{state.replace(/-/g, ' ')}</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
HOMEEOF

echo "Adding micro-interactions (framer-motion) to agency cards and page transitions..."
# Update AgencyCard with framer-motion for entry animation
cat > src/components/AgencyCard.tsx << 'ACEOF'
'use client';
import { motion } from 'framer-motion';
import type { AgencyData } from '@/lib/types';

export default function AgencyCard({ agency, index = 0 }: { agency: AgencyData; index?: number }) {
  return (
    <motion.a
      href="https://www.kalki-intelligence.in"
      target="_blank"
      rel="nofollow noopener"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="block border rounded-lg p-5 hover:shadow-lg transition bg-gray-800 border-gray-700 hover:border-blue-500/50 hover:-translate-y-1"
    >
      <h3 className="text-xl font-semibold text-white">{agency.name}</h3>
      <p className="text-gray-400 text-sm mt-1 line-clamp-2">{agency.description}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {agency.services.map(s => (
          <span key={s} className="bg-blue-900 text-blue-200 text-xs px-2 py-1 rounded">{s}</span>
        ))}
      </div>
      <span className="mt-3 inline-flex items-center text-blue-400 text-sm font-medium">
        Visit website ↗
      </span>
    </motion.a>
  );
}
ACEOF

# Update the locality page to use animated cards
cat > 'src/app/[state]/[city]/[locality]/page.tsx' << 'LOCEOF'
export const dynamic = "force-static";
import { getAgenciesByLocality, getLocalityMeta, getLocalitySlugs } from '@/lib/data';
import AgencyCard from '@/components/AgencyCard';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { notFound } from 'next/navigation';
import { collectionPageJson } from '@/lib/structuredData';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export async function generateStaticParams() {
  const localities = await getLocalitySlugs();
  return localities.map(l => ({ state: l.state, city: l.city, locality: l.locality }));
}

export async function generateMetadata({ params }: { params: { state: string; city: string; locality: string } }) {
  const meta = await getLocalityMeta(params.state, params.city, params.locality);
  if (!meta) return notFound();
  return {
    title: `Top Digital Marketing Agencies in ${meta.localityName}, ${meta.cityName}`,
    description: `Find the best SEO, PPC, social media agencies in ${meta.localityName}.`,
  };
}

export default async function LocalityPage({ params }: { params: { state: string; city: string; locality: string } }) {
  const agencies = await getAgenciesByLocality(params.state, params.city, params.locality);
  const meta = await getLocalityMeta(params.state, params.city, params.locality);
  if (!agencies.length || !meta) notFound();

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: meta.stateName, href: `/${params.state}` },
    { name: meta.cityName, href: `/${params.state}/${params.city}` },
    { name: meta.localityName, href: `/${params.state}/${params.city}/${params.locality}` },
  ];

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto py-12 px-4 bg-gray-950 text-white min-h-screen">
        <Breadcrumbs items={breadcrumbItems} />
        <h1 className="text-4xl font-bold capitalize mb-2">
          Digital Marketing Agencies in {meta.localityName}
        </h1>
        <p className="text-gray-400 mb-8">
          Top-rated companies serving {meta.localityName}, {meta.cityName}.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agencies.map((agency, i) => (
            <AgencyCard key={agency.id} agency={agency} index={i} />
          ))}
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              collectionPageJson(
                `Digital Marketing Agencies in ${meta.localityName}`,
                `Best agencies in ${meta.localityName}.`,
                `https://best-digital-marketing-agencies.vercel.app/${params.state}/${params.city}/${params.locality}`,
                agencies
              )
            ),
          }}
        />
      </main>
      <Footer />
    </>
  );
}
LOCEOF

# Also update the city and state pages with headers/footers and animated cards (optional)
cat > 'src/app/[state]/[city]/page.tsx' << 'CITYEOF'
export const dynamic = "force-static";
import { getLocalitiesByCity, getCitySlugs } from '@/lib/data';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export async function generateStaticParams() {
  const cities = await getCitySlugs();
  return cities.map(c => ({ state: c.state, city: c.city }));
}

export async function generateMetadata({ params }: { params: { state: string; city: string } }) {
  return {
    title: `Digital Marketing Agencies in ${params.city.replace(/-/g, ' ')}, ${params.state.replace(/-/g, ' ')}`,
    description: `Find agencies in every locality of ${params.city.replace(/-/g, ' ')}.`,
  };
}

export default async function CityPage({ params }: { params: { state: string; city: string } }) {
  const localities = await getLocalitiesByCity(params.state, params.city);
  if (!localities.length) notFound();

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto py-12 px-4 bg-gray-950 text-white min-h-screen">
        <h1 className="text-4xl font-bold mb-6 capitalize">
          Digital Marketing Agencies in {params.city.replace(/-/g, ' ')}
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {localities.map(loc => (
            <Link
              key={loc.slug}
              href={`/${params.state}/${params.city}/${loc.slug}`}
              className="p-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition"
            >
              {loc.name}
              <span className="text-gray-400 text-sm ml-2">({loc.count} agencies)</span>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
CITYEOF

echo "Rebuilding..."
npm run build

echo "Pushing to GitHub..."
git add .
git commit -m "Interactive search with microinteractions, animated cards, local redirection" || echo "Nothing to commit"
git push origin main

echo "Done. The site now has an elegant, interactive search that redirects to animated locality pages."