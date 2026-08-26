import { motion } from 'framer-motion';
import { useMemo } from 'react';

const images = [
  '/factory1.jpg',
  '/factory2.jpg',
  '/factory5.jpg',
  '/factory4.jpg',
];

const VerticalCarousel = () => {
  const doubledImages = useMemo(() => [...images, ...images], []);

  return (
    <div className="overflow-hidden h-[400px] sm:h-[500px] lg:h-[600px] rounded-xl">
      <motion.div
        className="flex flex-col"
        animate={{ y: ['0%', '-50%'] }}
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration: 20,
        }}
      >
        {doubledImages.map((src, i) => (
          <div key={i} className="flex-shrink-0 h-[250px] sm:h-[300px] lg:h-[320px] mb-4">
            <img
              src={src}
              alt={`Factory ${i}`}
              className="w-full h-full object-cover rounded-xl shadow-lg"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const AboutUs = () => {
  const reasons = [
    'State-of-the-art manufacturing facility in India',
    'Specialized in instant coffee, chicory, and custom blends',
    'Bulk exports with full documentation & quality compliance',
    'Trusted by importers, wholesalers & private-label brands globally',
    'Timely delivery & competitive pricing across 20+ countries',
  ];

  return (
    <section
      className="py-24 overflow-hidden bg-gray-50 relative"
      style={{
        backgroundImage: 'url(/leaf-pattern.png)', // Add subtle image (place in /public)
        backgroundSize: 'contain',
        backgroundRepeat: 'repeat',
        backgroundPosition: 'center',
        opacity: 1,
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-center text-gray-800 font-display relative mb-16">
  <span className="relative z-10">About Us</span>
  <span className="absolute left-1/2 -bottom-1 w-32 h-2 bg-yellow-400 rounded-full -translate-x-1/2 z-0" />
</h2>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Vertical carousel */}
          <VerticalCarousel />

          {/* Right: Text */}
         <motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.8 }}
  className="bg-white sm:bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-10 relative overflow-hidden"
>
  {/* Animated background marker */}
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    whileInView={{ scale: 1, opacity: 0.1 }}
    transition={{ duration: 1 }}
    className="absolute -top-5 left-0 w-40 h-40 bg-yellow-400 rotate-12 rounded-full z-0"
  />

  <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 font-display mb-6">
  Why Choose Purple Bean Agro?
  <span className="block w-16 h-1 bg-yellow-400 mt-2 rounded-full" />
</h3>


  <ul className="space-y-6 border-l-4 border-yellow-400 pl-6 relative z-10">
    {[
      'State-of-the-art manufacturing facility in India',
      'Specialized in instant coffee, chicory, and custom blends',
      'Bulk exports with full documentation & quality compliance',
      'Trusted by importers, wholesalers & private-label brands globally',
      'Timely delivery & competitive pricing across 20+ countries',
    ].map((text, index) => (
      <motion.li
        key={index}
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 * index, duration: 0.4 }}
        className="flex items-start gap-3"
      >
        <span className="text-green-500 mt-1 text-lg">✔️</span>
        <p className="text-gray-800 text-base sm:text-lg font-semibold leading-relaxed font-sans">
          {text}
        </p>
      </motion.li>
    ))}
  </ul>
</motion.div>

        </div>
      </div>
    </section>
  );
};

export default AboutUs;
