
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface HeaderProps {
  title: string;
}

// Интерфейс для уведомлений
interface Notification {
  id: string;
  title: string;
  message: string;
  date: Date;
  read: boolean;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notificationsList, setNotificationsList] = useState<Notification[]>([
    {
      id: '1',
      title: 'Новый заказ создан',
      message: 'Заказ ЗКЗ-2307-4821 был успешно создан',
      date: new Date(2023, 8, 15),
      read: false
    },
    {
      id: '2',
      title: 'Коммерческое предложение одобрено',
      message: 'Клиент одобрил коммерческое предложение для заказа ЗКЗ-2306-1249',
      date: new Date(2023, 8, 10),
      read: true
    },
    {
      id: '3',
      title: 'Задача назначена',
      message: 'Вам назначена новая задача: "Сборка гидравлической системы"',
      date: new Date(2023, 8, 5),
      read: false
    }
  ]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMarkAsRead = (id: string) => {
    setNotificationsList(prevList => 
      prevList.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };
  
  const handleDeleteNotification = (id: string) => {
    setNotificationsList(prevList => 
      prevList.filter(notification => notification.id !== id)
    );
  };

  // Подсчет непрочитанных уведомлений
  const unreadCount = notificationsList.filter(notification => !notification.read).length;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md shadow-sm sticky top-0 z-10 px-6 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between"
    >
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">{title}</h1>
      
      <div className="flex items-center space-x-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="relative hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-2">
              <h3 className="font-medium text-lg">Уведомления</h3>
              {notificationsList.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  У вас нет новых уведомлений
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {notificationsList.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 mb-2 rounded-lg ${
                        notification.read ? 'bg-white dark:bg-gray-800' : 'bg-blue-50 dark:bg-blue-900/20'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm">
                          {notification.title}
                          {!notification.read && (
                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                              Новое
                            </span>
                          )}
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleDeleteNotification(notification.id)}
                        >
                          &times;
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 my-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{notification.date.toLocaleDateString()}</span>
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-auto py-1"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            Отметить прочитанным
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="rounded-full h-8 w-8 p-0 overflow-hidden"
            >
              <div className="bg-blue-100 dark:bg-blue-800 h-full w-full flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-200" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>Профиль</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>Настройки</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              Выйти
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
};

export default Header;
