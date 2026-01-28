import { AlertTriangle, Info, MessageCircle, ChevronRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Alert } from "@/data/mockData";

interface AlertsPanelProps {
  alerts: Alert[];
}

const AlertsPanel = ({ alerts }: AlertsPanelProps) => {
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
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-foreground">Alertas e Pendências</h3>
          <p className="text-sm text-muted-foreground">{alerts.length} itens requerem atenção</p>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, index) => {
          const Icon = getAlertIcon(alert.type);
          const colors = getAlertColors(alert.type);

          return (
            <div
              key={alert.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-colors hover:bg-muted/50 cursor-pointer",
                colors.border,
                "animate-fade-in"
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={cn("p-2 rounded-lg", colors.bg)}>
                <Icon className={cn("w-4 h-4", colors.icon)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground">{alert.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
                {alert.clients && (
                  <div className="flex items-center gap-1 mt-2">
                    <Users size={12} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {alert.clients.slice(0, 2).join(", ")}
                      {alert.clients.length > 2 && ` +${alert.clients.length - 2}`}
                    </span>
                  </div>
                )}
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <ChevronRight size={16} />
              </Button>
            </div>
          );
        })}
      </div>

      <Button variant="outline" className="w-full mt-4" size="sm">
        Ver Todos os Alertas
      </Button>
    </div>
  );
};

export default AlertsPanel;
