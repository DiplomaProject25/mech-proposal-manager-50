
import React, { useState } from 'react';
import { Search, Plus, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface Part {
  id: string;
  name: string;
  articleNumber: string;
  price: number;
  quantity: number;
}

interface PartsCatalogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (parts: Part[]) => void;
  initialSelection?: Part[];
}

// Mock data for the parts catalog
const MOCK_PARTS: Part[] = [
  { id: 'p1', name: 'Процессор Intel Core i7', articleNumber: 'CPU-i7-11700', price: 25000, quantity: 1 },
  { id: 'p2', name: 'Материнская плата ASUS ROG', articleNumber: 'MB-ASUS-ROG-Z590', price: 18000, quantity: 1 },
  { id: 'p3', name: 'Видеокарта NVIDIA RTX 3080', articleNumber: 'GPU-RTX-3080', price: 85000, quantity: 1 },
  { id: 'p4', name: 'Оперативная память Kingston 16GB', articleNumber: 'RAM-KGN-16G', price: 7500, quantity: 1 },
  { id: 'p5', name: 'SSD Samsung 1TB', articleNumber: 'SSD-SM-1TB', price: 12000, quantity: 1 },
  { id: 'p6', name: 'Блок питания Corsair 850W', articleNumber: 'PSU-CRS-850', price: 9500, quantity: 1 },
  { id: 'p7', name: 'Корпус Cooler Master', articleNumber: 'CASE-CLM-MB311', price: 6800, quantity: 1 },
  { id: 'p8', name: 'Кулер CPU Noctua', articleNumber: 'COOL-NCT-NH15', price: 5200, quantity: 1 },
  { id: 'p9', name: 'Монитор Dell 27"', articleNumber: 'MON-DELL-S2721', price: 21000, quantity: 1 },
  { id: 'p10', name: 'Клавиатура Logitech', articleNumber: 'KEY-LGT-G915', price: 8900, quantity: 1 },
];

export const PartsCatalog: React.FC<PartsCatalogProps> = ({ isOpen, onClose, onSelect, initialSelection = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParts, setSelectedParts] = useState<Part[]>(initialSelection || []);
  
  const filteredParts = MOCK_PARTS.filter(part => 
    part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.articleNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePartSelect = (part: Part) => {
    const isSelected = selectedParts.some(p => p.articleNumber === part.articleNumber);
    if (isSelected) {
      setSelectedParts(selectedParts.filter(p => p.articleNumber !== part.articleNumber));
    } else {
      setSelectedParts([...selectedParts, part]);
    }
  };
  
  const handleConfirm = () => {
    onSelect(selectedParts);
    onClose();
  };
  
  return (
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
                <TableHead>Цена</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParts.length > 0 ? (
                filteredParts.map((part) => {
                  const isSelected = selectedParts.some(p => p.articleNumber === part.articleNumber);
                  
                  return (
                    <TableRow key={part.id} className={isSelected ? 'bg-blue-50' : ''}>
                      <TableCell>
                        {isSelected && <Check className="h-4 w-4 text-blue-500" />}
                      </TableCell>
                      <TableCell className="font-medium">{part.name}</TableCell>
                      <TableCell className="font-mono text-sm">{part.articleNumber}</TableCell>
                      <TableCell>${part.price.toFixed(2)}</TableCell>
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
  );
};

// Add a default export to match the import in CommercialProposal.tsx
export default PartsCatalog;
