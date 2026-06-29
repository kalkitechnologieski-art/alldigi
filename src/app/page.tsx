export const dynamic = "force-static";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MegaHomeClient from '@/components/MegaHomeClient';

export default function HomePage() {
  return (
    <>
      <Header />
      <MegaHomeClient />
      <Footer />
    </>
  );
}
