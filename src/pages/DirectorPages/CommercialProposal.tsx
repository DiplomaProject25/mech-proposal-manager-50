
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash, ChevronLeft, FileText, Calculator, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useOrders, OrderStatus, EquipmentPart } from '@/context/OrderContext';
import Header from '@/components/layout/Header';
import { PartsCatalog } from '@/components/commercial/PartsCatalog';

interface ProposalForm {
  orderId: string;
  tax: number;
  markup: number;
  selectedParts: EquipmentPart[];
  totalCost: number;
}

const CommercialProposal = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { getOrderById, createCommercialProposal } = useOrders();
  const { toast } = useToast();
  
  const [form, setForm] = useState<ProposalForm>({
    orderId: orderId || '',
    tax: 20,
    markup: 15,
    selectedParts: [],
    totalCost: 0,
  });
  const [showPartsCatalog, setShowPartsCatalog] = useState(false);

  const order = orderId ? getOrderById(orderId) : null;

  useEffect(() => {
    if (!order || !order.commercialProposal) return;
    
    // If order already has a proposal, populate the form with it
    setForm({
      orderId: order.id,
      tax: 20,
      markup: order.commercialProposal.markup || 15,
      selectedParts: [...order.commercialProposal.equipment],
      totalCost: order.commercialProposal.totalCost || 0,
    });
  }, [order]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prevForm => ({ ...prevForm, [name]: value }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prevForm => ({ ...prevForm, [name]: parseFloat(value) || 0 }));
  };

  const handlePartSelect = (parts: EquipmentPart[]) => {
    setForm(prevForm => ({
      ...prevForm,
      selectedParts: [...parts]
    }));
    setShowPartsCatalog(false);
  };

  const handleRemovePart = (articleNumber: string) => {
    setForm(prevForm => ({
      ...prevForm,
      selectedParts: prevForm.selectedParts.filter(part => part.articleNumber !== articleNumber)
    }));
  };

  const handleQuantityChange = (articleNumber: string, quantity: number) => {
    setForm(prevForm => ({
      ...prevForm,
      selectedParts: prevForm.selectedParts.map(part => 
        part.articleNumber === articleNumber ? { ...part, quantity } : part
      )
    }));
  };

  const handleDeliveryTimeChange = (articleNumber: string, deliveryTime: string) => {
    setForm(prevForm => ({
      ...prevForm,
      selectedParts: prevForm.selectedParts.map(part => 
        part.articleNumber === articleNumber ? { ...part, deliveryTime } : part
      )
    }));
  };

  const calculateTotal = () => {
    // Calculate subtotal of parts
    const subtotal = form.selectedParts.reduce(
      (total, item) => total + (item.price * item.quantity), 
      0
    );
    
    // Apply markup
    const markupAmount = subtotal * (form.markup / 100);
    
    // Calculate tax
    const taxAmount = (subtotal + markupAmount) * (form.tax / 100);
    
    // Final total
    const total = subtotal + markupAmount + taxAmount;
    
    setForm(prevForm => ({
      ...prevForm,
      totalCost: total
    }));
    
    toast({
      title: "Расчет выполнен",
      description: `Итоговая стоимость: $${total.toFixed(2)}`,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.selectedParts.length === 0) {
      toast({
        title: "Ошибка",
        description: "Добавьте хотя бы одну деталь в предложение",
        variant: "destructive",
      });
      return;
    }
    
    // Default value for company markup is 10%
    createCommercialProposal(
      form.orderId,
      form.selectedParts,
      form.markup,
      '',
      10
    );
    
    navigate(`/orders/${form.orderId}`);
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Заказ не найден</h2>
              <p className="text-gray-500 mb-4">
                Заказ, для которого вы хотите создать предложение, не существует.
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Создание коммерческого предложения" />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(`/orders/${orderId}`)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Вернуться к заказу
          </Button>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-xl">
                <FileText className="mr-2 h-5 w-5" />
                Коммерческое предложение для заказа #{form.orderId}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="tax">НДС (%)</Label>
                    <Input
                      id="tax"
                      name="tax"
                      type="number"
                      min="0"
                      max="100"
                      value={form.tax}
                      onChange={handleNumberInputChange}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="markup">Наценка (%)</Label>
                    <Input
                      id="markup"
                      name="markup"
                      type="number"
                      min="0"
                      max="200"
                      value={form.markup}
                      onChange={handleNumberInputChange}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Заказ</h3>
                    <Button
                      type="button"
                      onClick={() => setShowPartsCatalog(true)}
                      className="flex items-center"
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Добавить
                    </Button>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Наименование</TableHead>
                          <TableHead>Артикул</TableHead>
                          <TableHead>Количество</TableHead>
                          <TableHead>Цена</TableHead>
                          <TableHead>Срок доставки</TableHead>
                          <TableHead>Итого</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {form.selectedParts.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                              Нет выбранных деталей. Нажмите "Добавить", чтобы выбрать детали из каталога.
                            </TableCell>
                          </TableRow>
                        ) : (
                          form.selectedParts.map((part) => (
                            <TableRow key={part.articleNumber}>
                              <TableCell>{part.name}</TableCell>
                              <TableCell className="font-mono text-sm">{part.articleNumber}</TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="1"
                                  value={part.quantity}
                                  onChange={(e) => handleQuantityChange(part.articleNumber, parseInt(e.target.value) || 1)}
                                  className="w-20"
                                />
                              </TableCell>
                              <TableCell>${part.price.toFixed(2)}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                                  <Input
                                    placeholder="7-10 дней"
                                    value={part.deliveryTime || ''}
                                    onChange={(e) => handleDeliveryTimeChange(part.articleNumber, e.target.value)}
                                    className="w-28"
                                  />
                                </div>
                              </TableCell>
                              <TableCell>${(part.price * part.quantity).toFixed(2)}</TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemovePart(part.articleNumber)}
                                >
                                  <Trash className="h-4 w-4 text-red-500" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                <div className="flex justify-between items-start">
                  <Button 
                    type="button" 
                    onClick={calculateTotal}
                    className="flex items-center"
                    disabled={form.selectedParts.length === 0}
                  >
                    <Calculator className="mr-1 h-4 w-4" />
                    Рассчитать стоимость
                  </Button>
                  
                  <div className="text-right space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 mr-8">Подытог:</span>
                      <span className="font-medium">${form.selectedParts.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 mr-8">Наценка ({form.markup}%):</span>
                      <span className="font-medium">${(form.selectedParts.reduce((total, item) => total + (item.price * item.quantity), 0) * (form.markup / 100)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 mr-8">НДС ({form.tax}%):</span>
                      <span className="font-medium">${((form.selectedParts.reduce((total, item) => total + (item.price * item.quantity), 0) * (1 + form.markup / 100)) * (form.tax / 100)).toFixed(2)}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex justify-between">
                        <span className="text-md font-semibold mr-8">Итого с НДС:</span>
                        <span className="text-xl font-semibold">${form.totalCost.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={form.selectedParts.length === 0 || form.totalCost === 0}>
                    Создать предложение
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      
      {showPartsCatalog && (
        <PartsCatalog
          isOpen={showPartsCatalog} 
          onClose={() => setShowPartsCatalog(false)}
          onSelect={handlePartSelect}
          initialSelection={form.selectedParts}
        />
      )}
    </div>
  );
};

export default CommercialProposal;
