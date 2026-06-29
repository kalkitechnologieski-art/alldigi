'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface PopularLocality { state: string; city: string; locality: string; name: string; slug: string; }
interface PopularKeyword { term: string; slug: string; }

export default function HeroSearch({
  popularLocalities,
  popularKeywords,
}: {
  popularLocalities: PopularLocality[];
  popularKeywords: PopularKeyword[];
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<'agencies' | 'keywords'>('agencies');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchSuggestions = async () => {
      if (query.length < 2) { setSuggestions([]); return; }
      try {
        const res = await fetch(`/search?q=${encodeURIComponent(query)}&category=${activeCategory}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error('Network error');
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        if (!(err instanceof Error) || err.name !== 'AbortError') {
          setSuggestions([]);
        }
      }
    };
    fetchSuggestions();
    return () => controller.abort();
  }, [query, activeCategory]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl shadow-blue-500/20 hover:border-blue-400/50 transition-all duration-300">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search agency, service, or locality..."
          className="flex-1 bg-transparent px-4 py-3 text-white placeholder-gray-400 outline-none text-lg"
          aria-label="Search digital marketing agencies"
        />
        <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/25">
          Search
        </button>
      </div>

      <div className="flex gap-2 mt-4 justify-center flex-wrap">
        {['SEO', 'PPC', 'Social Media', 'Web Development', 'Ecommerce'].map(cat => (
          <button
            key={cat}
            onClick={() => { setActiveCategory('agencies'); setQuery(cat); }}
            className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-sm text-gray-300 hover:bg-white/20 hover:border-blue-400/50 transition"
          >
            {cat}
          </button>
        ))}
      </div>

      {suggestions.length > 0 && (
        <div className="absolute top-24 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl shadow-black/50 z-20 max-h-80 overflow-y-auto">
          {suggestions.map((item: any) => (
            <Link
              key={item.type + '-' + (item.slug || item.locality)}
              href={
                item.type === 'agency'
                  ? `/agencies/${item.slug}`
                  : `/${item.state}/${item.city}/${item.locality}`
              }
              onClick={() => setSuggestions([])}
              className="block p-4 hover:bg-white/5 border-b border-gray-800 last:border-0 transition"
            >
              <span className="font-medium text-white">{item.name || item.locality}</span>
              {item.services && (
                <span className="text-sm text-gray-400 ml-2">
                  ({item.services.join(', ')})
                </span>
              )}
              <span className="text-xs text-blue-400 ml-2">
                {item.type === 'agency' ? 'Agency' : 'Locality'}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
