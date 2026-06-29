export const dynamic = "force-static";
import { getAgenciesByLocality, getLocalityMeta, getLocalitySlugs } from '@/lib/data';
import AgencyCard from '@/components/AgencyCard';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { notFound } from 'next/navigation';
import { collectionPageJson } from '@/lib/structuredData';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export async function generateStaticParams() {
  const localities = await getLocalitySlugs();
  return localities.map(l => ({ state: l.state, city: l.city, locality: l.locality }));
}

export async function generateMetadata({ params }: { params: { state: string; city: string; locality: string } }) {
  const meta = await getLocalityMeta(params.state, params.city, params.locality);
  if (!meta) return notFound();
  return {
    title: `Top Digital Marketing Agencies in ${meta.localityName}, ${meta.cityName}`,
    description: `Find the best SEO, PPC, social media agencies in ${meta.localityName}.`,
  };
}

export default async function LocalityPage({ params }: { params: { state: string; city: string; locality: string } }) {
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
    <>
      <Header />
      <main className="max-w-6xl mx-auto py-12 px-4 bg-gray-950 text-white min-h-screen">
        <Breadcrumbs items={breadcrumbItems} />
        <h1 className="text-4xl font-bold capitalize mb-2">
          Digital Marketing Agencies in {meta.localityName}
        </h1>
        <p className="text-gray-400 mb-8">
          Top-rated companies serving {meta.localityName}, {meta.cityName}.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agencies.map((agency, i) => (
            <AgencyCard key={agency.id} agency={agency} index={i} />
          ))}
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              collectionPageJson(
                `Digital Marketing Agencies in ${meta.localityName}`,
                `Best agencies in ${meta.localityName}.`,
                `https://best-digital-marketing-agencies.vercel.app/${params.state}/${params.city}/${params.locality}`,
                agencies
              )
            ),
          }}
        />
      </main>
      <Footer />
    </>
  );
}
