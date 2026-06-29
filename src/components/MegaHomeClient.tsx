'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from './Header';
import Footer from './Footer';

interface LocalityInfo { state: string; city: string; locality: string; name: string; slug: string; }
interface KeywordInfo { term: string; slug: string; }

export default function MegaHomeClient({ popularLocalities, keywords }: { popularLocalities: LocalityInfo[]; keywords: KeywordInfo[] }) {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [filteredAgencies, setFilteredAgencies] = useState<any[]>([]);
  const [selectedState, setSelectedState] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');

  // Load all agencies from static JSON
  useEffect(() => {
    fetch('/agencies.json').then(r => r.json()).then(data => {
      setAgencies(data);
      setFilteredAgencies(data);
    });
  }, []);

  // Filter agencies based on selected state/city
  useEffect(() => {
    let filtered = agencies;
    if (selectedState !== 'all') {
      filtered = filtered.filter(a => a.stateSlug === selectedState);
    }
    if (selectedCity !== 'all') {
      filtered = filtered.filter(a => a.citySlug === selectedCity);
    }
    setFilteredAgencies(filtered);
  }, [selectedState, selectedCity, agencies]);

  // Nominatim location autocomplete
  useEffect(() => {
    if (search.length < 3) { setSuggestions([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}&countrycodes=in&limit=5`);
        const data = await res.json();
        setSuggestions(data);
      } catch (e) {
        setSuggestions([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSelectLocation = (place: any) => {
    // Find nearest agencies (simple version: filter by city name)
    const cityName = place.display_name.split(',')[0]?.trim();
    if (cityName) {
      setSelectedCity('all');
      setSelectedState('all');
      setSearch(cityName);
      setSuggestions([]);
      // Optionally filter agencies by lat/lon proximity
      // For now, we just show the locality text.
    }
  };

  // Extract unique states and cities for filter dropdowns
  const states = useMemo(() => [...new Set(agencies.map(a => a.stateSlug))], [agencies]);
  const cities = useMemo(() => {
    if (selectedState === 'all') return [...new Set(agencies.map(a => a.citySlug))];
    return [...new Set(agencies.filter(a => a.stateSlug === selectedState).map(a => a.citySlug))];
  }, [selectedState, agencies]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-950 text-white">
        {/* Hero */}
        <section className="relative overflow-hidden py-24 px-4">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          </div>
          <div className="relative z-10 max-w-5xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Find Top Digital Marketing Agencies
            </h1>
            <p className="mt-6 text-xl text-gray-300">Search by location, service, or agency name</p>
            <div className="mt-10 relative max-w-xl mx-auto">
              <div className="flex rounded-2xl overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Enter city, locality, or area..."
                  className="flex-1 bg-transparent px-5 py-4 text-white placeholder-gray-400 outline-none text-lg"
                />
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 font-semibold">Search</button>
              </div>
              {suggestions.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto">
                  {suggestions.map((s, i) => (
                    <button key={i} onClick={() => handleSelectLocation(s)} className="block w-full text-left p-3 hover:bg-gray-700 transition">
                      <span className="text-sm">{s.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Filters: State & City */}
        <section className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex flex-wrap gap-4 justify-center">
            <select value={selectedState} onChange={e => { setSelectedState(e.target.value); setSelectedCity('all'); }}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white">
              <option value="all">All States</option>
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white">
              <option value="all">All Cities</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </section>

        {/* Agency Cards Grid */}
        <section className="max-w-7xl mx-auto px-4 pb-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgencies.slice(0, 30).map(agency => (
              <Link key={agency.id} href={`/agencies/${agency.slug}`} className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-blue-500/50 transition group">
                <h3 className="text-xl font-bold group-hover:text-blue-400 transition">{agency.name}</h3>
                <p className="text-sm text-gray-400 mt-1">{agency.locality}, {agency.city}</p>
                <div className="flex flex-wrap gap-1 mt-3">
                  {agency.services.map((s: string) => <span key={s} className="text-xs bg-blue-900 text-blue-200 px-2 py-0.5 rounded">{s}</span>)}
                </div>
                <p className="text-sm text-gray-500 mt-3 line-clamp-2">{agency.description}</p>
                <div className="mt-3 text-yellow-400 text-sm">★ {agency.rating}</div>
              </Link>
            ))}
          </div>
          {filteredAgencies.length === 0 && <p className="text-center text-gray-500 mt-8">No agencies found. Try different filters.</p>}
        </section>
      </main>
      <Footer />
    </>
  );
}
