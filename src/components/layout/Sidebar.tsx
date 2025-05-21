
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  ClipboardList, 
  User,
  Settings,
  LogOut,
  Maximize2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, UserRole } from '@/context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
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
      className="bg-white dark:bg-gray-800 shadow-lg h-screen fixed left-0 top-0 z-10 flex flex-col"
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
              Отава
            </motion.div>
          )}
        </AnimatePresence>
        <button 
          onClick={toggleCollapse}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <Maximize2 size={18} />
        </button>
      </div>

      <div className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {menuItems.map((item) => {
            if (!item.forRoles.includes(user.role)) return null;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center p-3 rounded-lg transition-all duration-200",
                  location.pathname === item.href
                    ? "bg-blue-100 text-blue-700"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200"
                )}
              >
                <span className="flex items-center justify-center text-blue-600">
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

      <div className="mt-auto">
        <Link
          to="/profile"
          className={cn(
            "flex items-center p-3 transition-all duration-200",
            location.pathname === '/profile'
              ? "bg-blue-100 text-blue-700"
              : "hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200"
          )}
        >
          <span className="flex items-center justify-center text-blue-600">
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
            "flex items-center p-3 transition-all duration-200",
            location.pathname === '/settings'
              ? "bg-blue-100 text-blue-700"
              : "hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200"
          )}
        >
          <span className="flex items-center justify-center text-blue-600">
            <Settings size={20} />
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

        <button
          onClick={logout}
          className="flex items-center w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 transition-all duration-200"
        >
          <span className="flex items-center justify-center text-blue-600">
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
