import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, TruckIcon, ArrowUp, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrders, OrderStatus } from '@/context/OrderContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';

// Define the order statuses for purchasing flow
const purchaseStatuses = [
  OrderStatus.NEED_PURCHASING,
  OrderStatus.PURCHASING,
  OrderStatus.IN_DELIVERY,
  OrderStatus.UNLOADING,
  OrderStatus.READY_FOR_DEVELOPMENT
];

const AccountantDashboard = () => {
  const { orders, updateOrderStatus } = useOrders();
  const { toast } = useToast();
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  
  // Filter orders that require purchasing
  const purchaseOrders = orders.filter(order => 
    purchaseStatuses.includes(order.status as OrderStatus)
  );
  
  const filteredOrders = selectedStatusFilter === "all" 
    ? purchaseOrders 
    : purchaseOrders.filter(order => order.status === selectedStatusFilter);
  
  // Calculate parts needed across all orders
  const partsNeeded: Record<string, { 
    name: string, 
    articleNumber: string,
    quantity: number,
    price: number,
    // Remove the supplier property reference that's causing the TypeScript error
  }> = {};
  
  filteredOrders.forEach(order => {
    if (order.commercialProposal) {
      order.commercialProposal.equipment.forEach(part => {
        if (partsNeeded[part.articleNumber]) {
          partsNeeded[part.articleNumber].quantity += part.quantity;
        } else {
          partsNeeded[part.articleNumber] = {
            name: part.name,
            articleNumber: part.articleNumber,
            quantity: part.quantity,
            price: part.price,
            // Remove the supplier property that doesn't exist in the EquipmentPart type
          };
        }
      });
    }
  });
  
  const totalItems = Object.values(partsNeeded).reduce((acc, item) => acc + item.quantity, 0);
  const totalCost = Object.values(partsNeeded).reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    toast({
      title: "Статус обновлен",
      description: `Статус заказа изменен на: ${newStatus.replace(/_/g, " ")}`,
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Панель бухгалтера" />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">
                <div className="flex items-center">
                  <ShoppingCart className="mr-2 h-5 w-5 text-blue-500" />
                  Заказы в обработке
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {purchaseOrders.length}
              </div>
              <p className="text-sm text-gray-500">
                требуют действий бухгалтерии
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">
                <div className="flex items-center">
                  <Package className="mr-2 h-5 w-5 text-orange-500" />
                  Необходимо деталей
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalItems}
              </div>
              <p className="text-sm text-gray-500">
                общее количество комплектующих
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">
                <div className="flex items-center">
                  <ArrowUp className="mr-2 h-5 w-5 text-green-500" />
                  Общая стоимость
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalCost.toFixed(2)}
              </div>
              <p className="text-sm text-gray-500">
                стоимость всех деталей
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold">Заказы для закупки</h2>
            
            <Select
              value={selectedStatusFilter}
              onValueChange={setSelectedStatusFilter}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Фильтр по статусу" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                {purchaseStatuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {status.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-sm rounded-lg overflow-hidden"
        >
          <Table>
            <TableCaption>
              {filteredOrders.length === 0 ? 
                "Нет заказов, требующих закупки деталей." : 
                `Список из ${filteredOrders.length} заказов для закупки.`}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>ID заказа</TableHead>
                <TableHead>Клиент</TableHead>
                <TableHead>Кол-во деталей</TableHead>
                <TableHead className="text-right">Стоимость</TableHead>
                <TableHead>Текущий статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map(order => {
                const parts = order.commercialProposal?.equipment || [];
                const partCount = parts.reduce((sum, part) => sum + part.quantity, 0);
                const orderCost = parts.reduce((sum, part) => sum + (part.price * part.quantity), 0);
                
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.clientName}</TableCell>
                    <TableCell>{partCount}</TableCell>
                    <TableCell className="text-right">${orderCost.toFixed(2)}</TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Изменить статус" />
                        </SelectTrigger>
                        <SelectContent>
                          {purchaseStatuses.map(status => (
                            <SelectItem key={status} value={status}>
                              {status.replace(/_/g, " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleStatusChange(order.id, OrderStatus.READY_FOR_DEVELOPMENT)}
                      >
                        <TruckIcon className="mr-2 h-4 w-4" />
                        Завершить закупку
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </motion.div>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-6">Список необходимых деталей</h2>
          
          {Object.keys(partsNeeded).length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500">Нет деталей для закупки.</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white shadow-sm rounded-lg overflow-hidden"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Наименование</TableHead>
                    <TableHead>Артикул</TableHead>
                    <TableHead>Поставщик</TableHead>
                    <TableHead className="text-right">Количество</TableHead>
                    <TableHead className="text-right">Цена за ед.</TableHead>
                    <TableHead className="text-right">Итого</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.values(partsNeeded).map((part) => (
                    <TableRow key={part.articleNumber}>
                      <TableCell>{part.name}</TableCell>
                      <TableCell className="font-mono text-sm">{part.articleNumber}</TableCell>
                      <TableCell>{"Не указан"}</TableCell>
                      <TableCell className="text-right">{part.quantity}</TableCell>
                      <TableCell className="text-right">${part.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">${(part.price * part.quantity).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AccountantDashboard;
