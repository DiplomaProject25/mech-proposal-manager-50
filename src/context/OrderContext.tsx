
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth, UserRole } from './AuthContext';

// Define order status types
export enum OrderStatus {
  NEW = 'new',
  PROPOSAL_CREATED = 'proposal_created',
  REJECTED = 'rejected',
  READY_FOR_DEVELOPMENT = 'ready_for_development',
  IN_PROGRESS = 'in_progress',
  ASSEMBLY = 'assembly',
  PURCHASING = 'purchasing',
  COMPLETED = 'completed'
}

// Equipment/parts interface
export interface EquipmentPart {
  id: string;
  name: string;
  articleNumber: string;
  price: number;
  quantity: number;
  availableQuantity: number;
  location: string; // warehouse location
}

// Commercial proposal interface
export interface CommercialProposal {
  id: string;
  orderId: string;
  equipment: EquipmentPart[];
  markup: number; // percentage
  totalCost: number;
  createdAt: Date;
}

// Order interface
export interface Order {
  id: string;
  clientName: string;
  description: string;
  status: OrderStatus;
  assignedTo: string | null; // User ID of constructor assigned to the order
  commercialProposal: CommercialProposal | null;
  createdAt: Date;
  updatedAt: Date;
}

// Context interface
interface OrderContextType {
  orders: Order[];
  filteredOrders: Order[];
  currentOrder: Order | null;
  setCurrentOrder: (order: Order | null) => void;
  loading: boolean;
  error: string | null;
  createOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'assignedTo' | 'commercialProposal'>) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, assignTo?: string | null) => void;
  createCommercialProposal: (orderId: string, equipment: EquipmentPart[], markup: number) => void;
  getOrderById: (id: string) => Order | null;
  getAllEquipment: () => EquipmentPart[];
  getEquipmentByArticle: (articleNumber: string) => EquipmentPart | null;
  updateEquipmentInventory: (equipmentIds: string[], quantities: number[]) => void;
  downloadProposalAsTxt: (proposalId: string) => void;
}

// Create context
const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Mock equipment/parts data
const MOCK_EQUIPMENT: EquipmentPart[] = [
  {
    id: 'e1',
    name: 'Hydraulic Pump',
    articleNumber: 'HP-2023',
    price: 1200,
    quantity: 1,
    availableQuantity: 5,
    location: 'Section A, Shelf 3'
  },
  {
    id: 'e2',
    name: 'Control Valve',
    articleNumber: 'CV-4056',
    price: 450,
    quantity: 2,
    availableQuantity: 12,
    location: 'Section B, Shelf 1'
  },
  {
    id: 'e3',
    name: 'Electric Motor',
    articleNumber: 'EM-7890',
    price: 2500,
    quantity: 1,
    availableQuantity: 3,
    location: 'Section C, Shelf 4'
  },
  {
    id: 'e4',
    name: 'Pressure Gauge',
    articleNumber: 'PG-3421',
    price: 150,
    quantity: 4,
    availableQuantity: 20,
    location: 'Section A, Shelf 2'
  },
  {
    id: 'e5',
    name: 'Steel Frame',
    articleNumber: 'SF-1010',
    price: 850,
    quantity: 1,
    availableQuantity: 7,
    location: 'Section D, Shelf 1'
  }
];

