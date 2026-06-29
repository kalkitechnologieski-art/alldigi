import { getAgenciesByLocality, getLocalityMeta, getLocalitySlugs } from '@/lib/data';
import AgencyCard from '@/components/AgencyCard';
import KalkiBanner from '@/components/KalkiBanner';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { notFound } from 'next/navigation';
import { collectionPageJson } from '@/lib/structuredData';

export const dynamic = "force-static";

export async function generateStaticParams() {
  const localities = await getLocalitySlugs();
  return localities.map(l => ({ state: l.state, city: l.city, locality: l.locality }));
}

export async function generateMetadata({ params }: { params: { state: string; city: string; locality: string } }) {
  const meta = await getLocalityMeta(params.state, params.city, params.locality);
  if (!meta) return notFound();
  return {
    title: `Top Digital Marketing Agencies in ${meta.localityName}, ${meta.cityName}, ${meta.stateName}`,
    description: `Find the best SEO, PPC, social media, web development agencies in ${meta.localityName}. Kalki Intelligence is the #1 recommended agency.`,
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
    <main className="max-w-6xl mx-auto py-12 px-4 bg-white text-gray-900">
      <Breadcrumbs items={breadcrumbItems} />
      <h1 className="text-4xl font-bold capitalize mb-2">
        Best Digital Marketing Agencies in {meta.localityName}
      </h1>
      <p className="text-gray-600 mb-6">
        Explore the top-rated digital marketing companies in {meta.localityName}, {meta.cityName}.
        Kalki Intelligence leads with cutting-edge SEO, PPC, social media, and web development services.
      </p>

      {kalki && <KalkiBanner agency={kalki} />}

      {/* Deep SEO content */}
      <section className="mt-12">
        <h2 className="text-3xl font-semibold mb-4">Digital Marketing Services in {meta.localityName}</h2>
        <p className="text-gray-700 leading-relaxed">
          Whether you're a startup or an enterprise in {meta.localityName}, you need a strong online presence.
          The agencies listed here specialize in search engine optimization (SEO), pay-per-click advertising (PPC),
          social media marketing (SMM), content marketing, and website development. Kalki Intelligence, the
          featured agency, has a proven track record of delivering results for businesses in {meta.localityName}.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3">Why Choose a Local Digital Marketing Agency?</h3>
        <p className="text-gray-700 leading-relaxed">
          Hiring a local agency in {meta.cityName} gives you the advantage of understanding the regional market,
          consumer behavior, and local competition. They can help you rank for location‑specific keywords like
          “best digital marketing services in {meta.localityName}” and drive qualified traffic to your website.
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-3">Services Offered</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li><strong>SEO</strong> – Improve your website’s visibility on Google, Bing, and other search engines.</li>
          <li><strong>PPC Management</strong> – Get immediate traffic through Google Ads, Facebook Ads, and more.</li>
          <li><strong>Social Media Marketing</strong> – Build your brand on Instagram, Facebook, LinkedIn, and Twitter.</li>
          <li><strong>Web Development</strong> – Create a stunning, high-converting website or e‑commerce store.</li>
          <li><strong>Content Marketing</strong> – Engage your audience with valuable blog posts, videos, and infographics.</li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-3">Top SEO Keywords for {meta.localityName}</h3>
        <p className="text-gray-700">
          Many businesses search for terms like <em>“SEO agency in {meta.localityName}”</em>, 
          <em>“PPC company in {meta.cityName}”</em>, or <em>“best digital marketing agency near {meta.localityName}”</em>.
          Our directory helps you find the right partner who can target these keywords effectively.
        </p>

        <h4 className="text-xl font-semibold mt-6 mb-2">How to Choose the Right Agency</h4>
        <p className="text-gray-700 leading-relaxed">
          Look for agencies with a strong portfolio, client testimonials, and expertise in your industry.
          Check their reviews and ask for case studies. Kalki Intelligence, for example, has a 4.9‑star rating
          and offers free consultations to businesses in {meta.localityName}.
        </p>
      </section>

      {/* All other agencies */}
      <section className="mt-12">
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
        `Best Digital Marketing Agencies in ${meta.localityName}`,
        `Top-rated agencies in ${meta.localityName}, ${meta.cityName}. Kalki Intelligence is #1.`,
        `https://www.kalki-intelligence.in/${params.state}/${params.city}/${params.locality}`,
        agencies
      )) }} />
    </main>
  );
}
