'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface LocalityEntry {
  locality: string;
  localitySlug: string;
  city: string;
  citySlug: string;
  state: string;
  stateSlug: string;
}

export default function HeroSearch() {
  const [query, setQuery] = useState('');
  const [localities, setLocalities] = useState<LocalityEntry[]>([]);
  const [suggestions, setSuggestions] = useState<LocalityEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load the full locality list on mount
  useEffect(() => {
    fetch('/localities.json')
      .then(r => r.json())
      .then(data => setLocalities(data))
      .catch(console.error);
  }, []);

  // Filter suggestions as user types
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    const q = query.toLowerCase();
    const filtered = localities.filter(
      l => l.locality.toLowerCase().includes(q) ||
           l.city.toLowerCase().includes(q) ||
           l.state.toLowerCase().includes(q)
    ).slice(0, 8); // limit to 8 suggestions
    setSuggestions(filtered);
  }, [query, localities]);

  // Redirect to the correct URL when a suggestion is selected
  const handleSelect = (item: LocalityEntry) => {
    setIsLoading(true);
    // Build the URL: prefer locality if available, otherwise city
    const url = item.localitySlug
      ? `/${item.stateSlug}/${item.citySlug}/${item.localitySlug}`
      : `/${item.stateSlug}/${item.citySlug}`;
    router.push(url);
    // Reset UI
    setQuery('');
    setSuggestions([]);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl shadow-blue-500/20 hover:border-blue-400/50 transition-all duration-300">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search a city, locality, or state..."
          className="flex-1 bg-transparent px-4 py-3 text-white placeholder-gray-400 outline-none text-lg"
          aria-label="Search location"
        />
        {isLoading && (
          <div className="pr-3">
            <svg className="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
          </div>
        )}
        <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/25">
          Search
        </button>
      </div>

      {/* Animated suggestions dropdown */}
      <div className={`absolute top-20 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl shadow-black/50 z-50 max-h-80 overflow-y-auto transition-all duration-300 origin-top ${suggestions.length > 0 ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'}`}>
        {suggestions.map((item, i) => (
          <button
            key={i}
            onClick={() => handleSelect(item)}
            className="block w-full text-left p-4 hover:bg-white/5 border-b border-gray-800 last:border-0 transition-colors"
          >
            <span className="text-white font-medium">{item.locality || item.city}</span>
            <span className="text-gray-400 text-sm ml-2">
              {item.city}, {item.state}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
