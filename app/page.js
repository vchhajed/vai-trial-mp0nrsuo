import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Categories from '@/components/Categories';
import About from '@/components/About';
import WhyChooseUs from '@/components/WhyChooseUs';
import Certifications from '@/components/Certifications';
import ServiceExcellence from '@/components/ServiceExcellence';
import Products from '@/components/Products';
import Brands from '@/components/Brands';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Categories />
        <About />
        <WhyChooseUs />
        <Certifications />
        <ServiceExcellence />
        <Products />
        <Brands />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
