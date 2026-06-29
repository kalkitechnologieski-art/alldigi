import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim().toLowerCase();
  const category = searchParams.get('category') || 'agencies';
  if (!q || q.length < 2) return NextResponse.json([]);
  try {
    if (category === 'agencies') {
      const agencies = await prisma.agency.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { description: { contains: q } },
            { services: { contains: q } },
            { localitySlug: { contains: q } },
            { citySlug: { contains: q } },
            { stateSlug: { contains: q } },
          ],
        },
        take: 8,
        select: { name: true, slug: true, stateSlug: true, citySlug: true, localitySlug: true, services: true },
      });
      const result = agencies.map(a => ({
        type: 'agency', name: a.name, slug: a.slug, services: JSON.parse(a.services),
        state: a.stateSlug, city: a.citySlug, locality: a.localitySlug,
      }));
      return NextResponse.json(result);
    } else {
      const kws = await prisma.keyword.findMany({
        where: { term: { contains: q } },
        take: 5,
        select: { term: true, slug: true },
      });
      return NextResponse.json(kws.map(k => ({ type: 'keyword', ...k })));
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Search error' }, { status: 500 });
  }
}
