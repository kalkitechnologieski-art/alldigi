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
