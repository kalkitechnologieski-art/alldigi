#!/usr/bin/env bash
set -Eeuo pipefail
trap 'echo "❌ ERROR at line $LINENO – command: $BASH_COMMAND"' ERR

# Helper functions
RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; NC='\033[0m'
info()  { echo -e "${CYAN}[INFO]${NC} $1"; }
ok()    { echo -e "${GREEN}[ OK ]${NC} $1"; }
fail()  { echo -e "${RED}[FAIL]${NC} $1"; exit 1; }

PROJECT_ROOT="$(pwd)"
info "Applying final high‑end homepage & type fixes..."

# 1. Extend data access functions
cat > src/lib/data.ts << 'DATAEOF'
import prisma from './prisma';
import type { AgencyData, LocalityMeta, KeywordData } from './types';

// ---------- Meta helpers ----------
export async function getStateMeta(slug: string) {
  if (slug === 'global') return { slug: 'global', displayName: 'Global', type: 'global' };
  const state = await prisma.state.findUnique({ where: { slug }, select: { name: true, type: true } });
  return state ? { slug, displayName: state.name, type: state.type } : null;
}

export async function getCitiesByState(stateSlug: string) {
  if (stateSlug === 'global') {
    return [
      { slug: 'usa', name: 'United States', agencyCount: 0 },
      { slug: 'uk', name: 'United Kingdom', agencyCount: 0 },
      { slug: 'uae', name: 'UAE', agencyCount: 0 },
    ];
  }
  const cities = await prisma.city.findMany({
    where: { state: { slug: stateSlug } },
    select: { name: true, slug: true, _count: { select: { localities: true } } },
    orderBy: { name: 'asc' },
  });
  return cities.map(c => ({ slug: c.slug, name: c.name, agencyCount: c._count.localities }));
}

export async function getLocalitiesByCity(stateSlug: string, citySlug: string) {
  const city = await prisma.city.findFirst({
    where: { slug: citySlug, state: { slug: stateSlug } },
    include: { localities: { select: { name: true, slug: true, _count: { select: { agencies: true } } } } },
  });
  if (!city) return [];
  return city.localities.map(l => ({ name: l.name, slug: l.slug, count: l._count.agencies, cityName: city.name }));
}

export async function getAgenciesByLocality(stateSlug: string, citySlug: string, localitySlug: string): Promise<AgencyData[]> {
  const locality = await prisma.locality.findFirst({
    where: { slug: localitySlug, city: { slug: citySlug, state: { slug: stateSlug } } },
    include: { agencies: { orderBy: { featured: 'desc' } } },
  });
  if (!locality) return [];
  return locality.agencies.map(a => ({
    id: a.id, name: a.name, slug: a.slug, website: a.website, description: a.description,
    services: JSON.parse(a.services) as string[], rating: a.rating, featured: a.featured,
    stateSlug: a.stateSlug, citySlug: a.citySlug, localitySlug: a.localitySlug,
  }));
}

export async function getLocalityMeta(stateSlug: string, citySlug: string, localitySlug: string): Promise<LocalityMeta | null> {
  const loc = await prisma.locality.findFirst({
    where: { slug: localitySlug, city: { slug: citySlug, state: { slug: stateSlug } } },
    include: { city: { include: { state: true } } },
  });
  if (!loc) return null;
  return { localityName: loc.name, cityName: loc.city.name, stateName: loc.city.state.name };
}

export async function getAgencyBySlug(slug: string): Promise<AgencyData | null> {
  const a = await prisma.agency.findUnique({
    where: { slug },
    include: { locality: { include: { city: { include: { state: true } } } } },
  });
  if (!a) return null;
  return {
    id: a.id, name: a.name, slug: a.slug, website: a.website, description: a.description,
    services: JSON.parse(a.services) as string[], rating: a.rating, featured: a.featured,
    stateSlug: a.stateSlug, citySlug: a.citySlug, localitySlug: a.localitySlug,
  };
}

export async function getKeywordBySlug(slug: string): Promise<KeywordData | null> {
  const kw = await prisma.keyword.findUnique({ where: { slug } });
  return kw ? { term: kw.term, slug: kw.slug, description: kw.description, content: kw.content } : null;
}

