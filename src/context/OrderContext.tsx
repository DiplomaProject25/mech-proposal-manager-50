import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

// Define the order status enum
export enum OrderStatus {
  NEW = 'NEW',
  PENDING = 'PENDING',
  PROPOSAL_CREATED = 'PROPOSAL_CREATED',
  READY_FOR_DEVELOPMENT = 'READY_FOR_DEVELOPMENT',
  IN_PROGRESS = 'IN_PROGRESS',
  NEED_PURCHASING = 'NEED_PURCHASING',
  PURCHASING = 'PURCHASING',
  IN_TRANSIT = 'IN_TRANSIT',
  IN_DELIVERY = 'IN_DELIVERY',  // Added this to fix the errors
  UNLOADING = 'UNLOADING',
  ASSEMBLY = 'ASSEMBLY',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED'
}

// Define the equipment part interface
export interface EquipmentPart {
  id: string;
  name: string;
  articleNumber: string;
  price: number;
  quantity: number;
  availableQuantity: number;
  location: string;
  deliveryTime?: string;
  description?: string;
  weight?: number; // Added this optional property
}

// Define the commercial proposal interface
export interface CommercialProposal {
  id: string;
  orderId: string;
  equipment: EquipmentPart[];
  markup: number;
  companyMarkup?: number;
  responsibleEmployee?: string;
  totalCost: number;
  createdAt: Date;
  showPrices: boolean;
}

// Define the order interface
export interface Order {
  id: string;
  clientName: string;
  status: OrderStatus;
  description: string;
  responsibleEmployee?: string;
  assignedTo?: string;
  commercialProposal?: CommercialProposal;
  createdAt: Date;
  updatedAt: Date;
}

// Item needed for purchase interface
export interface PurchaseItem {
  part: EquipmentPart;
  neededQuantity: number;
}

// Define the context type
interface OrderContextType {
  orders: Order[];
  addOrder: (clientName: string, description: string) => Order;
  getOrderById: (id: string) => Order | undefined;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  getAllEquipment: () => EquipmentPart[];
  getEquipmentByArticle?: (articleNumber: string) => EquipmentPart | undefined;
  updateEquipmentInventory?: (articleNumber: string, quantity: number) => void;
  createCommercialProposal: (
    orderId: string,
    equipment: EquipmentPart[],
    markup: number,
    responsibleEmployee?: string,
    companyMarkup?: number
  ) => void;
  toggleProposalPrices: (orderId: string, showPrices: boolean) => void;
  downloadProposalAsWord: (proposalId: string) => void;
  // Add the missing methods
  createOrder: (orderData: { clientName: string, description: string, responsibleEmployee?: string }) => void;
  loading: boolean;
  getEmployeeList: () => string[];
  getOrdersByStatus: (statuses: OrderStatus[]) => Order[];
  getNeededPurchaseItems: () => PurchaseItem[];
  filteredOrders?: Order[];
  addNewEquipment?: (newEquipment: EquipmentPart) => void;
}

