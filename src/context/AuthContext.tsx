
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// Define the user roles
export enum UserRole {
  DIRECTOR = 'director',
  CONSTRUCTOR = 'constructor',
  ACCOUNTANT = 'accountant',
  LOGISTICIAN = 'logistician'
}

// Define the user interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Define the auth context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isDirector: boolean;
  isConstructor: boolean;
  isAccountant: boolean;
  isLogistician: boolean;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo purposes
const MOCK_USERS = [
  {
    id: '1',
    name: 'Director User',
    email: 'director@example.com',
    password: 'password123',
    role: UserRole.DIRECTOR
  },
  {
    id: '2',
    name: 'Constructor User',
    email: 'constructor@example.com',
    password: 'password123',
    role: UserRole.CONSTRUCTOR
  },
  {
    id: '3',
    name: 'Accountant User',
    email: 'accountant@example.com',
    password: 'password123',
    role: UserRole.ACCOUNTANT
  },
  {
    id: '4',
    name: 'Logistician User',
    email: 'logistician@example.com',
    password: 'password123',
    role: UserRole.LOGISTICIAN
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check for saved login on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Mock login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const foundUser = MOCK_USERS.find(
        u => u.email === email && u.password === password
      );
      
      if (!foundUser) {
        throw new Error('Invalid email or password');
      }
      
      // Remove password from user object
      const { password: _, ...userWithoutPassword } = foundUser;
      
      // Save user in state and localStorage
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      toast({
        title: 'Welcome back!',
        description: `Logged in as ${userWithoutPassword.name}`,
      });
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out',
    });
  };

  // Check if user is authenticated
  const isAuthenticated = !!user;
  
  // Role-based checks
  const isDirector = user?.role === UserRole.DIRECTOR;
  const isConstructor = user?.role === UserRole.CONSTRUCTOR;
  const isAccountant = user?.role === UserRole.ACCOUNTANT;
  const isLogistician = user?.role === UserRole.LOGISTICIAN;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated,
        isDirector,
        isConstructor,
        isAccountant,
        isLogistician,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
