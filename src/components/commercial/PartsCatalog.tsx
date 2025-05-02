import React, { useState } from 'react';
import { Search, Plus, Check, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

// Import EquipmentPart from OrderContext to ensure type consistency
import { EquipmentPart as OrderEquipmentPart } from '@/context/OrderContext';

// Define equipment part interface to match OrderContext exactly
export interface EquipmentPart extends OrderEquipmentPart {
  // No need to redefine properties as we're extending the original type
}

interface PartsCatalogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (parts: EquipmentPart[]) => void;
  initialSelection?: EquipmentPart[];
}

// Updated mock data with availability information
const MOCK_PARTS: EquipmentPart[] = [
  { id: 'p1', name: 'Процессор Intel Core i7', articleNumber: 'CPU-i7-11700', price: 25000, quantity: 1, availableQuantity: 5, location: 'Склад A' },
  { id: 'p2', name: 'Материнская плата ASUS ROG', articleNumber: 'MB-ASUS-ROG-Z590', price: 18000, quantity: 1, availableQuantity: 3, location: 'Склад B' },
  { id: 'p3', name: 'Видеокарта NVIDIA RTX 3080', articleNumber: 'GPU-RTX-3080', price: 85000, quantity: 1, availableQuantity: 0, location: 'Склад A' },
  { id: 'p4', name: 'Оперативная память Kingston 16GB', articleNumber: 'RAM-KGN-16G', price: 7500, quantity: 1, availableQuantity: 12, location: 'Склад A' },
  { id: 'p5', name: 'SSD Samsung 1TB', articleNumber: 'SSD-SM-1TB', price: 12000, quantity: 1, availableQuantity: 7, location: 'Склад B' },
  { id: 'p6', name: 'Блок питания Corsair 850W', articleNumber: 'PSU-CRS-850', price: 9500, quantity: 1, availableQuantity: 0, location: 'Склад C' },
  { id: 'p7', name: 'Корпус Cooler Master', articleNumber: 'CASE-CLM-MB311', price: 6800, quantity: 1, availableQuantity: 4, location: 'Склад B' },
  { id: 'p8', name: 'Кулер CPU Noctua', articleNumber: 'COOL-NCT-NH15', price: 5200, quantity: 1, availableQuantity: 8, location: 'Склад A' },
  { id: 'p9', name: 'Монитор Dell 27"', articleNumber: 'MON-DELL-S2721', price: 21000, quantity: 1, availableQuantity: 0, location: 'Склад C' },
  { id: 'p10', name: 'Клавиатура Logitech', articleNumber: 'KEY-LGT-G915', price: 8900, quantity: 1, availableQuantity: 6, location: 'Склад B' },
];

// Dialog for adding unavailable parts
interface UnavailablePartDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (partDetails: UnavailablePartDetails) => void;
  partName: string;
}

interface UnavailablePartDetails {
  weight: number;
  deliveryCost: number;
  purchasePrice: number;
  deliveryTime: string;
}

