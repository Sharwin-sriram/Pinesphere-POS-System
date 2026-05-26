import { Menu, UtensilsCrossed, X } from "lucide-react";
import React from 'react';
import { motion } from 'framer-motion';

interface NavbarProps {
 isMenuOpen?: boolean;
 toggleMenu?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
 isMenuOpen = false, 
 toggleMenu 
}) => {
 return (
 <motion.nav 
 initial={{ opacity: 0, y: -20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6 }}
 className="fixed top-0 left-0 right-0 z-50 bg-black/20 border-b border-white/10"
 >
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex items-center justify-between h-16">
 {/* Logo */}
 <motion.div 
 whileHover={{ scale: 1.05 }}
 className="flex items-center space-x-3"
 >
 <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
 <UtensilsCrossed className="h-5 w-5 text-[var(--color-accent)]" strokeWidth={1.5} />
 </div>
 <div>
 <h1 className="text-xl font-semibold text-white">PineSphere</h1>
 <p className="text-xs text-orange-400 -mt-1">POS System</p>
 </div>
 </motion.div>

 {/* Desktop Navigation */}
 <div className="hidden md:flex items-center space-x-8">
 <a href="#features" className="text-gray-300 hover:text-white transition-colors">
 Features
 </a>
 <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">
 Pricing
 </a>
 <a href="#support" className="text-gray-300 hover:text-white transition-colors">
 Support
 </a>
 <motion.a 
 href="/login"
 whileHover={{ scale: 1.05 }}
 whileTap={{ scale: 0.95 }}
 className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
 >
 Sign In
 </motion.a>
 </div>

 {/* Mobile Menu Button */}
 <div className="md:hidden">
 <button
 onClick={toggleMenu}
 className="text-gray-300 hover:text-white transition-colors p-2"
 >
 {isMenuOpen ? <X className="h-4 w-4" strokeWidth={1.5} /> : <Menu className="h-4 w-4" strokeWidth={1.5} />}
 </button>
 </div>
 </div>

 {/* Mobile Navigation */}
 {isMenuOpen && (
 <motion.div 
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: 'auto' }}
 exit={{ opacity: 0, height: 0 }}
 className="md:hidden border-t border-white/10 py-4"
 >
 <div className="flex flex-col space-y-4">
 <a href="#features" className="text-gray-300 hover:text-white transition-colors px-4 py-2">
 Features
 </a>
 <a href="#pricing" className="text-gray-300 hover:text-white transition-colors px-4 py-2">
 Pricing
 </a>
 <a href="#support" className="text-gray-300 hover:text-white transition-colors px-4 py-2">
 Support
 </a>
 <a 
 href="/login"
 className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 mx-4"
 >
 Sign In
 </a>
 </div>
 </motion.div>
 )}
 </div>
 </motion.nav>
 );
};

export default Navbar;