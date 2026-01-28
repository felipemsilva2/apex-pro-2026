import { Users, Calendar, TrendingUp, Award, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "success" | "warning";
}

const MetricCard = ({ title, value, subtitle, icon: Icon, trend, variant = "default" }: MetricCardProps) => {
  const iconBgColors = {
    default: "bg-muted",
    primary: "bg-primary/10",
    success: "bg-success/10",
    warning: "bg-warning/10",
  };

  const iconColors = {
    default: "text-muted-foreground",
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
  };

  return (
    <div className="metric-card">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-2.5 rounded-lg", iconBgColors[variant])}>
          <Icon className={cn("w-5 h-5", iconColors[variant])} />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
            trend.isPositive 
              ? "bg-success/10 text-success" 
              : "bg-destructive/10 text-destructive"
          )}>
            {trend.isPositive ? (
              <ArrowUpRight size={12} />
            ) : (
              <ArrowDownRight size={12} />
            )}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label mt-1">{title}</div>
      {subtitle && (
        <div className="text-xs text-muted-foreground mt-2">{subtitle}</div>
      )}
    </div>
  );
};

interface DashboardMetricsProps {
  totalClients: number;
  todayAppointments: number;
  weekAppointments: number;
  avgAdherence: number;
  topPerformers: number;
}

const DashboardMetrics = ({
  totalClients,
  todayAppointments,
  weekAppointments,
  avgAdherence,
  topPerformers,
}: DashboardMetricsProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Clientes Ativos"
        value={totalClients}
        subtitle="+3 este mês"
        icon={Users}
        variant="primary"
        trend={{ value: 12, isPositive: true }}
      />
      <MetricCard
        title="Consultas Hoje"
        value={todayAppointments}
        subtitle={`${weekAppointments} esta semana`}
        icon={Calendar}
        variant="success"
      />
      <MetricCard
        title="Taxa de Adesão"
        value={`${avgAdherence}%`}
        subtitle="Média dos clientes"
        icon={TrendingUp}
        variant="warning"
        trend={{ value: 5, isPositive: true }}
      />
      <MetricCard
        title="Top Performers"
        value={topPerformers}
        subtitle="Acima de 90% de adesão"
        icon={Award}
        variant="success"
      />
    </div>
  );
};

export default DashboardMetrics;