// ---------- Sitemap & static paths ----------
export async function getKeywordSlugs() { return (await prisma.keyword.findMany({ select: { slug: true } })).map(k => k.slug); }
export async function getStateSlugs() { return (await prisma.state.findMany({ select: { slug: true } })).map(s => s.slug); }
export async function getCitySlugs() {
  const c = await prisma.city.findMany({ select: { slug: true, state: { select: { slug: true } } } });
  return c.map(c => ({ city: c.slug, state: c.state.slug }));
}
export async function getLocalitySlugs() {
  const l = await prisma.locality.findMany({ select: { slug: true, city: { select: { slug: true, state: { select: { slug: true } } } } } });
  return l.map(l => ({ locality: l.slug, city: l.city.slug, state: l.city.state.slug }));
}
export async function getAgencySlugs() { return (await prisma.agency.findMany({ select: { slug: true } })).map(a => a.slug); }

// ---------- Homepage data ----------
export async function getPopularLocalities(limit = 12) {
  const locs = await prisma.locality.findMany({
    take: limit, orderBy: { agencies: { _count: 'desc' } },
    include: { city: { include: { state: true } } },
  });
  return locs.map(l => ({ state: l.city.state.slug, city: l.city.slug, locality: l.slug, name: l.name, slug: l.slug }));
}

export async function getPopularKeywords(limit = 10) {
  const kws = await prisma.keyword.findMany({ take: limit, orderBy: { id: 'asc' } });
  return kws.map(k => ({ term: k.term, slug: k.slug }));
}

export async function getStats() {
  const [states, cities, localities, agencies, keywords] = await Promise.all([
    prisma.state.count({ where: { NOT: { slug: 'global' } } }),
    prisma.city.count(),
    prisma.locality.count(),
    prisma.agency.count(),
    prisma.keyword.count(),
  ]);
  return { states, cities, localities, agencies, keywords };
}

export async function getRecentAgencies(limit = 6) {
  const agencies = await prisma.agency.findMany({
    orderBy: { id: 'desc' },
    take: limit,
    include: { locality: { include: { city: { include: { state: true } } } } },
  });
  return agencies.map(a => ({
    ...a,
    services: JSON.parse(a.services) as string[],
    localityName: a.locality.name,
    cityName: a.locality.city.name,
    stateName: a.locality.city.state.name,
  }));
}

export async function getAllStatesWithTopCities() {
  const states = await prisma.state.findMany({
    where: { NOT: { slug: 'global' } },
    include: {
      cities: {
        take: 5,
        orderBy: { localities: { _count: 'desc' } },
        select: { name: true, slug: true },
      },
    },
    orderBy: { name: 'asc' },
  });
  return states.map(s => ({
    name: s.name,
    slug: s.slug,
    cities: s.cities,
  }));
}
DATAEOF
ok "Extended data layer written."

# 2. Replace Homepage with long high‑end content
cat > src/app/page.tsx << 'HOMEEOF'
import {
  getPopularLocalities,
  getPopularKeywords,
  getStats,
  getRecentAgencies,
  getAllStatesWithTopCities,
} from '@/lib/data';
import HeroSearch from '@/components/HeroSearch';
import Link from 'next/link';

