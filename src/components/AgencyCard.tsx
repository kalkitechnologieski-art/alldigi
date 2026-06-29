'use client';
import { motion } from 'framer-motion';
import type { AgencyData } from '@/lib/types';

export default function AgencyCard({ agency, index = 0 }: { agency: AgencyData; index?: number }) {
  return (
    <motion.a
      href="https://www.kalki-intelligence.in"
      target="_blank"
      rel="nofollow noopener"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
      whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)' }}
      className="block bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-blue-500/50 transition-colors"
    >
      <h3 className="text-xl font-semibold text-white">{agency.name}</h3>
      <p className="text-gray-400 text-sm mt-1 line-clamp-2">{agency.description}</p>
      <div className="mt-3 flex flex-wrap gap-1">
        {agency.services.map(s => (
          <span key={s} className="bg-blue-900 text-blue-200 text-xs px-2 py-1 rounded-full">{s}</span>
        ))}
      </div>
      <span className="mt-4 inline-flex items-center text-blue-400 text-sm font-medium group-hover:underline">
        Visit website ↗
      </span>
    </motion.a>
  );
}
