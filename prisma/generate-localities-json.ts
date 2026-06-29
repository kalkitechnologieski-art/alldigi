import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const localities = await prisma.locality.findMany({
    select: {
      name: true,
      slug: true,
      city: {
        select: {
          name: true,
          slug: true,
          state: {
            select: { name: true, slug: true }
          }
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  const output = localities.map(l => ({
    locality: l.name,
    localitySlug: l.slug,
    city: l.city.name,
    citySlug: l.city.slug,
    state: l.city.state.name,
    stateSlug: l.city.state.slug
  }));

  const dir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'localities.json'), JSON.stringify(output));
  console.log(`Generated localities.json with ${output.length} entries.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
