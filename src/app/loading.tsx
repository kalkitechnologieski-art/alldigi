export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4 animate-pulse space-y-6">
      <div className="h-8 bg-gray-200 rounded w-1/3" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="h-48 bg-gray-200 rounded" />))}
      </div>
    </div>
  );
}
