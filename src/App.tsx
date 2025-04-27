
import React, { useEffect, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';

// Import components
import Sidebar from './components/layout/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import NotFound from './pages/NotFound';
import CommercialProposal from './pages/DirectorPages/CommercialProposal';
import OrderDetails from './pages/DirectorPages/OrderDetails';
import Proposals from './pages/DirectorPages/Proposals';
import ConstructorDashboard from './pages/ConstructorPages/ConstructorDashboard';
import EquipmentDetails from './pages/ConstructorPages/EquipmentDetails';
import Equipment from './pages/ConstructorPages/Equipment';
import Workshop from './pages/ConstructorPages/Workshop';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ProductManagement from './pages/DirectorPages/ProductManagement';

// Import framer-motion for page transitions
import { AnimatePresence } from 'framer-motion';

const queryClient = new QueryClient();

// Route Guard component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Загрузка...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Layout component with sidebar
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-[250px]">
        {children}
      </div>
    </div>
  );
};

// Main app component
const AppContent = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <AppLayout>
        <Suspense fallback={<div>Загрузка...</div>}>
          <Routes location={location} key={location.pathname}>
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/orders" element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            } />
            
            <Route path="/orders/:orderId" element={
              <ProtectedRoute>
                <OrderDetails />
              </ProtectedRoute>
            } />
            
            <Route path="/proposals" element={
              <ProtectedRoute>
                <Proposals />
              </ProtectedRoute>
            } />
            
            <Route path="/proposals/create/:orderId" element={
              <ProtectedRoute>
                <CommercialProposal />
              </ProtectedRoute>
            } />
            
            <Route path="/equipment/order/:orderId" element={
              <ProtectedRoute>
                <EquipmentDetails />
              </ProtectedRoute>
            } />
            
            <Route path="/products" element={
              <ProtectedRoute>
                <ProductManagement />
              </ProtectedRoute>
            } />
            
            {/* Routes for Equipment, Workshop, Profile, and Settings */}
            <Route path="/equipment" element={
              <ProtectedRoute>
                <Equipment />
              </ProtectedRoute>
            } />
            
            <Route path="/workshop" element={
              <ProtectedRoute>
                <Workshop />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AppLayout>
    </AnimatePresence>
  );
};

// Main App with providers
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <OrderProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </OrderProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
