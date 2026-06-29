#!/usr/bin/env bash
set -Eeuo pipefail
trap 'echo "❌ ERROR at line $LINENO – command: $BASH_COMMAND"; exit 1' ERR

# ---------- Colors ----------
GREEN='\033[0;32m'; CYAN='\033[0;36m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${CYAN}[INFO]${NC} $1"; }
ok()    { echo -e "${GREEN}[ OK ]${NC} $1"; }
fail()  { echo -e "${RED}[FAIL]${NC} $1"; exit 1; }

PROJECT_ROOT="$(pwd)"
info "Starting full homepage rebuild..."

# ===== 1. Clean duplicate dynamic exports =====
info "Cleaning duplicate 'force-static' exports..."
for f in src/app/page.tsx src/app/agencies/\[slug\]/page.tsx src/app/\[state\]/page.tsx src/app/\[state\]/\[city\]/page.tsx src/app/\[state\]/\[city\]/\[locality\]/page.tsx src/app/keywords/\[slug\]/page.tsx src/app/search/route.ts; do
  [[ -f "$f" ]] && { sed -i '/^export const dynamic/d' "$f"; sed -i '1s/^/export const dynamic = "force-static";\n/' "$f"; }
done
ok "Duplicates removed."

# ===== 2. Install required packages =====
info "Installing dependencies (framer-motion)..."
npm install framer-motion --save
ok "Dependencies installed."

# ===== 3. Ensure all required JSON data files are generated at build time =====
# We already have generate-agency-json.ts and generate-localities-json.ts; we'll update build script to include them.
info "Updating build script to generate JSON data..."
node -e "
  const pkg = require('./package.json');
  if (!pkg.scripts.build.includes('generate-agency-json')) {
    pkg.scripts.build = 'prisma db push && prisma db seed && npx ts-node prisma/generate-agency-json.ts && npx ts-node prisma/generate-localities-json.ts && next build';
    require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
  }
"
ok "Build script updated."

# ===== 4. Generate localities.json script (if not already present) =====
cat > prisma/generate-localities-json.ts << 'LOCJSONEOF'
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
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
LOCJSONEOF

# ===== 5. Rewrite AgencyCard with framer-motion and redirect to kalki-intelligence.in =====
cat > src/components/AgencyCard.tsx << 'CARDEOF'
'use client';
import { motion } from 'framer-motion';
import type { AgencyData } from '@/lib/types';

export default function AgencyCard({ agency, index = 0 }: { agency: AgencyData; index?: number }) {
  return (
    <motion.a
      href="https://www.kalki-intelligence.in"
      target="_blank"
      rel="nofollow noopener"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
      whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)' }}
      className="block bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-blue-500/50 transition-colors"
    >
      <h3 className="text-xl font-semibold text-white">{agency.name}</h3>
      <p className="text-gray-400 text-sm mt-1 line-clamp-2">{agency.description}</p>
      <div className="mt-3 flex flex-wrap gap-1">
        {agency.services.map(s => (
          <span key={s} className="bg-blue-900 text-blue-200 text-xs px-2 py-1 rounded-full">{s}</span>
        ))}
      </div>
      <span className="mt-4 inline-flex items-center text-blue-400 text-sm font-medium group-hover:underline">
        Visit website ↗
      </span>
    </motion.a>
  );
}
CARDEOF
ok "AgencyCard updated with animations and redirect."

# ===== 6. Create the comprehensive client-side homepage component =====
cat > src/components/MegaHomeClient.tsx << 'MEGAEOF'
'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Agency {
  id: string;
  name: string;
  slug: string;
  website: string;
  description: string;
  services: string[];
  rating: number;
  featured: boolean;
  locality: string;
  localitySlug: string;
  city: string;
  citySlug: string;
  state: string;
  stateSlug: string;
}

interface Locality {
  locality: string;
  localitySlug: string;
  city: string;
  citySlug: string;
  state: string;
  stateSlug: string;
}

const categories = ['SEO', 'PPC', 'Social Media', 'Web Development', 'Ecommerce', 'Content Marketing'];

