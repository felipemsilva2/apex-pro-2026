import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Building2,
    Users2,
    Settings,
    Menu,
    X,
    ShieldAlert,
    BarChart3,
    LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();

    const menuItems = [
        { label: "ATIVIDADE", icon: LayoutDashboard, path: "/hq" },
        { label: "AMBIENTES", icon: Building2, path: "/hq/tenants" },
        { label: "USUÁRIOS", icon: Users2, path: "/hq/users" },
        { label: "MÉTRICAS", icon: BarChart3, path: "/hq/metrics" },
        { label: "CONFIGURAÇÕES", icon: Settings, path: "/hq/settings" },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white flex overflow-hidden">
            {/* HQ Backglow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full opacity-50" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-600/5 blur-[150px] rounded-full opacity-30" />
            </div>

            {/* Sidebar */}
            <aside
                className={cn(
                    "relative z-50 bg-black/40 backdrop-blur-2xl border-r border-white/5 transition-all duration-500 flex flex-col",
                    isSidebarOpen ? "w-64" : "w-20"
                )}
            >
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white flex items-center justify-center -skew-x-12 shrink-0">
                        <span className="text-black font-display font-black text-2xl italic leading-none">A</span>
                    </div>
                    <AnimatePresence>
                        {isSidebarOpen && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="flex flex-col"
                            >
                                <span className="font-display font-black text-xl italic leading-none tracking-tighter">
                                    APEX<span className="text-primary">HQ</span>
                                </span>
                                <span className="text-[8px] font-black text-white/40 tracking-[0.3em] uppercase italic">Comando Global</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <nav className="flex-1 px-4 py-8 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-4 px-4 py-4 transition-all duration-300 group relative overflow-hidden",
                                    isActive ? "text-primary" : "text-white/40 hover:text-white"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="active-bg"
                                        className="absolute inset-0 bg-primary/5 border-r-2 border-primary"
                                    />
                                )}
                                <item.icon size={20} className={cn("transition-transform group-hover:scale-110", isActive && "text-primary")} />
                                <AnimatePresence>
                                    {isSidebarOpen && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="font-display font-bold italic text-[11px] tracking-widest uppercase"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-4 h-12 hover:bg-red-500/10 hover:text-red-500 text-white/40 transition-colors"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
                        {isSidebarOpen && <span className="font-display font-bold italic text-[10px] tracking-widest uppercase">RECOLHER</span>}
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 relative z-10 overflow-hidden">
                {/* Global HUD Header */}
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/20 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20">
                            <ShieldAlert size={12} className="text-red-500 animate-pulse" />
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest italic">Acesso Nível Omega</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-white italic tracking-widest uppercase">Admin Supervisor</span>
                            <span className="text-[8px] font-bold text-primary tracking-widest uppercase">Mestre do Sistema</span>
                        </div>
                        <Button variant="outline" size="icon" className="w-10 h-10 rounded-none border-white/10 bg-transparent hover:bg-white hover:text-black transition-all">
                            <LogOut size={16} />
                        </Button>
                    </div>
                </header>

                {/* Content Outlet */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
