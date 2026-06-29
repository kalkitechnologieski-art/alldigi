import { getAgenciesByLocality, getLocalityMeta, getLocalitySlugs } from '@/lib/data';
import AgencyCard from '@/components/AgencyCard';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { notFound } from 'next/navigation';
import { collectionPageJson } from '@/lib/structuredData';

export const dynamic = "force-static";

export async function generateStaticParams() {
  const localities = await getLocalitySlugs();
  return localities.map(l => ({ state: l.state, city: l.city, locality: l.locality }));
}

interface LocalityParams {
  state: string;
  city: string;
  locality: string;
}

export async function generateMetadata({ params }: { params: LocalityParams }) {
  const meta = await getLocalityMeta(params.state, params.city, params.locality);
  if (!meta) return notFound();
  return {
    title: `Top Digital Marketing Agencies in ${meta.localityName}, ${meta.cityName}`,
    description: `Find the best digital marketing companies in ${meta.localityName}. SEO, PPC, Social Media, Web Development services.`,
  };
}

export default async function LocalityPage({ params }: { params: LocalityParams }) {
  const agencies = await getAgenciesByLocality(params.state, params.city, params.locality);
  const meta = await getLocalityMeta(params.state, params.city, params.locality);
  if (!agencies.length || !meta) notFound();

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: meta.stateName, href: `/${params.state}` },
    { name: meta.cityName, href: `/${params.state}/${params.city}` },
    { name: meta.localityName, href: `/${params.state}/${params.city}/${params.locality}` },
  ];

  return (
    <main className="max-w-6xl mx-auto py-12 px-4 bg-gray-950 text-white min-h-screen">
      <Breadcrumbs items={breadcrumbItems} />
      <h1 className="text-4xl font-bold capitalize mb-2">Digital Marketing Agencies in {meta.localityName}</h1>
      <p className="text-gray-400 mb-8">Explore top-rated companies serving {meta.localityName}, {meta.cityName}.</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agencies.map(agency => <AgencyCard key={agency.id} agency={agency} />)}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJson(
        `Digital Marketing Agencies in ${meta.localityName}`,
        `Top agencies in ${meta.localityName}, ${meta.cityName}.`,
        `https://best-digital-marketing-agencies.vercel.app/${params.state}/${params.city}/${params.locality}`,
        agencies
      )) }} />
    </main>
  );
}
