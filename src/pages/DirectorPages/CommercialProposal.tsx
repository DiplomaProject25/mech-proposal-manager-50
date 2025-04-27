
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Plus, Minus, Trash2, Calculator, Save, Download, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useOrders, EquipmentPart } from '@/context/OrderContext';
import Header from '@/components/layout/Header';

const CommercialProposal = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { 
    getOrderById, 
    getAllEquipment, 
    createCommercialProposal,
    downloadProposalAsTxt,
    downloadProposalAsWord,
    getEmployeeList
  } = useOrders();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentPart[]>([]);
  const [markup, setMarkup] = useState<number>(15);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredEquipment, setFilteredEquipment] = useState<EquipmentPart[]>([]);
  const [isProposalCreated, setIsProposalCreated] = useState<boolean>(false);
  const [calculationDone, setCalculationDone] = useState<boolean>(false);
  const [responsibleEmployee, setResponsibleEmployee] = useState<string>('');
  
  const allEquipment = getAllEquipment();
  const employees = getEmployeeList();

  useEffect(() => {
    if (!orderId) return;
    
    const order = getOrderById(orderId);
    if (!order) {
      toast({
        title: 'Заказ не найден',
        description: 'Запрашиваемый заказ не существует',
        variant: 'destructive',
      });
      navigate('/orders');
      return;
    }
    
    if (order.commercialProposal) {
      setSelectedEquipment(order.commercialProposal.equipment);
      setMarkup(order.commercialProposal.markup);
      setSubtotal(order.commercialProposal.totalCost / (1 + order.commercialProposal.markup / 100));
      setTotal(order.commercialProposal.totalCost);
      setIsProposalCreated(true);
      setCalculationDone(true);
      if (order.commercialProposal.responsibleEmployee) {
        setResponsibleEmployee(order.commercialProposal.responsibleEmployee);
      }
    }
    
    if (order.responsibleEmployee) {
      setResponsibleEmployee(order.responsibleEmployee);
    }
  }, [orderId, getOrderById, navigate, toast]);
  
  useEffect(() => {
    // Filter equipment based on search term
    const filtered = allEquipment.filter(
      eq => 
        eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.articleNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEquipment(filtered);
  }, [searchTerm, allEquipment]);

  const handleAddEquipment = (equipment: EquipmentPart) => {
    // Check if equipment is already in the list
    const existingIndex = selectedEquipment.findIndex(
      eq => eq.id === equipment.id
    );
    
    if (existingIndex >= 0) {
      // Increment quantity if already in list
      const updatedEquipment = [...selectedEquipment];
      updatedEquipment[existingIndex] = {
        ...updatedEquipment[existingIndex],
        quantity: updatedEquipment[existingIndex].quantity + 1
      };
      setSelectedEquipment(updatedEquipment);
    } else {
      // Add as new with quantity 1
      setSelectedEquipment([
        ...selectedEquipment,
        { ...equipment, quantity: 1 }
      ]);
    }
    
    setCalculationDone(false);
  };

  const handleRemoveEquipment = (id: string) => {
    setSelectedEquipment(
      selectedEquipment.filter(equipment => equipment.id !== id)
    );
    setCalculationDone(false);
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setSelectedEquipment(
      selectedEquipment.map(equipment =>
        equipment.id === id
          ? { ...equipment, quantity: newQuantity }
          : equipment
      )
    );
    
    setCalculationDone(false);
  };

  const calculateProposal = () => {
    const calculatedSubtotal = selectedEquipment.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );
    
    const calculatedTotal = calculatedSubtotal * (1 + markup / 100);
    
    setSubtotal(calculatedSubtotal);
    setTotal(calculatedTotal);
    setCalculationDone(true);
    
    toast({
      title: 'Расчет выполнен',
      description: 'Предложение успешно рассчитано',
    });
  };

  const handleCreateProposal = async () => {
    if (!orderId || !calculationDone) return;
    
    try {
      const proposal = await createCommercialProposal(
        orderId,
        selectedEquipment,
        markup,
        responsibleEmployee
      );
      
      // Fix: Check if proposal is truthy rather than testing void for truthiness
      if (proposal !== undefined && proposal !== null) {
        setIsProposalCreated(true);
        toast({
          title: 'Предложение создано',
          description: 'Коммерческое предложение успешно создано',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать коммерческое предложение',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadProposalAsWord = () => {
    if (!orderId) return;
    
    const order = getOrderById(orderId);
    if (!order || !order.commercialProposal) {
      toast({
        title: 'Предложение не найдено',
        description: 'Для данного заказа не существует предложения',
        variant: 'destructive',
      });
      return;
    }
    
    downloadProposalAsWord(order.commercialProposal.id);
  };

  const handleDownloadProposalAsTxt = () => {
    if (!orderId) return;
    
    const order = getOrderById(orderId);
    if (!order || !order.commercialProposal) {
      toast({
        title: 'Предложение не найдено',
        description: 'Для данного заказа не существует предложения',
        variant: 'destructive',
      });
      return;
    }
    
    downloadProposalAsTxt(order.commercialProposal.id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Создать коммерческое предложение" />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Equipment Selection Panel */}
          <div className="md:col-span-1">
            <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Каталог оборудования
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input
                    type="text"
                    placeholder="Поиск по названию или артикулу..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div className="h-[500px] overflow-y-auto pr-2">
                  {filteredEquipment.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                      Оборудование не найдено
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {filteredEquipment.map((equipment) => (
                        <motion.li
                          key={equipment.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="p-3 rounded-lg border border-gray-200 flex justify-between items-center hover:border-blue-300 hover:bg-blue-50 transition-colors"
                        >
                          <div>
                            <p className="font-medium">{equipment.name}</p>
                            <p className="text-xs text-gray-500">
                              {equipment.articleNumber}
                            </p>
                            <p className="text-sm mt-1">
                              ${equipment.price.toFixed(2)}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddEquipment(equipment)}
                            disabled={isProposalCreated}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Proposal Builder */}
          <div className="md:col-span-2">
            <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Детали предложения</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <Label htmlFor="markup" className="mb-2 block">
                      Процент наценки (%)
                    </Label>
                    <Input
                      id="markup"
                      type="number"
                      min="0"
                      max="100"
                      value={markup}
                      onChange={(e) => {
                        setMarkup(Number(e.target.value));
                        setCalculationDone(false);
                      }}
                      className="w-full"
                      disabled={isProposalCreated}
                    />
                  </div>
                  <div>
                    <Label htmlFor="employee" className="mb-2 block">
                      Ответственный сотрудник
                    </Label>
                    <Select
                      value={responsibleEmployee}
                      onValueChange={(value) => setResponsibleEmployee(value)}
                      disabled={isProposalCreated}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Выберите сотрудника" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee} value={employee}>
                            {employee}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Выбранное оборудование</h3>
                  
                  {selectedEquipment.length === 0 ? (
                    <div className="text-center py-8 border rounded-lg border-dashed border-gray-300">
                      <p className="text-gray-500">
                        В предложение еще не добавлено оборудование
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Товар</TableHead>
                          <TableHead>Цена</TableHead>
                          <TableHead>Количество</TableHead>
                          <TableHead>Подытог</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedEquipment.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-xs text-gray-500">
                                  {item.articleNumber}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>${item.price.toFixed(2)}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => 
                                    handleQuantityChange(item.id, item.quantity - 1)
                                  }
                                  disabled={item.quantity <= 1 || isProposalCreated}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => 
                                    handleQuantityChange(item.id, item.quantity + 1)
                                  }
                                  disabled={isProposalCreated}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              ${(item.price * item.quantity).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleRemoveEquipment(item.id)}
                                disabled={isProposalCreated}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Подытог без НДС:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">
                      Наценка ({markup}%):
                    </span>
                    <span>${(subtotal * markup / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">НДС (20%):</span>
                    <span>${(subtotal * (1 + markup / 100) * 0.2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Итого с НДС:</span>
                    <span>${(total * 1.2).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4 bg-gray-50">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/orders/${orderId}`)}
                  >
                    Назад
                  </Button>
                  
                  {isProposalCreated && (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleDownloadProposalAsTxt}
                        className="flex items-center"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Скачать в TXT
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={handleDownloadProposalAsWord}
                        className="flex items-center"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Скачать в Word
                      </Button>
                    </>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  {!isProposalCreated && (
                    <>
                      <Button
                        variant="outline"
                        onClick={calculateProposal}
                        disabled={selectedEquipment.length === 0}
                        className="flex items-center"
                      >
                        <Calculator className="mr-2 h-4 w-4" />
                        Рассчитать
                      </Button>
                      
                      <Button
                        onClick={handleCreateProposal}
                        disabled={!calculationDone || selectedEquipment.length === 0 || !responsibleEmployee}
                        className="flex items-center"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Создать предложение
                      </Button>
                    </>
                  )}
                </div>
              </CardFooter>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default CommercialProposal;
