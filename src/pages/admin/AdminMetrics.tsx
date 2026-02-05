import { useState, useEffect } from "react";
import { AdminService, type GlobalStats } from "@/api/services/adminService";
import {
    Activity,
    TrendingUp,
    Users,
    Building,
    BarChart3,
    ArrowUpRight,
    Calendar
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

const AdminMetrics = () => {
    const [stats, setStats] = useState<GlobalStats | null>(null);
    const [loading, setLoading] = useState(true);

    // Mock history data for charts
    const historyData = [
        { name: 'JAN', ambientes: 10, usuarios: 45, crescimento: 12 },
        { name: 'FEV', ambientes: 15, usuarios: 98, crescimento: 25 },
        { name: 'MAR', ambientes: 22, usuarios: 167, crescimento: 18 },
        { name: 'ABR', ambientes: 28, usuarios: 234, crescimento: 32 },
        { name: 'MAI', ambientes: 35, usuarios: 312, crescimento: 45 },
        { name: 'JUN', ambientes: 42, usuarios: 445, crescimento: 58 },
    ];

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await AdminService.getGlobalStats();
                setStats(data);
            } catch (err) {
                console.error("Error fetching metrics:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-700">
            <div className="flex flex-col gap-1">
                <h1 className="text-4xl font-display font-black italic uppercase text-white tracking-tighter">
                    ANÁLISE DE <span className="text-primary text-blur-sm">PERFORMANCE</span>
                </h1>
                <p className="text-white/40 font-display font-bold uppercase italic text-[10px] tracking-[0.3em]">
                    Dados agregados e projeções de crescimento da rede
                </p>
            </div>

            {/* Performance Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Growth Chart */}
                <Card className="lg:col-span-2 bg-black/40 border-white/5 p-8 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="text-primary" size={24} />
                            <h2 className="text-xl font-display font-black italic uppercase tracking-tighter">CRESCIMENTO DA REDE</h2>
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 p-1 px-3 border border-white/5">
                            <Calendar size={12} className="text-primary" />
                            <span className="text-[10px] font-black italic text-white/60">ÚLTIMOS 6 MESES</span>
                        </div>
                    </div>

                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={historyData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#D4FF00" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#D4FF00" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                                <XAxis
                                    dataKey="name"
                                    stroke="#ffffff20"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#ffffff20"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff10', fontSize: '12px' }}
                                    itemStyle={{ color: '#D4FF00' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="usuarios"
                                    stroke="#D4FF00"
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Sub-metrics */}
                <div className="space-y-6">
                    <Card className="bg-black/40 border-white/5 p-6 border-l-4 border-primary">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 flex items-center justify-center">
                                <Users size={20} className="text-primary" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">TAXA DE RETENÇÃO</span>
                                <span className="text-2xl font-display font-black italic text-white">98.4%</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-black/60 border-white/5 p-8 relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <BarChart3 size={120} />
                        </div>
                        <h3 className="text-xs font-black text-white/60 uppercase tracking-widest italic mb-6 text-center">SAÚDE DOS AMBIENTES</h3>
                        <div className="space-y-6 relative z-10">
                            {[
                                { label: "UPTIME GLOBAL", value: 99.9, color: "bg-emerald-500" },
                                { label: "USO DE STORAGE", value: 42, color: "bg-primary" },
                                { label: "CARGA DE CPU", value: 18, color: "bg-indigo-500" },
                            ].map((item, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{item.label}</span>
                                        <span className="text-[10px] font-black italic text-white">{item.value}%</span>
                                    </div>
                                    <Progress value={item.value} className="h-1 bg-white/5" indicatorClassName={item.color} />
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminMetrics;
