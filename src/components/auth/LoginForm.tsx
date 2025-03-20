
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      // Error is already handled in the auth context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-white/50 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="bg-white/50 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </div>
      
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </motion.div>
      
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>
          Demo accounts:
        </p>
        <div className="flex justify-center gap-4 mt-2">
          <button
            type="button"
            onClick={() => {
              setEmail('director@example.com');
              setPassword('password123');
              toast({
                title: "Demo credentials filled",
                description: "You can now sign in as a Director",
              });
            }}
            className="text-blue-600 hover:underline"
          >
            Director
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail('constructor@example.com');
              setPassword('password123');
              toast({
                title: "Demo credentials filled",
                description: "You can now sign in as a Constructor",
              });
            }}
            className="text-blue-600 hover:underline"
          >
            Constructor
          </button>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;
