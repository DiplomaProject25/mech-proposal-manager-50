
import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useOrders, OrderStatus } from '@/context/OrderContext';
import Header from '@/components/layout/Header';
import StatusBadge from '@/components/common/StatusBadge';

const OrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getOrderById, updateOrderStatus, downloadProposalAsWord } = useOrders();
  
  const order = orderId ? getOrderById(orderId) : null;
  
  const fromProposals = location.state?.from === '/proposals';

  const handleBack = () => {
    navigate(fromProposals ? '/proposals' : '/orders');
  };
  
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Заказ не найден</h2>
              <p className="text-gray-500 mb-4">
                Запрашиваемый заказ не существует или был удален
              </p>
              <Button onClick={() => navigate('/dashboard')}>
                Вернуться на главную
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const handleCreateProposal = () => {
    navigate(`/proposals/create/${orderId}`);
  };
  
  const handleDownloadProposal = () => {
    if (order.commercialProposal) {
      downloadProposalAsWord(order.commercialProposal.id);
    }
  };
  
  const handleRejectProposal = () => {
    updateOrderStatus(order.id, OrderStatus.REJECTED);
    toast({
      title: 'Предложение отклонено',
      description: 'Коммерческое предложение было отклонено',
    });
  };
  
  const handleApproveProposal = () => {
    updateOrderStatus(order.id, OrderStatus.READY_FOR_DEVELOPMENT);
    toast({
      title: 'Предложение одобрено',
      description: 'Коммерческое предложение одобрено и готово к разработке',
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Детали заказа" />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            {fromProposals ? 'Назад к предложениям' : 'Назад к заказам'}
          </Button>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm mb-6">
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
              <div>
                <h3 className="text-lg font-medium mb-3">Информация о заказе</h3>
                <p className="text-gray-700 mb-4">
                  {order.description}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Создан:</p>
                    <p className="font-medium">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Обновлен:</p>
                    <p className="font-medium">
                      {new Date(order.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ответственный:</p>
                    <p className="font-medium">
                      {order.responsibleEmployee || 'Не назначен'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Конструктор:</p>
                    <p className="font-medium">
                      {order.assignedTo || 'Не назначен'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            {order.commercialProposal && order.status === OrderStatus.PROPOSAL_CREATED && (
              <CardFooter className="border-t p-4 bg-gray-50">
                <div className="w-full flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleRejectProposal}
                  >
                    Отклонить
                  </Button>
                  <Button
                    onClick={handleApproveProposal}
                  >
                    Одобрить
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
          
          {order.commercialProposal ? (
            <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Коммерческое предложение</CardTitle>
                  <Button
                    variant="outline"
                    onClick={handleDownloadProposal}
                  >
                    Скачать в Word
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Наименование</th>
                        <th className="text-left py-2">Артикул</th>
                        <th className="text-right py-2">Цена</th>
                        <th className="text-right py-2">Кол-во</th>
                        <th className="text-right py-2">Сумма</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.commercialProposal.equipment.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="py-2">{item.name}</td>
                          <td className="py-2">{item.articleNumber}</td>
                          <td className="py-2 text-right">${item.price.toFixed(2)}</td>
                          <td className="py-2 text-right">{item.quantity}</td>
                          <td className="py-2 text-right">
                            ${(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t">
                        <td colSpan={4} className="py-2 text-right font-medium">
                          Подытог:
                        </td>
                        <td className="py-2 text-right font-medium">
                          ${order.commercialProposal.totalCost.toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={4} className="py-2 text-right font-medium">
                          Наценка ({order.commercialProposal.markup}%):
                        </td>
                        <td className="py-2 text-right font-medium">
                          ${(order.commercialProposal.totalCost * order.commercialProposal.markup / 100).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={4} className="py-2 text-right font-bold">
                          Итого:
                        </td>
                        <td className="py-2 text-right font-bold">
                          ${(order.commercialProposal.totalCost * (1 + order.commercialProposal.markup / 100)).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm text-center py-8">
              <CardContent>
                <p className="text-gray-500 mb-4">
                  Коммерческое предложение еще не создано
                </p>
                <Button onClick={handleCreateProposal}>
                  Создать предложение
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default OrderDetails;
