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
