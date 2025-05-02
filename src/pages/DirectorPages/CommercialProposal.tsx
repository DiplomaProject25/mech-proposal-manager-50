
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calculator, FileText, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOrders, OrderStatus } from '@/context/OrderContext';
import Header from '@/components/layout/Header';
import { PartsCatalog } from '@/components/commercial/PartsCatalog';

interface Part {
  id: string;
  name: string;
  articleNumber: string;
  price: number;
  quantity: number;
}

interface CommercialProposalForm {
  title: string;
  description: string;
  vat: number;
  markup: number;
  selectedParts: Part[];
  totalCost: number;
  status: string;
}

const CommercialProposal = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getOrderById, updateOrderStatus } = useOrders();
  const [form, setForm] = useState<CommercialProposalForm>({
    title: '',
    description: '',
    vat: 20,
    markup: 15,
    selectedParts: [],
    totalCost: 0,
    status: "PROPOSAL_CREATED",
  });
  const [showPartsCatalog, setShowPartsCatalog] = useState(false);

  useEffect(() => {
    if (orderId) {
      const order = getOrderById(orderId);
      if (order) {
        setForm(prevForm => ({
          ...prevForm,
          title: `Коммерческое предложение для ${order.clientName}`,
          description: `Предложение по заказу #${orderId}: ${order.description}`
        }));
      }
    }
  }, [orderId, getOrderById]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prevForm => ({ ...prevForm, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prevForm => ({ ...prevForm, [name]: parseFloat(value) || 0 }));
  };

  const handleStatusChange = (status: string) => {
    setForm(prevForm => ({ ...prevForm, status }));
  };

  const handleAddPart = (part: Part) => {
    setForm(prevForm => {
      const existingPartIndex = prevForm.selectedParts.findIndex(p => p.id === part.id);
      
      if (existingPartIndex >= 0) {
        // Update existing part quantity
        const updatedParts = [...prevForm.selectedParts];
        updatedParts[existingPartIndex] = {
          ...updatedParts[existingPartIndex],
          quantity: updatedParts[existingPartIndex].quantity + 1
        };
        return { ...prevForm, selectedParts: updatedParts };
      } else {
        // Add new part with quantity 1
        return {
          ...prevForm,
          selectedParts: [...prevForm.selectedParts, { ...part, quantity: 1 }]
        };
      }
    });
  };

  const handleRemovePart = (partId: string) => {
    setForm(prevForm => ({
      ...prevForm,
      selectedParts: prevForm.selectedParts.filter(part => part.id !== partId)
    }));
  };

  const handleQuantityChange = (partId: string, quantity: number) => {
    if (quantity < 1) return;

    setForm(prevForm => ({
      ...prevForm,
      selectedParts: prevForm.selectedParts.map(part => 
        part.id === partId ? { ...part, quantity } : part
      )
    }));
  };

  const calculateTotalCost = () => {
    const subtotal = form.selectedParts.reduce((sum, part) => sum + part.price * part.quantity, 0);
    const markupAmount = subtotal * (form.markup / 100);
    const vatAmount = (subtotal + markupAmount) * (form.vat / 100);
    const total = subtotal + markupAmount + vatAmount;
    
    setForm(prevForm => ({ ...prevForm, totalCost: total }));
    toast({
      title: 'Расчет выполнен',
      description: `Общая стоимость: ${total.toFixed(2)} ₽`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось получить ID заказа.',
        variant: 'destructive',
      });
      return;
    }

    if (form.selectedParts.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Добавьте хотя бы одну запчасть в предложение.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Create commercial proposal with all the data
      const proposal = {
        title: form.title,
        description: form.description,
        vat: form.vat,
        markup: form.markup,
        equipment: form.selectedParts,
        totalCost: form.totalCost,
        showPrices: true,
        createdAt: new Date().toISOString()
      };
      
      // Optimistically update the order status
      updateOrderStatus(orderId, form.status, proposal);

      toast({
        title: 'Коммерческое предложение создано!',
        description: 'Ваше предложение успешно отправлено.',
      });

      navigate('/proposals');
    } catch (error) {
      console.error('Failed to create commercial proposal:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать коммерческое предложение.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Создание Коммерческого Предложения" />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-none shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold flex items-center">
                <FileText className="mr-2 h-5 w-5 text-blue-500" />
                Создание Коммерческого Предложения
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Заголовок</Label>
                  <Input
                    type="text"
                    id="title"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Введите заголовок предложения"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Опишите детали предложения"
                    rows={4}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vat">НДС (%)</Label>
                    <Input
                      type="number"
                      id="vat"
                      name="vat"
                      value={form.vat}
                      onChange={handleNumberChange}
                      placeholder="Укажите НДС"
                      min="0"
                      max="100"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="markup">Наценка (%)</Label>
                    <Input
                      type="number"
                      id="markup"
                      name="markup"
                      value={form.markup}
                      onChange={handleNumberChange}
                      placeholder="Укажите наценку"
                      min="0"
                      max="100"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">Статус заказа</Label>
                  <Select onValueChange={(value) => handleStatusChange(value)} defaultValue={form.status}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEED_PURCHASING">NEED_PURCHASING</SelectItem>
                      <SelectItem value="PROPOSAL_CREATED">PROPOSAL_CREATED</SelectItem>
                      <SelectItem value="PENDING_APPROVAL">PENDING_APPROVAL</SelectItem>
                      <SelectItem value="APPROVED">APPROVED</SelectItem>
                      <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
                      <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {form.selectedParts.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3">Выбранные запчасти</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Наименование
                            </th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Артикул
                            </th>
                            <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Количество
                            </th>
                            <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Цена
                            </th>
                            <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Итого
                            </th>
                            <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Действия
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {form.selectedParts.map((part) => (
                            <tr key={part.id} className="border-b border-gray-100">
                              <td className="py-3 px-4">
                                {part.name}
                              </td>
                              <td className="py-3 px-4 font-mono text-sm">
                                {part.articleNumber}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end">
                                  <button
                                    type="button"
                                    className="p-1 rounded hover:bg-gray-200"
                                    onClick={() => handleQuantityChange(part.id, part.quantity - 1)}
                                  >
                                    -
                                  </button>
                                  <span className="mx-2">{part.quantity}</span>
                                  <button
                                    type="button"
                                    className="p-1 rounded hover:bg-gray-200"
                                    onClick={() => handleQuantityChange(part.id, part.quantity + 1)}
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right">
                                {part.price.toFixed(2)} ₽
                              </td>
                              <td className="py-3 px-4 text-right">
                                {(part.price * part.quantity).toFixed(2)} ₽
                              </td>
                              <td className="py-3 px-4 text-right">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemovePart(part.id)}
                                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                >
                                  Удалить
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        {form.totalCost > 0 && (
                          <tfoot>
                            <tr className="border-t border-gray-200">
                              <td colSpan={4} className="py-3 px-4 text-right font-medium">
                                Подитог:
                              </td>
                              <td colSpan={2} className="py-3 px-4 text-right font-medium">
                                {form.selectedParts.reduce((sum, part) => sum + part.price * part.quantity, 0).toFixed(2)} ₽
                              </td>
                            </tr>
                            <tr>
                              <td colSpan={4} className="py-3 px-4 text-right font-medium">
                                Наценка ({form.markup}%):
                              </td>
                              <td colSpan={2} className="py-3 px-4 text-right font-medium">
                                {(form.selectedParts.reduce((sum, part) => sum + part.price * part.quantity, 0) * (form.markup / 100)).toFixed(2)} ₽
                              </td>
                            </tr>
                            <tr>
                              <td colSpan={4} className="py-3 px-4 text-right font-medium">
                                НДС ({form.vat}%):
                              </td>
                              <td colSpan={2} className="py-3 px-4 text-right font-medium">
                                {(form.selectedParts.reduce((sum, part) => sum + part.price * part.quantity, 0) * (1 + form.markup / 100) * (form.vat / 100)).toFixed(2)} ₽
                              </td>
                            </tr>
                            <tr className="bg-gray-50 font-semibold">
                              <td colSpan={4} className="py-3 px-4 text-right">
                                Всего:
                              </td>
                              <td colSpan={2} className="py-3 px-4 text-right">
                                {form.totalCost.toFixed(2)} ₽
                              </td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPartsCatalog(!showPartsCatalog)}
                    className="flex items-center"
                  >
                    <Database className="mr-2 h-4 w-4" />
                    {showPartsCatalog ? 'Скрыть каталог запчастей' : 'Показать каталог запчастей'}
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={calculateTotalCost}
                    className="flex items-center"
                    disabled={form.selectedParts.length === 0}
                  >
                    <Calculator className="mr-2 h-4 w-4" />
                    Рассчитать
                  </Button>
                </div>
                
                {showPartsCatalog && (
                  <div className="mt-4 border rounded-md p-4">
                    <PartsCatalog onAddPart={handleAddPart} />
                  </div>
                )}
                
                <Button type="submit" className="w-full mt-6" disabled={form.selectedParts.length === 0 || form.totalCost <= 0}>
                  Создать предложение
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default CommercialProposal;
