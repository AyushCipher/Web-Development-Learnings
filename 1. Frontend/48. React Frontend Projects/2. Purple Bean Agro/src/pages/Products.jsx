import { motion } from 'framer-motion';
import { useState,useEffect } from 'react';
import { ArrowRight, Star, CheckCircle, ChevronDown, ChevronRight } from 'lucide-react';
import ProductModal from '../components/ProductModal';
import { products, categoryStructure, categories } from '../data';
import { ArrowUp, MessageCircle, Loader2 } from 'lucide-react';



const Products = ({ searchTerm = '' }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedSubSubcategory, setSelectedSubSubcategory] = useState('');
  const [expandedCategory, setExpandedCategory] = useState('');
  const [expandedSubcategory, setExpandedSubcategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [selectedCategory, selectedSubcategory, selectedSubSubcategory, searchTerm]);

  
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredProducts = products.filter((product) => {
  const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;

  let matchesSubcategory = true;
  let matchesSubSubcategory = true;

  const selectedStructure = categoryStructure[selectedCategory];

  if (selectedSubcategory) {
  if (
    typeof selectedStructure === 'object' &&
    !Array.isArray(selectedStructure)
  ) {
    matchesSubcategory = product.subcategory === selectedSubcategory;
  } else if (Array.isArray(selectedStructure)) {
    // For categories like 'Plain Coffee' or 'Crystal Coffee'
    matchesSubcategory = product.subcategory === selectedSubcategory;
  }
} 


  if (
    selectedSubSubcategory &&
    selectedStructure &&
    typeof selectedStructure[selectedSubcategory] === 'object' &&
    Array.isArray(selectedStructure[selectedSubcategory])
  ) {
    matchesSubSubcategory = product.subSubcategory === selectedSubSubcategory;
  }

  const matchesSearch =
    !searchTerm ||
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.subcategory &&
      product.subcategory.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    matchesCategory &&
    matchesSubcategory &&
    matchesSubSubcategory &&
    matchesSearch
  );
});



  const handleCategoryClick = (category) => {
    const subcategories = categoryStructure[category];

    if (Array.isArray(subcategories) && subcategories.length > 0) {
      setExpandedCategory(expandedCategory === category ? '' : category);
      setSelectedCategory(category);
      setSelectedSubcategory('');
      setSelectedSubSubcategory('');
    } else if (typeof subcategories === 'object' && Object.keys(subcategories).length > 0) {
      setExpandedCategory(expandedCategory === category ? '' : category);
      setSelectedCategory(category);
      setSelectedSubcategory('');
      setSelectedSubSubcategory('');
      setExpandedSubcategory('');
    } else {
      setSelectedCategory(category);
      setSelectedSubcategory('');
      setSelectedSubSubcategory('');
      setExpandedCategory('');
      setExpandedSubcategory('');
    }
  };

  const handleSubcategoryClick = (subcategory) => {
    const subSubcategories = categoryStructure[selectedCategory][subcategory];

    if (Array.isArray(subSubcategories) && subSubcategories.length > 0) {
      setExpandedSubcategory(expandedSubcategory === subcategory ? '' : subcategory);
      setSelectedSubcategory(subcategory);
      setSelectedSubSubcategory('');
    } else {
      setSelectedSubcategory(subcategory);
      setSelectedSubSubcategory('');
      setExpandedSubcategory('');
      setExpandedCategory(''); // ✅ closes main dropdown
    }

  };

  const handleSubSubcategoryClick = (subSubcategory) => {
    setSelectedSubSubcategory(subSubcategory);
    setExpandedCategory(''); // ✅ ensure dropdown closes
    setExpandedSubcategory('');
  };


  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleScheduleCall = () => {
    const subject = encodeURIComponent('Schedule a Call - Purple Bean Agro');
    const body = encodeURIComponent(
      'Hello,\n\nI would like to schedule a call to discuss your coffee products and services.\n\nBest regards,'
    );
    window.location.href = `mailto:purplebeanagro@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 py-20 mt-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold text-white mb-6"
          >
            Our Products
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/90 max-w-3xl mx-auto"
          >
            Discover our comprehensive range of premium coffee products, 
            which are processed with the highest quality standards.
          </motion.p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start justify-between">
            {/* Categories Navigation */}
            <div className="flex-1">
              <div className="flex flex-wrap gap-3">
                {/* All Categories Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedSubcategory('');
                    setSelectedSubSubcategory('');
                    setExpandedCategory('');
                    setExpandedSubcategory('');
                  }}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-100 ${
                    selectedCategory === 'All'
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Products
                </motion.button>

                {/* Category Buttons with Dropdowns */}
                {categories.map((category) => {
                  const subcategories = categoryStructure[category];
                  const hasSubcategories = (Array.isArray(subcategories) && subcategories.length > 0) || 
                                         (typeof subcategories === 'object' && Object.keys(subcategories).length > 0);
                  
                  return (
                    <div key={category} className="relative">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCategoryClick(category)}
                        className={`px-6 py-2 rounded-full font-medium transition-all duration-100 flex items-center gap-2 ${
                          selectedCategory === category
                            ? 'bg-primary-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <span>{category}</span>
                        {hasSubcategories && (
                          <ChevronDown 
                            className={`h-4 w-4 transition-transform duration-100 ${
                              expandedCategory === category ? 'rotate-180' : ''
                            }`} 
                          />
                        )}
                      </motion.button>

                      {/* Vertical Dropdown for Subcategories */}
                      {expandedCategory === category && hasSubcategories && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 min-w-48 z-50 overflow-hidden"
                        >
                          <div className="py-2">
                            {Array.isArray(subcategories) ? (
                              // Simple array of subcategories
                              subcategories.map((subcategory) => (
                                <motion.button
                                  key={subcategory}
                                  whileHover={{ backgroundColor: '#f3f4f6' }}
                                  onClick={() => {
                                    setSelectedSubcategory(subcategory);
                                    setSelectedSubSubcategory('');
                                    setExpandedCategory('');
                                  }}
                                  className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-100 flex items-center justify-between ${
                                    selectedSubcategory === subcategory
                                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                                      : 'text-gray-700 hover:text-primary-600'
                                  }`}
                                >
                                  <span>{subcategory}</span>
                                  {selectedSubcategory === subcategory && (
                                    <CheckCircle className="h-4 w-4 text-primary-600" />
                                  )}
                                </motion.button>
                              ))
                            ) : (
                              // Nested object with sub-subcategories
                              Object.keys(subcategories).map((subcategory) => {
                                const subSubcategories = subcategories[subcategory];
                                const hasSubSubcategories = Array.isArray(subSubcategories) && subSubcategories.length > 0;
                                
                                return (
                                  <div key={subcategory} className="relative">
                                    <motion.button
                                      whileHover={{ backgroundColor: '#f3f4f6' }}
                                      onClick={() => handleSubcategoryClick(subcategory)}
                                      className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-100 flex items-center justify-between ${
                                        selectedSubcategory === subcategory
                                          ? 'bg-primary-50 text-primary-700'
                                          : 'text-gray-700 hover:text-primary-600'
                                      }`}
                                    >
                                      <span>{subcategory}</span>
                                      <div className="flex items-center gap-1">
                                        {selectedSubcategory === subcategory && !hasSubSubcategories && (
                                          <CheckCircle className="h-4 w-4 text-primary-600" />
                                        )}
                                        {hasSubSubcategories && (
                                          <ChevronRight 
                                            className={`h-4 w-4 transition-transform ${
                                              expandedSubcategory === subcategory ? 'rotate-90' : ''
                                            }`} 
                                          />
                                        )}
                                      </div>
                                    </motion.button>
                                    
                                    {/* Sub-subcategories dropdown */}
                                    {expandedSubcategory === subcategory && hasSubSubcategories && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-gray-50 border-t border-gray-200"
                                      >
                                        {subSubcategories.map((subSubcategory) => (
                                          <motion.button
                                            key={subSubcategory}
                                            whileHover={{ backgroundColor: '#e5e7eb' }}
                                            onClick={() => {
                                              handleSubSubcategoryClick(subSubcategory);
                                              setExpandedCategory('');
                                            }}
                                            className={`w-full text-left px-8 py-2 text-xs font-medium transition-all duration-100 flex items-center justify-between ${
                                              selectedSubSubcategory === subSubcategory
                                                ? 'bg-primary-100 text-primary-800'
                                                : 'text-gray-600 hover:text-primary-600'
                                            }`}
                                          >
                                            <span>{subSubcategory}</span>
                                            {selectedSubSubcategory === subSubcategory && (
                                              <CheckCircle className="h-3 w-3 text-primary-600" />
                                            )}
                                          </motion.button>
                                        ))}
                                      </motion.div>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Selected Filters Display */}
              {(selectedCategory !== 'All' || selectedSubcategory || selectedSubSubcategory || searchTerm) && (
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-600">Active filters:</span>
                  {selectedCategory !== 'All' && (
                    <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                      {selectedCategory}
                    </span>
                  )}
                  {selectedSubcategory && (
                    <span className="bg-primary-200 text-primary-900 px-3 py-1 rounded-full text-sm font-medium">
                      {selectedSubcategory}
                    </span>
                  )}
                  {selectedSubSubcategory && (
                    <span className="bg-primary-300 text-primary-900 px-3 py-1 rounded-full text-sm font-medium">
                      {selectedSubSubcategory}
                    </span>
                  )}
                  {searchTerm && (
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      Search: "{searchTerm}"
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setSelectedSubcategory('');
                      setSelectedSubSubcategory('');
                      setExpandedCategory('');
                      setExpandedSubcategory('');
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin h-10 w-10 text-primary-600" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search terms or filters
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-100 overflow-hidden cursor-pointer"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-100"
                    />
                    {product.isNew && (
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                        NEW
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-primary-600 font-medium">
                        {product.category}
                        {product.subcategory && (
                          <span className="text-gray-500"> - {product.subcategory}</span>
                        )}
                        {product.subSubcategory && (
                          <span className="text-gray-400"> - {product.subSubcategory}</span>
                        )}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">{product.rating}</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {product.name}
                    </h3>

                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      {product.features.slice(0, 2).map((feature) => (
                        <div key={feature} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-primary-600" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-purple-500">
                        {product.price}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-primary-600 text-white px-6 py-2 rounded-full font-medium hover:bg-primary-700 transition-colors duration-100 flex items-center space-x-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductClick(product);
                        }}
                      >
                        <span>View Details</span>
                        <ArrowRight className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Can't Find What You're Looking For?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              We offer custom formulations and private labeling services. 
              Let us know your specific requirements and we'll create the perfect solution.
            </p>
            <motion.button
              onClick={handleScheduleCall}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary-700 transition-colors duration-100"
            >
              Request Custom Order
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

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={closeModal}
        onRequestQuote={handleScheduleCall}
      />
    </motion.div>
  );
};

export default Products;