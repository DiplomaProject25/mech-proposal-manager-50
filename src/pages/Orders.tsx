import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Filter, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useOrders, OrderStatus } from '@/context/OrderContext';
import { useAuth, UserRole } from '@/context/AuthContext';
import Header from '@/components/layout/Header';
import OrderCard from '@/components/common/OrderCard';
import NewOrderDialog from '@/components/common/NewOrderDialog';

const Orders = () => {
  const { filteredOrders, getEmployeeList } = useOrders();
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [isNewOrderDialogOpen, setIsNewOrderDialogOpen] = useState(false);
  
  const employeeList = getEmployeeList();
  
  const filteredAndSearchedOrders = filteredOrders.filter(order => {
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }
    
    if (employeeFilter !== 'all' && order.responsibleEmployee !== employeeFilter) {
      return false;
    }
    
    const searchTerms = searchQuery.toLowerCase().trim();
    if (searchTerms === '') return true;
    
    return (
      order.id.toLowerCase().includes(searchTerms) ||
      order.clientName.toLowerCase().includes(searchTerms) ||
      order.description.toLowerCase().includes(searchTerms)
    );
  });

  const handleOpenNewOrderDialog = () => {
    setIsNewOrderDialogOpen(true);
  };

  const handleCloseNewOrderDialog = () => {
    setIsNewOrderDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Заказы" />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Поиск заказов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            
            <div className="w-full sm:w-48">
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4 text-gray-500" />
                    <SelectValue placeholder="Фильтр по статусу" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  {Object.values(OrderStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace(/_/g, ' ').split(' ').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full sm:w-64">
              <Select
                value={employeeFilter}
                onValueChange={setEmployeeFilter}
              >
                <SelectTrigger className="w-full">
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4 text-gray-500" />
                    <SelectValue placeholder="Фильтр по сотруднику" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все сотрудники</SelectItem>
                  {employeeList.map((employee) => (
                    <SelectItem key={employee} value={employee}>
                      {employee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {user?.role === UserRole.DIRECTOR && (
            <Button 
              className="flex items-center whitespace-nowrap bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
              onClick={handleOpenNewOrderDialog}
            >
              <Plus className="mr-2 h-4 w-4" />
              Новый заказ
            </Button>
          )}
        </div>
        
        {filteredAndSearchedOrders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <h3 className="text-xl font-medium text-gray-700 mb-2">Заказы не найдены</h3>
            <p className="text-gray-500">
              {searchQuery || statusFilter !== 'all' || employeeFilter !== 'all'
                ? 'Попробуйте изменить критерии поиска или фильтрации'
                : 'На данный момент нет доступных заказов'}
            </p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredAndSearchedOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <OrderCard order={order} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      <NewOrderDialog 
        isOpen={isNewOrderDialogOpen} 
        onClose={handleCloseNewOrderDialog} 
      />
    </div>
  );
};

export default Orders;