export default function MegaHomeClient() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<Locality[]>([]);
  const [selectedState, setSelectedState] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load data from static JSON files
  useEffect(() => {
    const loadData = async () => {
      try {
        const [agenciesRes, localitiesRes] = await Promise.all([
          fetch('/agencies.json'),
          fetch('/localities.json')
        ]);
        const agenciesData = await agenciesRes.json();
        const localitiesData = await localitiesRes.json();
        setAgencies(agenciesData);
        setLocalities(localitiesData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter agencies based on selected state, city, and category
  const filteredAgencies = useMemo(() => {
    let filtered = agencies;

    if (selectedState !== 'all') {
      filtered = filtered.filter(a => a.stateSlug === selectedState);
    }
    if (selectedCity !== 'all') {
      filtered = filtered.filter(a => a.citySlug === selectedCity);
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.services.includes(selectedCategory));
    }
    return filtered;
  }, [agencies, selectedState, selectedCity, selectedCategory]);

  // Generate unique state and city lists from agencies
  const states = useMemo(() => [...new Set(agencies.map(a => a.stateSlug))].sort(), [agencies]);
  const cities = useMemo(() => {
    if (selectedState === 'all') return [...new Set(agencies.map(a => a.citySlug))].sort();
    return [...new Set(agencies.filter(a => a.stateSlug === selectedState).map(a => a.citySlug))].sort();
  }, [selectedState, agencies]);

  // Search logic: filter localities as user types
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const q = searchQuery.toLowerCase();
    const filtered = localities.filter(l =>
      l.locality.toLowerCase().includes(q) ||
      l.city.toLowerCase().includes(q) ||
      l.state.toLowerCase().includes(q)
    ).slice(0, 8);
    setSearchSuggestions(filtered);
    setShowSuggestions(true);
  }, [searchQuery, localities]);

  // When a search suggestion is clicked, redirect to that locality page
  const handleSearchSelect = (item: Locality) => {
    const url = `/${item.stateSlug}/${item.citySlug}/${item.localitySlug}`;
    window.location.href = url;
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* ========== Hero Section ========== */}
      <section className="relative overflow-hidden py-24 px-4">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
          >
            Find Top Digital Marketing Agencies
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Search any Indian city or locality to discover the best agencies near you.
          </motion.p>

          {/* Search Bar with Autocomplete */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 max-w-2xl mx-auto relative"
          >
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl shadow-blue-500/20 hover:border-blue-400/50 transition-all duration-300">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Search a city, locality, or state..."
                className="flex-1 bg-transparent px-4 py-3 text-white placeholder-gray-400 outline-none text-lg"
                aria-label="Search location"
              />
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/25">
                Search
              </button>
            </div>
            {/* Suggestions dropdown */}
            <AnimatePresence>
              {showSuggestions && searchSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-20 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl shadow-black/50 z-50 max-h-80 overflow-y-auto"
                >
                  {searchSuggestions.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearchSelect(item)}
                      className="block w-full text-left p-4 hover:bg-white/5 border-b border-gray-800 last:border-0 transition-colors"
                    >
                      <span className="text-white font-medium">{item.locality}</span>
                      <span className="text-gray-400 text-sm ml-2">
                        {item.city}, {item.state}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ========== Filters Section ========== */}
      <section className="max-w-7xl mx-auto px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          {/* State filter */}
          <select
            value={selectedState}
            onChange={e => { setSelectedState(e.target.value); setSelectedCity('all'); }}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All States</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {/* City filter */}
          <select
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Services</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </motion.div>
      </section>

      {/* ========== Agency Cards Grid ========== */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {filteredAgencies.length} Agencies Found
          </h2>
        </div>
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredAgencies.map((agency, i) => (
              <motion.div
                key={agency.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <a
                  href="https://www.kalki-intelligence.in"
                  target="_blank"
                  rel="nofollow noopener"
                  className="block bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-blue-500/50 transition-colors hover:shadow-lg hover:shadow-blue-500/10 group"
                >
                  <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {agency.name}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {agency.locality}, {agency.city}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {agency.services.map(s => (
                      <span key={s} className="bg-blue-900 text-blue-200 text-xs px-2 py-1 rounded-full">{s}</span>
                    ))}
                  </div>
                  <p className="text-gray-500 text-sm mt-3 line-clamp-2">{agency.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-yellow-400 text-sm">★ {agency.rating}</span>
                    <span className="text-blue-400 text-sm font-medium group-hover:underline">Visit website ↗</span>
                  </div>
                </a>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        {filteredAgencies.length === 0 && (
          <p className="text-center text-gray-500 mt-12">No agencies match your filters. Try different criteria.</p>
        )}
      </section>
    </main>
  );
}
MEGAEOF
ok "MegaHomeClient component created."

# ===== 7. Rewrite homepage to use the client component =====
cat > src/app/page.tsx << 'PAGEEOF'
export const dynamic = "force-static";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MegaHomeClient from '@/components/MegaHomeClient';

export default function HomePage() {
  return (
    <>
      <Header />
      <MegaHomeClient />
      <Footer />
    </>
  );
}
PAGEEOF
ok "Homepage updated."

# ===== 8. Ensure all other pages have Header/Footer (already done in earlier steps, but we'll reinforce) =====
info "Updating other pages to include Header and Footer..."
# We'll quickly patch the state and city pages (they already have, but just in case)
for f in src/app/\[state\]/page.tsx src/app/\[state\]/\[city\]/page.tsx; do
  if ! grep -q "import Header from '@/components/Header'" "$f"; then
    sed -i '1s/^/import Header from '\''@\/components\/Header'\'';\n/' "$f"
    sed -i '1s/^/import Footer from '\''@\/components\/Footer'\'';\n/' "$f"
  fi
done

# ===== 9. Ensure public directory exists =====
mkdir -p public

# ===== 10. Build the project =====
info "Running production build..."
npm run build || fail "Build failed."

# ===== 11. Commit and push if build succeeds =====
info "Committing and pushing to GitHub..."
git add .
git commit -m "Complete homepage rebuild: search, filters, categories, microinteractions, all localities covered" || echo "Nothing to commit"
git push origin main
ok "Pushed to GitHub. Vercel will deploy automatically."

echo ""
echo "=========================================="
echo " ✅  FULL HOMEPAGE REBUILD COMPLETE!"
echo " - Search bar with autocomplete"
echo " - State, city, and category filters"
echo " - Animated agency cards with redirects"
echo " - All localities covered"
echo "=========================================="