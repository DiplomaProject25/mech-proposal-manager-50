
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, User, Calendar } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Order } from '@/context/OrderContext';
import StatusBadge from './StatusBadge';
import { useAuth, UserRole } from '@/context/AuthContext';

interface OrderCardProps {
  order: Order;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleClick = () => {
    if (user?.role === UserRole.DIRECTOR) {
      navigate(`/orders/${order.id}`);
    } else {
      navigate(`/equipment/order/${order.id}`);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card className="h-full overflow-hidden border border-gray-200 bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-300">
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <StatusBadge status={order.status} />
            <span className="text-sm text-gray-500">
              ID: {order.id}
            </span>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {order.clientName}
          </h3>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {order.description}
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-500">
              <User className="h-4 w-4 mr-2" />
              <span>
                {order.responsibleEmployee 
                  ? `Ответственный: ${order.responsibleEmployee}`
                  : 'Ответственный не назначен'}
              </span>
            </div>
            
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-2" />
              <span>
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex items-center text-sm text-gray-500">
              <ClipboardList className="h-4 w-4 mr-2" />
              <span>
                {order.commercialProposal ? 'Есть предложение' : 'Нет предложения'}
              </span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-4 bg-gray-50 border-t border-gray-100">
          <Button
            onClick={handleClick}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            Просмотр деталей
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default OrderCard;
