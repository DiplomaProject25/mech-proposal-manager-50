
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { DollarSign, FileText, Users, PieChart, Database, ArrowDown } from 'lucide-react';
import { useOrders, OrderStatus } from '@/context/OrderContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';

// Define extended OrderStatus for purchasing flow
const purchaseStatuses = [
  "NEED_PURCHASING",
  "PURCHASING_IN_PROGRESS",
  "IN_TRANSIT",
  "UNLOADING",
  "READY_FOR_DEVELOPMENT"
];

const AccountantDashboard = () => {
  const { orders, updateOrderStatus } = useOrders();
  const { toast } = useToast();
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");
  
  // Filter orders that require purchasing
  const purchaseOrders = orders.filter(order => 
    purchaseStatuses.includes(order.status as string)
  );
  
  const filteredOrders = selectedStatusFilter === "all" 
    ? purchaseOrders 
    : purchaseOrders.filter(order => order.status === selectedStatusFilter);

  // Calculate total parts to purchase
  const partsNeeded = purchaseOrders.reduce((acc, order) => {
    if (order.commercialProposal?.equipment) {
      order.commercialProposal.equipment.forEach(item => {
        if (!acc[item.articleNumber]) {
          acc[item.articleNumber] = {
            name: item.name,
            quantity: 0,
            price: item.price
          };
        }
        acc[item.articleNumber].quantity += item.quantity;
      });
    }
    return acc;
  }, {} as Record<string, { name: string; quantity: number; price: number }>);
  
  const totalItems = Object.values(partsNeeded).reduce((acc, item) => acc + item.quantity, 0);
  const totalCost = Object.values(partsNeeded).reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateOrderStatus(orderId, newStatus);
    toast({
      title: "Статус обновлен",
      description: `Заказ #${orderId} переведен в статус "${newStatus}"`,
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Панель бухгалтера" />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Финансовая сводка */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-4 w-4 text-green-500" />
                Финансовая сводка
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {totalCost.toFixed(2)} ₽
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Общая стоимость закупок
              </p>
            </CardContent>
          </Card>

          {/* Запчасти */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-4 w-4 text-blue-500" />
                Запчасти
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {totalItems}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Общее количество запчастей для закупки
              </p>
            </CardContent>
          </Card>

          {/* Заказы на закупку */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-4 w-4 text-indigo-500" />
                Заказы на закупку
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {purchaseOrders.length}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Количество заказов на закупку
              </p>
            </CardContent>
          </Card>

          {/* Исполнители */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-4 w-4 text-purple-500" />
                Исполнители
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {new Set(purchaseOrders.map(order => order.responsibleEmployee).filter(Boolean)).size}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Количество ответственных исполнителей
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Список заказов на закупку */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border bg-white dark:bg-gray-800">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Заказы на закупку</CardTitle>
                  <CardDescription>
                    Управление заказами, требующими закупки запчастей
                  </CardDescription>
                </div>
                
                <Select
                  value={selectedStatusFilter}
                  onValueChange={setSelectedStatusFilter}
                >
                  <SelectTrigger className="w-full md:w-[240px]">
                    <div className="flex items-center">
                      <ArrowDown className="mr-2 h-4 w-4 text-gray-500" />
                      <SelectValue placeholder="Фильтр по статусу" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    {purchaseStatuses.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID заказа</TableHead>
                        <TableHead>Клиент</TableHead>
                        <TableHead>Исполнитель</TableHead>
                        <TableHead>Требуемые запчасти</TableHead>
                        <TableHead>Текущий статус</TableHead>
                        <TableHead>Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.clientName}</TableCell>
                          <TableCell>{order.responsibleEmployee || "Не назначен"}</TableCell>
                          <TableCell>
                            {order.commercialProposal?.equipment?.length || 0} наименований
                          </TableCell>
                          <TableCell>{order.status}</TableCell>
                          <TableCell>
                            <Select
                              value={order.status}
                              onValueChange={(value) => handleStatusChange(order.id, value)}
                            >
                              <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Изменить статус" />
                              </SelectTrigger>
                              <SelectContent>
                                {purchaseStatuses.map((status) => (
                                  <SelectItem key={status} value={status}>{status}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Нет заказов, требующих закупки</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Список запчастей для закупки */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8"
        >
          <Card className="border bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Запчасти для закупки</CardTitle>
              <CardDescription>
                Список всех запчастей, требуемых для текущих заказов
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(partsNeeded).length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Наименование</TableHead>
                        <TableHead>Артикул</TableHead>
                        <TableHead className="text-right">Количество</TableHead>
                        <TableHead className="text-right">Цена за ед.</TableHead>
                        <TableHead className="text-right">Общая стоимость</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(partsNeeded).map(([articleNumber, details]) => (
                        <TableRow key={articleNumber}>
                          <TableCell className="font-medium">{details.name}</TableCell>
                          <TableCell className="font-mono">{articleNumber}</TableCell>
                          <TableCell className="text-right">{details.quantity}</TableCell>
                          <TableCell className="text-right">{details.price.toFixed(2)} ₽</TableCell>
                          <TableCell className="text-right">{(details.quantity * details.price).toFixed(2)} ₽</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <tfoot>
                      <tr className="bg-gray-50">
                        <td colSpan={2} className="py-3 px-4 font-medium">Итого:</td>
                        <td className="py-3 px-4 text-right font-medium">{totalItems}</td>
                        <td colSpan={2} className="py-3 px-4 text-right font-medium">{totalCost.toFixed(2)} ₽</td>
                      </tr>
                    </tfoot>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Нет запчастей для закупки</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default AccountantDashboard;
