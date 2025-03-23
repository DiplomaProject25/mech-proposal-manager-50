
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench, CheckCircle2, Clock, Hourglass } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useOrders, Order, OrderStatus } from '@/context/OrderContext';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/layout/Header';
import StatusBadge from '@/components/common/StatusBadge';

const Workshop = () => {
  const { filteredOrders, updateOrderStatus } = useOrders();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('in-progress');
  
  // Filter orders by their status and assigned to current user
  const assignedOrders = filteredOrders.filter(order => 
    order.assignedTo === user?.id
  );
  
  const inProgressOrders = assignedOrders.filter(
    order => order.status === OrderStatus.IN_PROGRESS
  );
  
  const assemblyOrders = assignedOrders.filter(
    order => order.status === OrderStatus.ASSEMBLY
  );
  
  const completedOrders = assignedOrders.filter(
    order => order.status === OrderStatus.COMPLETED
  );
  
  const handleCompleteOrder = (orderId: string) => {
    updateOrderStatus(orderId, OrderStatus.COMPLETED);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Workshop" />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold">
                <span className="flex items-center">
                  <Wrench className="mr-2 h-5 w-5" />
                  Workshop Dashboard
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="in-progress" onValueChange={setActiveTab} value={activeTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="in-progress" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>In Progress</span>
                    {inProgressOrders.length > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 px-2">
                        {inProgressOrders.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="assembly" className="flex items-center gap-2">
                    <Hourglass className="h-4 w-4" />
                    <span>Assembly</span>
                    {assemblyOrders.length > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 px-2">
                        {assemblyOrders.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Completed</span>
                    {completedOrders.length > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 px-2">
                        {completedOrders.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="in-progress">
                  {inProgressOrders.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {inProgressOrders.map((order) => (
                        <Card key={order.id} className="overflow-hidden">
                          <CardHeader className="bg-gray-50 pb-2">
                            <div className="flex justify-between items-center">
                              <h3 className="font-medium">Order #{order.id}</h3>
                              <StatusBadge status={order.status} />
                            </div>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <p className="text-sm font-medium mb-1">Client:</p>
                            <p className="text-sm mb-3">{order.clientName}</p>
                            
                            <p className="text-sm font-medium mb-1">Description:</p>
                            <p className="text-sm mb-3">{order.description}</p>
                            
                            <div className="flex justify-end mt-4 space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.location.href = `/equipment/order/${order.id}`}
                              >
                                View Details
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 border rounded-lg border-dashed border-gray-300">
                      <Clock className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-500">No orders in progress</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="assembly">
                  {assemblyOrders.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {assemblyOrders.map((order) => (
                        <Card key={order.id} className="overflow-hidden">
                          <CardHeader className="bg-gray-50 pb-2">
                            <div className="flex justify-between items-center">
                              <h3 className="font-medium">Order #{order.id}</h3>
                              <StatusBadge status={order.status} />
                            </div>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <p className="text-sm font-medium mb-1">Client:</p>
                            <p className="text-sm mb-3">{order.clientName}</p>
                            
                            <p className="text-sm font-medium mb-1">Description:</p>
                            <p className="text-sm mb-3">{order.description}</p>
                            
                            <div className="flex justify-end mt-4 space-x-2">
                              <Button 
                                size="sm"
                                onClick={() => handleCompleteOrder(order.id)}
                                className="bg-green-500 hover:bg-green-600"
                              >
                                <CheckCircle2 className="mr-1 h-4 w-4" />
                                Mark as Completed
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 border rounded-lg border-dashed border-gray-300">
                      <Hourglass className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-500">No orders in assembly</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="completed">
                  {completedOrders.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {completedOrders.map((order) => (
                        <Card key={order.id} className="overflow-hidden">
                          <CardHeader className="bg-gray-50 pb-2">
                            <div className="flex justify-between items-center">
                              <h3 className="font-medium">Order #{order.id}</h3>
                              <StatusBadge status={order.status} />
                            </div>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <p className="text-sm font-medium mb-1">Client:</p>
                            <p className="text-sm mb-3">{order.clientName}</p>
                            
                            <p className="text-sm font-medium mb-1">Description:</p>
                            <p className="text-sm mb-3">{order.description}</p>
                            
                            <p className="text-sm font-medium mb-1">Completed:</p>
                            <p className="text-sm text-gray-500">
                              {new Date(order.updatedAt).toLocaleString()}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 border rounded-lg border-dashed border-gray-300">
                      <CheckCircle2 className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-500">No completed orders</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Workshop;
