import { Users, Calendar, TrendingUp, Award, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

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
  isLoading?: boolean;
}

const MetricCard = ({ title, value, subtitle, icon: Icon, trend, variant = "default", isLoading }: MetricCardProps) => {
  if (isLoading) {
    return (
      <div className="athletic-card border-white/5 relative overflow-hidden">
        <div className="flex justify-between mb-4">
          <Skeleton className="h-8 w-8 rounded-none" variant="tactical" />
          <Skeleton className="h-4 w-12 rounded-none" />
        </div>
        <Skeleton className="h-10 w-24 mb-2" variant="shimmer" />
        <Skeleton className="h-4 w-16" />
      </div>
    );
  }
  return (
    <div className="athletic-card group border-t-2 border-t-primary/20 hover:border-t-primary transition-all relative overflow-hidden">
      <div className="scanline opacity-10" />
      <div className="kinetic-border" />
      {/* Background Kinetic Line */}
      <div className="absolute top-0 right-0 w-32 h-full bg-primary/5 -skew-x-[30deg] translate-x-16 transition-transform duration-500 group-hover:translate-x-12" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-2">
          <div className="p-2 bg-primary/10 border border-primary/20 -skew-x-12 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
            <Icon className="w-4 h-4" />
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-[9px] font-black px-2 py-0.5 -skew-x-12 italic uppercase tracking-tighter shadow-[0_5px_15px_rgba(212,255,0,0.1)]",
              trend.isPositive
                ? "bg-primary text-primary-foreground"
                : "bg-destructive text-destructive-foreground"
            )}>
              {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
            </div>
          )}
        </div>

        <div className="stat-value text-4xl mb-1 group-hover:scale-110 origin-left transition-transform group-hover:text-white">{value}</div>
        <div className="stat-label mb-2 text-primary/40 group-hover:text-primary transition-colors">{title}</div>

        {subtitle && (
          <div className="text-[9px] font-black uppercase tracking-[0.25em] text-white/30 italic">
            DATA: {subtitle}
          </div>
        )}
      </div>
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
  isLoading
}: DashboardMetricsProps & { isLoading?: boolean }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Alunos Ativos"
        value={totalClients}
        subtitle="+3 novos"
        icon={Users}
        variant="primary"
        trend={{ value: 12, isPositive: true }}
        isLoading={isLoading}
      />
      <MetricCard
        title="Treinos Hoje"
        value={todayAppointments}
        subtitle={`${weekAppointments} na semana`}
        icon={Calendar}
        variant="success"
        isLoading={isLoading}
      />
      <MetricCard
        title="Consistência"
        value={`${avgAdherence}%`}
        subtitle="Média global"
        icon={TrendingUp}
        variant="warning"
        trend={{ value: 5, isPositive: true }}
        isLoading={isLoading}
      />
      <MetricCard
        title="Destaques (90%+)"
        value={topPerformers}
        subtitle="Foco na performance"
        icon={Award}
        variant="success"
        isLoading={isLoading}
      />
    </div>
  );
};

export default DashboardMetrics;