// Create the context
const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Mock equipment data
const MOCK_EQUIPMENT: EquipmentPart[] = [
  {
    id: '1',
    name: 'Контроллер Arduino Mega',
    articleNumber: 'ARD-M2560',
    price: 45.99,
    quantity: 1,
    availableQuantity: 15,
    location: 'Склад A3-25',
    description: 'Микроконтроллер ATmega2560'
  },
  {
    id: '2',
    name: 'Сервопривод высокой мощности',
    articleNumber: 'SRV-180HP',
    price: 29.99,
    quantity: 1,
    availableQuantity: 8,
    location: 'Склад A4-12',
    description: '180 градусов поворота, высокий крутящий момент'
  },
  {
    id: '3',
    name: 'Датчик температуры DS18B20',
    articleNumber: 'DS18B20',
    price: 4.50,
    quantity: 1,
    availableQuantity: 35,
    location: 'Склад B2-05',
    description: 'Цифровой датчик температуры, водонепроницаемый'
  },
  {
    id: '4',
    name: 'Плата расширения для Arduino',
    articleNumber: 'ARD-SHD-V5',
    price: 12.99,
    quantity: 1,
    availableQuantity: 10,
    location: 'Склад A3-26',
    description: 'Плата расширения для подключения различных модулей'
  },
  {
    id: '5',
    name: 'LCD Дисплей 16x2 с I2C',
    articleNumber: 'LCD-16X2-I2C',
    price: 8.99,
    quantity: 1,
    availableQuantity: 22,
    location: 'Склад B4-18',
    description: 'ЖК-дисплей с интерфейсом I2C'
  },
  {
    id: '6',
    name: 'Шаговый двигатель Nema 17',
    articleNumber: 'NEMA17-42',
    price: 15.99,
    quantity: 1,
    availableQuantity: 14,
    location: 'Склад A5-07',
    description: '42mm шаговый двигатель для точного позиционирования'
  },
  {
    id: '7',
    name: 'Драйвер шагового двигателя A4988',
    articleNumber: 'DRV-A4988',
    price: 5.99,
    quantity: 1,
    availableQuantity: 25,
    location: 'Склад A5-08',
    description: 'Драйвер для управления шаговыми двигателями'
  },
  {
    id: '8',
    name: 'Ультразвуковой датчик HC-SR04',
    articleNumber: 'HC-SR04',
    price: 3.99,
    quantity: 1,
    availableQuantity: 40,
    location: 'Склад B2-06',
    description: 'Датчик для измерения расстояния'
  },
  {
    id: '9',
    name: 'Модуль Bluetooth HC-05',
    articleNumber: 'HC-05-BT',
    price: 6.99,
    quantity: 1,
    availableQuantity: 18,
    location: 'Склад B3-14',
    description: 'Модуль беспроводной связи Bluetooth'
  },
  {
    id: '10',
    name: 'RGB-светодиод WS2812B (лента 1м)',
    articleNumber: 'WS2812B-1M',
    price: 18.99,
    quantity: 1,
    availableQuantity: 12,
    location: 'Склад B1-22',
    description: 'Адресуемая светодиодная лента'
  }
];

// Mock orders data
const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    clientName: 'ООО "ТехИнновации"',
    status: OrderStatus.NEW,
    description: 'Система автоматизации производственной линии с контролем температуры и влажности. Требуется разработать и изготовить прототип для тестирования.',
    createdAt: new Date('2025-05-10'),
    updatedAt: new Date('2025-05-10')
  },
  {
    id: '2',
    clientName: 'АО "ЭнергоРешения"',
    status: OrderStatus.READY_FOR_DEVELOPMENT,
    description: 'Модульная система мониторинга энергопотребления для промышленных объектов. Необходимо интегрировать с существующей инфраструктурой заказчика.',
    responsibleEmployee: 'Иванов И.И.',
    assignedTo: '2',
    createdAt: new Date('2025-05-05'),
    updatedAt: new Date('2025-05-12')
  },
  {
    id: '3',
    clientName: 'ЗАО "АгроТех"',
    status: OrderStatus.PROPOSAL_CREATED,
    description: 'Автоматическая система полива для тепличного комплекса с датчиками влажности почвы и воздуха. Требуется интеграция с метеостанцией.',
    responsibleEmployee: 'Петров П.П.',
    commercialProposal: {
      id: '1',
      orderId: '3',
      equipment: [
        {
          ...MOCK_EQUIPMENT[0],
          quantity: 2,
          deliveryTime: '10-14 дней'
        },
        {
          ...MOCK_EQUIPMENT[2],
          quantity: 15,
          deliveryTime: '7-10 дней'
        },
        {
          ...MOCK_EQUIPMENT[7],
          quantity: 5,
          deliveryTime: '5-7 дней'
        }
      ],
      markup: 15,
      companyMarkup: 10,
      totalCost: 298.75,
      createdAt: new Date('2025-05-14'),
      showPrices: false
    },
    createdAt: new Date('2025-05-08'),
    updatedAt: new Date('2025-05-14')
  },
  {
    id: '4',
    clientName: 'ИП Смирнов А.В.',
    status: OrderStatus.IN_PROGRESS,
    description: 'Система контроля доступа с распознаванием лиц для офисного помещения. Требуется разработать программное обеспечение и подобрать оборудование.',
    responsibleEmployee: 'Сидоров С.С.',
    assignedTo: '2',
    createdAt: new Date('2025-04-28'),
    updatedAt: new Date('2025-05-08')
  },
  {
    id: '5',
    clientName: 'ООО "МедТехника"',
    status: OrderStatus.COMPLETED,
    description: 'Прототип медицинского устройства для дистанционного мониторинга пациентов. Требуется обеспечить надежность и точность измерений.',
    responsibleEmployee: 'Иванов И.И.',
    createdAt: new Date('2025-04-15'),
    updatedAt: new Date('2025-05-10')
  },
  {
    id: '6',
    clientName: 'ООО "СтройКонтроль"',
    status: OrderStatus.REJECTED,
    description: 'Система мониторинга состояния строительных конструкций. Требуется разработать компактные датчики и систему сбора данных.',
    createdAt: new Date('2025-05-02'),
    updatedAt: new Date('2025-05-06')
  },
  {
    id: '7',
    clientName: 'ЗАО "ТранспортЛогистика"',
    status: OrderStatus.NEED_PURCHASING,
    description: 'Система мониторинга состояния грузов при транспортировке. Необходимы датчики температуры, влажности и ускорения.',
    responsibleEmployee: 'Петров П.П.',
    assignedTo: '2',
    createdAt: new Date('2025-04-25'),
    updatedAt: new Date('2025-05-12')
  }
];

