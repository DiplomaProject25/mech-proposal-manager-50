import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Truck, ShoppingCart, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useOrders, OrderStatus, EquipmentPart } from '@/context/OrderContext';
import Header from '@/components/layout/Header';
import { Badge } from '@/components/ui/badge';

const LogisticianDashboard = () => {
  const { getOrdersByStatus, getNeededPurchaseItems, updateOrderStatus } = useOrders();
  const { toast } = useToast();
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  
  // Get orders that need purchasing
  const ordersNeedingPurchase = getOrdersByStatus([
    OrderStatus.NEED_PURCHASING, 
    OrderStatus.PURCHASING, 
    OrderStatus.IN_DELIVERY, 
    OrderStatus.UNLOADING
  ]);
  
  // Get parts that need to be purchased
  const neededPurchaseItems = getNeededPurchaseItems();
  
  const filteredOrders = filter === 'all' ? ordersNeedingPurchase : 
    ordersNeedingPurchase.filter(order => order.status === filter);
  
  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    
    toast({
      title: 'Статус обновлен',
      description: `Заказ переведен в статус: ${newStatus}`,
    });
  };
  
  const nextStatusMap: Record<string, OrderStatus> = {
    [OrderStatus.NEED_PURCHASING]: OrderStatus.PURCHASING,
    [OrderStatus.PURCHASING]: OrderStatus.IN_DELIVERY,
    [OrderStatus.IN_DELIVERY]: OrderStatus.UNLOADING,
    [OrderStatus.UNLOADING]: OrderStatus.READY_FOR_DEVELOPMENT,
    [OrderStatus.READY_FOR_DEVELOPMENT]: OrderStatus.READY_FOR_DEVELOPMENT,
    // Add other statuses for type safety
    [OrderStatus.NEW]: OrderStatus.NEW,
    [OrderStatus.PROPOSAL_CREATED]: OrderStatus.PROPOSAL_CREATED,
    [OrderStatus.REJECTED]: OrderStatus.REJECTED,
    [OrderStatus.IN_PROGRESS]: OrderStatus.IN_PROGRESS,
    [OrderStatus.ASSEMBLY]: OrderStatus.ASSEMBLY,
    [OrderStatus.COMPLETED]: OrderStatus.COMPLETED,
    [OrderStatus.PENDING]: OrderStatus.PENDING,
    [OrderStatus.IN_TRANSIT]: OrderStatus.IN_TRANSIT
  };
  
  const getNextButtonText = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.NEED_PURCHASING:
        return 'Начать закупку';
      case OrderStatus.PURCHASING:
        return 'Отметить в пути';
      case OrderStatus.IN_DELIVERY:
        return 'Начать разгрузку';
      case OrderStatus.UNLOADING:
        return 'Завершить и передать';
      default:
        return 'Следующий этап';
    }
  };
  
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.NEED_PURCHASING:
        return <ShoppingCart className="h-5 w-5 text-amber-500" />;
      case OrderStatus.PURCHASING:
        return <ShoppingCart className="h-5 w-5 text-blue-500" />;
      case OrderStatus.IN_DELIVERY:
        return <Truck className="h-5 w-5 text-purple-500" />;
      case OrderStatus.UNLOADING:
        return <Truck className="h-5 w-5 text-indigo-500" />;
      case OrderStatus.READY_FOR_DEVELOPMENT:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Панель логиста" />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Сводка деталей к закупке</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {neededPurchaseItems.length > 0 ? (
              neededPurchaseItems.map(({ part, neededQuantity }) => (
                <Card key={part.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-start justify-between">
                      <span>{part.name}</span>
                      <Badge variant="outline" className="ml-2">
                        Требуется: {neededQuantity} шт.
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Артикул:</span>
                        <span className="font-mono">{part.articleNumber}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">В наличии:</span>
                        <span>{part.availableQuantity} шт.</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Цена за единицу:</span>
                        <span>${part.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                <Card>
                  <CardContent className="py-6">
                    <div className="text-center">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                      <h3 className="text-xl font-semibold mb-2">Нет деталей для закупки</h3>
                      <p className="text-gray-500">
                        В данный момент нет деталей, которые требуют закупки.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Заказы, требующие логистики</h2>
            
            <div className="w-64">
              <Select value={filter} onValueChange={(value) => setFilter(value as OrderStatus | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Фильтр по статусу" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все заказы</SelectItem>
                  <SelectItem value={OrderStatus.NEED_PURCHASING}>Необходима закупка</SelectItem>
                  <SelectItem value={OrderStatus.PURCHASING}>Происходит закупка</SelectItem>
                  <SelectItem value={OrderStatus.IN_DELIVERY}>В пути</SelectItem>
                  <SelectItem value={OrderStatus.UNLOADING}>Разгрузка</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {filteredOrders.length > 0 ? (
            filteredOrders.map(order => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="flex items-center">
                        {getStatusIcon(order.status)}
                        <span className="ml-2">Заказ #{order.id}</span>
                      </CardTitle>
                      <Badge variant={
                        order.status === OrderStatus.NEED_PURCHASING ? "outline" :
                        order.status === OrderStatus.PURCHASING ? "secondary" :
                        order.status === OrderStatus.IN_DELIVERY ? "default" :
                        "destructive"
                      }>
                        {order.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Информация о заказе</h4>
                      <p className="text-gray-700 mb-3">{order.description}</p>
                      <p className="text-sm text-gray-500">Клиент: {order.clientName}</p>
                    </div>
                    
                    {order.commercialProposal && (
                      <div className="mb-5">
                        <h4 className="font-medium mb-2">Детали для закупки</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="py-2 text-left">Наименование</th>
                                <th className="py-2 text-center">Артикул</th>
                                <th className="py-2 text-center">Кол-во</th>
                                <th className="py-2 text-right">Доступно</th>
                                <th className="py-2 text-right">Нужно закупить</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.commercialProposal.equipment.map(part => {
                                // Check if the part exists in the available equipment
                                const existingPart = neededPurchaseItems.find(
                                  item => item.part.articleNumber === part.articleNumber
                                );
                                
                                return (
                                  <tr key={part.articleNumber} className="border-b border-gray-100">
                                    <td className="py-2">{part.name}</td>
                                    <td className="py-2 text-center font-mono">{part.articleNumber}</td>
                                    <td className="py-2 text-center">{part.quantity} шт.</td>
                                    <td className="py-2 text-right">{part.availableQuantity} шт.</td>
                                    <td className="py-2 text-right">
                                      {existingPart ? (
                                        <span className="text-amber-600 font-medium">{existingPart.neededQuantity} шт.</span>
                                      ) : (
                                        <span className="text-green-600">Достаточно</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={() => handleStatusUpdate(order.id, nextStatusMap[order.status])}
                        disabled={order.status === OrderStatus.READY_FOR_DEVELOPMENT}
                      >
                        {getNextButtonText(order.status)}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card>
              <CardContent className="py-6">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <h3 className="text-xl font-semibold mb-2">Нет заказов для обработки</h3>
                  <p className="text-gray-500">
                    В данный момент нет заказов, которые требуют логистических действий.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default LogisticianDashboard;
