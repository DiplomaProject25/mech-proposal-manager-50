import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, X, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useOrders, EquipmentPart } from '@/context/OrderContext';
import Header from '@/components/layout/Header';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const CommercialProposal = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { getOrderById, getAllEquipment, createCommercialProposal, toggleProposalPrices } = useOrders();
  const { toast } = useToast();
  
  const [selectedItems, setSelectedItems] = useState<EquipmentPart[]>([]);
  const [availableEquipment, setAvailableEquipment] = useState<EquipmentPart[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [markup, setMarkup] = useState(15);
  
  const order = orderId ? getOrderById(orderId) : null;
  
  useEffect(() => {
    const equipment = getAllEquipment();
    setAvailableEquipment(equipment);
  }, [getAllEquipment]);
  
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Заказ не найден</h2>
              <p className="text-gray-500 mb-4">
                Заказ, который вы ищете, не существует или был удален.
              </p>
              <Button onClick={() => navigate('/orders')}>
                Вернуться к списку заказов
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const filteredEquipment = availableEquipment.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.articleNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const toggleSelectItem = (item: EquipmentPart) => {
    const isSelected = selectedItems.find(si => si.id === item.id);
    
    if (isSelected) {
      setSelectedItems(selectedItems.filter(si => si.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };
  
  const handleChangeQuantity = (item: EquipmentPart, quantity: number) => {
    if (quantity < 1) {
      toast({
        title: 'Ошибка',
        description: 'Количество не может быть меньше 1',
        variant: 'destructive',
      });
      return;
    }
    
    if (quantity > item.availableQuantity) {
      toast({
        title: 'Ошибка',
        description: `На складе недостаточно оборудования. Доступно: ${item.availableQuantity}`,
        variant: 'destructive',
      });
      return;
    }
    
    setSelectedItems(selectedItems.map(si =>
      si.id === item.id ? { ...si, quantity } : si
    ));
  };
  
  const createOrUpdateProposal = () => {
    if (selectedItems.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Выберите хотя бы одно оборудование для создания коммерческого предложения',
        variant: 'destructive',
      });
      return;
    }
    
    const proposal = createCommercialProposal(
      orderId,
      selectedItems,
      markup,
    );
    
    if (proposal) {
      // Updated to show prices by default
      toggleProposalPrices(orderId, true);
      navigate(`/orders/${orderId}`);
    }
  };
  
  const isItemSelected = (item: EquipmentPart) => {
    return selectedItems.find(si => si.id === item.id);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Создание коммерческого предложения" />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">
                Создание коммерческого предложения для заказа #{order.id}
              </CardTitle>
              <p className="text-gray-500 mt-1">{order.clientName}</p>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Информация о заказе</h3>
                <p className="text-gray-700">
                  {order.description}
                </p>
              </div>
              
              <div className="mb-4">
                <Label htmlFor="markup" className="text-sm font-medium block mb-2">
                  Наценка (%)
                </Label>
                <Input
                  type="number"
                  id="markup"
                  value={markup}
                  onChange={(e) => setMarkup(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div className="mb-4">
                <Label htmlFor="search" className="text-sm font-medium block mb-2">
                  Поиск оборудования
                </Label>
                <Input
                  type="text"
                  id="search"
                  placeholder="Введите название или артикул оборудования"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableCaption>Список доступного оборудования для добавления в коммерческое предложение</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Выбрать</TableHead>
                      <TableHead>Наименование</TableHead>
                      <TableHead>Артикул</TableHead>
                      <TableHead>В наличии</TableHead>
                      <TableHead>Количество</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEquipment.map((item) => {
                      const isSelected = isItemSelected(item);
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => toggleSelectItem(item)}
                            >
                              {isSelected ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                            </Button>
                          </TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.articleNumber}</TableCell>
                          <TableCell>{item.availableQuantity}</TableCell>
                          <TableCell>
                            {isSelected ? (
                              <Input
                                type="number"
                                defaultValue={1}
                                min={1}
                                max={item.availableQuantity}
                                onChange={(e) => handleChangeQuantity(item, Number(e.target.value))}
                                className="w-24"
                              />
                            ) : (
                              <span>{selectedItems.find(si => si.id === item.id)?.quantity || 0}</span>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Выбранное оборудование</h3>
                
                {selectedItems.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    Оборудование не выбрано
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Наименование</TableHead>
                          <TableHead>Артикул</TableHead>
                          <TableHead>Количество</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.articleNumber}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
              
              <div className="mt-6 border-t pt-4">
                <Button onClick={createOrUpdateProposal}>
                  Создать коммерческое предложение
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default CommercialProposal;
