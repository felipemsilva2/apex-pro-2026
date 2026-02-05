import { useNavigate } from "react-router-dom";
import { Clock, Play, MoreVertical, Phone, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { Appointment } from "@/lib/supabase";

interface TodayAgendaProps {
  appointments: any[]; // Using any because of the join structure
  isLoading?: boolean;
}

const TodayAgenda = ({ appointments, isLoading }: TodayAgendaProps) => {
  const navigate = useNavigate();
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-success/10 text-success";
      case "pending":
        return "bg-warning/10 text-warning";
      case "cancelled":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmado";
      case "pending":
        return "Pendente";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  return (
    <div className="athletic-card group">
      <div className="kinetic-border" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="stat-label">Treinos de Hoje</h3>
          <p className="text-xl font-display font-black italic uppercase tracking-tighter mt-1">
            {appointments.length} Sessões <span className="text-primary">Ativas</span>
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/agenda')}
          className="text-[10px] font-black uppercase italic tracking-widest text-primary border border-primary/20 px-3 py-1 hover:bg-primary hover:text-primary-foreground transition-all"
        >
          VER AGENDA COMPLETA
        </button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border border-white/5 bg-white/5">
              <div className="space-y-2">
                <Skeleton className="h-6 w-12" variant="tactical" />
                <Skeleton className="h-3 w-8" variant="tactical" />
              </div>
              <Skeleton className="h-10 w-10 rounded-none -skew-x-12" variant="shimmer" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" variant="shimmer" />
                <Skeleton className="h-3 w-20" variant="tactical" />
              </div>
              <Skeleton className="h-8 w-24" variant="tactical" />
            </div>
          ))
        ) : appointments.length === 0 ? (
          <div className="text-center py-12 border border-white/5 bg-white/5 -skew-x-6">
            <Clock className="w-8 h-8 mx-auto mb-3 text-primary/40" />
            <p className="font-display font-bold italic uppercase text-xs tracking-widest opacity-50">Nenhum treino agendado</p>
          </div>
        ) : (
          appointments.map((appointment, index) => {
            const client = (appointment as any).clients;
            const time = new Date(appointment.start_time).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

            return (
              <div
                key={appointment.id}
                className={cn(
                  "group flex items-center gap-4 p-4 border border-white/5 bg-white/5 hover:border-primary/30 transition-all duration-300",
                  "animate-fade-in relative overflow-hidden"
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute top-0 right-0 w-16 h-full bg-primary/5 -skew-x-12 translate-x-8 opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Time */}
                <div className="flex flex-col items-center justify-center min-w-[70px] border-r border-white/10 pr-4">
                  <div className="text-xl font-display font-black text-primary italic leading-none">{time}</div>
                  <div className="text-[9px] font-bold uppercase text-muted-foreground mt-1">INÍCIO</div>
                </div>

                {/* Client Info */}
                <Avatar className="h-10 w-10 border border-white/10 -skew-x-12 rounded-none">
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-display font-bold uppercase rounded-none">
                    {client?.full_name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-sm text-foreground truncate uppercase italic">
                    {client?.full_name || "Desconhecido"}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-tighter opacity-80">{appointment.title}</span>
                    <div className={cn("text-[8px] font-black uppercase italic px-1.5 py-0.5 -skew-x-12", getStatusColor(appointment.status))}>
                      {getStatusLabel(appointment.status)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 relative z-10">
                  <button className="btn-athletic py-2 px-4 shadow-lg shadow-primary/10">
                    <span className="text-[10px]">VER TREINO</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div >
  );
};

export default TodayAgenda;
