import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, FileText, Users, PieChart } from 'lucide-react';
import Header from '@/components/layout/Header';

const AccountantDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Панель бухгалтера" />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* Финансовая сводка */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-4 w-4 text-green-500" />
                Финансовая сводка
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                1,250,000 ₽
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Общий доход за последний месяц
              </p>
            </CardContent>
          </Card>

          {/* Отчеты */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-4 w-4 text-blue-500" />
                Отчеты
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                12
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Количество подготовленных отчетов
              </p>
            </CardContent>
          </Card>

          {/* Клиенты */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-4 w-4 text-indigo-500" />
                Клиенты
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                45
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Общее количество клиентов
              </p>
            </CardContent>
          </Card>

          {/* Аналитика */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="mr-2 h-4 w-4 text-purple-500" />
                Аналитика
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* График или аналитические данные */}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Здесь будет отображаться аналитика и графики.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default AccountantDashboard;
