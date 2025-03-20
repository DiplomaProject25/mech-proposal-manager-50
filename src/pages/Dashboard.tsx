
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import { useAuth, UserRole } from '@/context/AuthContext';
import { useOrders, OrderStatus } from '@/context/OrderContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { orders } = useOrders();

  // Count orders by status
  const orderCountsByStatus = Object.values(OrderStatus).map(status => {
    const count = orders.filter(order => order.status === status).length;
    return {
      status: status.replace('_', ' ').split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      count
    };
  });

  // Count orders by month (last 6 months)
  const getLastSixMonths = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = month.toLocaleString('default', { month: 'short' });
      const monthYear = `${monthName} ${month.getFullYear()}`;
      
      const count = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === month.getMonth() && 
               orderDate.getFullYear() === month.getFullYear();
      }).length;
      
      data.push({ month: monthName, count });
    }
    
    return data;
  };

  const monthlyData = getLastSixMonths();
  
  // Director-specific stats
  const directorStats = [
    {
      title: 'Total Orders',
      value: orders.length,
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Accepted Proposals',
      value: orders.filter(order => 
        order.status === OrderStatus.READY_FOR_DEVELOPMENT ||
        order.status === OrderStatus.IN_PROGRESS ||
        order.status === OrderStatus.ASSEMBLY ||
        order.status === OrderStatus.COMPLETED
      ).length,
      change: '+5%',
      changeType: 'increase'
    },
    {
      title: 'Rejected Proposals',
      value: orders.filter(order => order.status === OrderStatus.REJECTED).length,
      change: '-2%',
      changeType: 'decrease'
    },
    {
      title: 'Completion Rate',
      value: `${Math.round((orders.filter(order => order.status === OrderStatus.COMPLETED).length / orders.length) * 100)}%`,
      change: '+3%',
      changeType: 'increase'
    }
  ];
  
  // Constructor-specific stats
  const constructorStats = [
    {
      title: 'Available Orders',
      value: orders.filter(order => 
        order.status === OrderStatus.READY_FOR_DEVELOPMENT && !order.assignedTo
      ).length,
      change: '+3',
      changeType: 'increase'
    },
    {
      title: 'My Orders',
      value: orders.filter(order => order.assignedTo === user?.id).length,
      change: '0',
      changeType: 'neutral'
    },
    {
      title: 'In Assembly',
      value: orders.filter(order => 
        order.status === OrderStatus.ASSEMBLY && order.assignedTo === user?.id
      ).length,
      change: '+1',
      changeType: 'increase'
    },
    {
      title: 'Awaiting Parts',
      value: orders.filter(order => 
        order.status === OrderStatus.PURCHASING && order.assignedTo === user?.id
      ).length,
      change: '-1',
      changeType: 'decrease'
    }
  ];
  
  const stats = user?.role === UserRole.DIRECTOR ? directorStats : constructorStats;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Dashboard" />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <div className={`text-sm font-medium ${
                      stat.changeType === 'increase' ? 'text-green-500' : 
                      stat.changeType === 'decrease' ? 'text-red-500' : 
                      'text-gray-500'
                    }`}>
                      {stat.change}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm h-full">
              <CardHeader>
                <CardTitle>Orders by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={orderCountsByStatus}
                      margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="status" 
                        angle={-45} 
                        textAnchor="end" 
                        height={70} 
                        tick={{ fontSize: 12 }} 
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm h-full">
              <CardHeader>
                <CardTitle>Monthly Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
