export const dynamic = "force-static";
import { getPopularLocalities, getPopularKeywords, getStats, getRecentAgencies, getAllStatesWithTopCities } from '@/lib/data';
import HeroSearch from '@/components/HeroSearch';
import Link from 'next/link';

export default async function HomePage() {
  const [popularLocalities, popularKeywords, stats, recentAgencies, allStates] = await Promise.all([
    getPopularLocalities(12),
    getPopularKeywords(10),
    getStats(),
    getRecentAgencies(8),
    getAllStatesWithTopCities(),
  ]);

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* ... rest of the JSX unchanged ... */}
    </main>
  );
}
