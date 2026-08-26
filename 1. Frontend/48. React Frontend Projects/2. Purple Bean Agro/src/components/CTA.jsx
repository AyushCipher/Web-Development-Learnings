import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const CallToAction = () => {
  const handleScheduleEmail = () => {
    const subject = encodeURIComponent('Schedule a Call - Purple Bean Agro');
    const body = encodeURIComponent(
      'Hello,\n\nI would like to schedule a call to discuss your coffee products and services at your convenience.\n\nBest regards,'
    );
    const mailtoLink = `mailto:purplebeanagro@gmail.com?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
  };

  const handleDownloadCatalogue = () => {
    const link = document.createElement('a');
    link.href = '/catalogue.pdf';
    link.download = 'Purple-Bean-Agro-Catalogue.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: '30min' });
      cal('ui', {
        hideEventTypeDetails: false,
        layout: 'month_view',
      });
    })();
  }, []);

  return (
    <section className="relative h-[500px] sm:h-[600px] flex items-center justify-center text-white overflow-hidden">
      {/* Video Background (optional) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/cta-bg.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-10"></div>

      {/* CTA Content */}
      <div className="relative z-20 text-center px-4 sm:px-6 max-w-3xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-5xl font-bold mb-6"
        >
          Ready to Partner With Us?
        </motion.h2>

        <p className="text-lg sm:text-xl text-white/90 mb-8">
          Trusted by buyers worldwide for our quality, reliability, and service.
          Let’s discuss how Purple Bean can power your supply chain.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            onClick={handleScheduleEmail}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-primary-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors duration-200"
          >
            Schedule Email
          </motion.button>

          <Link to="/contact">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-primary-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100"
            >
              Contact Us
            </motion.button>
          </Link>

          <motion.button
            onClick={handleDownloadCatalogue}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-primary-700 transition-all duration-200"
          >
            Download Catalog
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
