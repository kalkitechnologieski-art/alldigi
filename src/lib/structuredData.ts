export function breadcrumbJson(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, i) => ({
      "@type": "ListItem", "position": i + 1, "name": item.name, "item": item.url,
    })),
  };
}
export function localBusinessJson(agency: any) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": agency.name,
    "url": agency.website,
    "description": agency.description,
    "address": { "@type": "PostalAddress", "addressLocality": agency.locality, "addressRegion": agency.state, "addressCountry": "IN" },
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": agency.rating, "bestRating": "5" },
  };
}
export function collectionPageJson(title: string, description: string, url: string, agencies: any[]) {
  return { "@context": "https://schema.org", "@type": "CollectionPage", "name": title, "description": description, "url": url, "mainEntity": agencies.map(localBusinessJson) };
}
