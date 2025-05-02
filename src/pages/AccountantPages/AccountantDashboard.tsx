
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Truck, Package, Calendar, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useOrders, OrderStatus } from '@/context/OrderContext';
import Header from '@/components/layout/Header';
import StatusBadge from '@/components/common/StatusBadge';
import { useToast } from '@/components/ui/use-toast';

const AccountantDashboard = () => {
  const { getOrdersByStatus, updateOrderStatus, getNeededPurchaseItems } = useOrders();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'orders' | 'parts'>('orders');

  const purchaseOrders = getOrdersByStatus([
    OrderStatus.NEED_PURCHASING, 
    OrderStatus.PURCHASING,
    OrderStatus.IN_DELIVERY,
    OrderStatus.UNLOADING
  ]);

  const neededItems = getNeededPurchaseItems();

  const updateOrderStatusHandler = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    
    const statusMessages = {
      [OrderStatus.PURCHASING]: 'Заказ переведен в статус "Закупка"',
      [OrderStatus.IN_DELIVERY]: 'Заказ переведен в статус "В пути"',
      [OrderStatus.UNLOADING]: 'Заказ переведен в статус "Разгрузка"',
      [OrderStatus.READY_FOR_DEVELOPMENT]: 'Заказ переведен в статус "Готов к разработке"'
    };
    
    toast({
      title: 'Статус обновлен',
      description: statusMessages[newStatus] || 'Статус заказа успешно обновлен'
    });
  };

  const getStatusTransitions = (currentStatus: OrderStatus) => {
    const transitions: { label: string; status: OrderStatus; icon: React.FC }[] = [];
    
    switch (currentStatus) {
      case OrderStatus.NEED_PURCHASING:
        transitions.push({ 
          label: 'Начать закупку', 
          status: OrderStatus.PURCHASING,
          icon: ShoppingCart
        });
        break;
      case OrderStatus.PURCHASING:
        transitions.push({ 
          label: 'В пути', 
          status: OrderStatus.IN_DELIVERY, 
          icon: Truck 
        });
        break;
      case OrderStatus.IN_DELIVERY:
        transitions.push({ 
          label: 'Разгрузка', 
          status: OrderStatus.UNLOADING, 
          icon: Package 
        });
        break;
      case OrderStatus.UNLOADING:
        transitions.push({ 
          label: 'Завершить закупку', 
          status: OrderStatus.READY_FOR_DEVELOPMENT, 
          icon: ArrowRight 
        });
        break;
    }
    
    return transitions;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Панель бухгалтера" />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex space-x-4">
          <Button
            variant={activeTab === 'orders' ? 'default' : 'outline'}
            onClick={() => setActiveTab('orders')}
          >
            Заказы на закупку
          </Button>
          <Button
            variant={activeTab === 'parts' ? 'default' : 'outline'}
            onClick={() => setActiveTab('parts')}
          >
            Необходимые запчасти
          </Button>
        </div>
        
        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 gap-6"
          >
            <h2 className="text-2xl font-bold mb-4">Заказы, требующие закупки</h2>
            
            {purchaseOrders.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <p className="text-gray-500">На данный момент нет заказов, требующих закупки</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              purchaseOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-gray-50 border-b">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">
                          Заказ #{order.id}
                        </CardTitle>
                        <StatusBadge status={order.status} />
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-4">
                      <div className="mb-4">
                        <p className="font-medium">{order.clientName}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          <Calendar className="inline-block h-4 w-4 mr-1" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      {order.commercialProposal && (
                        <div className="mt-4 border-t pt-4">
                          <h4 className="font-medium mb-2">Требуемые запчасти:</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b">
                                  <th className="py-2 px-2 text-left">Наименование</th>
                                  <th className="py-2 px-2 text-left">Артикул</th>
                                  <th className="py-2 px-2 text-right">Требуется</th>
                                </tr>
                              </thead>
                              <tbody>
                                {order.commercialProposal.equipment.map((item) => (
                                  <tr key={item.id} className="border-b border-gray-100">
                                    <td className="py-2 px-2">{item.name}</td>
                                    <td className="py-2 px-2 font-mono">{item.articleNumber}</td>
                                    <td className="py-2 px-2 text-right">{item.quantity}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-4 flex justify-end space-x-3">
                        {getStatusTransitions(order.status).map((transition, idx) => (
                          <Button
                            key={idx}
                            onClick={() => updateOrderStatusHandler(order.id, transition.status)}
                            className="flex items-center"
                          >
                            <transition.icon className="mr-2 h-4 w-4" />
                            {transition.label}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
        
        {activeTab === 'parts' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-4">Необходимые запчасти</h2>
            
            {neededItems.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <p className="text-gray-500">На данный момент все необходимые запчасти в наличии</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Наименование
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Артикул
                          </th>
                          <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            В наличии
                          </th>
                          <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Требуется докупить
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Расположение
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {neededItems.map((item) => (
                          <tr key={item.part.id} className="border-b border-gray-100">
                            <td className="py-3 px-4">
                              {item.part.name}
                            </td>
                            <td className="py-3 px-4 font-mono text-sm">
                              {item.part.articleNumber}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {item.part.availableQuantity}
                            </td>
                            <td className="py-3 px-4 text-center font-medium text-red-600">
                              {item.neededQuantity}
                            </td>
                            <td className="py-3 px-4 text-sm">
                              {item.part.location}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default AccountantDashboard;
