import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, PackageCheck, MapPin, AlertTriangle, Wrench, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useOrders, OrderStatus, EquipmentPart } from '@/context/OrderContext';
import Header from '@/components/layout/Header';
import StatusBadge from '@/components/common/StatusBadge';
import { Progress } from '@/components/ui/progress';

const EquipmentDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { 
    getOrderById, 
    updateOrderStatus,
    getEquipmentByArticle,
    updateEquipmentInventory
  } = useOrders();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [articleNumber, setArticleNumber] = useState('');
  const [searchResults, setSearchResults] = useState<EquipmentPart | null>(null);
  const [partsInfo, setPartsInfo] = useState<{
    part: EquipmentPart;
    hasEnough: boolean;
  }[]>([]);
  
  const order = orderId ? getOrderById(orderId) : null;
  
  useEffect(() => {
    if (!order || !order.commercialProposal) return;
    
    const parts = order.commercialProposal.equipment.map(part => {
      const currentPart = getEquipmentByArticle(part.articleNumber);
      return {
        part,
        hasEnough: currentPart ? currentPart.availableQuantity >= part.quantity : false
      };
    });
    
    setPartsInfo(parts);
  }, [order, getEquipmentByArticle]);
  
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
              <p className="text-gray-500 mb-4">
                The order you are looking for does not exist or has been removed.
              </p>
              <Button onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const handleSearchArticle = () => {
    if (!articleNumber.trim()) return;
    
    const result = getEquipmentByArticle(articleNumber);
    
    if (result) {
      setSearchResults(result);
      toast({
        title: 'Equipment Found',
        description: `${result.name} (${result.articleNumber})`,
      });
    } else {
      setSearchResults(null);
      toast({
        title: 'Equipment Not Found',
        description: 'No equipment found with this article number',
        variant: 'destructive',
      });
    }
  };
  
  const handleAssemblyOrder = () => {
    if (!orderId) return;
    
    const allPartsAvailable = partsInfo.every(info => info.hasEnough);
    
    if (!allPartsAvailable) {
      toast({
        title: 'Missing Parts',
        description: 'Not all parts are available for assembly',
        variant: 'destructive',
      });
      return;
    }
    
    // Update each part's inventory individually
    partsInfo.forEach(info => {
      updateEquipmentInventory(info.part.articleNumber, info.part.quantity);
    });
    
    updateOrderStatus(orderId, OrderStatus.ASSEMBLY);
    
    toast({
      title: 'Assembly Started',
      description: 'The order is now in assembly process, inventory has been updated',
    });
  };
  
  const handlePurchaseOrder = () => {
    if (!orderId) return;
    
    updateOrderStatus(orderId, OrderStatus.PURCHASING);
    
    toast({
      title: 'Order Sent to Purchasing',
      description: 'The order has been sent to the purchasing department',
    });
  };
  
  const allPartsAvailable = partsInfo.length > 0 && partsInfo.every(info => info.hasEnough);
  const somePartsAvailable = partsInfo.some(info => info.hasEnough);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Equipment Details" />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
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
                    Order #{order.id}
                  </CardTitle>
                  <p className="text-gray-500 mt-1">{order.clientName}</p>
                </div>
                <StatusBadge status={order.status} className="ml-2" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Order Description</h3>
                <p className="text-gray-700">
                  {order.description}
                </p>
              </div>
              
              {order.commercialProposal ? (
                <div>
                  <h3 className="text-lg font-medium mb-3">Required Parts</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="py-3 px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Part Name
                          </th>
                          <th className="py-3 px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Article #
                          </th>
                          <th className="py-3 px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Location
                          </th>
                          <th className="py-3 px-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Required
                          </th>
                          <th className="py-3 px-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Available
                          </th>
                          <th className="py-3 px-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {partsInfo.map((info) => (
                          <tr 
                            key={info.part.id} 
                            className={`border-b border-gray-100 ${
                              !info.hasEnough ? 'bg-red-50' : ''
                            }`}
                          >
                            <td className="py-3 px-2">
                              {info.part.name}
                            </td>
                            <td className="py-3 px-2 font-mono text-sm">
                              {info.part.articleNumber}
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex items-center text-gray-600">
                                <MapPin className="h-3 w-3 mr-1" />
                                {info.part.location}
                              </div>
                            </td>
                            <td className="py-3 px-2 text-right">
                              {info.part.quantity}
                            </td>
                            <td className="py-3 px-2 text-right">
                              {info.part.availableQuantity}
                            </td>
                            <td className="py-3 px-2 text-right">
                              {info.hasEnough ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                  <PackageCheck className="h-3 w-3 mr-1" />
                                  In Stock
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Insufficient
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 border rounded-lg border-dashed border-gray-300">
                  <p className="text-gray-500">
                    No commercial proposal available for this order
                  </p>
                </div>
              )}
            </CardContent>
            
            {order.status === OrderStatus.IN_PROGRESS && (
              <CardFooter className="border-t p-4 bg-gray-50">
                <div className="w-full">
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">
                        Parts Availability
                      </span>
                      <span className="text-sm text-gray-500">
                        {partsInfo.filter(info => info.hasEnough).length} of {partsInfo.length} parts available
                      </span>
                    </div>
                    <Progress 
                      value={
                        partsInfo.length > 0
                          ? (partsInfo.filter(info => info.hasEnough).length / partsInfo.length) * 100
                          : 0
                      } 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    {!allPartsAvailable && (
                      <Button
                        variant="outline"
                        onClick={handlePurchaseOrder}
                        className="flex items-center"
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Send to Purchasing
                      </Button>
                    )}
                    
                    <Button
                      onClick={handleAssemblyOrder}
                      disabled={!allPartsAvailable}
                      className="flex items-center"
                    >
                      <Wrench className="mr-2 h-4 w-4" />
                      Start Assembly
                    </Button>
                  </div>
                </div>
              </CardFooter>
            )}
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Search Equipment by Article Number</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2 mb-6">
                <Input
                  type="text"
                  placeholder="Enter article number..."
                  value={articleNumber}
                  onChange={(e) => setArticleNumber(e.target.value)}
                />
                <Button onClick={handleSearchArticle}>
                  Search
                </Button>
              </div>
              
              {searchResults && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <h3 className="font-medium mb-2">{searchResults.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Article Number</p>
                      <p className="font-mono">{searchResults.articleNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Price</p>
                      <p>${searchResults.price.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Available Quantity</p>
                      <p>{searchResults.availableQuantity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Location</p>
                      <p className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                        {searchResults.location}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default EquipmentDetails;
