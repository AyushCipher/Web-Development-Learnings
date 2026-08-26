import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ArrowUp, MessageCircle } from 'lucide-react';

import HeroSection from '../components/HeroSection';
import AboutUs from '../components/AboutUs';
import CallToAction from '../components/CTA';
import SalesProcess from '../components/SalesProcess';
import ProductCategoryPreview from '../components/Product';
import Footer from '../components/Footer';

const Home = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-hidden">
      <HeroSection />
      <AboutUs />
       <CallToAction />
      <SalesProcess />
      <ProductCategoryPreview />
      <Footer />

      {/* Scroll to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-purple-600 shadow-lg hover:bg-purple-700 transition-all duration-100 flex items-center justify-center ${
          showScrollTop ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <ArrowUp className="h-6 w-6 text-white" />
      </button>

      {/* WhatsApp CTA */}
      <a
        href="https://wa.me/918101287339?text=Hello%20Purple%20Bean%2C%20I%27m%20interested%20in%20your%20products."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        title="Chat with us on WhatsApp"
        className="fixed bottom-6 left-6 z-50 w-12 h-12 rounded-full bg-green-500 shadow-lg hover:bg-green-600 transition-all duration-200 flex items-center justify-center"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </a>
    </motion.div>
  );
};

export default Home;
