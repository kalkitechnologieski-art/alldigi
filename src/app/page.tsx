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
