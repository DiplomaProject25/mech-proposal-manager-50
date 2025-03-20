
import React from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthLayout from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/context/AuthContext';

const Login = () => {
  const { isAuthenticated } = useAuth();

  // Redirect to dashboard if already logged in
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <AuthLayout 
        title="Welcome Back" 
        subtitle="Sign in to your account to continue"
      >
        <LoginForm />
      </AuthLayout>
    </motion.div>
  );
};

export default Login;
