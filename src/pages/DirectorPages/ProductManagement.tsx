import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, Search, Edit, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { useAuth, UserRole } from '@/context/AuthContext';
import { useOrders, EquipmentPart } from '@/context/OrderContext';
import Header from '@/components/layout/Header';
import { useNavigate } from 'react-router-dom';

const ProductManagement = () => {
  const { getAllEquipment, addNewEquipment } = useOrders();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Add id to the new product form
  const [newProduct, setNewProduct] = useState({
    id: '',  // Add ID field
    name: '',
    articleNumber: '',
    price: 0,
    availableQuantity: 0,
    location: '',
    quantity: 1 // Количество по умолчанию для нового оборудования
  });
  
  // Проверка, является ли пользователь директором
  React.useEffect(() => {
    if (user?.role !== UserRole.DIRECTOR) {
      navigate('/dashboard');
      toast({
        title: 'Доступ запрещен',
        description: 'У вас нет прав для доступа к этой странице',
        variant: 'destructive',
      });
    }
  }, [user, navigate, toast]);
  
  const allEquipment = getAllEquipment();
  
  // Фильтрация оборудования на основе поискового запроса
  const filteredEquipment = allEquipment.filter(
    eq => 
      eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.articleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.location.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleOpenAddDialog = () => {
    setIsAddDialogOpen(true);
  };
  
  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false);
    setNewProduct({
      id: '',  // Add ID field
      name: '',
      articleNumber: '',
      price: 0,
      availableQuantity: 0,
      location: '',
      quantity: 1
    });
  };
  
  const handleAddNewProduct = () => {
    // Валидация
    if (!newProduct.name.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Название продукта не может быть пустым',
        variant: 'destructive',
      });
      return;
    }
    
    if (!newProduct.articleNumber.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Артикул не может быть пустым',
        variant: 'destructive',
      });
      return;
    }
    
    if (newProduct.price <= 0) {
      toast({
        title: 'Ошибка',
        description: 'Цена должна быть больше 0',
        variant: 'destructive',
      });
      return;
    }
    
    if (newProduct.availableQuantity < 0) {
      toast({
        title: 'Ошибка',
        description: 'Количество не может быть отрицательным',
        variant: 'destructive',
      });
      return;
    }
    
    // Generate a random ID for the new product
    const productWithId = {
      ...newProduct,
      id: Math.random().toString(36).substring(2, 11) // Generate a random ID
    };
    
    // Добавление нового продукта
    addNewEquipment(productWithId);
    handleCloseAddDialog();
  };
  
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Управление продуктами" />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Поиск продуктов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button 
            onClick={handleOpenAddDialog}
            className="flex items-center whitespace-nowrap"
          >
            <Plus className="mr-2 h-4 w-4" />
            Добавить продукт
          </Button>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-none shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Каталог продуктов
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredEquipment.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">Товары не найдены</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'Попробуйте изменить критерии поиска' : 'В каталоге еще нет товаров'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Название</TableHead>
                        <TableHead>Артикул</TableHead>
                        <TableHead>Цена</TableHead>
                        <TableHead>Доступное кол-во</TableHead>
                        <TableHead>Расположение</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEquipment.map((equipment) => (
                        <TableRow key={equipment.id}>
                          <TableCell className="font-medium">{equipment.name}</TableCell>
                          <TableCell>{equipment.articleNumber}</TableCell>
                          <TableCell>{formatPrice(equipment.price)}</TableCell>
                          <TableCell>{equipment.availableQuantity}</TableCell>
                          <TableCell>{equipment.location}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Диалог добавления продукта */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Добавить новый продукт</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Название
              </Label>
              <Input
                id="name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="articleNumber" className="text-right">
                Артикул
              </Label>
              <Input
                id="articleNumber"
                value={newProduct.articleNumber}
                onChange={(e) => setNewProduct({...newProduct, articleNumber: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Цена ($)
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Количество
              </Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={newProduct.availableQuantity}
                onChange={(e) => setNewProduct({...newProduct, availableQuantity: parseInt(e.target.value)})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Расположение
              </Label>
              <Input
                id="location"
                placeholder="Секция A, Полка 1"
                value={newProduct.location}
                onChange={(e) => setNewProduct({...newProduct, location: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseAddDialog}>
              <X className="mr-2 h-4 w-4" />
              Отмена
            </Button>
            <Button onClick={handleAddNewProduct}>
              <Save className="mr-2 h-4 w-4" />
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManagement;