export default async function HomePage() {
  const [popularLocalities, popularKeywords, stats, recentAgencies, allStates] =
    await Promise.all([
      getPopularLocalities(12),
      getPopularKeywords(10),
      getStats(),
      getRecentAgencies(8),
      getAllStatesWithTopCities(),
    ]);

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* ========== HERO (unchanged but fits the dark theme) ========== */}
      <section className="relative overflow-hidden py-32 px-4">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Digital Marketing Agencies
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto">
            Discover India’s top-rated agencies for SEO, PPC, social media, and web development.
            Find the perfect partner for your brand.
          </p>
          <div className="mt-12">
            <HeroSearch popularLocalities={popularLocalities} popularKeywords={popularKeywords} />
          </div>
        </div>
      </section>

      {/* ========== STATS BAR ========== */}
      <section className="bg-gray-900/50 border-y border-gray-800 py-8 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: 'States', value: stats.states },
            { label: 'Cities', value: stats.cities },
            { label: 'Localities', value: stats.localities },
            { label: 'Agencies', value: stats.agencies },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold text-blue-400">{stat.value}+</div>
              <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ========== TOP STATES ========== */}
      <section className="max-w-6xl mx-auto py-20 px-4">
        <h2 className="text-4xl font-bold text-center mb-12">
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Top States
          </span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {['delhi', 'maharashtra', 'uttar-pradesh', 'madhyapradesh', 'rajasthan'].map((state) => (
            <Link
              key={state}
              href={`/${state}`}
              className="group p-6 bg-gray-900 rounded-2xl border border-gray-800 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 text-center"
            >
              <span className="text-lg font-semibold capitalize group-hover:text-blue-400 transition">
                {state.replace(/-/g, ' ')}
              </span>
            </Link>
          ))}
          <Link
            href="/global"
            className="group p-6 bg-gradient-to-r from-blue-900 to-purple-900 rounded-2xl border border-blue-500/30 hover:border-blue-400 transition-all duration-300 text-center"
          >
            <span className="text-lg font-semibold text-blue-300 group-hover:text-blue-200 transition">
              Global →
            </span>
          </Link>
        </div>
      </section>

      {/* ========== LATEST AGENCIES (News per city) ========== */}
      <section className="bg-gray-900 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Latest Agencies Added
            </span>
          </h2>
          <p className="text-center text-gray-400 mb-12">
            Fresh digital marketing companies across Indian cities
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentAgencies.map((agency) => (
              <Link
                key={agency.id}
                href={`/agencies/${agency.slug}`}
                className="block p-5 bg-gray-800 rounded-xl border border-gray-700 hover:border-blue-500/50 transition group"
              >
                <h3 className="text-lg font-semibold group-hover:text-blue-400 transition">
                  {agency.name}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  {agency.cityName}, {agency.stateName}
                </p>
                <p className="text-xs text-gray-500 mt-2 line-clamp-2">{agency.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========== ALL STATES WITH TOP CITIES ========== */}
      <section className="max-w-6xl mx-auto py-20 px-4">
        <h2 className="text-4xl font-bold text-center mb-12">
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            All States & Top Cities
          </span>
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allStates.map((state) => (
            <div key={state.slug} className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
              <Link href={`/${state.slug}`} className="text-xl font-bold text-blue-400 hover:underline">
                {state.name}
              </Link>
              <ul className="mt-3 space-y-1">
                {state.cities.map((city) => (
                  <li key={city.slug}>
                    <Link
                      href={`/${state.slug}/${city.slug}`}
                      className="text-sm text-gray-400 hover:text-white transition"
                    >
                      {city.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ========== POPULAR LOCALITIES ========== */}
      <section className="bg-gray-900 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Popular Localities
            </span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {popularLocalities.map((loc) => (
              <Link
                key={loc.locality}
                href={`/${loc.state}/${loc.city}/${loc.locality}`}
                className="p-4 bg-gray-800 rounded-xl border border-gray-700 hover:border-blue-500/50 text-center transition"
              >
                <span className="font-medium">{loc.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========== POPULAR SERVICES ========== */}
      <section className="max-w-6xl mx-auto py-20 px-4">
        <h2 className="text-4xl font-bold text-center mb-12">
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Popular Services
          </span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {popularKeywords.map((kw) => (
            <Link
              key={kw.slug}
              href={`/keywords/${kw.slug}`}
              className="p-5 bg-gray-900 rounded-xl border border-gray-800 hover:border-blue-500/50 text-center transition"
            >
              <span className="font-medium">{kw.term}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ========== KALKI INTELLIGENCE BANNER ========== */}
      <section className="bg-gradient-to-r from-blue-900 to-purple-900 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold">Need a Digital Marketing Partner?</h2>
          <p className="mt-4 text-gray-300">
            Kalki Intelligence is the #1 recommended agency across all localities.
          </p>
          <a
            href="https://www.kalki-intelligence.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-6 bg-white text-gray-900 font-semibold px-8 py-3 rounded-full hover:bg-gray-200 transition"
          >
            Visit Kalki Intelligence
          </a>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="bg-gray-950 border-t border-gray-800 py-12 px-4 text-sm text-gray-500">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div>
            <h3 className="text-white font-semibold mb-2">Kalki Intelligence Directory</h3>
            <p>India's largest digital marketing agency directory.</p>
            <p className="mt-2">© {new Date().getFullYear()} All rights reserved.</p>
          </div>
          <div className="flex gap-8">
            <div>
              <h4 className="text-white font-medium mb-2">Quick Links</h4>
              <ul className="space-y-1">
                <li><Link href="/" className="hover:text-blue-400">Home</Link></li>
                <li><Link href="/global" className="hover:text-blue-400">Global</Link></li>
                <li><Link href="/keywords/seo-services" className="hover:text-blue-400">SEO Services</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Top States</h4>
              <ul className="space-y-1">
                {['delhi', 'maharashtra', 'uttar-pradesh', 'rajasthan'].map(s => (
                  <li key={s}>
                    <Link href={`/${s}`} className="hover:text-blue-400 capitalize">{s.replace(/-/g, ' ')}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
HOMEEOF
ok "Long high‑end homepage replaced."

# 3. Fix HeroSearch type error (already safe now, but ensure it's correct)
cat > src/components/HeroSearch.tsx << 'HEROEOF'
'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface PopularLocality { state: string; city: string; locality: string; name: string; slug: string; }
interface PopularKeyword { term: string; slug: string; }

export default function HeroSearch({
  popularLocalities,
  popularKeywords,
}: {
  popularLocalities: PopularLocality[];
  popularKeywords: PopularKeyword[];
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<'agencies' | 'keywords'>('agencies');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchSuggestions = async () => {
      if (query.length < 2) { setSuggestions([]); return; }
      try {
        const res = await fetch(`/search?q=${encodeURIComponent(query)}&category=${activeCategory}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error('Network error');
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        if (!(err instanceof Error) || err.name !== 'AbortError') {
          setSuggestions([]);
        }
      }
    };
    fetchSuggestions();
    return () => controller.abort();
  }, [query, activeCategory]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl shadow-blue-500/20 hover:border-blue-400/50 transition-all duration-300">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search agency, service, or locality..."
          className="flex-1 bg-transparent px-4 py-3 text-white placeholder-gray-400 outline-none text-lg"
          aria-label="Search digital marketing agencies"
        />
        <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/25">
          Search
        </button>
      </div>

      <div className="flex gap-2 mt-4 justify-center flex-wrap">
        {['SEO', 'PPC', 'Social Media', 'Web Development', 'Ecommerce'].map(cat => (
          <button
            key={cat}
            onClick={() => { setActiveCategory('agencies'); setQuery(cat); }}
            className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-sm text-gray-300 hover:bg-white/20 hover:border-blue-400/50 transition"
          >
            {cat}
          </button>
        ))}
      </div>

      {suggestions.length > 0 && (
        <div className="absolute top-24 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl shadow-black/50 z-20 max-h-80 overflow-y-auto">
          {suggestions.map((item: any) => (
            <Link
              key={item.type + '-' + (item.slug || item.locality)}
              href={
                item.type === 'agency'
                  ? `/agencies/${item.slug}`
                  : `/${item.state}/${item.city}/${item.locality}`
              }
              onClick={() => setSuggestions([])}
              className="block p-4 hover:bg-white/5 border-b border-gray-800 last:border-0 transition"
            >
              <span className="font-medium text-white">{item.name || item.locality}</span>
              {item.services && (
                <span className="text-sm text-gray-400 ml-2">
                  ({item.services.join(', ')})
                </span>
              )}
              <span className="text-xs text-blue-400 ml-2">
                {item.type === 'agency' ? 'Agency' : 'Locality'}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
HEROEOF

# 4. Fix KeywordContent type error (already safe)
cat > src/components/KeywordContent.tsx << 'KWCEOF'
import React from 'react';
interface Subtopic { heading: string; content: string; children?: Subtopic[]; }
function renderSubtopic(node: Subtopic, level: number = 2) {
  const HeadingTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
  return (
    <div key={node.heading} className="mt-6">
      <HeadingTag className="font-bold text-gray-800 mb-2">{node.heading}</HeadingTag>
      <div className="prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: node.content }} />
      {(node.children?.length ?? 0) > 0 && (
        <div className="ml-4 border-l-2 border-gray-200 pl-4 mt-4 space-y-6">
          {node.children!.map(child => renderSubtopic(child, level + 1))}
        </div>
      )}
    </div>
  );
}
export default function KeywordContent({ subtopics }: { subtopics: Subtopic[] }) {
  return <>{subtopics.map(node => renderSubtopic(node))}</>;
}
KWCEOF

ok "All components fixed."

# 5. Build
info "Rebuilding..."
npm run build || fail "Build failed."
ok "Build successful! The high‑end homepage is ready."
echo ""
echo "🎉 You can now run: npm run dev"