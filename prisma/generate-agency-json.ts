import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const agencies = await prisma.agency.findMany({
    include: {
      locality: {
        select: { name: true, slug: true, lat: true, lon: true,
          city: { select: { name: true, slug: true,
            state: { select: { name: true, slug: true } }
          } }
        }
      }
    }
  });

  const output = agencies.map(a => ({
    id: a.id,
    name: a.name,
    slug: a.slug,
    website: a.website,
    description: a.description,
    services: JSON.parse(a.services),
    rating: a.rating,
    featured: a.featured,
    locality: a.locality.name,
    localitySlug: a.locality.slug,
    city: a.locality.city.name,
    citySlug: a.locality.city.slug,
    state: a.locality.city.state.name,
    stateSlug: a.locality.city.state.slug,
    lat: a.locality.lat,
    lon: a.locality.lon,
  }));

  const dir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'agencies.json'), JSON.stringify(output));
  console.log(`Generated agencies.json with ${output.length} agencies.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
