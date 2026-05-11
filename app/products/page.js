import Navbar from '@/components/Navbar';
import Products from '@/components/Products';
import Footer from '@/components/Footer';

export const metadata = { title: 'Products – Namo Steel' };

export default function ProductsPage() {
  return (
    <>
      <Navbar />
      <main>
        <Products />
      </main>
      <Footer />
    </>
  );
}
