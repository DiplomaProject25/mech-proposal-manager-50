
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardList, Plus, Package, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useOrders, OrderStatus } from '@/context/OrderContext';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/layout/Header';
import StatusBadge from '@/components/common/StatusBadge';

const ConstructorDashboard = () => {
  const { user } = useAuth();
  const { filteredOrders, updateOrderStatus } = useOrders();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Orders ready for development (not yet assigned)
  const availableOrders = filteredOrders.filter(
    order => order.status === OrderStatus.READY_FOR_DEVELOPMENT && !order.assignedTo
  );
  
  // Orders assigned to the current constructor
  const myOrders = filteredOrders.filter(
    order => order.assignedTo === user?.id
  );
  
  const handleTakeOrder = (orderId: string) => {
    if (!user) return;
    
    updateOrderStatus(orderId, OrderStatus.IN_PROGRESS, user.id);
    
    toast({
      title: 'Order Assigned',
      description: 'This order has been assigned to you and is now in progress',
    });
  };
  
  const handleViewOrderDetails = (orderId: string) => {
    navigate(`/equipment/order/${orderId}`);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Constructor Dashboard" />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ClipboardList className="mr-2 h-5 w-5" />
                Available Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {availableOrders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-2">
                    There are no orders available for development
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableOrders.map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-all duration-300"
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-medium">
                            {order.clientName}
                          </h3>
                          <StatusBadge status={order.status} />
                        </div>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {order.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            Order #{order.id}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handleTakeOrder(order.id)}
                            className="flex items-center"
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            Take Order
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5" />
                My Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {myOrders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-2">
                    You don't have any orders assigned to you
                  </p>
                  <p className="text-sm text-gray-400">
                    Take an order from the available list above
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-3 px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="py-3 px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="py-3 px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="py-3 px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="py-3 px-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {myOrders.map((order) => (
                        <tr 
                          key={order.id} 
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-2 whitespace-nowrap">
                            #{order.id}
                          </td>
                          <td className="py-3 px-2">
                            {order.clientName}
                          </td>
                          <td className="py-3 px-2">
                            <StatusBadge status={order.status} />
                          </td>
                          <td className="py-3 px-2 text-sm text-gray-500">
                            {new Date(order.updatedAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-2 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewOrderDetails(order.id)}
                              className="flex items-center ml-auto"
                            >
                              <FileText className="mr-1 h-3 w-3" />
                              Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default ConstructorDashboard;
