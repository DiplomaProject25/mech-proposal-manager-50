
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from '@/hooks/use-toast';
import { useOrders, OrderStatus } from '@/context/OrderContext';
import Header from '@/components/layout/Header';

interface CommercialProposalForm {
  title: string;
  description: string;
  price: number;
  duration: string;
  status: OrderStatus;
}

const CommercialProposal = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateOrderStatus } = useOrders();
  const [form, setForm] = useState<CommercialProposalForm>({
    title: '',
    description: '',
    price: 0,
    duration: '',
    status: OrderStatus.PROPOSAL_CREATED,
  });

  useEffect(() => {
    if (orderId) {
      // You can fetch order details here if needed
      // and pre-populate the form
    }
  }, [orderId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prevForm => ({ ...prevForm, [name]: value }));
  };

  const handleStatusChange = (status: OrderStatus) => {
    setForm(prevForm => ({ ...prevForm, status: status }));
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

    try {
      // Optimistically update the order status
      updateOrderStatus(orderId, form.status);

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
          <Card className="border-none shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold">
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
                
                <div>
                  <Label htmlFor="price">Цена</Label>
                  <Input
                    type="number"
                    id="price"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="Укажите цену"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="duration">Срок выполнения</Label>
                  <Input
                    type="text"
                    id="duration"
                    name="duration"
                    value={form.duration}
                    onChange={handleChange}
                    placeholder="Укажите срок выполнения"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="status">Статус заказа</Label>
                  <Select onValueChange={(value) => handleStatusChange(value as OrderStatus)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(OrderStatus).map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button type="submit" className="w-full">
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
