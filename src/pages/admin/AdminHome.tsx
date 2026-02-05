import { useState, useEffect } from "react";
import { AdminService, type GlobalStats } from "@/api/services/adminService";
import {
    Users,
    Building,
    UserCheck,
    Activity,
    ArrowUpRight,
    Search,
    Filter,
    ShieldAlert,
    Eye
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const AdminHome = () => {
    const [stats, setStats] = useState<GlobalStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await AdminService.getGlobalStats();
                setStats(data);
            } catch (err) {
                console.error("Error fetching admin stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const metricCards = [
        { label: "AMBIENTES ATIVOS", value: stats?.active_tenants || 0, total: stats?.total_tenants || 0, icon: Building, color: "text-primary" },
        { label: "TREINADORES MESTRE", value: stats?.total_coaches || 0, icon: UserCheck, color: "text-indigo-500" },
        { label: "ATLETAS NO SISTEMA", value: stats?.total_clients || 0, icon: Users, color: "text-emerald-500" },
        { label: "CARGA DO SERVIDOR", value: "Normal", icon: Activity, color: "text-orange-500" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Page Title */}
            <div className="flex flex-col gap-1">
                <h1 className="text-4xl font-display font-black italic uppercase text-white tracking-tighter">
                    VISÃO GERAL <span className="text-primary text-blur-sm">TACTICAL</span>
                </h1>
                <p className="text-white/40 font-display font-bold uppercase italic text-[10px] tracking-[0.3em]">
                    Monitoramento em tempo real de toda a frota Apex
                </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metricCards.map((metric, i) => (
                    <Card key={i} className="bg-black/40 border-white/5 p-6 relative overflow-hidden group hover:border-primary/50 transition-all duration-500">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <metric.icon size={48} />
                        </div>
                        <div className="flex flex-col gap-4 relative z-10">
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] italic">{metric.label}</span>
                                <ArrowUpRight size={12} className="text-primary opacity-50" />
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-display font-black italic text-white leading-none">
                                    {metric.value}
                                </span>
                                {metric.total !== undefined && (
                                    <span className="text-sm font-display font-bold text-white/20 italic">/ {metric.total}</span>
                                )}
                            </div>
                            {metric.total !== undefined && (
                                <Progress value={((metric.value as number) / (metric.total as number)) * 100} className="h-1 bg-white/5" />
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            {/* Recent Alerts & Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* System Integrity */}
                <Card className="lg:col-span-2 bg-black/40 border-white/5 p-8 relative overflow-hidden shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-8 bg-primary -skew-x-12" />
                            <h2 className="text-xl font-display font-black italic uppercase tracking-tighter">ESTADO DOS SISTEMAS</h2>
                        </div>
                        <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest italic text-primary/60 hover:text-primary transition-colors gap-2">
                            VER DETALHES <Eye size={14} />
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {[
                            { name: "AUTENTICAÇÃO GLOBAL", status: "NOMINAL", latency: "14ms", load: 12 },
                            { name: "REDE DE ENTREGAS (CDN)", status: "ESTÁVEL", latency: "22ms", load: 0.8 },
                            { name: "SINCRONIZAÇÃO EM TEMPO REAL", status: "NOMINAL", latency: "8ms", load: 45 },
                        ].map((sys, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 group hover:bg-white/10 transition-colors">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black italic tracking-widest text-white/60 uppercase">{sys.name}</span>
                                    <span className={`text-[9px] font-black italic tracking-[0.2em] mt-1 ${sys.status === 'NOMINAL' ? 'text-emerald-500' : 'text-primary'}`}>{sys.status}</span>
                                </div>
                                <div className="text-right flex items-center gap-6">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">LATÊNCIA</span>
                                        <span className="text-xs font-display font-black italic text-white">{sys.latency}</span>
                                    </div>
                                    <div className="w-[100px]">
                                        <Progress value={sys.load} className="h-0.5 bg-white/5" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Critical Commands */}
                <div className="space-y-6">
                    <Card className="bg-red-500/5 border-red-500/20 p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <ShieldAlert size={64} className="text-red-500" />
                        </div>
                        <h3 className="text-lg font-display font-black italic text-red-500 uppercase tracking-tighter mb-4">COMANDO DE EMERGÊNCIA</h3>
                        <p className="text-[10px] font-bold text-red-500/60 uppercase italic leading-loose mb-6">
                            Acesso restrito para suspensão global ou manutenção de emergência do servidor.
                        </p>
                        <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-display font-black italic uppercase tracking-widest rounded-none h-12 transition-all group-hover:scale-[1.02]">
                            EXECUTAR PROTOCOLO 0
                        </Button>
                    </Card>

                    <Card className="bg-black/60 border-white/5 p-8 relative">
                        <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.3em] italic mb-6">BUSCA RÁPIDA</h3>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                            <Input
                                placeholder="LOCALIZAR AMBIENTE OU USER..."
                                className="pl-12 h-14 bg-white/5 border-white/10 rounded-none font-display font-bold italic uppercase text-[10px] tracking-widest focus:border-primary transition-all text-white"
                            />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminHome;
