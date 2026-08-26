import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductCategoryPreview = () => {
  const products = [
    {
      name: 'Flavoured Coffee',
      description:
        'Premium flavored instant coffee blends designed for cafes, bulk retail, and foodservice.',
      image:
        'https://t3.ftcdn.net/jpg/12/42/96/54/360_F_1242965459_kpunghVpfVLm1sUCS5kXMrTAY5OsKIBd.jpg',
    },
    {
      name: 'Plain Coffee',
      description:
        'High-quality spray dried, agglomerated, and freeze dried coffee powders for industrial and private label use.',
      image:
        'https://img.freepik.com/free-photo/top-view-coffee-powder-beans_23-2148254984.jpg',
    },
    {
      name: 'Coffee Premix',
      description:
        'Ready-to-drink premixes with sugar and milk solids, ideal for vending, hotels, and quick-serve setups.',
      image:
        'https://img.freepik.com/free-photo/coconut-palm-sugar-wooden-spoon-isolated-white-background_123827-32696.jpg?semt=ais_hybrid&w=740',
    },
  ];

  return (
    <section
      className="py-20 bg-gray-50"
      aria-labelledby="product-preview-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2
            id="product-preview-heading"
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Our Product Categories
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our range of export-ready coffee and chicory products —
            tailored for distributors, importers, and private-label buyers.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition"
            >
              <div className="h-64 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 mb-4">{product.description}</p>
                <Link
                  to="/products"
                  className="text-primary-600 font-semibold hover:text-primary-700 flex items-center space-x-1"
                >
                  <span>Learn More</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/products">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary-700 transition"
            >
              View All Products
            </motion.button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductCategoryPreview;
