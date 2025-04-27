
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, FileText, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useOrders } from '@/context/OrderContext';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import StatusBadge from '@/components/common/StatusBadge';

const Proposals = () => {
  const { orders, downloadProposalAsWord } = useOrders();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Фильтрация заказов с предложениями
  const ordersWithProposals = orders.filter(order => order.commercialProposal !== null);
  
  // Функционал поиска
  const filteredProposals = ordersWithProposals.filter(order => {
    const query = searchQuery.toLowerCase().trim();
    if (query === '') return true;
    
    return (
      order.id.toLowerCase().includes(query) ||
      order.clientName.toLowerCase().includes(query) ||
      order.description.toLowerCase().includes(query) ||
      order.commercialProposal?.id.toLowerCase().includes(query) ||
      order.responsibleEmployee?.toLowerCase().includes(query)
    );
  });

  const handleDownloadProposalAsWord = (proposalId: string) => {
    downloadProposalAsWord(proposalId);
  };

  const handleViewOrder = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  // Генерация реалистичного ID для предложения
  const formatProposalId = (id: string) => {
    // Если ID уже содержит формат "КП-XXXX-XXXX", вернем его
    if (id.startsWith('КП-')) return id;
    
    // Иначе форматируем как "КП-XXXX-XXXX" с годом и последовательным номером
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const randomNum = Math.floor(10000 + Math.random() * 90000).toString();
    
    return `КП-${year}${month}-${randomNum}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Коммерческие предложения" />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Поиск предложений..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {filteredProposals.length === 0 ? (
            <Card className="border-none shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardContent className="pt-6 pb-6 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">Предложения не найдены</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery 
                    ? 'Попробуйте изменить критерии поиска'
                    : 'Коммерческие предложения еще не созданы'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-none shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Все коммерческие предложения</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID заказа</TableHead>
                        <TableHead>Клиент</TableHead>
                        <TableHead>ID предложения</TableHead>
                        <TableHead>Дата создания</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Ответственный</TableHead>
                        <TableHead>Сумма</TableHead>
                        <TableHead className="text-right">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProposals.map((order) => (
                        <TableRow key={order.commercialProposal?.id}>
                          <TableCell>{order.id}</TableCell>
                          <TableCell>{order.clientName}</TableCell>
                          <TableCell>{formatProposalId(order.commercialProposal?.id || '')}</TableCell>
                          <TableCell>
                            {order.commercialProposal?.createdAt.toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={order.status} />
                          </TableCell>
                          <TableCell>
                            {order.responsibleEmployee || "Не назначен"}
                          </TableCell>
                          <TableCell className="font-medium">
                            ${order.commercialProposal?.totalCost.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadProposalAsWord(order.commercialProposal!.id)}
                                className="flex items-center"
                              >
                                <File className="mr-2 h-4 w-4" />
                                Word
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleViewOrder(order.id)}
                              >
                                Просмотр
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="border-t p-4 bg-gray-50 dark:bg-gray-800/50">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Показано {filteredProposals.length} из {ordersWithProposals.length} предложений
                </div>
              </CardFooter>
            </Card>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Proposals;