// Mock orders
const MOCK_ORDERS: Order[] = [
  {
    id: 'o1',
    clientName: 'Acme Industries',
    description: 'Industrial hydraulic system with pressure control',
    status: OrderStatus.NEW,
    assignedTo: null,
    commercialProposal: null,
    createdAt: new Date(2023, 6, 15),
    updatedAt: new Date(2023, 6, 15)
  },
  {
    id: 'o2',
    clientName: 'Tech Solutions',
    description: 'Automated assembly line components',
    status: OrderStatus.PROPOSAL_CREATED,
    assignedTo: null,
    commercialProposal: {
      id: 'cp1',
      orderId: 'o2',
      equipment: [MOCK_EQUIPMENT[0], MOCK_EQUIPMENT[2]],
      markup: 15,
      totalCost: 4255, // (1200 + 2500) * 1.15
      createdAt: new Date(2023, 6, 20)
    },
    createdAt: new Date(2023, 6, 18),
    updatedAt: new Date(2023, 6, 20)
  },
  {
    id: 'o3',
    clientName: 'Global Manufacturing',
    description: 'Custom CNC machine parts',
    status: OrderStatus.READY_FOR_DEVELOPMENT,
    assignedTo: null,
    commercialProposal: {
      id: 'cp2',
      orderId: 'o3',
      equipment: [MOCK_EQUIPMENT[1], MOCK_EQUIPMENT[3], MOCK_EQUIPMENT[4]],
      markup: 20,
      totalCost: 1920, // (450*2 + 150*4 + 850) * 1.2
      createdAt: new Date(2023, 6, 25)
    },
    createdAt: new Date(2023, 6, 22),
    updatedAt: new Date(2023, 6, 26)
  }
];

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [equipment, setEquipment] = useState<EquipmentPart[]>(MOCK_EQUIPMENT);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Filtered orders based on user role
  const filteredOrders = React.useMemo(() => {
    if (!user) return [];
    
    if (user.role === UserRole.DIRECTOR) {
      // Directors see all orders
      return orders;
    } else if (user.role === UserRole.CONSTRUCTOR) {
      // Constructors see only orders ready for development or assigned to them
      return orders.filter(
        order => 
          order.status === OrderStatus.READY_FOR_DEVELOPMENT ||
          order.assignedTo === user.id
      );
    }
    
    return [];
  }, [orders, user]);

  // Create a new order
  const createOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'assignedTo' | 'commercialProposal'>) => {
    setLoading(true);
    try {
      const newOrder: Order = {
        id: `o${orders.length + 1}`,
        ...orderData,
        status: OrderStatus.NEW,
        assignedTo: null,
        commercialProposal: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setOrders(prevOrders => [...prevOrders, newOrder]);
      
      toast({
        title: 'Order Created',
        description: `New order for ${orderData.clientName} has been created`,
      });
    } catch (err) {
      setError('Failed to create order');
      toast({
        title: 'Error',
        description: 'Failed to create order',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = (orderId: string, status: OrderStatus, assignTo: string | null = null) => {
    setLoading(true);
    try {
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId
            ? { 
                ...order, 
                status, 
                assignedTo: assignTo !== undefined ? assignTo : order.assignedTo,
                updatedAt: new Date() 
              }
            : order
        )
      );
      
      toast({
        title: 'Status Updated',
        description: `Order status changed to ${status.replace('_', ' ')}`,
      });
    } catch (err) {
      setError('Failed to update order status');
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Create commercial proposal
  const createCommercialProposal = (orderId: string, selectedEquipment: EquipmentPart[], markup: number) => {
    setLoading(true);
    try {
      // Calculate total cost with markup
      const subtotal = selectedEquipment.reduce(
        (total, item) => total + (item.price * item.quantity), 
        0
      );
      const totalCost = subtotal * (1 + markup / 100);
      
      const proposal: CommercialProposal = {
        id: `cp${Date.now()}`,
        orderId,
        equipment: selectedEquipment,
        markup,
        totalCost,
        createdAt: new Date()
      };
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId
            ? { 
                ...order, 
                commercialProposal: proposal,
                status: OrderStatus.PROPOSAL_CREATED,
                updatedAt: new Date() 
              }
            : order
        )
      );
      
      toast({
        title: 'Proposal Created',
        description: `Commercial proposal created successfully`,
      });
      
      return proposal;
    } catch (err) {
      setError('Failed to create commercial proposal');
      toast({
        title: 'Error',
        description: 'Failed to create commercial proposal',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get order by ID
  const getOrderById = (id: string): Order | null => {
    return orders.find(order => order.id === id) || null;
  };

  // Get all equipment
  const getAllEquipment = (): EquipmentPart[] => {
    return equipment;
  };

  // Get equipment by article number
  const getEquipmentByArticle = (articleNumber: string): EquipmentPart | null => {
    return equipment.find(eq => eq.articleNumber === articleNumber) || null;
  };

  // Update equipment inventory
  const updateEquipmentInventory = (equipmentIds: string[], quantities: number[]) => {
    setLoading(true);
    try {
      setEquipment(prevEquipment => 
        prevEquipment.map(item => {
          const index = equipmentIds.indexOf(item.id);
          if (index !== -1) {
            return {
              ...item,
              availableQuantity: Math.max(0, item.availableQuantity - quantities[index])
            };
          }
          return item;
        })
      );
      
      toast({
        title: 'Inventory Updated',
        description: 'Equipment inventory has been updated',
      });
    } catch (err) {
      setError('Failed to update inventory');
      toast({
        title: 'Error',
        description: 'Failed to update inventory',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Download proposal as text file
  const downloadProposalAsTxt = (proposalId: string) => {
    try {
      // Find the order with the given proposal
      const order = orders.find(o => o.commercialProposal?.id === proposalId);
      
      if (!order || !order.commercialProposal) {
        throw new Error('Proposal not found');
      }
      
      // Create proposal text content
      const proposal = order.commercialProposal;
      const date = proposal.createdAt.toLocaleDateString();
      
      let content = `COMMERCIAL PROPOSAL\n`;
      content += `=====================================\n\n`;
      content += `Date: ${date}\n`;
      content += `Client: ${order.clientName}\n`;
      content += `Order ID: ${order.id}\n\n`;
      content += `Description: ${order.description}\n\n`;
      content += `EQUIPMENT AND PARTS:\n`;
      content += `-------------------------------------\n`;
      
      proposal.equipment.forEach((item, index) => {
        content += `${index + 1}. ${item.name} (${item.articleNumber})\n`;
        content += `   Quantity: ${item.quantity}\n`;
        content += `   Price per unit: $${item.price.toFixed(2)}\n`;
        content += `   Subtotal: $${(item.price * item.quantity).toFixed(2)}\n\n`;
      });
      
      content += `-------------------------------------\n`;
      content += `Subtotal: $${(proposal.totalCost / (1 + proposal.markup / 100)).toFixed(2)}\n`;
      content += `Markup: ${proposal.markup}%\n`;
      content += `TOTAL: $${proposal.totalCost.toFixed(2)}\n\n`;
      content += `=====================================\n`;
      content += `Thank you for your business!\n`;
      
      // Create and download the file
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `proposal_${proposalId}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Proposal Downloaded',
        description: 'Commercial proposal has been downloaded as a text file',
      });
    } catch (err) {
      setError('Failed to download proposal');
      toast({
        title: 'Error',
        description: 'Failed to download proposal',
        variant: 'destructive',
      });
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        filteredOrders,
        currentOrder,
        setCurrentOrder,
        loading,
        error,
        createOrder,
        updateOrderStatus,
        createCommercialProposal,
        getOrderById,
        getAllEquipment,
        getEquipmentByArticle,
        updateEquipmentInventory,
        downloadProposalAsTxt
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

// Custom hook to use the order context
export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
