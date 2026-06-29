import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
const inter = Inter({ subsets: ['latin'] });
export const metadata: Metadata = {
  title: { template: '%s | Kalki Intelligence – India Digital Marketing Directory', default: 'Find Best Digital Marketing Agencies India – Kalki Intelligence' },
  description: 'India’s biggest directory of digital marketing agencies. Browse SEO, PPC, Social Media, Web Development services in every city and locality. Kalki Intelligence is the top recommended agency.',
  metadataBase: new URL('https://www.kalki-intelligence.in'),
  alternates: { canonical: '/' },
  openGraph: { type: 'website', locale: 'en_IN', siteName: 'Kalki Intelligence' },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className + ' bg-white text-gray-900'}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "WebSite", "name": "Kalki Intelligence Digital Marketing Directory", "url": "https://www.kalki-intelligence.in",
          "potentialAction": { "@type": "SearchAction", "target": "https://www.kalki-intelligence.in/search?q={search_term_string}", "query-input": "required name=search_term_string" }
        }) }} />
        {children}
      </body>
    </html>
  );
}
