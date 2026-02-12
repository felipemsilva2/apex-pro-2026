import { useNavigate } from "react-router-dom";
import { Activity, Dumbbell, CalendarCheck, Zap, MessageSquare } from "lucide-react";
import { useRetentionMetrics } from "@/hooks/useCoachData";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const RecentActivityFeed = () => {
    const navigate = useNavigate();
    const { data, isLoading } = useRetentionMetrics();

    if (isLoading) {
        return <FeedSkeleton />;
    }

    const activities = data?.recentActivity || [];

    return (
        <div className="athletic-card group relative overflow-hidden h-full">
            <div className="kinetic-border" />

            <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                    <h3 className="stat-label">Feed Operacional</h3>
                    <p className="text-xl font-display font-black italic uppercase tracking-tighter mt-1">
                        ATIVIDADE <span className="text-primary text-blur-sm">RECENTE</span>
                    </p>
                </div>
                <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center -skew-x-12 text-primary">
                    <Activity size={20} />
                </div>
            </div>

            <div className="space-y-4 relative z-10 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {activities.length === 0 ? (
                    <div className="text-center py-8 opacity-50">
                        <Dumbbell className="mx-auto w-10 h-10 text-white/20 mb-2" />
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sem atividade recente</p>
                    </div>
                ) : (
                    activities.map((activity: any, i: number) => (
                        <div
                            key={activity.id}
                            onClick={() => {
                                if (activity.type === 'message' && activity.client_id) {
                                    navigate(`/dashboard/messages?clientId=${activity.client_id}`);
                                }
                            }}
                            className={cn(
                                "group/item flex gap-4 p-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors relative",
                                activity.type === 'message' && activity.client_id && "cursor-pointer"
                            )}
                            style={{ animationDelay: `${i * 0.05}s` }}
                        >
                            <div className="relative mt-1">
                                <div className="w-8 h-8 bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden rounded-full">
                                    {activity.clientAvatar ? (
                                        <img src={activity.clientAvatar} alt={activity.clientName} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="font-bold text-[10px] text-zinc-500">{activity.clientName?.[0]}</span>
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-primary text-black rounded-full p-0.5 border border-black">
                                    {activity.type === 'message' ? (
                                        <MessageSquare size={8} fill="currentColor" />
                                    ) : (
                                        <Zap size={8} fill="currentColor" />
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <p className="font-bold text-xs text-primary truncate">
                                        {activity.clientName}
                                    </p>
                                    <span className="text-[9px] text-muted-foreground font-medium whitespace-nowrap ml-2">
                                        {formatDistanceToNow(new Date(activity.completed_at), { addSuffix: true, locale: ptBR })}
                                    </span>
                                </div>
                                <p className="text-sm font-bold text-white leading-tight mt-0.5">
                                    {activity.type === 'message' ? (
                                        <span>Enviou: <span className="italic text-white/80">{activity.content || 'Mensagem direta'}</span></span>
                                    ) : (
                                        <span>Completou: <span className="italic text-white/80">{activity.name}</span></span>
                                    )}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-background to-transparent z-20 pointer-events-none" />
        </div>
    );
};

const FeedSkeleton = () => (
    <div className="athletic-card h-[350px] p-6">
        <div className="flex justify-between mb-8">
            <Skeleton className="h-8 w-32 bg-zinc-800" />
            <Skeleton className="h-10 w-10 rounded-none bg-zinc-800" />
        </div>
        <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex gap-4">
                    <Skeleton className="h-10 w-10 rounded-full bg-zinc-900" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24 bg-zinc-900" />
                        <Skeleton className="h-4 w-full bg-zinc-900" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default RecentActivityFeed;
