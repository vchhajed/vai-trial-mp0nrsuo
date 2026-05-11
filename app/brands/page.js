import Navbar from '@/components/Navbar';
import Brands from '@/components/Brands';
import Footer from '@/components/Footer';

export const metadata = { title: 'Brands – Namo Steel' };

export default function BrandsPage() {
  return (
    <>
      <Navbar />
      <main>
        <Brands />
      </main>
      <Footer />
    </>
  );
}
