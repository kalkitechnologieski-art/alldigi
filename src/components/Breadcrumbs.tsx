import Link from 'next/link';
interface BreadcrumbItem { name: string; href: string; }
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-gray-600 mb-6">
      <ol className="inline-flex items-center space-x-1 flex-wrap">
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && <span className="mx-1">›</span>}
            {index === items.length - 1 ? <span className="capitalize">{item.name}</span> : <Link href={item.href} className="hover:text-blue-600 capitalize">{item.name}</Link>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
