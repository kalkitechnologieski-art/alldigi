import Link from 'next/link';
import type { AgencyData } from '@/lib/types';
export default function AgencyCard({ agency }: { agency: AgencyData }) {
  return (
    <div className="border rounded-lg p-5 hover:shadow-lg transition bg-white flex flex-col">
      <h3 className="text-xl font-semibold">{agency.name}</h3>
      <p className="text-gray-600 text-sm mt-1 line-clamp-2">{agency.description}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {agency.services.map(s => <span key={s} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{s}</span>)}
      </div>
      <div className="mt-auto pt-4 flex items-center justify-between">
        <a href={agency.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm font-medium">Visit website ↗</a>
        <Link href={`/agencies/${agency.slug}`} className="text-xs text-gray-500 hover:text-blue-600">Details →</Link>
      </div>
    </div>
  );
}
