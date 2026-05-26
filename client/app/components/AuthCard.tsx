import React from 'react';
import { motion } from 'framer-motion';
import { MdRestaurant } from 'react-icons/md';

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showLogo?: boolean;
}

const AuthCard: React.FC<AuthCardProps> = ({
  children,
  title,
  subtitle,
  showLogo = true
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating Particles */}
      <div className="particle particle-1"></div>
      <div className="particle particle-2"></div>
      <div className="particle particle-3"></div>
      <div className="particle particle-4"></div>
      <div className="particle particle-5"></div>
      <div className="particle particle-6"></div>

      {/* Background Pattern */}
      <div className="absolute inset-0 bg-pattern-light"></div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo Section */}
        {showLogo && (
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4 floating shadow-lg"
            >
              <MdRestaurant className="text-2xl text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold gradient-text-light"
            >
              PineSphere POS
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-blue-600 text-sm font-medium"
            >
              Restaurant Management System
            </motion.p>
          </div>
        )}

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-3xl p-8 shadow-2xl floating-slow"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-2xl font-bold text-slate-800 mb-2"
            >
              {title}
            </motion.h2>
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-slate-600"
              >
                {subtitle}
              </motion.p>
            )}
          </div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {children}
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            <p className="text-slate-500 text-sm">
              Need help? Contact{' '}
              <a href="mailto:support@pinesphere.com" className="text-blue-500 hover:text-blue-600 transition-colors">
                support@pinesphere.com
              </a>
            </p>
          </motion.div>
        </motion.div>

        {/* Bottom Branding */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-6"
        >
          <p className="text-slate-400 text-xs">
            Powered by PineSphere Technologies
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AuthCard;