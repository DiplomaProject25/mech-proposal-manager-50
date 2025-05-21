
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { Home, ClipboardList, Package, Settings, User, LogOut } from 'lucide-react';
import { useAuth, UserRole } from '@/context/AuthContext';

const AppSidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const menuItems = [
    {
      title: 'Панель управления',
      icon: <Home className="h-5 w-5" />,
      href: '/dashboard',
      forRoles: [UserRole.DIRECTOR, UserRole.CONSTRUCTOR, UserRole.ACCOUNTANT],
    },
    {
      title: 'Заказы',
      icon: <ClipboardList className="h-5 w-5" />,
      href: '/orders',
      forRoles: [UserRole.DIRECTOR, UserRole.CONSTRUCTOR],
    },
    {
      title: 'Оборудование',
      icon: <Package className="h-5 w-5" />,
      href: '/equipment',
      forRoles: [UserRole.CONSTRUCTOR],
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center p-2">
          <span className="text-lg font-semibold">Отава</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Главное меню</SidebarGroupLabel>
          <SidebarMenu>
            {menuItems.map((item) => {
              if (!item.forRoles.includes(user.role)) return null;
              
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.title}
                  >
                    <Link to={item.href}>
                      <span className="text-blue-600">{item.icon}</span>
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/profile')}
              tooltip="Профиль"
            >
              <Link to="/profile">
                <User className="h-5 w-5 text-blue-600" />
                <span>Профиль</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/settings')}
              tooltip="Настройки"
            >
              <Link to="/settings">
                <Settings className="h-5 w-5 text-blue-600" />
                <span>Настройки</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Выйти"
            >
              <button onClick={logout}>
                <LogOut className="h-5 w-5 text-blue-600" />
                <span>Выйти</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
