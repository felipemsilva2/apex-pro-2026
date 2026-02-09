import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  Bell,
  ChevronLeft,
  FileText,
  MessageSquare,
  Menu,
  X,
  Shield,
  Activity,
  LogOut,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { mockCoach, mockMessages } from "@/data/mockData";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DashboardSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const DashboardSidebar = ({ collapsed, onCollapse }: DashboardSidebarProps) => {
  const { signOut, profile } = useAuth();

  const location = useLocation();
  const { tenant, t } = useTenant();
  const unreadCount = mockMessages.filter(m => m.unread).length;

  const menuItems = [
    { icon: LayoutDashboard, label: "VISÃO GERAL", path: "/dashboard" },
    { icon: Users, label: "MEUS ALUNOS", path: "/dashboard/clients" },
    { icon: Activity, label: t('marketing', 'MARKETING'), path: "/dashboard/marketing" },
    { icon: Calendar, label: t('appointments', 'AGENDA'), path: "/dashboard/agenda" },
    { icon: FileText, label: `${t('training', 'TREINOS')} & ${t('nutrition', 'DIETA')}`, path: "/dashboard/plans" },
    { icon: MessageSquare, label: t('messages', 'CHAT'), path: "/dashboard/messages", badge: unreadCount },
    { icon: CreditCard, label: "ASSINATURA", path: "/dashboard/billing" },
    { icon: Settings, label: "CONFIGURAÇÕES", path: "/dashboard/settings" },
  ];

  return (
    <aside
      data-tour="sidebar-nav"
      className={cn(
        "fixed left-0 top-0 h-screen z-40 bg-zinc-950/40 backdrop-blur-2xl border-r border-white/10 transition-all duration-500 group/sidebar overflow-hidden flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Brand */}
      <div className="p-6 h-20 flex items-center justify-between border-b border-white/10 shrink-0 relative overflow-hidden">
        {!collapsed ? (
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="w-10 h-10 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center overflow-hidden shrink-0">
              {tenant?.logo_url ? (
                <img src={tenant.logo_url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary font-display font-black text-lg italic">{tenant?.business_name?.charAt(0) || 'A'}</span>
              )}
            </div>
            <div className="min-w-0 flex-1 flex flex-col justify-center">
              <span className="font-display font-black text-lg text-white italic uppercase tracking-tighter leading-none break-words line-clamp-2">
                {tenant?.business_name || 'APEX'}<span className="text-primary text-blur-sm">{!tenant?.business_name && 'PRO'}</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center overflow-hidden mx-auto">
            {tenant?.logo_url ? (
              <img src={tenant.logo_url} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary font-display font-black text-xl italic">{tenant?.business_name?.charAt(0) || 'A'}</span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Profile */}
        <div className={cn(
          "mx-4 my-2 p-4 bg-white/[0.03] border border-white/10 rounded-2xl relative overflow-hidden shrink-0",
          collapsed ? "px-0 flex justify-center" : ""
        )}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-10 w-10 border border-primary/20">
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-display font-bold">
                    {profile?.full_name?.substring(0, 2).toUpperCase() || 'CO'}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="font-display font-bold uppercase italic text-xs">{profile?.full_name || 'Coach'}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-3 relative z-10">
              <Avatar className="h-10 w-10 border border-primary/20">
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-display font-bold">
                  {profile?.full_name?.substring(0, 2).toUpperCase() || 'CO'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-xs text-foreground truncate uppercase italic">
                  {profile?.full_name || 'Coach'}
                </p>
                <p className="text-[10px] text-primary font-bold uppercase tracking-widest opacity-80">
                  Personal Trainer
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== "/dashboard" && location.pathname.startsWith(item.path));

            const linkContent = (
              <NavLink
                to={item.path}
                className={cn(
                  "sidebar-item hover:text-primary transition-all duration-300 group relative",
                  isActive && "sidebar-item-active",
                  collapsed && "justify-center px-0"
                )}
              >
                <item.icon size={18} className={cn("transition-all duration-300 group-hover:scale-110 group-hover:text-primary z-10", isActive && "text-primary neon-glow")} />
                {!collapsed && (
                  <span className="flex-1 font-display font-bold uppercase italic text-[11px] tracking-wider z-10 leading-none">{item.label}</span>
                )}
                {"badge" in item && item.badge !== undefined && item.badge > 0 && !collapsed && (
                  <div className="h-4 min-w-4 px-1 bg-primary text-primary-foreground text-[10px] font-black flex items-center justify-center -skew-x-12 z-10 shadow-[0_0_10px_rgba(212,255,0,0.3)]">
                    {item.badge}
                  </div>
                )}
                {isActive && (
                  <div className="absolute inset-0 bg-primary/5 border-l-2 border-primary z-0" />
                )}
              </NavLink>
            );

            return collapsed ? (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" className="flex items-center gap-2 bg-card border-primary/20 text-foreground font-display font-bold italic uppercase text-xs">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            ) : (
              <div key={item.path}>{linkContent}</div>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-white/5 space-y-1 shrink-0">
          {/* Notifications */}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" className="w-full justify-center relative text-white/40 hover:text-primary" size="icon">
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(212,255,0,0.5)]" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Notificações</TooltipContent>
            </Tooltip>
          ) : (
            <Button variant="ghost" className="w-full justify-start gap-3 text-white/40 hover:text-primary group">
              <Bell size={18} />
              <span className="flex-1 text-left font-display font-bold uppercase italic text-[10px] tracking-widest transition-colors">Notificações</span>
              {unreadCount > 0 && (
                <div className="h-4 min-w-4 px-1 bg-primary text-black text-[10px] font-black flex items-center justify-center -skew-x-12">
                  {unreadCount}
                </div>
              )}
            </Button>
          )}


          {/* Logout */}
          {!collapsed && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <div className="flex items-center gap-3 text-white/40 hover:text-primary transition-colors cursor-pointer group px-2">
                  <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="font-display font-black italic uppercase text-[10px] tracking-widest">DESCONECTAR SISTEMA</span>
                </div>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-zinc-950 border border-white/10 p-6 rounded-none">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-display font-black italic uppercase text-white text-xl">Confirmar Saída</AlertDialogTitle>
                  <AlertDialogDescription className="text-zinc-400 text-xs uppercase tracking-wider font-medium">
                    Tem certeza que deseja encerrar sua sessão?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                  <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white rounded-none font-display font-bold uppercase tracking-widest text-[10px] h-10 border-0">Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={signOut} className="bg-primary text-black hover:bg-primary/90 rounded-none font-display font-black italic uppercase tracking-widest text-[10px] h-10 border-0">Confirmar Saída</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* Expand */}
          {collapsed && (
            <Button
              variant="ghost"
              className="w-full justify-center text-white/40 hover:text-primary pt-2"
              size="icon"
              onClick={() => onCollapse(false)}
            >
              <ChevronLeft size={18} className="rotate-180" />
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
