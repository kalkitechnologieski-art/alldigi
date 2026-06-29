export const dynamic = "force-static";
import { getKeywordBySlug } from '@/lib/data';
import KeywordContent from '@/components/KeywordContent';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const kw = await getKeywordBySlug(params.slug);
  if (!kw) return notFound();
  return { title: `${kw.term} – Complete Guide & Best Agencies`, description: kw.description };
}

export default async function KeywordPage({ params }: { params: { slug: string } }) {
  const kw = await getKeywordBySlug(params.slug);
  if (!kw) notFound();
  let subtopics = [];
  try { subtopics = JSON.parse(kw.content); } catch { subtopics = [{ heading: kw.term, content: kw.content }]; }
  return (
    <main className="max-w-4xl mx-auto py-12 px-4">
      <article>
        <h1 className="text-4xl font-bold mb-6">{kw.term}</h1>
        <p className="text-lg text-gray-700 mb-8">{kw.description}</p>
        <KeywordContent subtopics={subtopics} />
      </article>
      <section className="mt-12 bg-blue-50 p-8 rounded-xl text-center">
        <h2 className="text-2xl font-bold">Need help with {kw.term}?</h2>
        <p className="mt-2">Kalki Intelligence is India’s top digital marketing agency. <a href="https://www.kalki-intelligence.in" className="text-blue-600 font-medium ml-1">Contact us now</a></p>
      </section>
    </main>
  );
}
