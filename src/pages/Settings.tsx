
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Moon, Sun, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/layout/Header';

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Обновление темы интерфейса в реальном времени
  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#1A1F2C';
      document.body.style.color = '#FFFFFF';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#FFFFFF';
      document.body.style.color = '#000000';
    }
  }, [darkMode]);

  const handleChangePassword = () => {
    // Проверка паролей
    if (!currentPassword) {
      toast({ title: 'Ошибка', description: 'Введите текущий пароль', variant: 'destructive' });
      return;
    }

    if (!newPassword) {
      toast({ title: 'Ошибка', description: 'Введите новый пароль', variant: 'destructive' });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ title: 'Ошибка', description: 'Пароли не совпадают', variant: 'destructive' });
      return;
    }

    // Имитация смены пароля с успешным результатом
    toast({
      title: 'Пароль изменен',
      description: 'Ваш пароль был успешно изменен',
    });

    // Закрыть диалог и сбросить поля
    setIsPasswordDialogOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header title="Настройки" />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Card className="border-none shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
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
                  <TabsTrigger value="security">Безопасность</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general">
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium">Общие настройки</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Управление общими настройками приложения.
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="notifications">Уведомления</Label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Включить или отключить уведомления
                          </p>
                        </div>
                        <Switch
                          id="notifications"
                          checked={notifications}
                          onCheckedChange={setNotifications}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="appearance">
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium">Настройки внешнего вида</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Настройте внешний вид приложения.
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="theme">Тема</Label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Переключение между светлой и темной темой.
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Sun className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                          <Switch
                            id="theme"
                            checked={darkMode}
                            onCheckedChange={setDarkMode}
                          />
                          <Moon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="security">
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium">Настройки безопасности</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Управляйте настройками безопасности вашей учетной записи.
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <div className="space-y-4">
                        <h4 className="font-medium">Смена пароля</h4>
                        <Button
                          variant="outline"
                          onClick={() => setIsPasswordDialogOpen(true)}
                          className="flex items-center"
                        >
                          <Lock className="mr-2 h-4 w-4" />
                          Изменить пароль
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Диалог изменения пароля */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Изменение пароля</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="current-password">Текущий пароль</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">Новый пароль</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Подтвердите новый пароль</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleChangePassword}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