const UnavailablePartDialog: React.FC<UnavailablePartDialogProps> = ({ isOpen, onClose, onConfirm, partName }) => {
  const [details, setDetails] = useState<UnavailablePartDetails>({
    weight: 0,
    deliveryCost: 0,
    purchasePrice: 0,
    deliveryTime: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDetails(prev => ({
      ...prev,
      [name]: name === 'deliveryTime' ? value : parseFloat(value) || 0
    }));
  };

  const handleSubmit = () => {
    onConfirm(details);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Детали для заказа запчасти</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <p className="text-sm text-gray-500 mb-4">
              Запчасть "{partName}" отсутствует на складе. Пожалуйста, введите дополнительную информацию для расчета стоимости.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="weight" className="text-sm font-medium">Вес (кг)</label>
              <Input
                id="weight"
                name="weight"
                type="number"
                value={details.weight}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="deliveryCost" className="text-sm font-medium">Стоимость доставки</label>
              <Input
                id="deliveryCost"
                name="deliveryCost"
                type="number"
                value={details.deliveryCost}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="purchasePrice" className="text-sm font-medium">Стоимость закупки</label>
              <Input
                id="purchasePrice"
                name="purchasePrice"
                type="number"
                value={details.purchasePrice}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="deliveryTime" className="text-sm font-medium">Срок доставки (дни)</label>
              <Input
                id="deliveryTime"
                name="deliveryTime"
                placeholder="напр. 7-10 дней"
                value={details.deliveryTime}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={handleSubmit}>Подтвердить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const PartsCatalog: React.FC<PartsCatalogProps> = ({ isOpen, onClose, onSelect, initialSelection = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParts, setSelectedParts] = useState<EquipmentPart[]>(initialSelection || []);
  const [showUnavailableDialog, setShowUnavailableDialog] = useState(false);
  const [currentPart, setCurrentPart] = useState<EquipmentPart | null>(null);
  const { toast } = useToast();
  
  const filteredParts = MOCK_PARTS.filter(part => 
    part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.articleNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePartSelect = (part: EquipmentPart) => {
    const isSelected = selectedParts.some(p => p.articleNumber === part.articleNumber);
    
    if (isSelected) {
      setSelectedParts(selectedParts.filter(p => p.articleNumber !== part.articleNumber));
      return;
    }
    
    // Check if part is available
    if (part.availableQuantity <= 0) {
      setCurrentPart(part);
      setShowUnavailableDialog(true);
    } else {
      setSelectedParts([...selectedParts, part]);
    }
  };
  
  const handleUnavailablePartConfirm = (details: UnavailablePartDetails) => {
    if (!currentPart) return;
    
    // Calculate estimated price based on purchase price and delivery cost
    const estimatedPrice = details.purchasePrice + (details.deliveryCost / details.weight);
    
    const updatedPart: EquipmentPart = {
      ...currentPart,
      price: estimatedPrice,
      weight: details.weight,
      purchasePrice: details.purchasePrice,
      deliveryCost: details.deliveryCost,
      deliveryTime: details.deliveryTime,
    };
    
    setSelectedParts([...selectedParts, updatedPart]);
    
    toast({
      title: "Запчасть добавлена",
      description: "Расчетная стоимость запчасти добавлена в предложение.",
    });
  };
  
  const handleConfirm = () => {
    onSelect(selectedParts);
    onClose();
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Каталог запчастей</DialogTitle>
          </DialogHeader>
          
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Поиск по названию или артикулу..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="overflow-x-auto rounded-md border max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead className="w-[40%]">Наименование</TableHead>
                  <TableHead>Артикул</TableHead>
                  <TableHead>Наличие</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParts.length > 0 ? (
                  filteredParts.map((part) => {
                    const isSelected = selectedParts.some(p => p.articleNumber === part.articleNumber);
                    const isAvailable = part.availableQuantity > 0;
                    
                    return (
                      <TableRow key={part.id} className={isSelected ? 'bg-blue-50' : ''}>
                        <TableCell>
                          {isSelected && <Check className="h-4 w-4 text-blue-500" />}
                        </TableCell>
                        <TableCell className="font-medium">{part.name}</TableCell>
                        <TableCell className="font-mono text-sm">{part.articleNumber}</TableCell>
                        <TableCell>
                          {isAvailable ? (
                            <span className="text-green-600">{part.availableQuantity} шт.</span>
                          ) : (
                            <span className="text-red-600 flex items-center">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Нет в наличии
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant={isSelected ? "outline" : "default"}
                            onClick={() => handlePartSelect(part)}
                            className="h-8"
                          >
                            {isSelected ? 'Убрать' : 'Выбрать'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      Запчасти не найдены
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Выбрано деталей: {selectedParts.length}
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button onClick={handleConfirm}>
              Подтвердить выбор
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {showUnavailableDialog && currentPart && (
        <UnavailablePartDialog
          isOpen={showUnavailableDialog}
          onClose={() => setShowUnavailableDialog(false)}
          onConfirm={handleUnavailablePartConfirm}
          partName={currentPart.name}
        />
      )}
    </>
  );
};

// Add a default export to match the import in CommercialProposal.tsx
export default PartsCatalog;
