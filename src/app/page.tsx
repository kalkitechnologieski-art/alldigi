export const dynamic = "force-static";
import prisma from '@/lib/prisma';
import HeroSearch from '@/components/HeroSearch';
import Link from 'next/link';
import type { Keyword } from '@prisma/client';

export default async function HomePage() {
  // Fetch ALL keywords from the database (3,000+ possible)
  const keywords: Keyword[] = await prisma.keyword.findMany({
    orderBy: { term: 'asc' },
  });

  // Sample popular localities for the hero (still needed)
  const popularLocalities = await prisma.locality.findMany({
    take: 12,
    orderBy: { agencies: { _count: 'desc' } },
    include: { city: { include: { state: true } } },
  });
  const popularLocalitiesMapped = popularLocalities.map(l => ({
    state: l.city.state.slug,
    city: l.city.slug,
    locality: l.slug,
    name: l.name,
    slug: l.slug,
  }));

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Hero Section (same as before) */}
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
            <HeroSearch popularLocalities={popularLocalitiesMapped} popularKeywords={[]} />
          </div>
        </div>
      </section>

      {/* ====== ALL KEYWORDS SECTION (3,000+ H2 headings) ====== */}
      <section className="bg-gray-900 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Digital Marketing Services – Complete Guide
            </span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {keywords.map((kw) => (
              <article key={kw.id} className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-blue-500/50 transition">
                <Link href={`/keywords/${kw.slug}`}>
                  <h3 className="text-xl font-bold text-blue-400 hover:underline">
                    {kw.term}
                  </h3>
                </Link>
                <p className="mt-3 text-gray-400 text-sm leading-relaxed">
                  {kw.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800 py-12 px-4 text-sm text-gray-500">
        <div className="max-w-6xl mx-auto text-center">
          © {new Date().getFullYear()} Kalki Intelligence – India’s largest digital marketing directory.
        </div>
      </footer>
    </main>
  );
}
