export const dynamic = "force-static";
import { getPopularLocalities, getPopularKeywords } from '@/lib/data';
import MegaHomeClient from '@/components/MegaHomeClient';

export default async function HomePage() {
  // Fetch popular localities and keywords for initial display
  const popularLocalities = await getPopularLocalities(24);
  const keywords = await getPopularKeywords(12);

  return <MegaHomeClient popularLocalities={popularLocalities} keywords={keywords} />;
}
