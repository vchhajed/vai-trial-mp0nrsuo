import Navbar from '@/components/Navbar';
import About from '@/components/About';
import WhyChooseUs from '@/components/WhyChooseUs';
import Certifications from '@/components/Certifications';
import ServiceExcellence from '@/components/ServiceExcellence';
import Footer from '@/components/Footer';

export const metadata = { title: 'About – Namo Steel' };

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        <About />
        <WhyChooseUs />
        <Certifications />
        <ServiceExcellence />
      </main>
      <Footer />
    </>
  );
}
