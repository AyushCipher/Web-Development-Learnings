import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative h-screen flex items-center justify-start px-4 sm:px-8 lg:px-20 py-20 sm:py-32 bg-black text-white">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/factory1.jpg"
          alt="Coffee Factory"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 sm:bg-opacity-70" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl space-y-5 sm:space-y-6">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-5xl font-bold leading-tight"
        >
          Your Global Partner in{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            Coffee & Chicory
          </span>{' '}
          Manufacturing
        </motion.h1>

        {/* Short text for mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="sm:hidden bg-black/60 backdrop-blur-sm p-4 rounded-lg max-w-xl"
        >
          <p className="text-base text-white/90 leading-relaxed">
            Trusted supplier across 20+ countries. Export-ready blends. Competitive pricing.
          </p>
        </motion.div>

        {/* Full text for desktop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="hidden sm:block bg-black/60 backdrop-blur-sm p-5 rounded-lg max-w-xl"
        >
          <p className="text-lg md:text-xl text-white/90 leading-relaxed">
            India’s trusted supplier to importers, wholesalers, and private-label brands in 20+ countries.
            <br />
            Specialists in instant coffee, chicory, and custom blends — with export-ready packaging & pricing.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 pt-2"
        >
          <Link to="/products">
            <button className="bg-white text-primary-700 px-6 py-3 rounded-full font-semibold text-sm sm:text-base hover:bg-gray-100 transition">
              Explore Products
            </button>
          </Link>
          <Link to="/contact">
            <button className="border-2 border-white text-white px-6 py-3 rounded-full font-semibold text-sm sm:text-base hover:bg-white hover:text-primary-700 transition">
              Get in Touch
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
