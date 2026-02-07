
import { useState, useEffect, ReactNode, createContext, useContext } from "react";
import {
    X, LayoutDashboard, Users, Calendar,
    BarChart3, MessageSquare, Settings as SettingsIcon,
    Plus, Search, Bell, Menu, ArrowRight
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import DashboardHome from "@/pages/dashboard/DashboardHome";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { cn } from "@/lib/utils";

// Mock Data for the Sandbox
const mockDemoProfile = {
    id: "demo-coach-id",
    full_name: "Coach Emerson",
    role: "coach",
    cref: "123456-G/SP",
    tenant_id: "demo-tenant-id"
};

const mockDemoTenant = {
    id: "demo-tenant-id",
    business_name: "APEX PERFORMANCE",
    logo_url: null,
    primary_color: "#D4FF00",
};

// We create a "Sandbox Wrapper" to provide mock context for real dashboard components
export const InteractiveDemoModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [runTour, setRunTour] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => setRunTour(true), 1000);
            return () => clearTimeout(timer);
        } else {
            setRunTour(false);
        }
    }, [isOpen]);

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status } = data;
        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
            setRunTour(false);
        }
    };

    const steps: Step[] = [
        {
            target: 'body',
            placement: 'center',
            content: (
                <div className="flex flex-col gap-3 text-left">
                    <h3 className="font-display font-black italic uppercase text-lg text-primary">Degustação APEX PRO</h3>
                    <p className="text-sm text-zinc-400">
                        Você está agora dentro do sistema real, mas em um ambiente de teste seguro.
                    </p>
                </div>
            ),
            disableBeacon: true,
        },
        {
            target: '[data-tour="sidebar-nav"]',
            content: "Este é seu centro de controle lateral. Tudo o que você precisa para gerenciar alunos e consultoria está aqui.",
            placement: 'right',
        },
        {
            target: '[data-tour="quick-actions"]',
            content: "Ações rápidas para produtividade tática. Crie planos e cadastre alunos com um clique.",
            placement: 'bottom',
        },
        {
            target: '.apex-container',
            content: "Explore os widgets reais: Gráficos de evolução, agenda sincronizada e retenção de alunos.",
            placement: 'top'
        }
    ];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-[98vw] md:max-w-[90vw] w-full h-[92vh] md:h-[85vh] p-0 bg-[#0A0A0B] border border-white/10 overflow-hidden flex shadow-[0_0_80px_rgba(0,0,0,0.9)] backdrop-blur-3xl outline-none select-none rounded-xl md:rounded-3xl border-white/5">

                {/* Main Container with flex column for Banner + Content */}
                <div className="flex flex-col w-full h-full relative isolate">

                    {/* Sandbox Banner - Fixed height container */}
                    <div className="h-12 md:h-14 shrink-0 z-[100] bg-primary text-black px-4 md:px-8 flex items-center justify-between font-display font-black italic text-[9px] md:text-[11px] uppercase tracking-widest shadow-[0_4px_30px_rgba(212,255,0,0.3)] border-b border-black/10">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-black animate-pulse" />
                                <span className="hidden xs:inline">MODO DEMONSTRAÇÃO ATIVO</span>
                                <span className="xs:hidden">DEMO ATIVA</span>
                            </span>
                            <span className="hidden lg:block opacity-40 font-bold border-l border-black/20 pl-4 tracking-tighter uppercase italic">Interface Real // Sistema Apex Pro</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="flex items-center gap-2 hover:bg-black/10 px-2 md:px-4 py-1.5 md:py-2 transition-all rounded-sm border border-black/10 font-black italic"
                        >
                            <span className="hidden xs:inline">FECHAR PREVIEW</span>
                            <span className="xs:hidden">SAIR</span>
                            <X size={16} strokeWidth={3} />
                        </button>
                    </div>

                    {/* Content Wrapper (Sidebar + Dashboard) */}
                    <div className="flex-1 flex w-full relative overflow-hidden h-[calc(100%-3.5rem)]">

                        {/* Modified Sidebar Container - Local placement */}
                        <div className="hidden lg:block relative z-50 h-full">
                            <div className="absolute inset-0 w-full h-full [&_aside]:absolute [&_aside]:h-full [&_aside]:z-50 [&_aside]:pt-8">
                                <DashboardSidebar
                                    collapsed={sidebarCollapsed}
                                    onCollapse={setSidebarCollapsed}
                                />
                            </div>
                            {/* Static spacer */}
                            <div className={cn("transition-all duration-500 h-full border-r border-white/5", sidebarCollapsed ? "w-16" : "w-64")} />
                        </div>

                        {/* Real Dashboard Content */}
                        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#0A0A0B] relative apex-container h-full">
                            <div className="p-4 md:p-8 lg:p-16 lg:pt-20 min-h-full">
                                <DashboardHome />
                            </div>

                            {/* Conversion Overlay CTA */}
                            <div className="sticky bottom-4 md:bottom-10 left-0 right-0 z-[110] flex justify-center pointer-events-none pb-6 md:pb-12 px-4">
                                <button
                                    onClick={() => window.location.href = '/checkout'}
                                    className="pointer-events-auto bg-primary shadow-[0_30px_70px_rgba(212,255,0,0.5)] px-6 md:px-14 py-4 md:py-5 text-black font-display font-black italic uppercase text-[10px] md:text-xs -skew-x-12 hover:scale-110 active:scale-95 transition-all flex items-center gap-4 border-2 border-black/10"
                                >
                                    <span className="hidden xs:inline">ATIVAR MEU COMANDO AGORA</span>
                                    <span className="xs:hidden">ATIVAR AGORA</span>
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </main>
                    </div>

                    {/* Joyride Tour */}
                    <Joyride
                        steps={steps}
                        run={runTour}
                        continuous
                        showSkipButton
                        showProgress
                        callback={handleJoyrideCallback}
                        styles={{
                            options: {
                                zIndex: 1000000,
                                primaryColor: '#D4FF00',
                                backgroundColor: '#09090b',
                                textColor: '#fff',
                                arrowColor: '#09090b',
                            }
                        }}
                        locale={{
                            back: 'VOLTAR',
                            close: 'FECHAR',
                            last: 'COMEÇAR AGORA',
                            next: 'PRÓXIMO',
                            skip: 'PULAR',
                        }}
                    />

                    {/* Global CSS Overrides for Joyride components inside the modal */}
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        /* Force High Contrast for Joyride Next/Last Button */
                        button[aria-label="Next"], 
                        button[aria-label="Last"],
                        .joyride-tooltip__button-primary {
                            color: #000000 !important;
                            font-weight: 900 !important;
                            font-family: inherit !important;
                            text-transform: uppercase !important;
                            padding: 12px 24px !important;
                            border-radius: 2px !important;
                            transform: skewX(-12deg) !important;
                        }
                        
                        [data-radix-portal] { z-index: 9999 !important; }
                        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(212,255,0,0.1); border-radius: 10px; }
                    `}} />
                </div>
            </DialogContent>
        </Dialog>
    );
};
