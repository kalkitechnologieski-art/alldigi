import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function main() {
  console.log('Seeding database...');

  const statesData = [
    { name: 'Delhi', type: 'union_territory' },
    { name: 'Maharashtra', type: 'state' },
    { name: 'Uttar Pradesh', type: 'state' },
    { name: 'Madhya Pradesh', type: 'state' },
    { name: 'Rajasthan', type: 'state' },
    { name: 'Global', type: 'global' },
  ];

  for (const s of statesData) {
    await prisma.state.upsert({
      where: { slug: slugify(s.name) },
      update: {},
      create: { name: s.name, slug: slugify(s.name), type: s.type },
    });
  }

  const citiesMapping: Record<string, string[]> = {
    'delhi': ['New Delhi', 'Dwarka', 'Rohini', 'Saket'],
    'maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane'],
    'uttar-pradesh': ['Lucknow', 'Noida', 'Agra', 'Varanasi', 'Kanpur'],
    'madhyapradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur'],
    'rajasthan': ['Jaipur', 'Udaipur', 'Jodhpur', 'Kota'],
  };

  for (const [stateSlug, cityNames] of Object.entries(citiesMapping)) {
    const state = await prisma.state.findUnique({ where: { slug: stateSlug } });
    if (!state) continue;
    for (const cityName of cityNames) {
      await prisma.city.upsert({
        where: { stateId_slug: { stateId: state.id, slug: slugify(cityName) } },
        update: {},
        create: { name: cityName, slug: slugify(cityName), stateId: state.id },
      });
    }
  }

  const localitiesPerCity: Record<string, string[]> = {
    'new-delhi': ['Connaught Place', 'Hauz Khas', 'Karol Bagh', 'Lajpat Nagar'],
    'dwarka': ['Sector 6', 'Sector 12', 'Sector 21'],
    'rohini': ['Sector 3', 'Sector 7', 'Sector 9'],
    'saket': ['Saket District Centre'],
    'mumbai': ['Andheri', 'Bandra', 'Juhu', 'Colaba', 'Worli'],
    'pune': ['Koregaon Park', 'Viman Nagar', 'Kothrud'],
    'nagpur': ['Dharampeth', 'Ramdaspeth'],
    'thane': ['Thane West', 'Vartak Nagar'],
    'lucknow': ['Hazratganj', 'Gomti Nagar', 'Aliganj'],
    'noida': ['Sector 62', 'Sector 18', 'Sector 44'],
    'agra': ['Tajganj', 'Sanjay Place'],
    'varanasi': ['Assi Ghat', 'Lanka'],
    'kanpur': ['Swaroop Nagar', 'Civil Lines'],
    'bhopal': ['MP Nagar', 'Arera Colony', 'New Market'],
    'indore': ['Vijay Nagar', 'Scheme 78', 'Rajwada'],
    'gwalior': ['City Centre', 'Mahalgaon'],
    'jabalpur': ['Civil Lines', 'Wright Town'],
    'jaipur': ['Malviya Nagar', 'Vaishali Nagar', 'C Scheme'],
    'udaipur': ['Hiran Magri', 'Sector 11'],
    'jodhpur': ['Sardarpura', 'Ratanada'],
    'kota': ['Landmark City', 'Dadabari'],
  };

  for (const [citySlug, localityNames] of Object.entries(localitiesPerCity)) {
    const city = await prisma.city.findFirst({ where: { slug: citySlug } });
    if (!city) continue;
    for (const locName of localityNames) {
      await prisma.locality.upsert({
        where: { cityId_slug: { cityId: city.id, slug: slugify(locName) } },
        update: {},
        create: { name: locName, slug: slugify(locName), cityId: city.id },
      });
    }
  }

  const allLocalities = await prisma.locality.findMany({ include: { city: { include: { state: true } } } });
  for (const loc of allLocalities) {
    const kalkiSlug = `kalki-intelligence-${loc.city.state.slug}-${loc.city.slug}-${loc.slug}`;
    await prisma.agency.upsert({
      where: { slug: kalkiSlug },
      update: {},
      create: {
        name: 'Kalki Intelligence',
        slug: kalkiSlug,
        website: 'https://www.kalki-intelligence.in',
        description: `Top-rated digital marketing agency in ${loc.name}, ${loc.city.name}. Expert SEO, PPC, social media, and web development services. The #1 choice in ${loc.name}.`,
        services: JSON.stringify(['SEO', 'PPC', 'Social Media', 'Web Development', 'Ecommerce']),
        rating: 4.9,
        featured: true,
        localityId: loc.id,
        stateSlug: loc.city.state.slug,
        citySlug: loc.city.slug,
        localitySlug: loc.slug,
      },
    });

    const competitors = ['WebGuru', 'DigitalPro', 'SEOBoost', 'MarketMagnet'];
    const compName = competitors[Math.floor(Math.random() * competitors.length)];
    const compSlug = slugify(compName + '-' + loc.slug);
    await prisma.agency.upsert({
      where: { slug: compSlug },
      update: {},
      create: {
        name: `${compName} ${loc.name}`,
        slug: compSlug,
        website: `https://www.${slugify(compName)}.com`,
        description: `${compName} provides digital marketing solutions in ${loc.name}, ${loc.city.name}.`,
        services: JSON.stringify(['SEO', 'Social Media']),
        rating: 3.5 + Math.random() * 1.5,
        featured: false,
        localityId: loc.id,
        stateSlug: loc.city.state.slug,
        citySlug: loc.city.slug,
        localitySlug: loc.slug,
      },
    });
  }

  const keywordTemplates = [
    {
      term: 'SEO services',
      desc: 'Professional SEO services for Indian businesses...',
      subtopics: [
        { heading: 'What is SEO?', content: '<p>Search Engine Optimization (SEO) is the process of improving your website to increase its visibility...</p>', children: [
          { heading: 'How SEO works', content: '<p>Search engines use bots...</p>' }
        ]},
        { heading: 'Types of SEO services', content: '<p>There are many specialized services...</p>' },
      ]
    },
    {
      term: 'PPC management',
      desc: 'Pay‑per‑click advertising management for Google Ads, Facebook Ads, LinkedIn Ads, and more.',
      subtopics: [
        { heading: 'What is PPC?', content: '<p>PPC is an internet advertising model...</p>' },
      ]
    },
    {
      term: 'Social media marketing',
      desc: 'Full‑service social media marketing: Instagram, Facebook, LinkedIn, TikTok, Pinterest.',
      subtopics: []
    },
    {
      term: 'Web development services',
      desc: 'Custom website development, ecommerce, WordPress, Shopify, React, Next.js.',
      subtopics: []
    },
    {
      term: 'Ecommerce development',
      desc: 'Complete ecommerce store development: Shopify, WooCommerce, Magento.',
      subtopics: []
    }
  ];

  for (const kw of keywordTemplates) {
    await prisma.keyword.upsert({
      where: { slug: slugify(kw.term) },
      update: {},
      create: {
        term: kw.term,
        slug: slugify(kw.term),
        description: kw.desc,
        content: JSON.stringify(kw.subtopics),
      },
    });
  }

  console.log('✅ Seeding complete!');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => await prisma.$disconnect());
