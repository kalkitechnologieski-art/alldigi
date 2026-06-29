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
