
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Search, Filter, ArrowDownUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useOrders, EquipmentPart } from '@/context/OrderContext';
import Header from '@/components/layout/Header';

const Equipment = () => {
  const { getAllEquipment } = useOrders();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof EquipmentPart>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Get all equipment from the context
  const equipment = getAllEquipment();
  
  // Filter equipment based on search query
  const filteredEquipment = equipment.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.articleNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Sort the filtered equipment
  const sortedEquipment = [...filteredEquipment].sort((a, b) => {
    const fieldA = a[sortField];
    const fieldB = b[sortField];
    
    if (typeof fieldA === 'string' && typeof fieldB === 'string') {
      return sortDirection === 'asc' 
        ? fieldA.localeCompare(fieldB)
        : fieldB.localeCompare(fieldA);
    } else if (typeof fieldA === 'number' && typeof fieldB === 'number') {
      return sortDirection === 'asc' 
        ? fieldA - fieldB 
        : fieldB - fieldA;
    }
    
    return 0;
  });
  
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Equipment Inventory" />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-semibold">
                <span className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Equipment Inventory
                </span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Search equipment..."
                    className="pl-9 w-[250px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Filter className="h-4 w-4" />
                      <span>Sort</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSortField('name')}>
                      Name
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortField('articleNumber')}>
                      Article Number
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortField('price')}>
                      Price
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortField('availableQuantity')}>
                      Quantity
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleSortDirection}
                  className="gap-1"
                >
                  <ArrowDownUp className={`h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                  <span>{sortDirection === 'asc' ? 'Asc' : 'Desc'}</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Part Name
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Article #
                      </th>
                      <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Available
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedEquipment.map((item) => (
                      <tr 
                        key={item.id} 
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-4 whitespace-nowrap">
                          {item.name}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap font-mono text-sm">
                          {item.articleNumber}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap text-right">
                          ${item.price.toFixed(2)}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap text-right">
                          <span className={item.availableQuantity > 0 ? 'text-green-600' : 'text-red-600'}>
                            {item.availableQuantity}
                          </span>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          {item.location}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {sortedEquipment.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No equipment found matching your search criteria.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Equipment;
