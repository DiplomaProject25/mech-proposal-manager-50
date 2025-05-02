
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, FileText, User, Calendar, Calculator, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useOrders, OrderStatus } from '@/context/OrderContext';
import Header from '@/components/layout/Header';
import StatusBadge from '@/components/common/StatusBadge';

const OrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { getOrderById, updateOrderStatus, toggleProposalPrices } = useOrders();
  const { toast } = useToast();
  
  const order = orderId ? getOrderById(orderId) : null;
  
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Заказ не найден</h2>
              <p className="text-gray-500 mb-4">
                Заказ, который вы ищете, не существует или был удален.
              </p>
              <Button onClick={() => navigate('/orders')}>
                Вернуться к списку заказов
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const handleStatusChange = (newStatus: OrderStatus) => {
    if (!orderId) return;
    
    updateOrderStatus(orderId, newStatus);
  };
  
  const handleCreateProposal = () => {
    navigate(`/proposals/create/${orderId}`);
  };
  
  const handleCalculatePrices = () => {
    if (orderId && order.commercialProposal) {
      toggleProposalPrices(orderId, true);
      toast({
        title: 'Цены рассчитаны',
        description: 'Теперь цены отображаются в коммерческом предложении',
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Детали заказа" />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/orders')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Вернуться к списку заказов
          </Button>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">
                    Заказ #{order.id}
                  </CardTitle>
                  <p className="text-gray-500 mt-1">{order.clientName}</p>
                </div>
                <StatusBadge status={order.status} className="ml-2" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Описание заказа</h3>
                <p className="text-gray-700 mb-6">
                  {order.description}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Информация</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-gray-700">
                          {order.responsibleEmployee ? order.responsibleEmployee : 'Ответственный не назначен'}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-gray-700">
                          Создан: {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-gray-700">
                          Обновлен: {new Date(order.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Управление</h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Статус заказа</label>
                        <div className="flex flex-wrap gap-2">
                          {order.status === OrderStatus.NEW && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(OrderStatus.REJECTED)}
                              className="border-red-300 text-red-700 hover:bg-red-50"
                            >
                              Отклонить
                            </Button>
                          )}
                          
                          {order.status === OrderStatus.PROPOSAL_CREATED && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(OrderStatus.READY_FOR_DEVELOPMENT)}
                                className="border-green-300 text-green-700 hover:bg-green-50"
                              >
                                Одобрить
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(OrderStatus.REJECTED)}
                                className="border-red-300 text-red-700 hover:bg-red-50"
                              >
                                Отклонить
                              </Button>
                            </>
                          )}
                          
                          {order.status === OrderStatus.READY_FOR_DEVELOPMENT && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(OrderStatus.NEED_PURCHASING)}
                                className="border-amber-300 text-amber-700 hover:bg-amber-50"
                              >
                                <ShoppingCart className="mr-1 h-4 w-4" />
                                Необходима закупка
                              </Button>
                              <span className="text-green-700">Заказ готов к разработке.</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium mb-3">Коммерческое предложение</h3>
                
                {order.commercialProposal ? (
                  <div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-700">
                        Предложение создано: {new Date(order.commercialProposal.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="mb-4 overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Наименование
                            </th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Артикул
                            </th>
                            <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Количество
                            </th>
                            {order.commercialProposal.showPrices && (
                              <>
                                <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Цена
                                </th>
                                <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Итого
                                </th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {order.commercialProposal.equipment.map((item) => (
                            <tr key={item.id} className="border-b border-gray-100">
                              <td className="py-3 px-4">
                                {item.name}
                              </td>
                              <td className="py-3 px-4 font-mono text-sm">
                                {item.articleNumber}
                              </td>
                              <td className="py-3 px-4 text-right">
                                {item.quantity}
                              </td>
                              {order.commercialProposal.showPrices && (
                                <>
                                  <td className="py-3 px-4 text-right">
                                    ${item.price.toFixed(2)}
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    ${(item.price * item.quantity).toFixed(2)}
                                  </td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                        {order.commercialProposal.showPrices && (
                          <tfoot>
                            <tr className="bg-gray-50">
                              <td colSpan={3} className="py-3 px-4 text-right font-medium">
                                Наценка ({order.commercialProposal.markup}%):
                              </td>
                              <td colSpan={2} className="py-3 px-4 text-right font-medium">
                                ${(order.commercialProposal.totalCost - (order.commercialProposal.totalCost / (1 + order.commercialProposal.markup / 100))).toFixed(2)}
                              </td>
                            </tr>
                            <tr className="bg-gray-50 font-semibold">
                              <td colSpan={3} className="py-3 px-4 text-right">
                                Всего:
                              </td>
                              <td colSpan={2} className="py-3 px-4 text-right">
                                ${order.commercialProposal.totalCost.toFixed(2)}
                              </td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                    
                    <div className="flex space-x-2">
                      {!order.commercialProposal.showPrices && (
                        <Button 
                          onClick={handleCalculatePrices}
                          className="flex items-center"
                        >
                          <Calculator className="mr-1 h-4 w-4" />
                          Рассчитать
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-md border border-dashed border-gray-300 p-6">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h4 className="text-lg font-medium mb-2">Нет коммерческого предложения</h4>
                      <p className="text-gray-500 mb-4">
                        Для этого заказа еще не создано коммерческое предложение.
                      </p>
                      <Button onClick={handleCreateProposal}>
                        Создать предложение
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default OrderDetails;
