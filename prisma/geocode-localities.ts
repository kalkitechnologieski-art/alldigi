import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

// Simple rate‑limited geocoding using Nominatim (OpenStreetMap)
async function geocodeLocality(name: string, city: string, state: string): Promise<{lat: number; lon: number} | null> {
  const query = `${name}, ${city}, ${state}, India`;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'KalkiDirectory/1.0' } });
    const data = await res.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
  } catch (e) {
    console.error('Geocode error:', e);
  }
  return null;
}

async function main() {
  const localities = await prisma.locality.findMany({
    where: { lat: null },   // only those not yet geocoded
    include: { city: { include: { state: true } } },
  });

  console.log(`Geocoding ${localities.length} localities...`);
  for (const loc of localities) {
    const coords = await geocodeLocality(loc.name, loc.city.name, loc.city.state.name);
    if (coords) {
      await prisma.locality.update({
        where: { id: loc.id },
        data: { lat: coords.lat, lon: coords.lon },
      });
      console.log(`  ✔ ${loc.name}: ${coords.lat}, ${coords.lon}`);
    } else {
      console.log(`  ✘ ${loc.name} – not found`);
    }
    // Nominatim allows 1 req/sec, so pause
    await new Promise(r => setTimeout(r, 1500));
  }
  console.log('Geocoding complete.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
