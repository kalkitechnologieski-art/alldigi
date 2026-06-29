export const dynamic = "force-static";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

const categories = [
  { name: 'SEO', slug: 'seo-services', icon: '🔍', desc: 'Search Engine Optimization services to rank higher on Google.' },
  { name: 'PPC', slug: 'ppc-management', icon: '💰', desc: 'Pay‑Per‑Click advertising management for immediate traffic.' },
  { name: 'Social Media Marketing', slug: 'social-media-marketing', icon: '📱', desc: 'Build your brand on Instagram, Facebook, LinkedIn, TikTok.' },
  { name: 'Web Development', slug: 'web-development-services', icon: '💻', desc: 'Custom websites, e‑commerce stores, and web applications.' },
  { name: 'Content Marketing', slug: 'content-marketing', icon: '✍️', desc: 'High‑quality content that engages and converts.' },
  { name: 'Email Marketing', slug: 'email-marketing', icon: '📧', desc: 'Email campaigns that nurture leads and drive sales.' },
  { name: 'Ecommerce Development', slug: 'ecommerce-development', icon: '🛒', desc: 'Shopify, WooCommerce, and custom e‑commerce solutions.' },
  { name: 'Local SEO', slug: 'local-seo', icon: '📍', desc: 'Dominate local search results and Google Maps.' },
  { name: 'Video Marketing', slug: 'video-marketing', icon: '🎥', desc: 'YouTube and video advertising strategies.' },
  { name: 'Influencer Marketing', slug: 'influencer-marketing', icon: '🤳', desc: 'Connect with influencers to amplify your brand.' },
];

export default function CategoriesPage() {
  return (
    <>
      <Header />
      <main className="bg-gray-950 text-white min-h-screen py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Digital Marketing Service Categories
          </h1>
          <p className="text-xl text-gray-300 mb-12">
            Explore our comprehensive guides to every digital marketing service.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(cat => (
              <Link
                key={cat.slug}
                href={`/keywords/${cat.slug}`}
                className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-blue-500/50 transition text-left"
              >
                <span className="text-4xl">{cat.icon}</span>
                <h2 className="text-2xl font-bold mt-4">{cat.name}</h2>
                <p className="text-gray-400 mt-2">{cat.desc}</p>
                <span className="inline-block mt-4 text-blue-400 text-sm font-medium">
                  Read guide →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
