
import React, { useState } from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useOrders } from '@/context/OrderContext';
import { toast } from '@/hooks/use-toast';

interface NewOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewOrderDialog: React.FC<NewOrderDialogProps> = ({ isOpen, onClose }) => {
  const { createOrder, loading } = useOrders();
  
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientName.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Название клиента обязательно для заполнения',
        variant: 'destructive',
      });
      return;
    }
    
    if (!description.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Описание заказа обязательно для заполнения',
        variant: 'destructive',
      });
      return;
    }
    
    createOrder({
      clientName: clientName.trim(),
      description: description.trim(),
    });
    
    // Reset form and close dialog
    setClientName('');
    setDescription('');
    onClose();
  };
  
  const handleClose = () => {
    setClientName('');
    setDescription('');
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Создать новый заказ</DialogTitle>
          <DialogDescription>
            Введите информацию о клиенте и детали заказа.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="clientName" className="text-sm font-medium">
              Название клиента
            </label>
            <Input
              id="clientName"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Введите название клиента"
              className="w-full"
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Описание заказа
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Введите подробное описание заказа"
              className="w-full min-h-[100px]"
              disabled={loading}
            />
          </div>
          
          <DialogFooter className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Создание...' : 'Создать заказ'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewOrderDialog;
