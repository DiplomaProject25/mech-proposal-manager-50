
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { isAuthenticated } = useAuth();

  // Redirect based on authentication status
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  } else {
    return <Navigate to="/login" replace />;
  }
};

export default Index;
