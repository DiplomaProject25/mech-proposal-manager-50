
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, 
  FileText, 
  Home, 
  Wrench, 
  Package, 
  Settings as SettingsIcon,
  LogOut, 
  Minimize2, 
  Maximize2,
  User,
  ShoppingCart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, UserRole } from '@/context/AuthContext';

const Sidebar = () => {
  const { user, logout, isDirector, isConstructor } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const toggleCollapse = () => {
    setCollapsed(prev => !prev);
  };

  const menuItems = [
    {
      title: 'Панель управления',
      icon: <Home size={20} />,
      href: '/dashboard',
      forRoles: [UserRole.DIRECTOR, UserRole.CONSTRUCTOR, UserRole.ACCOUNTANT],
    },
    {
      title: 'Заказы',
      icon: <ClipboardList size={20} />,
      href: '/orders',
      forRoles: [UserRole.DIRECTOR, UserRole.CONSTRUCTOR],
    },
    {
      title: 'Коммерческие предложения',
      icon: <FileText size={20} />,
      href: '/proposals',
      forRoles: [UserRole.DIRECTOR],
    },
    {
      title: 'Каталог запчастей',
      icon: <Package size={20} />,
      href: '/equipment',
      forRoles: [UserRole.CONSTRUCTOR],
    },
    {
      title: 'Цех',
      icon: <Wrench size={20} />,
      href: '/workshop',
      forRoles: [UserRole.CONSTRUCTOR],
    },
    {
      title: 'Управление закупками',
      icon: <ShoppingCart size={20} />,
      href: '/accountant',
      forRoles: [UserRole.ACCOUNTANT],
    },
  ];

  const sidebarVariants = {
    expanded: { width: 250 },
    collapsed: { width: 70 }
  };

  return (
    <motion.div
      variants={sidebarVariants}
      initial="expanded"
      animate={collapsed ? 'collapsed' : 'expanded'}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 shadow-lg h-screen fixed left-0 top-0 z-10 flex flex-col border-r border-gray-200 dark:border-gray-700"
    >
      <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-semibold text-lg dark:text-white"
            >
              MechERP
            </motion.div>
          )}
        </AnimatePresence>
        <button 
          onClick={toggleCollapse}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          {collapsed ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
        </button>
      </div>

      <div className="flex-1 py-4 overflow-y-auto">
        <nav className="space-y-1 px-2">
          {menuItems.map((item) => {
            if (!item.forRoles.includes(user.role)) return null;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center p-2 rounded-lg transition-all duration-200",
                  location.pathname === item.href
                    ? "bg-blue-500 text-white"
                    : "hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-200"
                )}
              >
                <span className="flex items-center justify-center">
                  {item.icon}
                </span>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="ml-3"
                    >
                      {item.title}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="py-2 px-2 border-t border-gray-200 dark:border-gray-700">
        <Link
          to="/profile"
          className={cn(
            "flex items-center p-2 rounded-lg transition-all duration-200",
            location.pathname === '/profile'
              ? "bg-blue-500 text-white"
              : "hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-200"
          )}
        >
          <span className="flex items-center justify-center">
            <User size={20} />
          </span>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="ml-3"
              >
                Профиль
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        
        <Link
          to="/settings"
          className={cn(
            "flex items-center p-2 rounded-lg transition-all duration-200",
            location.pathname === '/settings'
              ? "bg-blue-500 text-white"
              : "hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-200"
          )}
        >
          <span className="flex items-center justify-center">
            <SettingsIcon size={20} />
          </span>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="ml-3"
              >
                Настройки
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={logout}
          className="flex items-center w-full p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-200 transition-all duration-200"
        >
          <span className="flex items-center justify-center">
            <LogOut size={20} />
          </span>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="ml-3"
              >
                Выйти
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
