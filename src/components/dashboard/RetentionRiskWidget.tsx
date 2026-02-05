import { useNavigate } from "react-router-dom";
import { AlertTriangle, Clock, UserX, CheckCircle, Smartphone } from "lucide-react";
import { useRetentionMetrics } from "@/hooks/useCoachData";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const RetentionRiskWidget = () => {
    const navigate = useNavigate();
    const { data, isLoading } = useRetentionMetrics();

    const atRiskCount = data?.atRisk?.length || 0;

    if (isLoading) {
        return <RetentionSkeleton />;
    }

    // If no data or empty, we can show a "All Good" state or hidden.
    // We'll show "All Good" if atRisk is 0 but we have onTrack clients.

    return (
        <div className="athletic-card group relative overflow-hidden">
            <div className="kinetic-border" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                    <h3 className="stat-label">Risco de Retenção</h3>
                    <p className="text-xl font-display font-black italic uppercase tracking-tighter mt-1">
                        ALUNOS <span className={cn(atRiskCount > 0 ? "text-destructive" : "text-primary")}>
                            {atRiskCount > 0 ? "EM RISCO" : "ENGAJADOS"}
                        </span>
                    </p>
                </div>
                <div className={cn(
                    "w-10 h-10 flex items-center justify-center -skew-x-12",
                    atRiskCount > 0 ? "bg-destructive/10 text-destructive border border-destructive/20" : "bg-primary/10 text-primary border border-primary/20"
                )}>
                    {atRiskCount > 0 ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
                </div>
            </div>

            {/* Content */}
            <div className="space-y-4 relative z-10 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {atRiskCount === 0 && (data?.onTrack?.length || 0) > 0 && (
                    <div className="text-center py-8 opacity-50">
                        <CheckCircle className="mx-auto w-12 h-12 text-primary mb-2 opacity-50" />
                        <p className="text-xs font-bold uppercase tracking-widest">Tudo em ordem, coach.</p>
                    </div>
                )}

                {data?.atRisk?.map((client: any, i: number) => (
                    <div
                        key={client.id}
                        onClick={() => navigate(`/dashboard/clients/${client.id}`)}
                        className="group/item flex items-center gap-4 p-3 border border-white/5 bg-white/5 hover:border-destructive/40 hover:bg-destructive/5 transition-all cursor-pointer -skew-x-3 hover:-skew-x-6"
                        style={{ animationDelay: `${i * 0.1}s` }}
                    >
                        {/* Avatar / Status Indicator */}
                        <div className="relative">
                            <div className="w-10 h-10 bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden">
                                {client.avatar_url ? (
                                    <img src={client.avatar_url} alt={client.full_name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="font-black italic text-xs text-white/30">{client.full_name?.[0]}</span>
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-destructive text-[8px] font-black text-white px-1 py-0.5 border border-black">
                                {client.daysInactive}d
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <h4 className="font-display font-bold text-sm text-white truncate group-hover/item:text-destructive transition-colors">
                                {client.full_name}
                            </h4>
                            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider flex items-center gap-1.5 mt-1">
                                <Clock size={10} />
                                Sem atividade há {client.daysInactive} dias
                            </p>
                        </div>

                        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity -translate-x-2 group-hover/item:translate-x-0">
                            <Smartphone size={14} className="text-destructive" />
                        </div>
                    </div>
                ))}

                {/* Top 3 Engaged (Mini Leaderboard) */}
                {(data?.onTrack?.length || 0) > 0 && (
                    <div className="pt-4 mt-4 border-t border-white/5">
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3">Top Engajamento (Alpha Squad)</p>
                        <div className="flex gap-2">
                            {data?.onTrack?.slice(0, 5).map((client: any) => (
                                <div key={client.id} className="relative group/mini cursor-pointer" onClick={() => navigate(`/dashboard/clients/${client.id}`)}>
                                    <div className="w-8 h-8 bg-zinc-900 border border-primary/20 flex items-center justify-center">
                                        {client.avatar_url ? (
                                            <img src={client.avatar_url} className="w-full h-full object-cover grayscale group-hover/mini:grayscale-0 transition-all" />
                                        ) : (
                                            <span className="text-[9px] font-bold text-primary">{client.full_name?.[0]}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const RetentionSkeleton = () => (
    <div className="athletic-card h-[300px] p-6">
        <div className="flex justify-between mb-8">
            <Skeleton className="h-8 w-32 bg-zinc-800" />
            <Skeleton className="h-10 w-10 rounded-none bg-zinc-800" />
        </div>
        <div className="space-y-4">
            <Skeleton className="h-16 w-full bg-zinc-900/50" />
            <Skeleton className="h-16 w-full bg-zinc-900/50" />
            <Skeleton className="h-16 w-full bg-zinc-900/50" />
        </div>
    </div>
);

export default RetentionRiskWidget;
