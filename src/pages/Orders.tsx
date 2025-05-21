
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import NewOrderDialog from '@/components/common/NewOrderDialog';
import OrderCard from '@/components/common/OrderCard';
import Header from '@/components/layout/Header';
import { useOrders, OrderStatus } from '@/context/OrderContext';

const Orders = () => {
  const { orders } = useOrders();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showNewOrderDialog, setShowNewOrderDialog] = useState(false);

  // Filter orders by status and search query
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesQuery = order.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        order.id.includes(searchQuery) ||
                        order.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Заказы" />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Поиск по названию, описанию или номеру заказа"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Фильтр
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Статус заказа</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                  <DropdownMenuRadioItem value="all">Все заказы</DropdownMenuRadioItem>
                  {Object.entries(OrderStatus).map(([key, value]) => (
                    <DropdownMenuRadioItem key={key} value={value}>
                      {(() => {
                        const statusLabels: Record<string, string> = {
                          'NEW': 'Новый',
                          'PENDING': 'В ожидании',
                          'PROPOSAL_CREATED': 'Предложение создано',
                          'READY_FOR_DEVELOPMENT': 'Готов к разработке',
                          'IN_PROGRESS': 'В работе',
                          'NEED_PURCHASING': 'Необходима закупка',
                          'PURCHASING': 'Происходит закупка',
                          'IN_TRANSIT': 'В пути',
                          'IN_DELIVERY': 'В пути',
                          'UNLOADING': 'Разгрузка',
                          'ASSEMBLY': 'Сборка',
                          'COMPLETED': 'Завершен',
                          'REJECTED': 'Отклонен'
                        };
                        return statusLabels[value] || value;
                      })()}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button onClick={() => setShowNewOrderDialog(true)} className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Новый заказ
            </Button>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
          
          {filteredOrders.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <h3 className="text-lg font-medium mb-2">Заказы не найдены</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery
                  ? "Нет заказов, соответствующих вашему запросу."
                  : "В системе пока нет заказов. Создайте новый заказ, чтобы начать работу."}
              </p>
              <Button onClick={() => setShowNewOrderDialog(true)}>
                Создать заказ
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <NewOrderDialog isOpen={showNewOrderDialog} onClose={() => setShowNewOrderDialog(false)} />
    </div>
  );
};

export default Orders;
