import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth, UserRole } from './AuthContext';

// Define order status types
export enum OrderStatus {
  NEW = 'новый',
  PROPOSAL_CREATED = 'предложение_создано',
  REJECTED = 'отклонен',
  READY_FOR_DEVELOPMENT = 'готов_к_разработке',
  IN_PROGRESS = 'в_процессе',
  ASSEMBLY = 'сборка',
  PURCHASING = 'закупка', 
  NEED_PURCHASING = 'необходима_закупка',
  IN_DELIVERY = 'в_пути',
  UNLOADING = 'разгрузка',
  COMPLETED = 'завершен'
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
  deliveryTime?: string; // Added for delivery time input
  weight?: number; // Added for unavailable parts
  purchasePrice?: number; // Added for unavailable parts
  deliveryCost?: number; // Added for unavailable parts
}

// Commercial proposal interface
export interface CommercialProposal {
  id: string;
  orderId: string;
  equipment: EquipmentPart[];
  markup: number; // percentage
  companyMarkup?: number; // percentage for company markup
  totalCost: number;
  createdAt: Date;
  responsibleEmployee?: string; // Name of the responsible employee
  showPrices?: boolean; // Control visibility of prices
}

// Order interface
export interface Order {
  id: string;
  clientName: string;
  description: string;
  status: OrderStatus;
  assignedTo: string | null; // User ID of constructor assigned to the order
  responsibleEmployee: string | null; // Name of the responsible employee
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
  createOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'assignedTo' | 'commercialProposal' | 'responsibleEmployee'>) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, assignTo?: string | null) => void;
  createCommercialProposal: (orderId: string, equipment: EquipmentPart[], markup: number, responsibleEmployee?: string, companyMarkup?: number) => void;
  getOrderById: (id: string) => Order | null;
  getAllEquipment: () => EquipmentPart[];
  getEquipmentByArticle: (articleNumber: string) => EquipmentPart | null;
  updateEquipmentInventory: (equipmentIds: string[], quantities: number[]) => void;
  downloadProposalAsTxt: (proposalId: string) => void;
  downloadProposalAsWord: (proposalId: string) => void;
  assignResponsibleEmployee: (orderId: string, employeeName: string) => void;
  addNewEquipment: (equipment: Omit<EquipmentPart, 'id'>) => void;
  getEmployeeList: () => string[];
  toggleProposalPrices: (orderId: string, show: boolean) => void;
  getOrdersByStatus: (status: OrderStatus | OrderStatus[]) => Order[];
  getNeededPurchaseItems: () => { part: EquipmentPart, neededQuantity: number }[];
}

// Create context
const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Mock equipment/parts data
const MOCK_EQUIPMENT: EquipmentPart[] = [
  {
    id: 'e1',
    name: 'Гидравлический насос',
    articleNumber: 'HP-2023',
    price: 1200,
    quantity: 1,
    availableQuantity: 5,
    location: 'Секция A, Полка 3'
  },
  {
    id: 'e2',
    name: 'Управляющий клапан',
    articleNumber: 'CV-4056',
    price: 450,
    quantity: 2,
    availableQuantity: 12,
    location: 'Секция B, Полка 1'
  },
  {
    id: 'e3',
    name: 'Электродвигатель',
    articleNumber: 'EM-7890',
    price: 2500,
    quantity: 1,
    availableQuantity: 3,
    location: 'Секция C, Полка 4'
  },
  {
    id: 'e4',
    name: 'Манометр',
    articleNumber: 'PG-3421',
    price: 150,
    quantity: 4,
    availableQuantity: 20,
    location: 'Секция A, Полка 2'
  },
  {
    id: 'e5',
    name: 'Стальная рама',
    articleNumber: 'SF-1010',
    price: 850,
    quantity: 1,
    availableQuantity: 7,
    location: 'Секция D, Полка 1'
  }
];

// Employee list
const EMPLOYEE_LIST = [
  'Иванов И.И.',
  'Петров П.П.',
  'Сидоров С.С.',
  'Смирнова А.В.',
  'Кузнецов К.К.'
];

// Generate realistic order ID
const generateOrderId = () => {
  const year = new Date().getFullYear().toString().slice(-2);
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `ЗКЗ-${year}${month}-${randomDigits}`;
};