// Mock employee list
const MOCK_EMPLOYEES = ['Иванов И.И.', 'Петров П.П.', 'Сидоров С.С.', 'Козлов К.К.', 'Смирнов С.С.'];

// OrderProvider component
export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Add a new order
  const addOrder = (clientName: string, description: string): Order => {
    const newOrder: Order = {
      id: (orders.length + 1).toString(),
      clientName,
      status: OrderStatus.NEW,
      description,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setOrders(prevOrders => [...prevOrders, newOrder]);
    return newOrder;
  };

  // Create order with loading state
  const createOrder = (orderData: { clientName: string, description: string, responsibleEmployee?: string }) => {
    setLoading(true);
    try {
      const newOrder: Order = {
        id: (orders.length + 1).toString(),
        clientName: orderData.clientName,
        description: orderData.description,
        responsibleEmployee: orderData.responsibleEmployee,
        status: OrderStatus.NEW,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setOrders(prevOrders => [...prevOrders, newOrder]);
      
      toast({
        title: 'Заказ создан',
        description: `Заказ №${newOrder.id} успешно создан`,
      });
    } catch (err) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать заказ',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Get order by ID
  const getOrderById = (id: string): Order | undefined => {
    return orders.find(order => order.id === id);
  };

  // Update order status
  const updateOrderStatus = (id: string, status: OrderStatus): void => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === id
          ? { ...order, status, updatedAt: new Date() }
          : order
      )
    );
    
    toast({
      title: 'Статус обновлен',
      description: `Заказ №${id} теперь в статусе: ${status}`,
    });
  };

  // Get all equipment
  const getAllEquipment = (): EquipmentPart[] => {
    return MOCK_EQUIPMENT;
  };

  // Get equipment by article number
  const getEquipmentByArticle = (articleNumber: string): EquipmentPart | undefined => {
    return MOCK_EQUIPMENT.find(item => item.articleNumber === articleNumber);
  };

  // Update equipment inventory
  const updateEquipmentInventory = (articleNumber: string, quantity: number): void => {
    // In a real app, this would update the database
    console.log(`Updated ${articleNumber} quantity to ${quantity}`);
  };

  // Get employee list
  const getEmployeeList = (): string[] => {
    return MOCK_EMPLOYEES;
  };

  // Get orders by status
  const getOrdersByStatus = (statuses: OrderStatus[]): Order[] => {
    return orders.filter(order => statuses.includes(order.status));
  };

  // Get needed purchase items
  const getNeededPurchaseItems = (): PurchaseItem[] => {
    const items: PurchaseItem[] = [];
    
    // Find all equipment in orders with NEED_PURCHASING status
    const purchasingOrders = getOrdersByStatus([OrderStatus.NEED_PURCHASING, OrderStatus.PURCHASING]);
    
    // Collect all parts that need to be purchased
    purchasingOrders.forEach(order => {
      if (order.commercialProposal) {
        order.commercialProposal.equipment.forEach(part => {
          // Check if we need to purchase more
          if (part.quantity > part.availableQuantity) {
            const neededQuantity = part.quantity - part.availableQuantity;
            
            // Check if we already have this part in our items list
            const existingItem = items.find(item => item.part.articleNumber === part.articleNumber);
            
            if (existingItem) {
              // Update the needed quantity
              existingItem.neededQuantity += neededQuantity;
            } else {
              // Add a new item
              items.push({
                part,
                neededQuantity
              });
            }
          }
        });
      }
    });
    
    return items;
  };

  // Add new equipment
  const addNewEquipment = (newEquipment: EquipmentPart): void => {
    // In a real app, this would add to the database
    console.log('New equipment added:', newEquipment);
  };

  // Create a commercial proposal
  const createCommercialProposal = (
    orderId: string,
    equipment: EquipmentPart[],
    markup: number,
    responsibleEmployee?: string,
    companyMarkup?: number
  ): void => {
    // Calculate total cost
    let subtotal = 0;
    equipment.forEach(item => {
      subtotal += item.price * item.quantity;
    });
    
    const markupAmount = subtotal * (markup / 100);
    const companyMarkupAmount = companyMarkup ? subtotal * (companyMarkup / 100) : 0;
    const taxAmount = (subtotal + markupAmount + companyMarkupAmount) * 0.2;
    const totalCost = subtotal + markupAmount + companyMarkupAmount + taxAmount;
    
    const proposal: CommercialProposal = {
      id: `CP-${orderId}`,
      orderId,
      equipment,
      markup,
      companyMarkup,
      responsibleEmployee,
      totalCost,
      createdAt: new Date(),
      showPrices: false
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
      title: 'Предложение создано',
      description: `Коммерческое предложение для заказа №${orderId} создано`,
    });
  };

  // Toggle proposal prices visibility
  const toggleProposalPrices = (orderId: string, showPrices: boolean): void => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId && order.commercialProposal
          ? { 
              ...order, 
              commercialProposal: {
                ...order.commercialProposal,
                showPrices
              },
              updatedAt: new Date()
            }
          : order
      )
    );
  };

  // Update downloadProposalAsWord to include delivery times
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
              <th style="padding: 8px; text-align: center;">Срок доставки</th>
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
            <td style="padding: 8px; text-align: center;">${item.deliveryTime || "7-10 дней"}</td>
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
        const companyMarkupAmount = proposal.companyMarkup ? subtotalWithoutVAT * (proposal.companyMarkup / 100) : 0;
        const markupAmount = subtotalWithoutVAT * (proposal.markup / 100);
        
        htmlContent += `
          <tr style="font-weight: bold; background-color: #f2f2f2;">
            <td colspan="4" style="padding: 8px; text-align: right;">Итого без наценок:</td>
            <td colspan="${proposal.showPrices ? 4 : 1}" style="padding: 8px; text-align: right;">${subtotalWithoutVAT.toFixed(2)}</td>
          </tr>
        `;
        
        htmlContent += `
          </table>
          <p><b>Наценка (${proposal.markup}%):</b> $${markupAmount.toFixed(2)}</p>
        `;

        if (proposal.companyMarkup) {
          htmlContent += `
            <p><b>Наценка для предприятия (${proposal.companyMarkup}%):</b> $${companyMarkupAmount.toFixed(2)}</p>
          `;
        }

        htmlContent += `
          <p><b>НДС (20%):</b> $${totalVAT.toFixed(2)}</p>
          <p><b>ИТОГО с НДС:</b> $${proposal.totalCost.toFixed(2)}</p>
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

  return (
    <OrderContext.Provider
      value={{
        orders,
        addOrder,
        getOrderById,
        updateOrderStatus,
        getAllEquipment,
        getEquipmentByArticle,
        updateEquipmentInventory,
        createCommercialProposal,
        toggleProposalPrices,
        downloadProposalAsWord,
        createOrder,
        loading,
        getEmployeeList,
        getOrdersByStatus,
        getNeededPurchaseItems,
        addNewEquipment
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
