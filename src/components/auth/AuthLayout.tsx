
import React from 'react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-md shadow-lg rounded-2xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className="text-3xl font-semibold text-gray-800 mb-2">{title}</h1>
              {subtitle && <p className="text-gray-500">{subtitle}</p>}
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {children}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
