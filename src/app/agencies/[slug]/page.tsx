export const dynamic = "force-static";
import { getAgencyBySlug } from '@/lib/data';
import { notFound } from 'next/navigation';
import { localBusinessJson } from '@/lib/structuredData';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const agency = await getAgencyBySlug(params.slug);
  if (!agency) return notFound();
  return { title: `${agency.name} – Digital Marketing Agency`, description: agency.description };
}

export default async function AgencyPage({ params }: { params: { slug: string } }) {
  const agency = await getAgencyBySlug(params.slug);
  if (!agency) notFound();
  return (
    <main className="max-w-4xl mx-auto py-12 px-4">
      <Link href={`/${agency.stateSlug}/${agency.citySlug}/${agency.localitySlug}`} className="text-blue-600 hover:underline text-sm">← Back to locality</Link>
      <div className="mt-4 bg-white p-8 rounded-xl shadow">
        <h1 className="text-3xl font-bold">{agency.name}</h1>
        <p className="text-gray-700 mt-2">{agency.description}</p>
        <div className="mt-4 flex gap-2 flex-wrap">
          {agency.services.map(s => <span key={s} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">{s}</span>)}
        </div>
        <a href={agency.website} target="_blank" rel="noopener noreferrer" className="inline-block mt-6 bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700">Visit official website ↗</a>
        <div className="mt-6 text-sm text-gray-500">Rating: {agency.rating} / 5</div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJson(agency)) }} />
    </main>
  );
}
