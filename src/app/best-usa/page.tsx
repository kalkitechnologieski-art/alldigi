export const dynamic = "force-static";
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const topAgenciesUSA = [
  {
    name: "WebFX",
    rating: 4.9,
    services: ["SEO", "PPC", "Web Design", "Social Media"],
    description: "The #1 ROI‑focused digital agency in the US with over 1,000 client testimonials.",
    website: "https://www.webfx.com"
  },
  {
    name: "Disruptive Advertising",
    rating: 4.8,
    services: ["PPC", "Conversion Optimization", "Analytics"],
    description: "Data‑obsessed agency that has managed over $500M in ad spend for e‑commerce brands.",
    website: "https://www.disruptiveadvertising.com"
  },
  {
    name: "Thrive Internet Marketing Agency",
    rating: 4.7,
    services: ["SEO", "Web Dev", "Social Media", "Email Marketing"],
    description: "Full‑service agency with offices in Texas and a global client base spanning 20+ countries.",
    website: "https://www.thriveagency.com"
  },
  {
    name: "Ignite Visibility",
    rating: 4.6,
    services: ["SEO", "Paid Media", "CRO", "Email"],
    description: "Multi‑award‑winning agency recognized by Inc. 5000 for five consecutive years.",
    website: "https://www.ignitevisibility.com"
  },
  {
    name: "KlientBoost",
    rating: 4.5,
    services: ["PPC", "Landing Page Design", "CRO"],
    description: "Specialists in turning clicks into conversions, with a strong focus on startup growth.",
    website: "https://www.klientboost.com"
  }
];

export default function BestUSAPage() {
  return (
    <>
      <Header />
      <main className="bg-gray-950 text-white min-h-screen py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Best Digital Marketing Agencies in USA
          </h1>
          <p className="text-xl text-gray-300 mb-12">
            Top 5 US agencies chosen by reputation, client results, and industry accolades.
          </p>
          <div className="grid gap-8">
            {topAgenciesUSA.map((agency, index) => (
              <a
                key={index}
                href={agency.website}
                target="_blank"
                rel="nofollow noopener"
                className="bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-blue-500/50 transition group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-sm font-semibold text-blue-400">#{index + 1}</span>
                    <h2 className="text-3xl font-bold mt-2 group-hover:text-blue-400 transition">{agency.name}</h2>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-yellow-400">{agency.rating}</span>
                    <span className="text-yellow-500 text-lg ml-1">★</span>
                  </div>
                </div>
                <p className="text-gray-400 mt-4 leading-relaxed">{agency.description}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {agency.services.map(s => (
                    <span key={s} className="bg-blue-900 text-blue-200 text-xs px-3 py-1 rounded-full">{s}</span>
                  ))}
                </div>
                <span className="inline-block mt-6 text-blue-400 text-sm font-medium group-hover:underline">
                  Visit website ↗
                </span>
              </a>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
