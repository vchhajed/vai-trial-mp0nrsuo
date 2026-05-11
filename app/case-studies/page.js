import Navbar from '@/components/Navbar';
import CaseStudies from '@/components/CaseStudies';
import Footer from '@/components/Footer';

export const metadata = { title: 'Case Studies – Namo Steel' };

export default function CaseStudiesPage() {
  return (
    <>
      <Navbar />
      <main>
        <CaseStudies />
      </main>
      <Footer />
    </>
  );
}
