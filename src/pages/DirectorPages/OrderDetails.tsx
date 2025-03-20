
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, User, Calendar, ClipboardList, FileText, Download, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useOrders, OrderStatus } from '@/context/OrderContext';
import Header from '@/components/layout/Header';
import StatusBadge from '@/components/common/StatusBadge';

const OrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { 
    getOrderById, 
    updateOrderStatus,
    downloadProposalAsTxt
  } = useOrders();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const order = orderId ? getOrderById(orderId) : null;
  
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md border-none shadow-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
              <p className="text-gray-500 mb-4">
                The order you are looking for does not exist or has been removed.
              </p>
              <Button onClick={() => navigate('/orders')}>
                Back to Orders
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
      downloadProposalAsTxt(order.commercialProposal.id);
    }
  };
  
  const handleRejectProposal = () => {
    updateOrderStatus(order.id, OrderStatus.REJECTED);
    toast({
      title: 'Proposal Rejected',
      description: 'The proposal has been rejected',
    });
  };
  
  const handleApproveProposal = () => {
    updateOrderStatus(order.id, OrderStatus.READY_FOR_DEVELOPMENT);
    toast({
      title: 'Proposal Approved',
      description: 'The proposal has been approved and is ready for development',
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Order Details" />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/orders')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Orders
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
                    Order #{order.id}
                  </CardTitle>
                  <p className="text-gray-500 mt-1">{order.clientName}</p>
                </div>
                <StatusBadge status={order.status} className="ml-2" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Order Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <ClipboardList className="h-5 w-5 mr-2 text-gray-500" />
                      <span className="text-gray-700">
                        {order.description}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                      <span className="text-gray-700">
                        Created: {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                      <span className="text-gray-700">
                        Updated: {new Date(order.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-5 w-5 mr-2 text-gray-500" />
                      <span className="text-gray-700">
                        {order.assignedTo 
                          ? `Assigned to Constructor (ID: ${order.assignedTo})` 
                          : 'Not assigned'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Commercial Proposal</h3>
                  {order.commercialProposal ? (
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-gray-500" />
                        <span className="text-gray-700">
                          Proposal ID: {order.commercialProposal.id}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                        <span className="text-gray-700">
                          Created: {new Date(order.commercialProposal.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium mr-2">Total Amount:</span>
                        <span className="text-lg font-bold text-blue-600">
                          ${order.commercialProposal.totalCost.toFixed(2)}
                        </span>
                      </div>
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadProposal}
                          className="flex items-center"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download Proposal
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 border rounded-lg border-dashed border-gray-300">
                      <p className="text-gray-500 mb-4">
                        No commercial proposal created yet
                      </p>
                      <Button onClick={handleCreateProposal}>
                        Create Proposal
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            {order.commercialProposal && order.status === OrderStatus.PROPOSAL_CREATED && (
              <CardFooter className="border-t p-4 bg-gray-50">
                <div className="w-full flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleRejectProposal}
                    className="flex items-center"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reject Proposal
                  </Button>
                  <Button
                    onClick={handleApproveProposal}
                    className="flex items-center"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approve Proposal
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
          
          {order.commercialProposal && (
            <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Equipment and Parts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-3 text-left text-gray-500 font-medium">Item</th>
                        <th className="py-3 text-left text-gray-500 font-medium">Article #</th>
                        <th className="py-3 text-right text-gray-500 font-medium">Price</th>
                        <th className="py-3 text-right text-gray-500 font-medium">Quantity</th>
                        <th className="py-3 text-right text-gray-500 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.commercialProposal.equipment.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100">
                          <td className="py-3">{item.name}</td>
                          <td className="py-3 text-gray-500">{item.articleNumber}</td>
                          <td className="py-3 text-right">${item.price.toFixed(2)}</td>
                          <td className="py-3 text-right">{item.quantity}</td>
                          <td className="py-3 text-right font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-gray-200">
                        <td colSpan={4} className="py-3 text-right font-medium">
                          Subtotal:
                        </td>
                        <td className="py-3 text-right font-medium">
                          ${(order.commercialProposal.totalCost / (1 + order.commercialProposal.markup / 100)).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={4} className="py-3 text-right font-medium">
                          Markup ({order.commercialProposal.markup}%):
                        </td>
                        <td className="py-3 text-right font-medium">
                          ${(order.commercialProposal.totalCost - (order.commercialProposal.totalCost / (1 + order.commercialProposal.markup / 100))).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={4} className="py-3 text-right font-bold text-lg">
                          Total:
                        </td>
                        <td className="py-3 text-right font-bold text-lg text-blue-600">
                          ${order.commercialProposal.totalCost.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default OrderDetails;
