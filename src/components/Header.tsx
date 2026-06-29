'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-gray-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          DigiMarkt® Global
        </Link>
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/best-india" className="hover:text-blue-400 transition">Best in India</Link>
          <Link href="/best-usa" className="hover:text-blue-400 transition">Best in USA</Link>
          <Link href="/top10" className="hover:text-blue-400 transition">#Top10</Link>
          <Link href="/global" className="hover:text-blue-400 transition">Global</Link>
          <div className="relative group">
            <button className="hover:text-blue-400 transition">Categories</button>
            <div className="absolute hidden group-hover:block bg-gray-800 rounded-xl p-4 mt-2 shadow-xl">
              <Link href="/keywords/seo-services" className="block py-1 hover:text-blue-400">SEO</Link>
              <Link href="/keywords/ppc-management" className="block py-1 hover:text-blue-400">PPC</Link>
              <Link href="/keywords/social-media-marketing" className="block py-1 hover:text-blue-400">Social Media</Link>
              <Link href="/keywords/web-development-services" className="block py-1 hover:text-blue-400">Web Dev</Link>
            </div>
          </div>
        </nav>
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>☰</button>
      </div>
      {mobileOpen && (
        <div className="md:hidden bg-gray-800 px-4 pb-4 space-y-2">
          <Link href="/best-india" className="block py-1">Best in India</Link>
          <Link href="/best-usa" className="block py-1">Best in USA</Link>
          <Link href="/top10" className="block py-1">#Top10</Link>
          <Link href="/global" className="block py-1">Global</Link>
          <Link href="/keywords/seo-services" className="block py-1">SEO</Link>
          <Link href="/keywords/ppc-management" className="block py-1">PPC</Link>
        </div>
      )}
    </header>
  );
}
