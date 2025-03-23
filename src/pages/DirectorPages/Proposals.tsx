
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useOrders } from '@/context/OrderContext';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import StatusBadge from '@/components/common/StatusBadge';

const Proposals = () => {
  const { orders, downloadProposalAsTxt } = useOrders();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter orders that have proposals
  const ordersWithProposals = orders.filter(order => order.commercialProposal !== null);
  
  // Search functionality
  const filteredProposals = ordersWithProposals.filter(order => {
    const query = searchQuery.toLowerCase().trim();
    if (query === '') return true;
    
    return (
      order.id.toLowerCase().includes(query) ||
      order.clientName.toLowerCase().includes(query) ||
      order.description.toLowerCase().includes(query) ||
      order.commercialProposal?.id.toLowerCase().includes(query)
    );
  });

  const handleDownloadProposal = (proposalId: string) => {
    downloadProposalAsTxt(proposalId);
  };

  const handleViewOrder = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Commercial Proposals" />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search proposals..."
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
            <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6 pb-6 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">No proposals found</h3>
                <p className="text-gray-500">
                  {searchQuery 
                    ? 'Try adjusting your search criteria'
                    : 'There are no commercial proposals created yet'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>All Commercial Proposals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Proposal ID</TableHead>
                        <TableHead>Date Created</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProposals.map((order) => (
                        <TableRow key={order.commercialProposal?.id}>
                          <TableCell>{order.id}</TableCell>
                          <TableCell>{order.clientName}</TableCell>
                          <TableCell>{order.commercialProposal?.id}</TableCell>
                          <TableCell>
                            {order.commercialProposal?.createdAt.toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={order.status} />
                          </TableCell>
                          <TableCell className="font-medium">
                            ${order.commercialProposal?.totalCost.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadProposal(order.commercialProposal!.id)}
                                className="flex items-center"
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleViewOrder(order.id)}
                              >
                                View Order
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="border-t p-4 bg-gray-50">
                <div className="text-sm text-gray-500">
                  Showing {filteredProposals.length} of {ordersWithProposals.length} proposals
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
