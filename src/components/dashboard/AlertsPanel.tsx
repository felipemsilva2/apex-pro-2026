import { useNavigate } from "react-router-dom";
import { AlertTriangle, Info, MessageCircle, ChevronRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Alert {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'info' | 'message';
  date: string;
  clients?: string[];
}

interface AlertsPanelProps {
  alerts: Alert[];
}

const AlertsPanel = ({ alerts }: AlertsPanelProps) => {
  const navigate = useNavigate();
  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning":
        return AlertTriangle;
      case "info":
        return Info;
      case "message":
        return MessageCircle;
      default:
        return Info;
    }
  };

  const getAlertColors = (type: string) => {
    switch (type) {
      case "warning":
        return {
          bg: "bg-warning/10",
          icon: "text-warning",
          border: "border-warning/20",
        };
      case "info":
        return {
          bg: "bg-info/10",
          icon: "text-info",
          border: "border-info/20",
        };
      case "message":
        return {
          bg: "bg-primary/10",
          icon: "text-primary",
          border: "border-primary/20",
        };
      default:
        return {
          bg: "bg-muted",
          icon: "text-muted-foreground",
          border: "border-border",
        };
    }
  };

  return (
    <div className="athletic-card group">
      <div className="kinetic-border" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="stat-label">Ações Requeridas</h3>
          <p className="text-xl font-display font-black italic uppercase tracking-tighter mt-1">
            Status de <span className="text-primary">Alerta</span>
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {alerts.map((alert, index) => {
          const Icon = getAlertIcon(alert.type);
          const colors = getAlertColors(alert.type);

          return (
            <div
              key={alert.id}
              className={cn(
                "group flex items-start gap-4 p-4 border border-white/5 bg-white/5 hover:border-primary/40 transition-all duration-300",
                "animate-fade-in relative overflow-hidden cursor-pointer"
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={cn("p-2 -skew-x-12", colors.bg.replace('/10', '/20'))}>
                <Icon className={cn("w-4 h-4", colors.icon)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-xs text-foreground uppercase italic">{alert.title}</p>
                <p className="text-[10px] text-muted-foreground mt-1 font-medium">{alert.description}</p>
                {alert.clients && (
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex -space-x-2">
                      {alert.clients.slice(0, 3).map((client, i) => (
                        <div key={i} className="w-5 h-5 bg-primary/20 border border-primary/40 flex items-center justify-center text-[8px] font-black italic -skew-x-12">
                          {client[0]}
                        </div>
                      ))}
                    </div>
                    <span className="text-[9px] font-bold text-primary uppercase tracking-widest opacity-80">
                      {alert.clients.length} Alunos Afetados
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => navigate('/dashboard/clients')}
        className="w-full mt-6 py-2 border border-white/10 text-[10px] font-display font-black italic uppercase tracking-widest hover:bg-white/5 transition-colors"
      >
        REVISAR TODOS OS ALERTAS
      </button>
    </div>
  );
};

export default AlertsPanel;
