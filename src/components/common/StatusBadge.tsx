
import React from 'react';
import { motion } from 'framer-motion';
import { OrderStatus } from '@/context/OrderContext';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const statusConfig = {
    [OrderStatus.NEW]: {
      color: 'bg-gray-100 text-gray-800 border-gray-300',
      label: 'Новый',
    },
    [OrderStatus.PROPOSAL_CREATED]: {
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      label: 'Предложение создано',
    },
    [OrderStatus.REJECTED]: {
      color: 'bg-red-100 text-red-800 border-red-300',
      label: 'Отклонен',
    },
    [OrderStatus.READY_FOR_DEVELOPMENT]: {
      color: 'bg-green-100 text-green-800 border-green-300',
      label: 'Готов к разработке',
    },
    [OrderStatus.IN_PROGRESS]: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      label: 'В процессе',
    },
    [OrderStatus.ASSEMBLY]: {
      color: 'bg-purple-100 text-purple-800 border-purple-300',
      label: 'Сборка',
    },
    [OrderStatus.PURCHASING]: {
      color: 'bg-orange-100 text-orange-800 border-orange-300',
      label: 'Закупка',
    },
    [OrderStatus.NEED_PURCHASING]: {
      color: 'bg-amber-100 text-amber-800 border-amber-300',
      label: 'Необходима закупка',
    },
    [OrderStatus.COMPLETED]: {
      color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      label: 'Завершен',
    },
    [OrderStatus.IN_DELIVERY]: {
      color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      label: 'В пути',
    },
    [OrderStatus.UNLOADING]: {
      color: 'bg-pink-100 text-pink-800 border-pink-300',
      label: 'Разгрузка',
    },
  };

  const { color, label } = statusConfig[status];

  return (
    <motion.span
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        color,
        className
      )}
    >
      <span className={`w-2 h-2 rounded-full mr-1.5 ${color.split(' ')[0].replace('bg-', 'bg-')}`}></span>
      {label}
    </motion.span>
  );
};

export default StatusBadge;
