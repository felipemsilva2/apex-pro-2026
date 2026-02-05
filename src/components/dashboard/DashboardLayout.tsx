import { Outlet } from "react-router-dom";
import { useState } from "react";
import DashboardSidebar from "./DashboardSidebar";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTenant } from "@/contexts/TenantContext";
import { ProductTour } from "./ProductTour";
import { WhatsAppSupport } from "./WhatsAppSupport";

const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { tenant } = useTenant();

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white font-sans">
      {/* Background kinetic effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full" />
      </div>

      <ProductTour />
      <WhatsAppSupport />

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <DashboardSidebar
          collapsed={sidebarCollapsed}
          onCollapse={setSidebarCollapsed}
        />
      </div>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-black/60 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-3">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary transition-colors">
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 bg-black border-r border-white/5">
              <DashboardSidebar
                collapsed={false}
                onCollapse={() => { }}
              />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-sm bg-primary flex items-center justify-center -skew-x-12">
              <span className="text-primary-foreground font-display font-black text-xl italic">{tenant?.business_name?.charAt(0) || 'N'}</span>
            </div>
            <span className="font-display font-black text-lg italic uppercase tracking-tighter">
              {tenant?.business_name || 'APEX'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={cn(
          "transition-all duration-500 pt-16 lg:pt-0 relative active:scale-[0.995] overflow-x-hidden",
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
        )}
      >
        <div className="p-4 lg:p-8 apex-container min-h-screen">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
