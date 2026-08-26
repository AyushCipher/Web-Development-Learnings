import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ArrowUp, MessageCircle, Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import { sendContactEmail } from '../utils/emailService';
import Cal, { getCalApi } from "@calcom/embed-react";

const Contact = () => {

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    (async function () {
      const cal = await getCalApi({"namespace":"30min"});
      cal("ui", {"hideEventTypeDetails":false,"layout":"month_view"});
    })();
  }, [])

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Try to send email automatically
      const result = await sendContactEmail(formData);
      
      if (result.success) {
        setIsSubmitted(true);
        // Reset form after successful submission
        setTimeout(() => {
          setIsSubmitted(false);
          setFormData({
            name: '',
            email: '',
            company: '',
            subject: '',
            message: '',
          });
        }, 3000);
      } else {
        // Fallback to mailto if automatic sending fails
        const subject = encodeURIComponent(`Contact Form Submission - ${formData.subject || 'General Inquiry'}`);
        const body = encodeURIComponent(
          `New contact form submission from Purple Bean Agro website:

Name: ${formData.name}
Email: ${formData.email}
Company: ${formData.company || 'Not provided'}
Subject: ${formData.subject}

Message:
${formData.message}

---
This message was sent from the Purple Bean Agro contact form.`
        );
        
        const mailtoLink = `mailto:ayushv3533e@gmail.com?subject=${subject}&body=${body}`;
        window.location.href = mailtoLink;
        
        setIsSubmitted(true);
        setTimeout(() => {
          setIsSubmitted(false);
          setFormData({
            name: '',
            email: '',
            company: '',
            subject: '',
            message: '',
          });
        }, 3000);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      // Fallback to mailto
      const subject = encodeURIComponent(`Contact Form Submission - ${formData.subject || 'General Inquiry'}`);
      const body = encodeURIComponent(
        `New contact form submission from Purple Bean Agro website:

Name: ${formData.name}
Email: ${formData.email}
Company: ${formData.company || 'Not provided'}
Subject: ${formData.subject}

Message:
${formData.message}

---
This message was sent from the Purple Bean Agro contact form.`
      );
      
      const mailtoLink = `mailto:ayushv3533e@gmail.com?subject=${subject}&body=${body}`;
      window.location.href = mailtoLink;
    }
    
    setIsSubmitting(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  
  const handleDownloadCatalogue = () => {
    const link = document.createElement('a');
    link.href = '/catalogue.pdf'; 
    link.download = 'Purple-Bean-Agro-Catalogue.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const handleScheduleCall = () => {
    const subject = encodeURIComponent('Schedule a Call - Purple Bean Agro');
    const body = encodeURIComponent(
      'Hello,\n\nI would like to schedule a call to discuss your coffee products and services at your convenience.\n\nBest regards,'
    );
    const mailtoLink = `mailto:purplebeanagro@gmail.com?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
  };

  const handleScheduleCallOne = () => {
    window.open("https://cal.com/purple-bean-agro-industries-pvt-ltd-wnsgkh/30min", "_blank");
  };


  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      details: ['+91-8101287339', '+91-81649460527'],
      description: 'Mon-Sun from 10am to 10pm IST',
    },
    {
      icon: Mail,
      title: 'Email',
      details: ['Purplebeanagro@gmail.com', 'Calistofoodx@gmail.com'],
      description: 'We respond within 24 hours',
    },
    {
      icon: MapPin,
      title: 'Office',
      details: ['PBAI Pvt. Ltd, Factory No. 12/4', 'Near Dapodi Metro Station, Dapodi,', ' Pimpri-Chinchwad,', 'Pune, Maharashtra 411012'],
      description: 'Visit us during business hours',
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: ['Monday - Sunday: 10:00am - 10:00pm'],
      description: 'Indian Standard Time',
    },
  ];

  const offices = [
    {
      city: 'Pune',
      address: ['PBAI Pvt. Ltd, Factory No. 12/4,', ' Near Dapodi Metro Station,', ' Pune, Maharashtra 411012.'],
      phone: '+91-8101287339',
      email: 'Purplebeanagro@gmail.com',
    },
    // {
    //   city: 'Delhi',
    //   address: '456 Commerce Plaza, New Delhi, Delhi 110001',
    //   phone: '+91-9876543211',
    //   email: 'delhi@purplebeanagro.com',
    // },
    // {
    //   city: 'Bangalore',
    //   address: '789 Tech Park, Bangalore, Karnataka 560001',
    //   phone: '+91-9876543212',
    //   email: 'bangalore@purplebeanagro.com',
    // },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-16">

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 py-20 text-center mt-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-6xl font-bold text-white mb-6">
            Contact Us
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl text-white/90 max-w-3xl mx-auto">
            Ready to start your journey with premium coffee products? Get in touch with our team and let's discuss how we can help your business grow.
          </motion.p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Send us a Message</h2>
            <p className="text-lg text-gray-600 mb-8">Fill out the form below and we'll get back to you within 24 hours.</p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input type="text" id="name" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="Your full name" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="name123@gmail.com" />
                </div>
              </div>
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <input type="text" id="company" name="company" value={formData.company} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="Your company name" />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                <select id="subject" name="subject" required value={formData.subject} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option value="">Select a subject</option>
                  <option value="product-inquiry">Product Inquiry</option>
                  <option value="bulk-order">Bulk Order</option>
                  <option value="partnership">Partnership</option>
                  <option value="custom-formulation">Custom Formulation</option>
                  <option value="general">General Question</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                <textarea id="message" name="message" required rows={6} value={formData.message} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none" placeholder="Tell us about your requirements..." />
              </div>
              <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={isSubmitted || isSubmitting} className={`w-full py-4 rounded-full font-semibold text-lg flex items-center justify-center space-x-2 transition-all duration-200 ${isSubmitted ? 'bg-green-600 text-white' : isSubmitting ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-primary-600 text-white hover:bg-primary-700'}`}>
                {isSubmitted ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Message Sent!</span>
                  </>
                ) : isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Send Message</span>
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Get in Touch</h2>
            {contactInfo.map((info, index) => (
              <motion.div key={info.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + index * 0.1 }} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-100">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-100 p-3 rounded-full flex-shrink-0">
                    <info.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{info.title}</h3>
                    {info.details.map((detail, i) => (
                      <p key={i} className="text-gray-600 font-medium">{detail}</p>
                    ))}
                    <p className="text-gray-500 text-sm mt-2">{info.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Office Locations */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Locations</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">We have offices across major cities to serve you better. Visit us or reach out to your nearest location.</p>
          </motion.div>
          <div className="flex justify-center flex-wrap gap-8">
            {offices.map((office, index) => (
              <motion.div key={office.city} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} whileHover={{ y: -10 }} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{office.city}</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3"><MapPin className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" /><span className="text-gray-600">{office.address}</span></div>
                  <div className="flex items-center space-x-3"><Phone className="h-5 w-5 text-primary-600 flex-shrink-0" /><span className="text-gray-600">{office.phone}</span></div>
                  <div className="flex items-center space-x-3"><Mail className="h-5 w-5 text-primary-600 flex-shrink-0" /><span className="text-gray-600">{office.email}</span></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">Join hundreds of businesses who trust us for their coffee product needs. Let's create something amazing together.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={handleScheduleCall}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-primary-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors duration-200"
              >
                Schedule Email
              </motion.button>
              <motion.button
                onClick={handleScheduleCallOne}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-primary-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100"
              >
                Schedule Call
              </motion.button>

              <motion.button
                onClick={handleDownloadCatalogue}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-primary-700 transition-all duration-200"
              >
                Download Catalog
              </motion.button>
            </div>
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

export default Contact;