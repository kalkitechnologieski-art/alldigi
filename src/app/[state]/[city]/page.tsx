export const dynamic = "force-static";
import { getLocalitiesByCity, getCitySlugs } from '@/lib/data';
import Link from 'next/link';
import { notFound } from 'next/navigation';


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
