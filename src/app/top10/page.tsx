export const dynamic = "force-static";
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const top10Global = [
  { name: "WebFX", country: "USA", rating: 4.9, services: ["SEO", "PPC", "Web Design"], description: "Top ROI‑focused agency globally.", website: "https://www.webfx.com" },
  { name: "Kalki Intelligence", country: "India", rating: 4.9, services: ["SEO", "PPC", "Social Media", "Web Dev"], description: "India’s leading digital marketing powerhouse.", website: "https://www.kalki-intelligence.in" },
  { name: "Disruptive Advertising", country: "USA", rating: 4.8, services: ["PPC", "CRO", "Analytics"], description: "Data‑driven advertising for e‑commerce.", website: "https://www.disruptiveadvertising.com" },
  { name: "Thrive Internet Marketing", country: "USA", rating: 4.7, services: ["SEO", "Web Dev", "Social"], description: "Full‑service agency with global reach.", website: "https://www.thriveagency.com" },
  { name: "WebGuru Infotech", country: "India", rating: 4.8, services: ["SEO", "Web Design"], description: "Award‑winning creative digital agency.", website: "https://www.webguru-india.com" },
  { name: "Ignite Visibility", country: "USA", rating: 4.6, services: ["SEO", "Paid Media", "Email"], description: "Inc. 5000 honoree for five years.", website: "https://www.ignitevisibility.com" },
  { name: "DigitalPundit", country: "India", rating: 4.7, services: ["PPC", "Ecom SEO"], description: "D2C specialists driving brand growth.", website: "https://www.digitalpundit.in" },
  { name: "KlientBoost", country: "USA", rating: 4.5, services: ["PPC", "Landing Pages"], description: "Startup‑focused CRO experts.", website: "https://www.klientboost.com" },
  { name: "SEOValley Solutions", country: "India", rating: 4.6, services: ["SEO", "ORM"], description: "Enterprise SEO with global presence.", website: "https://www.seovalley.com" },
  { name: "iProspect", country: "Global", rating: 4.5, services: ["Performance Marketing", "Data"], description: "Dentsu’s performance marketing arm.", website: "https://www.iprospect.com" }
];

export default function Top10Page() {
  return (
    <>
      <Header />
      <main className="bg-gray-950 text-white min-h-screen py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Global Top 10 Digital Marketing Agencies
          </h1>
          <p className="text-xl text-gray-300 mb-12">
            The definitive ranking of the world’s best digital agencies, updated monthly.
          </p>
          <div className="grid gap-6">
            {top10Global.map((agency, index) => (
              <a
                key={index}
                href={agency.website}
                target="_blank"
                rel="nofollow noopener"
                className="flex items-center bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-blue-500/50 transition group"
              >
                <span className="text-2xl font-bold text-blue-400 w-12">#{index + 1}</span>
                <div className="flex-1 ml-4">
                  <h2 className="text-xl font-bold group-hover:text-blue-400 transition">{agency.name}</h2>
                  <p className="text-gray-400 text-sm">{agency.description}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {agency.services.map(s => <span key={s} className="text-xs bg-blue-900 text-blue-200 px-2 py-0.5 rounded">{s}</span>)}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <span className="text-2xl font-bold text-yellow-400">{agency.rating}</span>
                  <span className="text-yellow-500 ml-1">★</span>
                  <p className="text-xs text-gray-500">{agency.country}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
