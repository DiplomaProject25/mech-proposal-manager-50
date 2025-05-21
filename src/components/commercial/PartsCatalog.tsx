
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Search, Check, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useOrders, EquipmentPart } from '@/context/OrderContext';

export const PartsCatalog = ({
  isOpen,
  onClose,
  onSelect,
  initialSelection = []
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (parts: EquipmentPart[]) => void;
  initialSelection?: EquipmentPart[];
}) => {
  const { getAllEquipment } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParts, setSelectedParts] = useState<EquipmentPart[]>(initialSelection);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  
  // Get all parts from the context
  const allParts = getAllEquipment();
  
  // Filter parts based on search term
  const filteredParts = allParts.filter(part =>
    part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.articleNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  useEffect(() => {
    // Initialize quantities based on initial selection
    const initialQuantities: Record<string, number> = {};
    initialSelection.forEach(part => {
      initialQuantities[part.articleNumber] = part.quantity;
    });
    setQuantities(initialQuantities);
  }, [initialSelection]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const isPartSelected = (articleNumber: string) => {
    return selectedParts.some(part => part.articleNumber === articleNumber);
  };
  
  const handleTogglePart = (part: EquipmentPart) => {
    if (isPartSelected(part.articleNumber)) {
      setSelectedParts(prev => prev.filter(p => p.articleNumber !== part.articleNumber));
      
      // Remove quantity when deselecting
      setQuantities(prev => {
        const newQuantities = { ...prev };
        delete newQuantities[part.articleNumber];
        return newQuantities;
      });
    } else {
      setSelectedParts(prev => [...prev, { ...part, quantity: 1 }]);
      
      // Set default quantity to 1 when selecting
      setQuantities(prev => ({
        ...prev,
        [part.articleNumber]: 1
      }));
    }
  };
  
  const handleQuantityChange = (articleNumber: string, value: number) => {
    const newValue = Math.max(1, value); // Ensure quantity is at least 1
    
    setQuantities(prev => ({
      ...prev,
      [articleNumber]: newValue
    }));
    
    // Update the quantity in selectedParts as well
    setSelectedParts(prev => 
      prev.map(part => 
        part.articleNumber === articleNumber ? { ...part, quantity: newValue } : part
      )
    );
  };
  
  const handleConfirm = () => {
    // Update quantities before submitting
    const partsWithQuantities = selectedParts.map(part => ({
      ...part,
      quantity: quantities[part.articleNumber] || 1
    }));
    
    onSelect(partsWithQuantities);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Каталог оборудования и деталей</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Поиск по наименованию или артикулу"
              className="pl-9"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        
        <div className="overflow-y-auto flex-grow">
          <Table className="border">
            <TableHeader className="sticky top-0 bg-white shadow-sm">
              <TableRow>
                <TableHead>Наименование</TableHead>
                <TableHead>Артикул</TableHead>
                <TableHead>Наличие</TableHead>
                <TableHead>Количество</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    {searchTerm ? 'Ничего не найдено по вашему запросу.' : 'Список деталей пуст.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredParts.map((part) => {
                  const isSelected = isPartSelected(part.articleNumber);
                  const quantity = quantities[part.articleNumber] || 1;
                  
                  return (
                    <TableRow key={part.articleNumber} className={isSelected ? 'bg-blue-50' : ''}>
                      <TableCell className="font-medium">{part.name}</TableCell>
                      <TableCell className="font-mono">{part.articleNumber}</TableCell>
                      <TableCell>
                        {part.availableQuantity > 0 ? (
                          <span className="text-green-600">{part.availableQuantity} шт.</span>
                        ) : (
                          <span className="text-red-600">Нет в наличии</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isSelected && (
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleQuantityChange(part.articleNumber, quantity - 1)}
                              disabled={quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center">{quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleQuantityChange(part.articleNumber, quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant={isSelected ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => handleTogglePart(part)}
                        >
                          {isSelected ? (
                            <>
                              <Check className="mr-1 h-4 w-4" />
                              Выбрано
                            </>
                          ) : (
                            "Выбрать"
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t mt-4">
          <div>
            <p className="text-sm text-gray-600">
              {selectedParts.length === 0
                ? 'Нет выбранных деталей'
                : `Выбрано: ${selectedParts.length} ${
                    selectedParts.length === 1 ? 'деталь' : 
                    selectedParts.length < 5 ? 'детали' : 'деталей'
                  }`}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={selectedParts.length === 0}
            >
              Подтвердить выбор
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
