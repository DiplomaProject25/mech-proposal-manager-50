
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';
import './App.css';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import OrderDetails from './pages/DirectorPages/OrderDetails';
import CommercialProposal from './pages/DirectorPages/CommercialProposal';
import Proposals from './pages/DirectorPages/Proposals';
import ProductManagement from './pages/DirectorPages/ProductManagement';
import ConstructorDashboard from './pages/ConstructorPages/ConstructorDashboard';
import Equipment from './pages/ConstructorPages/Equipment';
import EquipmentDetails from './pages/ConstructorPages/EquipmentDetails';
import Workshop from './pages/ConstructorPages/Workshop';
import AccountantDashboard from './pages/AccountantPages/AccountantDashboard';
import LogisticianDashboard from './pages/LogisticianPages/LogisticianDashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Index from './pages/Index';

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <OrderProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/orders/:orderId" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
            <Route path="/proposals/create/:orderId" element={<ProtectedRoute><CommercialProposal /></ProtectedRoute>} />
            <Route path="/proposals" element={<ProtectedRoute><Proposals /></ProtectedRoute>} />
            <Route path="/product-management" element={<ProtectedRoute><ProductManagement /></ProtectedRoute>} />
            
            {/* Constructor routes */}
            <Route path="/constructor" element={<ProtectedRoute><ConstructorDashboard /></ProtectedRoute>} />
            <Route path="/equipment" element={<ProtectedRoute><Equipment /></ProtectedRoute>} />
            <Route path="/equipment/:equipmentId" element={<ProtectedRoute><EquipmentDetails /></ProtectedRoute>} />
            <Route path="/workshop" element={<ProtectedRoute><Workshop /></ProtectedRoute>} />
            
            {/* Accountant routes */}
            <Route path="/accountant" element={<ProtectedRoute><AccountantDashboard /></ProtectedRoute>} />
            
            {/* Logistician routes */}
            <Route path="/logistics" element={<ProtectedRoute><LogisticianDashboard /></ProtectedRoute>} />
            
            {/* User routes */}
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </OrderProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
