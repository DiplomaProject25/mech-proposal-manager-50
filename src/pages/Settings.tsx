
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Moon, Sun, Bell, Lock, Save, User, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/layout/Header';

interface Notification {
  id: string;
  title: string;
  message: string;
  date: Date;
  read: boolean;
}

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('ru');
  const [autoSave, setAutoSave] = useState(true);
  
  // Mock notifications
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

  const handleSaveSettings = () => {
    toast({
      title: 'Настройки сохранены',
      description: 'Ваши настройки успешно обновлены.',
    });
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
    
    toast({
      title: 'Уведомление удалено',
      description: 'Уведомление было успешно удалено',
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Настройки" />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold">
                <span className="flex items-center">
                  <SettingsIcon className="mr-2 h-5 w-5" />
                  Настройки приложения
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="general">
                <TabsList className="mb-6">
                  <TabsTrigger value="general">Общие</TabsTrigger>
                  <TabsTrigger value="appearance">Внешний вид</TabsTrigger>
                  <TabsTrigger value="notifications">Уведомления</TabsTrigger>
                  <TabsTrigger value="security">Безопасность</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general">
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium">Общие настройки</h3>
                      <p className="text-sm text-gray-500">
                        Управление общими настройками приложения.
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="language">Язык</Label>
                          <p className="text-sm text-gray-500">
                            Выберите предпочитаемый язык интерфейса.
                          </p>
                        </div>
                        <select
                          id="language"
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="rounded-md border border-gray-300 py-2 px-3"
                        >
                          <option value="ru">Русский</option>
                          <option value="en">Английский</option>
                          <option value="fr">Французский</option>
                          <option value="de">Немецкий</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="autosave">Автосохранение</Label>
                          <p className="text-sm text-gray-500">
                            Автоматически сохранять вашу работу.
                          </p>
                        </div>
                        <Switch
                          id="autosave"
                          checked={autoSave}
                          onCheckedChange={setAutoSave}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="appearance">
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium">Настройки внешнего вида</h3>
                      <p className="text-sm text-gray-500">
                        Настройте внешний вид приложения.
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="theme">Тема</Label>
                          <p className="text-sm text-gray-500">
                            Переключение между светлой и темной темой.
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Sun className="h-5 w-5 text-gray-500" />
                          <Switch
                            id="theme"
                            checked={darkMode}
                            onCheckedChange={setDarkMode}
                          />
                          <Moon className="h-5 w-5 text-gray-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="notifications">
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium">Настройки уведомлений</h3>
                      <p className="text-sm text-gray-500">
                        Управление уведомлениями и их отображением.
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="notifications">Уведомления</Label>
                          <p className="text-sm text-gray-500">
                            Включить или отключить уведомления приложения.
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Bell className="h-5 w-5 text-gray-500" />
                          <Switch
                            id="notifications"
                            checked={notifications}
                            onCheckedChange={setNotifications}
                          />
                        </div>
                      </div>
                      
                      {notifications && (
                        <div className="mt-6">
                          <h4 className="font-medium mb-3">Ваши уведомления</h4>
                          <div className="bg-gray-50 rounded-lg border">
                            {notificationsList.length === 0 ? (
                              <div className="p-6 text-center text-gray-500">
                                У вас нет новых уведомлений
                              </div>
                            ) : (
                              <ul className="divide-y divide-gray-200">
                                {notificationsList.map((notification) => (
                                  <li 
                                    key={notification.id}
                                    className={`p-4 ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
                                  >
                                    <div className="flex justify-between">
                                      <div>
                                        <h5 className="font-medium">
                                          {notification.title}
                                          {!notification.read && (
                                            <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                                              Новое
                                            </span>
                                          )}
                                        </h5>
                                        <p className="text-gray-600 text-sm mt-1">
                                          {notification.message}
                                        </p>
                                        <p className="text-gray-400 text-xs mt-2">
                                          {notification.date.toLocaleDateString()}
                                        </p>
                                      </div>
                                      <div className="flex space-x-2">
                                        {!notification.read && (
                                          <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleMarkAsRead(notification.id)}
                                            className="flex items-center text-xs"
                                          >
                                            <Check className="h-3 w-3 mr-1" />
                                            Отметить прочитанным
                                          </Button>
                                        )}
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          onClick={() => handleDeleteNotification(notification.id)}
                                          className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs"
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="security">
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium">Настройки безопасности</h3>
                      <p className="text-sm text-gray-500">
                        Управляйте настройками безопасности вашей учетной записи.
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex flex-col space-y-4">
                      <Button 
                        variant="outline" 
                        className="flex items-center w-full md:w-auto justify-start"
                      >
                        <Lock className="mr-2 h-4 w-4" />
                        Изменить пароль
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="flex items-center w-full md:w-auto justify-start"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Настройки приватности
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="border-t bg-gray-50 flex justify-end">
              <Button onClick={handleSaveSettings} className="flex items-center">
                <Save className="mr-2 h-4 w-4" />
                Сохранить настройки
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Settings;
