
import React from 'react';
import { motion } from 'framer-motion';
import { OrderStatus } from '@/context/OrderContext';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  // Define status colors and labels
  const statusConfig = {
    [OrderStatus.NEW]: {
      color: 'bg-gray-100 text-gray-800 border-gray-300',
      label: 'New',
    },
    [OrderStatus.PROPOSAL_CREATED]: {
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      label: 'Proposal Created',
    },
    [OrderStatus.REJECTED]: {
      color: 'bg-red-100 text-red-800 border-red-300',
      label: 'Rejected',
    },
    [OrderStatus.READY_FOR_DEVELOPMENT]: {
      color: 'bg-green-100 text-green-800 border-green-300',
      label: 'Ready for Development',
    },
    [OrderStatus.IN_PROGRESS]: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      label: 'In Progress',
    },
    [OrderStatus.ASSEMBLY]: {
      color: 'bg-purple-100 text-purple-800 border-purple-300',
      label: 'Assembly',
    },
    [OrderStatus.PURCHASING]: {
      color: 'bg-orange-100 text-orange-800 border-orange-300',
      label: 'Purchasing',
    },
    [OrderStatus.COMPLETED]: {
      color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      label: 'Completed',
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
