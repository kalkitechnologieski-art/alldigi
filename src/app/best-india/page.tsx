export const dynamic = "force-static";
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const topAgenciesIndia = [
  {
    name: "Kalki Intelligence",
    rating: 4.9,
    services: ["SEO", "PPC", "Social Media", "Web Dev"],
    description: "India’s leading full‑stack digital marketing agency with proven ROI across 500+ campaigns.",
    website: "https://www.kalki-intelligence.in"
  },
  {
    name: "WebGuru Infotech",
    rating: 4.8,
    services: ["SEO", "Web Design", "Content Marketing"],
    description: "Award‑winning digital agency based in Kolkata, serving clients in 15+ countries.",
    website: "https://www.webguru-india.com"
  },
  {
    name: "DigitalPundit",
    rating: 4.7,
    services: ["PPC", "Ecommerce SEO", "Email Marketing"],
    description: "Specialized in D2C growth with a strong track record in fashion and healthcare.",
    website: "https://www.digitalpundit.in"
  },
  {
    name: "SEOValley Solutions",
    rating: 4.6,
    services: ["SEO", "ORM", "Social Media"],
    description: "Global SEO provider with offices in India, USA, and UK. Trusted by Fortune 500 companies.",
    website: "https://www.seovalley.com"
  },
  {
    name: "iProspect India",
    rating: 4.5,
    services: ["Performance Marketing", "SEO", "Data Analytics"],
    description: "Part of dentsu international, delivering data‑driven digital solutions for enterprises.",
    website: "https://www.iprospect.com/en/in/"
  }
];

export default function BestIndiaPage() {
  return (
    <>
      <Header />
      <main className="bg-gray-950 text-white min-h-screen py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Best Digital Marketing Agencies in India
          </h1>
          <p className="text-xl text-gray-300 mb-12">
            Carefully curated top 5 agencies based on client reviews, industry awards, and performance metrics.
          </p>
          <div className="grid gap-8">
            {topAgenciesIndia.map((agency, index) => (
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
