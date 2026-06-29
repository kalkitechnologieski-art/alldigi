import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
const inter = Inter({ subsets: ['latin'] });
export const metadata: Metadata = {
  title: { template: '%s | DigiMarkt Global', default: 'DigiMarkt Global – Find Best Digital Marketing Agencies' },
  description: 'Global directory of digital marketing agencies. Browse top SEO, PPC, social media, web development companies.',
  metadataBase: new URL('https://best-digital-marketing-agencies.vercel.app'),
  verification: { google: 'MlyT39B0Ya1DOLdb3JeOhtRLJWR4BX-WYs_fnsJwpbE' },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className + ' bg-gray-950 text-white'}>
        {children}
      </body>
    </html>
  );
}
