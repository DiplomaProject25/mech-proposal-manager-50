
import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Part {
  id: string;
  name: string;
  articleNumber: string;
  price: number;
  quantity: number;
}

interface PartsCatalogProps {
  onAddPart: (part: Part) => void;
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

export const PartsCatalog: React.FC<PartsCatalogProps> = ({ onAddPart }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredParts = MOCK_PARTS.filter(part => 
    part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.articleNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Каталог запчастей</h3>
      
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Поиск по названию или артикулу..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Наименование</TableHead>
              <TableHead>Артикул</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredParts.length > 0 ? (
              filteredParts.map((part) => (
                <TableRow key={part.id}>
                  <TableCell className="font-medium">{part.name}</TableCell>
                  <TableCell className="font-mono text-sm">{part.articleNumber}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => onAddPart(part)}
                      className="h-8"
                    >
                      <Plus className="mr-1 h-4 w-4" /> Добавить
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                  Запчасти не найдены
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
