import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, CheckCircle, ShoppingCart, Download } from 'lucide-react';

const ProductModal = ({ product, isOpen, onClose }) => {
  if (!product) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
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
      'Hello,\n\nI would like to schedule a call to discuss your coffee products and services.\n\nBest regards,'
    );
    const mailtoLink = `mailto:purplebeanagro@gmail.com?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Image */}
            <div className="relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors duration-200"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>

              <div className="h-80 overflow-hidden rounded-t-2xl">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {product.isNew && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  NEW
                </div>
              )}
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-primary-600 font-medium bg-primary-50 px-3 py-1 rounded-full">
                      {product.category}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-lg font-semibold text-gray-700">
                        {product.rating}
                      </span>
                    </div>
                  </div>

                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {product.name}
                  </h2>

                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    {product.description}
                  </p>

                  {product.detailedDescription && (
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        Product Details
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {product.detailedDescription}
                      </p>
                    </div>
                  )}

                  {/* Key Features */}
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Key Features
                    </h3>
                    <div className="space-y-3">
                      {product.features.map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center space-x-3"
                        >
                          <CheckCircle className="h-5 w-5 text-primary-600 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                    <h3 className="text-2xl font-bold text-purple-500 mb-2">
                      {product.price}
                    </h3>
                    <p className="text-gray-600 mb-4">Bulk pricing available</p>

                    <div className="space-y-3">
                      <motion.button
                        onClick={handleScheduleCall}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-primary-600 text-white py-3 rounded-full font-semibold hover:bg-primary-700 transition-colors duration-100 flex items-center justify-center space-x-2"
                      >
                        <ShoppingCart className="h-5 w-5" />
                        <span>Request Quote</span>
                      </motion.button>

                      <motion.button
                        onClick={handleDownloadCatalogue}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full border-2 border-primary-600 text-primary-600 py-3 rounded-full font-semibold hover:bg-primary-50 transition-colors duration-100 flex items-center justify-center space-x-2"
                      >
                        <Download className="h-5 w-5" />
                        <span>Download Specs</span>
                      </motion.button>
                    </div>
                  </div>

                  {/* Specifications */}
                  {product.specifications && (
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        Specifications
                      </h3>
                      <div className="space-y-3">
                        {Object.entries(product.specifications).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex flex-col sm:flex-row sm:justify-between sm:items-start py-2 border-b border-gray-100 last:border-b-0"
                          >
                            <span className="text-gray-600 font-medium mb-1 sm:mb-0 sm:min-w-[120px]">
                              {key}:
                            </span>

                            {/* Special handling for Variant field */}
                            {key.toLowerCase() === 'variant' && typeof value === 'string' ? (
                              <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
                                {value.split(',').map((variant, i) => (
                                  <span
                                    key={i}
                                    className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium"
                                  >
                                    {variant.trim()}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-900 text-right">{value}</span>
                            )}
                          </div>
                        ))}
                      </div>

                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductModal;
