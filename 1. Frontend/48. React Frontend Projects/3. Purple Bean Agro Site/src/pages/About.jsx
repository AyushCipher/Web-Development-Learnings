import { motion } from 'framer-motion';
import { ArrowUp, MessageCircle, Award, Users, Globe, Leaf, Target, Heart, Shield, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

const About = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
  });

  const values = [
    {
      icon: Leaf,
      title: 'Sustainability',
      description: 'Committed to environmentally responsible practices and sustainable sourcing',
    },
    {
      icon: Shield,
      title: 'Quality Assurance',
      description: 'Rigorous testing and quality control at every step of our process',
    },
    {
      icon: Heart,
      title: 'Customer Care',
      description: 'Building lasting relationships through exceptional service and support',
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'Continuously improving our processes and expanding our product range',
    },
  ];

  const timeline = [
  { image: "/factory1.jpg" },
  { image: "/factory2.jpg" },
  { image: "/factory5.jpg" },
  { image: "/factory4.jpg" },
  { image: "/factory3.jpg" }
];


  const team = [
    {
      name: 'Utsav Jain',
      role: 'Director',
      image: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg',
      bio: 'Strategic leader driving the growth of our B2B coffee business through innovation, strong partnerships, and a deep understanding of global market dynamics.',
    },
    {
      name: 'Mourjo Bosu',
      role: 'Director',
      image: 'https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg',
      bio: 'Operational expert ensuring top-tier quality and regulatory standards across our coffee supply chain, with a strong focus on fulfilling the needs of clients worldwide.',
    },
    // {
    //   name: 'Emily Rodriguez',
    //   role: 'Sales Director',
    //   image: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg',
    //   bio: 'International business development specialist',
    // },
  ];

  const handleScheduleCall = () => {
    const subject = encodeURIComponent('Schedule a Call - Purple Bean Agro');
    const body = encodeURIComponent(
      'Hello,\n\nI would like to schedule a call to discuss your coffee products and services.\n\nBest regards,'
    );
    const mailtoLink = `mailto:purplebeanagro@gmail.com?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
  };


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-16 overflow-x-hidden"
    >
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 py-20 mt-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                About Us
              </h1>
              <p className="text-xl text-white/90 leading-relaxed">
                With years of experience, we've been dedicated to providing the highest quality natural products to businesses worldwide. 
                Our commitment to excellence, sustainability, and customer satisfaction has made us a trusted partner in the natural products industry.
              </p>
            </motion.div>
            
            <motion.img
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              src="https://img.freepik.com/premium-photo/cup-coffee-with-swirl-coffee-top-it_1049408-6990.jpg"
              alt="Our Facility"
              className="w-full max-w-lg rounded-xl object-cover mx-auto"
            />

          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full">
                <Target className="h-8 w-8 text-primary-600" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                To provide premium natural products that enable businesses to create 
                healthier, more sustainable solutions for their customers. We believe 
                in the power of nature and are committed to preserving its integrity 
                while making it accessible to businesses worldwide.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-100 rounded-full">
                <Globe className="h-8 w-8 text-secondary-600" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Our Vision
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                To be the world's most trusted partner in natural products, setting 
                the standard for quality, sustainability, and innovation. We envision 
                a future where natural solutions are the first choice for businesses 
                seeking to improve lives and protect our planet.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These core values guide everything we do and shape our relationships 
              with partners, customers, and the environment.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-100 text-center"
              >
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <value.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}

     <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From humble beginnings to global leadership, here's how we've grown 
              over the years while staying true to our core mission.
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-primary-200"></div>
            
            {timeline.map((item, index) => (
            <motion.div
              key={item.year}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:justify-start' : 'md:justify-end'} mb-12`}
            >
              <div className={`w-full md:w-6/12 max-w-md ${index % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8 md:text-left'} mx-auto md:mx-0`}>
                <div className="rounded-2xl shadow-lg w-full max-w-full overflow-hidden">
                  <img
                    src={item.image}
                    alt={`Timeline event`}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>
              </div>

              <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary-600 rounded-full border-4 border-white shadow-lg"></div>
            </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Team Section */}
      {/*
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Leadership Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Meet the experienced professionals who guide our company's vision 
              and ensure we deliver excellence in everything we do.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-100 overflow-hidden"
              >
                <div className="h-64 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-primary-600 font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {member.bio}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      *}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Join Our Mission
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Whether you're looking for premium natural products or exploring 
              partnership opportunities, we'd love to hear from you.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleScheduleCall}
              className="bg-white text-primary-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors duration-200"
            >
              Get in Touch
            </motion.button>

          </motion.div>
        </div>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-purple-600 shadow-lg hover:bg-purple-700 transition-all duration-100 flex items-center justify-center ${
            showScrollTop ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          >
            <ArrowUp className="h-6 w-6 text-white" />
        </button>

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
        
      </section>
    </motion.div>
  );
};

export default About;