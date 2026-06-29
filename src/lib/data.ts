import prisma from './prisma';
import type { AgencyData, LocalityMeta, KeywordData } from './types';

// ---------- Meta helpers ----------
export async function getStateMeta(slug: string) {
  if (slug === 'global') return { slug: 'global', displayName: 'Global', type: 'global' };
  const state = await prisma.state.findUnique({ where: { slug }, select: { name: true, type: true } });
  return state ? { slug, displayName: state.name, type: state.type } : null;
}

export async function getCitiesByState(stateSlug: string) {
  if (stateSlug === 'global') {
    return [
      { slug: 'usa', name: 'United States', agencyCount: 0 },
      { slug: 'uk', name: 'United Kingdom', agencyCount: 0 },
      { slug: 'uae', name: 'UAE', agencyCount: 0 },
    ];
  }
  const cities = await prisma.city.findMany({
    where: { state: { slug: stateSlug } },
    select: { name: true, slug: true, _count: { select: { localities: true } } },
    orderBy: { name: 'asc' },
  });
  return cities.map(c => ({ slug: c.slug, name: c.name, agencyCount: c._count.localities }));
}

export async function getLocalitiesByCity(stateSlug: string, citySlug: string) {
  const city = await prisma.city.findFirst({
    where: { slug: citySlug, state: { slug: stateSlug } },
    include: { localities: { select: { name: true, slug: true, _count: { select: { agencies: true } } } } },
  });
  if (!city) return [];
  return city.localities.map(l => ({ name: l.name, slug: l.slug, count: l._count.agencies, cityName: city.name }));
}

export async function getAgenciesByLocality(stateSlug: string, citySlug: string, localitySlug: string): Promise<AgencyData[]> {
  const locality = await prisma.locality.findFirst({
    where: { slug: localitySlug, city: { slug: citySlug, state: { slug: stateSlug } } },
    include: { agencies: { orderBy: { featured: 'desc' } } },
  });
  if (!locality) return [];
  return locality.agencies.map(a => ({
    id: a.id, name: a.name, slug: a.slug, website: a.website, description: a.description,
    services: JSON.parse(a.services) as string[], rating: a.rating, featured: a.featured,
    stateSlug: a.stateSlug, citySlug: a.citySlug, localitySlug: a.localitySlug,
  }));
}

export async function getLocalityMeta(stateSlug: string, citySlug: string, localitySlug: string): Promise<LocalityMeta | null> {
  const loc = await prisma.locality.findFirst({
    where: { slug: localitySlug, city: { slug: citySlug, state: { slug: stateSlug } } },
    include: { city: { include: { state: true } } },
  });
  if (!loc) return null;
  return { localityName: loc.name, cityName: loc.city.name, stateName: loc.city.state.name };
}

export async function getAgencyBySlug(slug: string): Promise<AgencyData | null> {
  const a = await prisma.agency.findUnique({
    where: { slug },
    include: { locality: { include: { city: { include: { state: true } } } } },
  });
  if (!a) return null;
  return {
    id: a.id, name: a.name, slug: a.slug, website: a.website, description: a.description,
    services: JSON.parse(a.services) as string[], rating: a.rating, featured: a.featured,
    stateSlug: a.stateSlug, citySlug: a.citySlug, localitySlug: a.localitySlug,
  };
}

export async function getKeywordBySlug(slug: string): Promise<KeywordData | null> {
  const kw = await prisma.keyword.findUnique({ where: { slug } });
  return kw ? { term: kw.term, slug: kw.slug, description: kw.description, content: kw.content } : null;
}

// ---------- Sitemap & static paths ----------
export async function getKeywordSlugs() { return (await prisma.keyword.findMany({ select: { slug: true } })).map(k => k.slug); }
export async function getStateSlugs() { return (await prisma.state.findMany({ select: { slug: true } })).map(s => s.slug); }
export async function getCitySlugs() {
  const c = await prisma.city.findMany({ select: { slug: true, state: { select: { slug: true } } } });
  return c.map(c => ({ city: c.slug, state: c.state.slug }));
}
export async function getLocalitySlugs() {
  const l = await prisma.locality.findMany({ select: { slug: true, city: { select: { slug: true, state: { select: { slug: true } } } } } });
  return l.map(l => ({ locality: l.slug, city: l.city.slug, state: l.city.state.slug }));
}
export async function getAgencySlugs() { return (await prisma.agency.findMany({ select: { slug: true } })).map(a => a.slug); }

// ---------- Homepage data ----------
export async function getPopularLocalities(limit = 12) {
  const locs = await prisma.locality.findMany({
    take: limit, orderBy: { agencies: { _count: 'desc' } },
    include: { city: { include: { state: true } } },
  });
  return locs.map(l => ({ state: l.city.state.slug, city: l.city.slug, locality: l.slug, name: l.name, slug: l.slug }));
}

export async function getPopularKeywords(limit = 10) {
  const kws = await prisma.keyword.findMany({ take: limit, orderBy: { id: 'asc' } });
  return kws.map(k => ({ term: k.term, slug: k.slug }));
}

export async function getStats() {
  const [states, cities, localities, agencies, keywords] = await Promise.all([
    prisma.state.count({ where: { NOT: { slug: 'global' } } }),
    prisma.city.count(),
    prisma.locality.count(),
    prisma.agency.count(),
    prisma.keyword.count(),
  ]);
  return { states, cities, localities, agencies, keywords };
}

export async function getRecentAgencies(limit = 6) {
  const agencies = await prisma.agency.findMany({
    orderBy: { id: 'desc' },
    take: limit,
    include: { locality: { include: { city: { include: { state: true } } } } },
  });
  return agencies.map(a => ({
    ...a,
    services: JSON.parse(a.services) as string[],
    localityName: a.locality.name,
    cityName: a.locality.city.name,
    stateName: a.locality.city.state.name,
  }));
}

export async function getAllStatesWithTopCities() {
  const states = await prisma.state.findMany({
    where: { NOT: { slug: 'global' } },
    include: {
      cities: {
        take: 5,
        orderBy: { localities: { _count: 'desc' } },
        select: { name: true, slug: true },
      },
    },
    orderBy: { name: 'asc' },
  });
  return states.map(s => ({
    name: s.name,
    slug: s.slug,
    cities: s.cities,
  }));
}
