import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '../assets/logo1.png';
import { Menu, X, Search } from 'lucide-react';
import { filterItems, products } from '../data.js';

const Navbar = ({ onSearch, searchTerm, onClearSearch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm || '');
  const [searchResults, setSearchResults] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setLocalSearchTerm(searchTerm || '');
  }, [searchTerm]);

  useEffect(() => {
    const results = filterItems(products, localSearchTerm);
    setSearchResults(results);
  }, [localSearchTerm]);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    const results = filterItems(products, value);
    setSearchResults(results);
    if (onSearch) onSearch(value);
    if (value && location.pathname !== '/products') navigate('/products');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (localSearchTerm && location.pathname !== '/products') {
      navigate('/products');
    }
  };

  const handleNavClick = (path) => {
    if (onClearSearch) onClearSearch();
    setLocalSearchTerm('');
    navigate(path);
    setIsOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 shadow border-b border-gray-200 backdrop-blur' : 'bg-white/60 backdrop-blur'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-2">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img src="/logo.png" alt="Logo" className="h-48 w-30 object-contain" />
    
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.path)}
                className={`relative px-1 py-1 text-base font-medium transition duration-200 ${
                  location.pathname === item.path
                    ? 'text-primary-700 underline underline-offset-4'
                    : 'text-gray-700 hover:text-primary-700'
                }`}
              >
                {item.name}
              </button>
            ))}

            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={localSearchTerm}
                onChange={handleSearchChange}
                className="w-64 pl-9 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm bg-white text-gray-900"
              />
            </form>

            {/* CTA */}
            <Link to="/contact">
              <button className="bg-primary-600 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition ml-2">
                Get in Touch
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-primary-700 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden bg-white shadow px-4 pb-4"
        >
          <div className="space-y-3 pt-2">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.path)}
                className={`block w-full text-left text-sm font-medium ${
                  location.pathname === item.path
                    ? 'text-primary-700'
                    : 'text-gray-700 hover:text-primary-700'
                }`}
              >
                {item.name}
              </button>
            ))}

            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative pt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={localSearchTerm}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-primary-500"
              />
            </form>

            {/* CTA */}
            <Link to="/contact">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full bg-primary-600 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 mt-2"
              >
                Get in Touch
              </button>
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
