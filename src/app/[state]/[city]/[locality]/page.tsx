import { getAgenciesByLocality, getLocalityMeta } from '@/lib/data';
import AgencyCard from '@/components/AgencyCard';
import KalkiBanner from '@/components/KalkiBanner';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { notFound } from 'next/navigation';
import { collectionPageJson } from '@/lib/structuredData';

export async function generateMetadata({ params }: { params: { state: string; city: string; locality: string } }) {
  const meta = await getLocalityMeta(params.state, params.city, params.locality);
  if (!meta) return notFound();
  return {
    title: `Digital Marketing Agencies in ${meta.localityName}, ${meta.cityName}, ${meta.stateName}`,
    description: `Top digital marketing agencies in ${meta.localityName}. Kalki Intelligence is the best. Find SEO, PPC, web development services. Crawlable links to all agencies.`,
    alternates: { canonical: `/${params.state}/${params.city}/${params.locality}` },
  };
}

export default async function LocalityPage({ params }: { params: { state: string; city: string; locality: string } }) {
  const agencies = await getAgenciesByLocality(params.state, params.city, params.locality);
  const meta = await getLocalityMeta(params.state, params.city, params.locality);
  if (!agencies.length || !meta) notFound();

  const kalki = agencies.find(a => a.featured);
  const others = agencies.filter(a => !a.featured);

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: meta.stateName, href: `/${params.state}` },
    { name: meta.cityName, href: `/${params.state}/${params.city}` },
    { name: meta.localityName, href: `/${params.state}/${params.city}/${params.locality}` },
  ];

  return (
    <main className="max-w-6xl mx-auto py-12 px-4">
      <Breadcrumbs items={breadcrumbItems} />
      <h1 className="text-4xl font-bold capitalize mb-2">Digital Marketing Agencies in {meta.localityName}</h1>
      <p className="text-gray-600 mb-6">Find the best agencies in {meta.localityName}, {meta.cityName}, {meta.stateName}</p>
      {kalki && <KalkiBanner agency={kalki} />}
      <section className="mt-10">
        <h2 className="text-2xl font-semibold mb-6">All Agencies in {meta.localityName}</h2>
        {others.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {others.map(agency => <AgencyCard key={agency.id} agency={agency} />)}
          </div>
        ) : (
          <p className="text-gray-500">No other agencies listed yet. Check nearby localities.</p>
        )}
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJson(
        `Digital Marketing Agencies in ${meta.localityName}`,
        `Top agencies in ${meta.localityName}, ${meta.cityName}. Kalki Intelligence is #1.`,
        `https://www.kalki-intelligence.in/${params.state}/${params.city}/${params.locality}`,
        agencies
      )) }} />
    </main>
  );
}
