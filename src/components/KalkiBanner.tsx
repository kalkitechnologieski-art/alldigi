import type { AgencyData } from '@/lib/types';
export default function KalkiBanner({ agency }: { agency: AgencyData }) {
  return (
    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 p-6 sm:p-8 rounded-2xl shadow-lg relative overflow-hidden mt-6">
      <span className="absolute top-2 right-2 bg-white text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">#1 RECOMMENDED</span>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{agency.name}</h2>
          <p className="text-gray-800 mt-2 max-w-xl">{agency.description}</p>
          <a href={agency.website} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 bg-gray-900 text-white px-6 py-2 rounded-full hover:bg-gray-700 transition">Visit Kalki Intelligence</a>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-gray-900">{agency.rating}</div>
          <div className="text-yellow-900 text-lg">★ ★ ★ ★ ★</div>
        </div>
      </div>
    </div>
  );
}