// Mock orders
const MOCK_ORDERS: Order[] = [
  {
    id: 'ЗКЗ-2304-5782',
    clientName: 'ООО "Акмэ Индастриз"',
    description: 'Промышленная гидравлическая система с контролем давления',
    status: OrderStatus.NEW,
    assignedTo: null,
    responsibleEmployee: 'Иванов И.И.',
    commercialProposal: null,
    createdAt: new Date(2023, 6, 15),
    updatedAt: new Date(2023, 6, 15)
  },
  {
    id: 'ЗКЗ-2305-8431',
    clientName: 'ООО "Тех Солюшнс"',
    description: 'Компоненты для автоматизированной сборочной линии',
    status: OrderStatus.PROPOSAL_CREATED,
    assignedTo: null,
    responsibleEmployee: 'Петров П.П.',
    commercialProposal: {
      id: 'cp1',
      orderId: 'ЗКЗ-2305-8431',
      equipment: [MOCK_EQUIPMENT[0], MOCK_EQUIPMENT[2]],
      markup: 15,
      totalCost: 4255, // (1200 + 2500) * 1.15
      createdAt: new Date(2023, 6, 20),
      responsibleEmployee: 'Петров П.П.',
      showPrices: false
    },
    createdAt: new Date(2023, 6, 18),
    updatedAt: new Date(2023, 6, 20)
  },
  {
    id: 'ЗКЗ-2306-1249',
    clientName: 'АО "Глобал Мануфактуринг"',
    description: 'Изготовление деталей для станков с ЧПУ',
    status: OrderStatus.READY_FOR_DEVELOPMENT,
    assignedTo: null,
    responsibleEmployee: 'Сидоров С.С.',
    commercialProposal: {
      id: 'cp2',
      orderId: 'ЗКЗ-2306-1249',
      equipment: [MOCK_EQUIPMENT[1], MOCK_EQUIPMENT[3], MOCK_EQUIPMENT[4]],
      markup: 20,
      totalCost: 1920, // (450*2 + 150*4 + 850) * 1.2
      createdAt: new Date(2023, 6, 25),
      responsibleEmployee: 'Сидоров С.С.',
      showPrices: false
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
  const createOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'assignedTo' | 'commercialProposal' | 'responsibleEmployee'>) => {
    setLoading(true);
    try {
      const newOrderId = generateOrderId();
      
      const newOrder: Order = {
        id: newOrderId,
        ...orderData,
        status: OrderStatus.NEW,
        assignedTo: null,
        responsibleEmployee: null,
        commercialProposal: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setOrders(prevOrders => [...prevOrders, newOrder]);
      
      toast({
        title: 'Заказ создан',
        description: `Новый заказ для ${orderData.clientName} был создан`,
      });
    } catch (err) {
      setError('Не удалось создать заказ');
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать заказ',
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
        title: 'Статус обновлен',
        description: `Статус заказа изменен на ${status.replace('_', ' ')}`,
      });
    } catch (err) {
      setError('Не удалось обновить статус заказа');
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус заказа',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Toggle proposal prices visibility
  const toggleProposalPrices = (orderId: string, show: boolean) => {
    setLoading(true);
    try {
      setOrders(prevOrders => 
        prevOrders.map(order => {
          if (order.id === orderId && order.commercialProposal) {
            return {
              ...order,
              commercialProposal: {
                ...order.commercialProposal,
                showPrices: show
              }
            };
          }
          return order;
        })
      );
    } catch (err) {
      setError('Не удалось обновить отображение цен');
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить отображение цен',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Create commercial proposal
  const createCommercialProposal = (orderId: string, selectedEquipment: EquipmentPart[], markup: number, responsibleEmployee: string = '', companyMarkup: number = 0) => {
    setLoading(true);
    try {
      // Calculate total cost with markup
      const subtotal = selectedEquipment.reduce(
        (total, item) => total + (item.price * item.quantity), 
        0
      );
      const totalCost = subtotal * (1 + markup / 100 + companyMarkup / 100);
      
      const proposal: CommercialProposal = {
        id: `КП-${Date.now()}`,
        orderId,
        equipment: selectedEquipment,
        markup,
        companyMarkup,
        totalCost,
        createdAt: new Date(),
        responsibleEmployee: responsibleEmployee || null,
        showPrices: false
      };
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId
            ? { 
                ...order, 
                commercialProposal: proposal,
                status: OrderStatus.PROPOSAL_CREATED,
                responsibleEmployee: responsibleEmployee || order.responsibleEmployee,
                updatedAt: new Date() 
              }
            : order
        )
      );
      
      toast({
        title: 'Предложение создано',
        description: `Коммерческое предложение создано успешно`,
      });
      
      return proposal;
    } catch (err) {
      setError('Не удалось создать коммерческое предложение');
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать коммерческое предложение',
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
        title: 'Инвентарь обновлен',
        description: 'Инвентарь оборудования был обновлен',
      });
    } catch (err) {
      setError('Не удалось обновить инвентарь');
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить инвентарь',
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
        throw new Error('Предложение не найдено');
      }
      
      // Create proposal text content
      const proposal = order.commercialProposal;
      const date = proposal.createdAt.toLocaleDateString();
      
      let content = `КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ\n`;
      content += `=====================================\n\n`;
      content += `Дата: ${date}\n`;
      content += `Клиент: ${order.clientName}\n`;
      content += `ID Заказа: ${order.id}\n\n`;
      content += `Описание: ${order.description}\n\n`;
      content += `ОБОРУДОВАНИЕ И ДЕТАЛИ:\n`;
      content += `-------------------------------------\n`;
      
      proposal.equipment.forEach((item, index) => {
        content += `${index + 1}. ${item.name} (${item.articleNumber})\n`;
        content += `   Количество: ${item.quantity}\n`;
        if (proposal.showPrices) {
          content += `   Цена за единицу: $${item.price.toFixed(2)}\n`;
          content += `   Подитог: $${(item.price * item.quantity).toFixed(2)}\n\n`;
        } else {
          content += `   \n`;
        }
      });
      
      content += `-------------------------------------\n`;
      if (proposal.showPrices) {
        content += `Подитог: $${(proposal.totalCost / (1 + proposal.markup / 100)).toFixed(2)}\n`;
        content += `Наценка: ${proposal.markup}%\n`;
        content += `ИТОГО: $${proposal.totalCost.toFixed(2)}\n\n`;
      }
      content += `=====================================\n`;
      content += `Благодарим за сотрудничество!\n`;
      
      if (proposal.responsibleEmployee) {
        content += `\nОтветственный сотрудник: ${proposal.responsibleEmployee}\n`;
      }
      
      // Create and download the file
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `КП_${proposalId}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Предложение загружено',
        description: 'Коммерческое предложение загружено в виде текстового файла',
      });
    } catch (err) {
      setError('Не удалось загрузить предложение');
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить предложение',
        variant: 'destructive',
      });
    }
  };

  // Download proposal as Word document
  const downloadProposalAsWord = (proposalId: string) => {
    try {
      // Find the order with the given proposal
      const order = orders.find(o => o.commercialProposal?.id === proposalId);
      
      if (!order || !order.commercialProposal) {
        throw new Error('Предложение не найдено');
      }
      
      const proposal = order.commercialProposal;
      
      // Create HTML content for Word document
      let htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
        <head>
          <meta charset="utf-8">
          <title>Коммерческое предложение</title>
        </head>
        <body>
          <h1 style="text-align:center;">КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ</h1>
          <p><b>Дата:</b> ${proposal.createdAt.toLocaleDateString()}</p>
          <p><b>Клиент:</b> ${order.clientName}</p>
          <p><b>Номер заказа:</b> ${order.id}</p>
          <p><b>Описание:</b> ${order.description}</p>
          
          <h2>Спецификация</h2>
          
          <table border="1" style="border-collapse: collapse; width: 100%;">
            <tr style="background-color: #f2f2f2;">
              <th style="padding: 8px; text-align: center;">№</th>
              <th style="padding: 8px; text-align: center;">Наименование</th>
              <th style="padding: 8px; text-align: center;">Кол-во</th>
      `;
      
      if (proposal.showPrices) {
        htmlContent += `
              <th style="padding: 8px; text-align: center;">Цена за ед. без НДС ($)</th>
              <th style="padding: 8px; text-align: center;">Сумма без НДС ($)</th>
              <th style="padding: 8px; text-align: center;">НДС 20% ($)</th>
              <th style="padding: 8px; text-align: center;">Сумма с НДС ($)</th>
        `;
      }
      
      htmlContent += `</tr>`;
      
      let subtotalWithoutVAT = 0;
      
      proposal.equipment.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        const vat = itemTotal * 0.2;
        const totalWithVAT = itemTotal + vat;
        
        subtotalWithoutVAT += itemTotal;
        
        htmlContent += `
          <tr>
            <td style="padding: 8px; text-align: center;">${index + 1}</td>
            <td style="padding: 8px;">${item.name} (${item.articleNumber})</td>
            <td style="padding: 8px; text-align: center;">${item.quantity}</td>
        `;
        
        if (proposal.showPrices) {
          htmlContent += `
            <td style="padding: 8px; text-align: right;">${item.price.toFixed(2)}</td>
            <td style="padding: 8px; text-align: right;">${itemTotal.toFixed(2)}</td>
            <td style="padding: 8px; text-align: right;">${vat.toFixed(2)}</td>
            <td style="padding: 8px; text-align: right;">${totalWithVAT.toFixed(2)}</td>
          `;
        }
        
        htmlContent += `</tr>`;
      });
      
      if (proposal.showPrices) {
        const totalVAT = subtotalWithoutVAT * 0.2;
        const totalWithVAT = subtotalWithoutVAT + totalVAT;
        
        htmlContent += `
          <tr style="font-weight: bold; background-color: #f2f2f2;">
            <td colspan="4" style="padding: 8px; text-align: right;">Итого:</td>
            <td style="padding: 8px; text-align: right;">${subtotalWithoutVAT.toFixed(2)}</td>
            <td style="padding: 8px; text-align: right;">${totalVAT.toFixed(2)}</td>
            <td style="padding: 8px; text-align: right;">${totalWithVAT.toFixed(2)}</td>
          </tr>
        `;
        
        htmlContent += `
          </table>
          <p><b>Наценка:</b> ${proposal.markup}%</p>
          <p><b>ИТОГО с наценкой и НДС:</b> $${(totalWithVAT * (1 + proposal.markup / 100)).toFixed(2)}</p>
        `;
      } else {
        htmlContent += `</table>`;
      }
      
      if (proposal.responsibleEmployee) {
        htmlContent += `<p><b>Ответственный сотрудник:</b> ${proposal.responsibleEmployee}</p>`;
      }
      
      htmlContent += `
        <p style="margin-top: 30px; text-align: center;">Благодарим за сотрудничество!</p>
        </body>
        </html>
      `;
      
      // Convert to Blob
      const blob = new Blob([htmlContent], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `КП_${proposalId}.doc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Предложение загружено',
        description: 'Коммерческое предложение загружено в формате Word',
      });
    } catch (err) {
      setError('Не удалось загрузить предложение');
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить предложение',
        variant: 'destructive',
      });
    }
  };

  // Assign responsible employee
  const assignResponsibleEmployee = (orderId: string, employeeName: string) => {
    setLoading(true);
    try {
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId
            ? { 
                ...order, 
                responsibleEmployee: employeeName,
                updatedAt: new Date() 
              }
            : order
        )
      );
      
      // Also update the commercial proposal if it exists
      setOrders(prevOrders => 
        prevOrders.map(order => {
          if (order.id === orderId && order.commercialProposal) {
            return {
              ...order,
              commercialProposal: {
                ...order.commercialProposal,
                responsibleEmployee: employeeName
              }
            };
          }
          return order;
        })
      );
      
      toast({
        title: 'Сотрудник назначен',
        description: `${employeeName} назначен ответственным за заказ`,
      });
    } catch (err) {
      setError('Не удалось назначить сотрудника');
      toast({
        title: 'Ошибка',
        description: 'Не удалось назначить сотрудника',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Add new equipment (for director)
  const addNewEquipment = (newEquipment: Omit<EquipmentPart, 'id'>) => {
    setLoading(true);
    try {
      const equipmentId = `e${equipment.length + 1}`;
      
      const equipmentItem: EquipmentPart = {
        id: equipmentId,
        ...newEquipment
      };
      
      setEquipment(prevEquipment => [...prevEquipment, equipmentItem]);
      
      toast({
        title: 'Оборудование добавлено',
        description: `${newEquipment.name} добавлено в каталог`,
      });
    } catch (err) {
      setError('Не удалось добавить оборудование');
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить оборудование',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Get employee list
  const getEmployeeList = (): string[] => {
    return EMPLOYEE_LIST;
  };

  // Get orders by status
  const getOrdersByStatus = (status: OrderStatus | OrderStatus[]): Order[] => {
    const statusArray = Array.isArray(status) ? status : [status];
    return orders.filter(order => statusArray.includes(order.status));
  };
  
  // Get needed purchase items
  const getNeededPurchaseItems = () => {
    const purchaseOrders = getOrdersByStatus([OrderStatus.NEED_PURCHASING, OrderStatus.PURCHASING, OrderStatus.IN_DELIVERY, OrderStatus.UNLOADING]);
    
    const neededItems: Record<string, { part: EquipmentPart, neededQuantity: number }> = {};
    
    purchaseOrders.forEach(order => {
      if (!order.commercialProposal) return;
      
      order.commercialProposal.equipment.forEach(part => {
        const currentPart = getEquipmentByArticle(part.articleNumber);
        if (!currentPart) return;
        
        const availableQuantity = currentPart.availableQuantity;
        const requiredQuantity = part.quantity;
        
        if (availableQuantity < requiredQuantity) {
          if (neededItems[part.articleNumber]) {
            neededItems[part.articleNumber].neededQuantity += (requiredQuantity - availableQuantity);
          } else {
            neededItems[part.articleNumber] = {
              part: currentPart,
              neededQuantity: requiredQuantity - availableQuantity
            };
          }
        }
      });
    });
    
    return Object.values(neededItems);
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
        downloadProposalAsTxt,
        downloadProposalAsWord,
        assignResponsibleEmployee,
        addNewEquipment,
        getEmployeeList,
        toggleProposalPrices,
        getOrdersByStatus,
        getNeededPurchaseItems
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
    throw new Error('useOrders должен использоваться внутри OrderProvider');
  }
  return context;
};
