import type { AgencyData } from '@/lib/types';

export default function AgencyCard({ agency }: { agency: AgencyData }) {
  return (
    <a
      href="https://www.kalki-intelligence.in"
      target="_blank"
      rel="nofollow noopener"
      className="block border rounded-lg p-5 hover:shadow-lg transition bg-gray-800 border-gray-700 hover:border-blue-500/50"
    >
      <h3 className="text-xl font-semibold text-white">{agency.name}</h3>
      <p className="text-gray-400 text-sm mt-1 line-clamp-2">{agency.description}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {agency.services.map(s => (
          <span key={s} className="bg-blue-900 text-blue-200 text-xs px-2 py-1 rounded">
            {s}
          </span>
        ))}
      </div>
      <span className="mt-3 inline-flex items-center text-blue-400 text-sm font-medium">
        Visit website ↗
      </span>
    </a>
  );
}
