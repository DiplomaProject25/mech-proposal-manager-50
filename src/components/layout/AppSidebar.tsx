
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
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { LayoutDashboard, ClipboardList, Package, Settings, User, LogOut } from 'lucide-react';
import { useAuth, UserRole } from '@/context/AuthContext';

const AppSidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const menuItems = [
    {
      title: 'Панель управления',
      icon: <LayoutDashboard className="h-5 w-5" />,
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
        <div className="flex items-center justify-between p-3">
          <span className="text-xl font-semibold">Отава</span>
          <SidebarTrigger className="md:hidden" />
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
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
                    <Link to={item.href} className="flex items-center">
                      <span className={`${isActive(item.href) ? "text-blue-500" : "text-gray-500"}`}>{item.icon}</span>
                      <span className={`${isActive(item.href) ? "font-medium" : ""}`}>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="mt-auto">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive('/profile')}
              tooltip="Профиль"
            >
              <Link to="/profile" className="flex items-center">
                <User className={`h-5 w-5 ${isActive('/profile') ? "text-blue-500" : "text-gray-500"}`} />
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
              <Link to="/settings" className="flex items-center">
                <Settings className={`h-5 w-5 ${isActive('/settings') ? "text-blue-500" : "text-gray-500"}`} />
                <span>Настройки</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Выйти"
            >
              <button onClick={logout} className="flex w-full items-center">
                <LogOut className="h-5 w-5 text-gray-500" />
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
