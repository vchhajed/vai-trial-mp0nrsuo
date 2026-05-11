import Navbar from '@/components/Navbar';
import Clients from '@/components/Clients';
import Footer from '@/components/Footer';

export const metadata = { title: 'Clients – Namo Steel' };

export default function ClientsPage() {
  return (
    <>
      <Navbar />
      <main>
        <Clients />
      </main>
      <Footer />
    </>
  );
}
