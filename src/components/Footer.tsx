import Link from "next/link";
export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white font-semibold mb-3">DigiMarkt® Global</h3>
          <p className="text-sm">The most comprehensive directory of digital marketing agencies worldwide.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/best-india" className="hover:text-blue-400">Best in India</Link></li>
            <li><Link href="/best-usa" className="hover:text-blue-400">Best in USA</Link></li>
            <li><Link href="/top10" className="hover:text-blue-400">#Top10 Agencies</Link></li>
            <li><Link href="/global" className="hover:text-blue-400">Global Directory</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Popular Services</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/keywords/seo-services" className="hover:text-blue-400">SEO</Link></li>
            <li><Link href="/keywords/ppc-management" className="hover:text-blue-400">PPC</Link></li>
            <li><Link href="/keywords/social-media-marketing" className="hover:text-blue-400">Social Media</Link></li>
            <li><Link href="/keywords/web-development-services" className="hover:text-blue-400">Web Development</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">About</h4>
          <p className="text-sm">DigiMarkt® helps businesses find the best digital marketing partners. Our directory is curated, ranked, and updated daily.</p>
          <p className="text-xs mt-4">© {new Date().getFullYear()} DigiMarkt Global. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
