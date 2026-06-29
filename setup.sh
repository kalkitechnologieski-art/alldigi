#!/usr/bin/env bash
set -euo pipefail

echo "Updating all agency cards to redirect to kalki-intelligence.in..."

# 1. AgencyCard component – always links to Kalki Intelligence
cat > src/components/AgencyCard.tsx << 'ACEOF'
import type { AgencyData } from '@/lib/types';

export default function AgencyCard({ agency }: { agency: AgencyData }) {
  return (
    <a
      href="https://www.kalki-intelligence.in"
      target="_blank"
      rel="nofollow noopener"
      className="block border rounded-lg p-5 hover:shadow-lg transition bg-gray-800 border-gray-700 hover:border-blue-500/50"
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
    </a>
  );
}
ACEOF

# 2. Make the /global page more elegant (it's the [state] route with state='global')
cat > 'src/app/[state]/page.tsx' << 'STATEEOF'
import { getStateMeta, getCitiesByState, getStateSlugs } from '@/lib/data';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const dynamic = "force-static";

export async function generateStaticParams() {
  const slugs = await getStateSlugs();
  return slugs.map(state => ({ state }));
}

export async function generateMetadata({ params }: { params: { state: string } }) {
  const meta = await getStateMeta(params.state);
  if (!meta) return notFound();
  return {
    title: meta.type === 'global' ? 'Global Digital Marketing Agencies – DigiMarkt' : `Digital Marketing Agencies in ${meta.displayName} – City & Locality List`,
    description: meta.type === 'global' ? 'Explore digital marketing agencies across the world. Country‑specific directories.' : `Find digital marketing agencies in all cities of ${meta.displayName}. SEO, PPC, Social Media services.`,
  };
}

export default async function StatePage({ params }: { params: { state: string } }) {
  const stateMeta = await getStateMeta(params.state);
  if (!stateMeta) notFound();

  // --- GLOBAL PAGE ---
  if (params.state === 'global') {
    const countries = [
      { slug: 'usa', name: 'United States', flag: '🇺🇸' },
      { slug: 'uk', name: 'United Kingdom', flag: '🇬🇧' },
      { slug: 'uae', name: 'UAE', flag: '🇦🇪' },
      { slug: 'canada', name: 'Canada', flag: '🇨🇦' },
      { slug: 'australia', name: 'Australia', flag: '🇦🇺' },
      { slug: 'singapore', name: 'Singapore', flag: '🇸🇬' },
    ];
    return (
      <>
        <Header />
        <main className="bg-gray-950 text-white min-h-screen py-16 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              Global Digital Marketing Agencies
            </h1>
            <p className="text-xl text-gray-300 mb-12">
              Select your country to browse top‑rated agencies.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {countries.map(c => (
                <Link
                  key={c.slug}
                  href={`/global/${c.slug}`}
                  className="bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-blue-500/50 transition"
                >
                  <span className="text-5xl">{c.flag}</span>
                  <h2 className="text-2xl font-bold mt-4">{c.name}</h2>
                  <p className="text-gray-400 text-sm mt-2">Coming soon</p>
                </Link>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // --- Indian State page ---
  const cities = await getCitiesByState(params.state);
  return (
    <>
      <Header />
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
      <Footer />
    </>
  );
}
STATEEOF

# 3. Create a beautiful /categories page
mkdir -p src/app/categories
cat > src/app/categories/page.tsx << 'CATEOF'
export const dynamic = "force-static";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

const categories = [
  { name: 'SEO', slug: 'seo-services', icon: '🔍', desc: 'Search Engine Optimization services to rank higher on Google.' },
  { name: 'PPC', slug: 'ppc-management', icon: '💰', desc: 'Pay‑Per‑Click advertising management for immediate traffic.' },
  { name: 'Social Media Marketing', slug: 'social-media-marketing', icon: '📱', desc: 'Build your brand on Instagram, Facebook, LinkedIn, TikTok.' },
  { name: 'Web Development', slug: 'web-development-services', icon: '💻', desc: 'Custom websites, e‑commerce stores, and web applications.' },
  { name: 'Content Marketing', slug: 'content-marketing', icon: '✍️', desc: 'High‑quality content that engages and converts.' },
  { name: 'Email Marketing', slug: 'email-marketing', icon: '📧', desc: 'Email campaigns that nurture leads and drive sales.' },
  { name: 'Ecommerce Development', slug: 'ecommerce-development', icon: '🛒', desc: 'Shopify, WooCommerce, and custom e‑commerce solutions.' },
  { name: 'Local SEO', slug: 'local-seo', icon: '📍', desc: 'Dominate local search results and Google Maps.' },
  { name: 'Video Marketing', slug: 'video-marketing', icon: '🎥', desc: 'YouTube and video advertising strategies.' },
  { name: 'Influencer Marketing', slug: 'influencer-marketing', icon: '🤳', desc: 'Connect with influencers to amplify your brand.' },
];

export default function CategoriesPage() {
  return (
    <>
      <Header />
      <main className="bg-gray-950 text-white min-h-screen py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Digital Marketing Service Categories
          </h1>
          <p className="text-xl text-gray-300 mb-12">
            Explore our comprehensive guides to every digital marketing service.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(cat => (
              <Link
                key={cat.slug}
                href={`/keywords/${cat.slug}`}
                className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-blue-500/50 transition text-left"
              >
                <span className="text-4xl">{cat.icon}</span>
                <h2 className="text-2xl font-bold mt-4">{cat.name}</h2>
                <p className="text-gray-400 mt-2">{cat.desc}</p>
                <span className="inline-block mt-4 text-blue-400 text-sm font-medium">
                  Read guide →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
CATEOF

# 4. Ensure header links to /categories and /global (already present, but confirm)
# Header already contains: <Link href="/global">Global</Link> and a Categories dropdown with individual keywords.
# That's fine.

# 5. Build and push
echo "Rebuilding..."
npm run build

echo "Pushing to GitHub..."
git add .
git commit -m "Redirect all agency cards to kalki-intelligence.in, elegant Global & Categories pages" || echo "Nothing to commit"
git push origin main

echo "Done. All agency links now go to kalki-intelligence.in with nofollow."