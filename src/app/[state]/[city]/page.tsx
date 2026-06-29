import { getLocalitiesByCity } from '@/lib/data';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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
    <main className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6 capitalize">Digital Marketing Agencies in {params.city.replace(/-/g, ' ')}</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {localities.map(loc => (
          <Link key={loc.slug} href={`/${params.state}/${params.city}/${loc.slug}`} className="p-3 bg-gray-50 rounded-lg hover:bg-blue-50">
            {loc.name} <span className="text-xs text-gray-500 ml-2">({loc.count} agencies)</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
