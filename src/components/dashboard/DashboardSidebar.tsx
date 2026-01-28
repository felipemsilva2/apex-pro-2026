import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Calendar,
  BarChart3,
  MessageCircle,
  Settings,
  Bell,
  Moon,
  Sun,
  ChevronLeft,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { mockNutritionist, mockMessages } from "@/data/mockData";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DashboardSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Clientes", path: "/dashboard/clientes" },
  { icon: ClipboardList, label: "Planos", path: "/dashboard/planos" },
  { icon: Calendar, label: "Agenda", path: "/dashboard/agenda" },
  { icon: BarChart3, label: "Relatórios", path: "/dashboard/relatorios" },
  { icon: MessageCircle, label: "Mensagens", path: "/dashboard/mensagens", badge: mockMessages.filter(m => m.unread).length },
  { icon: Settings, label: "Configurações", path: "/dashboard/configuracoes" },
];

const DashboardSidebar = ({ collapsed, onCollapse }: DashboardSidebarProps) => {
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);
  const unreadCount = mockMessages.filter(m => m.unread).length;

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const SidebarContent = ({ item, isActive }: { item: typeof menuItems[0]; isActive: boolean }) => (
    <>
      <item.icon size={20} />
      {!collapsed && (
        <>
          <span className="flex-1">{item.label}</span>
          {item.badge && item.badge > 0 && (
            <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs">
              {item.badge}
            </Badge>
          )}
        </>
      )}
    </>
  );

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 z-40",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center h-16 px-4 border-b border-sidebar-border",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">N</span>
            </div>
            <span className="font-bold text-foreground">NutriManage</span>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">N</span>
          </div>
        )}
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onCollapse(true)}
          >
            <ChevronLeft size={16} />
          </Button>
        )}
      </div>

      {/* Profile */}
      <div className={cn(
        "p-4 border-b border-sidebar-border",
        collapsed && "flex justify-center"
      )}>
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="h-10 w-10 cursor-pointer">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                  {mockNutritionist.avatar}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="font-medium">{mockNutritionist.name}</p>
              <p className="text-xs text-muted-foreground">{mockNutritionist.crn}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                {mockNutritionist.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">
                {mockNutritionist.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {mockNutritionist.crn}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== "/dashboard" && location.pathname.startsWith(item.path));

          const linkContent = (
            <NavLink
              to={item.path}
              className={cn(
                "sidebar-item",
                isActive && "sidebar-item-active",
                collapsed && "justify-center px-0"
              )}
            >
              <SidebarContent item={item} isActive={isActive} />
            </NavLink>
          );

          return collapsed ? (
            <Tooltip key={item.path}>
              <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-2">
                {item.label}
                {item.badge && item.badge > 0 && (
                  <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </TooltipContent>
            </Tooltip>
          ) : (
            <div key={item.path}>{linkContent}</div>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        {/* Notifications */}
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" className="w-full justify-center relative" size="icon">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Notificações</TooltipContent>
          </Tooltip>
        ) : (
          <Button variant="ghost" className="w-full justify-start gap-3">
            <Bell size={20} />
            <span className="flex-1 text-left">Notificações</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs">
                {unreadCount}
              </Badge>
            )}
          </Button>
        )}

        {/* Theme toggle */}
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" className="w-full justify-center" size="icon" onClick={toggleTheme}>
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">{isDark ? "Modo claro" : "Modo escuro"}</TooltipContent>
          </Tooltip>
        ) : (
          <Button variant="ghost" className="w-full justify-start gap-3" onClick={toggleTheme}>
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            <span>{isDark ? "Modo claro" : "Modo escuro"}</span>
          </Button>
        )}

        {/* Collapse/Expand */}
        {collapsed && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-center"
                size="icon"
                onClick={() => onCollapse(false)}
              >
                <ChevronLeft size={20} className="rotate-180" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Expandir menu</TooltipContent>
          </Tooltip>
        )}
      </div>
    </aside>
  );
};

export default DashboardSidebar;
