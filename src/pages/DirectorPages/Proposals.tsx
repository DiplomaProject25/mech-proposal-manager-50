
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Download, ExternalLink, FileDown, ArrowUpDown, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useOrders, OrderStatus } from '@/context/OrderContext';
import Header from '@/components/layout/Header';

// Define the function that was missing
const formatProposalId = (id: string) => {
  // Format the proposal ID (e.g., "cp1" to "КП-00001")
  if (!id) return '';
  
  // Check if it already starts with КП-
  if (id.startsWith('КП-')) return id;
  
  // Extract numeric part if possible
  const numericPart = id.replace(/\D/g, '');
  const paddedNumber = numericPart.padStart(5, '0');
  
  return `КП-${paddedNumber}`;
};

const Proposals = () => {
  const { orders, downloadProposalAsTxt, downloadProposalAsWord } = useOrders();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Filter orders that have commercial proposals
  const ordersWithProposals = orders.filter(order => order.commercialProposal !== null);
  
  // Filter by search term
  const filteredProposals = ordersWithProposals.filter(order => {
    const searchLower = search.toLowerCase();
    return (
      order.id.toLowerCase().includes(searchLower) ||
      order.clientName.toLowerCase().includes(searchLower) ||
      (order.commercialProposal?.id && formatProposalId(order.commercialProposal.id).toLowerCase().includes(searchLower))
    );
  });
  
  // Sort proposals
  const sortedProposals = [...filteredProposals].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.commercialProposal!.createdAt).getTime();
      const dateB = new Date(b.commercialProposal!.createdAt).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortBy === 'client') {
      return sortDirection === 'asc'
        ? a.clientName.localeCompare(b.clientName)
        : b.clientName.localeCompare(a.clientName);
    } else if (sortBy === 'price') {
      const priceA = a.commercialProposal!.totalCost;
      const priceB = b.commercialProposal!.totalCost;
      return sortDirection === 'asc' ? priceA - priceB : priceB - priceA;
    }
    return 0;
  });
  
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Коммерческие предложения" />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-semibold">
                <span className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Коммерческие предложения
                </span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Поиск предложений..."
                    className="pl-9 w-[250px]"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <ArrowUpDown className="h-4 w-4" />
                      <span>Сортировка</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setSortBy('date'); toggleSortDirection(); }}>
                      По дате {sortBy === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSortBy('client'); toggleSortDirection(); }}>
                      По клиенту {sortBy === 'client' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSortBy('price'); toggleSortDirection(); }}>
                      По стоимости {sortBy === 'price' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        № Предложения
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        № Заказа
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Клиент
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Дата создания
                      </th>
                      <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Стоимость
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ответственный
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Статус заказа
                      </th>
                      <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProposals.map(order => (
                      <tr 
                        key={order.commercialProposal!.id} 
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-4 whitespace-nowrap font-medium">
                          {formatProposalId(order.commercialProposal!.id)}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          {order.id}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          {order.clientName}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap text-gray-500">
                          {new Date(order.commercialProposal!.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap text-right font-medium">
                          ${order.commercialProposal!.totalCost.toFixed(2)}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          {order.commercialProposal!.responsibleEmployee || '-'}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === OrderStatus.READY_FOR_DEVELOPMENT 
                              ? 'bg-green-100 text-green-800' 
                              : order.status === OrderStatus.PROPOSAL_CREATED
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap text-right">
                          <div className="flex justify-end space-x-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 px-2">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => downloadProposalAsTxt(order.commercialProposal!.id)}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  Скачать как TXT
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => downloadProposalAsWord(order.commercialProposal!.id)}>
                                  <FileDown className="mr-2 h-4 w-4" />
                                  Скачать как DOC
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 px-2"
                              onClick={() => navigate(`/orders/${order.id}`)}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {sortedProposals.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Нет коммерческих предложений, соответствующих критериям поиска.</p>
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

export default Proposals;
