import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import TodayAgenda from "@/components/dashboard/TodayAgenda";
import EvolutionChart from "@/components/dashboard/EvolutionChart";
import RecentMessages from "@/components/dashboard/RecentMessages";
import RetentionRiskWidget from "@/components/dashboard/RetentionRiskWidget";
import RecentActivityFeed from "@/components/dashboard/RecentActivityFeed";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Activity, Plus, Zap, MessageSquare, Dumbbell, CalendarCheck } from "lucide-react";
import { useDashboardStats, useCoachClients, useCoachMessages } from "@/hooks/useCoachData";
import { useTenant } from "@/contexts/TenantContext";

const DashboardHome = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: clients, isLoading: clientsLoading } = useCoachClients();
  const { data: messages, isLoading: messagesLoading } = useCoachMessages();
  const { tenant } = useTenant();

  const activeClients = stats?.totalActiveClients || 0;
  const todayApps = stats?.todayAppointments || [];


  return (
    <div className="space-y-12 animate-fade-in pb-12 relative z-10 overflow-hidden lg:overflow-visible min-h-screen">
      {/* Background Kinetic Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      </div>

      {/* HUD Decoration */}
      <div className="absolute top-0 right-0 pointer-events-none opacity-20 hidden lg:block">
        <div className="font-display font-black text-[120px] leading-none text-primary/5 select-none -translate-y-1/2 translate-x-1/4 italic uppercase">
          PERF
        </div>
      </div>

      {/* Tactical Header / HUD Top Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-20 border-b border-white/5 pb-8">
        <div className="max-w-4xl">
          <div className="flex items-center gap-4 mb-4">
            <span className="h-px w-12 bg-primary"></span>
            <span className="font-display font-black italic uppercase text-[10px] tracking-[0.4em] text-primary">
              {tenant?.business_name || 'APEX PRO'} // ONLINE
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black leading-none mb-2">
            VISÃO GERAL
          </h1>
          <p className="font-display font-bold uppercase italic text-sm tracking-[0.3em] text-primary/60 mt-6 max-w-xl border-l-2 border-primary/20 pl-6 py-2">
            Bem-vindo(a), Coach {profile?.full_name?.split(" ")[0]}. Monitoramento de performance dos alunos em tempo real.
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <button
            data-tour="quick-actions"
            onClick={() => navigate('/dashboard/plans')}
            className="btn-athletic text-[10px] px-10 py-4 shadow-[0_10px_30px_rgba(212,255,0,0.2)]"
          >
            NOVO PLANO
          </button>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="relative">
        <div className="lg:-mt-4 lg:ml-12">
          <DashboardMetrics
            totalClients={activeClients}
            todayAppointments={stats?.todayAppointments?.length || 0}
            weekAppointments={stats?.completedWorkoutsThisWeek || 0}
            avgAdherence={stats?.avgAdherence || 0}
            topPerformers={stats?.topPerformers || 0}
            isLoading={statsLoading}
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-display font-black italic uppercase text-xs tracking-widest text-white">AGENDA DO DIA</span>
            <div className="h-px flex-1 bg-white/5"></div>
          </div>
          <TodayAgenda appointments={todayApps as any} isLoading={statsLoading} />
          <div className="grid md:grid-cols-2 gap-8">
            <RetentionRiskWidget />
            <RecentMessages messages={messages || []} isLoading={messagesLoading} />
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-display font-black italic uppercase text-xs tracking-widest text-white">BIOMETRIA & PROGRESSÃO</span>
            <div className="h-px flex-1 bg-white/5"></div>
          </div>
          <EvolutionChart />

          <RecentActivityFeed />

          <div className="athletic-card bg-primary/5 border-primary/20 relative overflow-hidden group">
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 flex items-center justify-center bg-primary text-primary-foreground -skew-x-12 font-display font-black italic">
                !
              </div>
              <div className="flex-1">
                <h4 className="font-display font-black text-white italic uppercase tracking-tighter">Próximo Check-in</h4>
                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-1">Sexta-feira, 08:00</p>
              </div>
              <Link to="/dashboard/plans">
                <button className="btn-athletic flex items-center gap-2 px-6 py-2 shadow-2xl skew-x-[-15deg] group transition-all">
                  <span className="skew-x-[15deg] flex items-center gap-2 font-display font-black italic uppercase text-xs">
                    <Plus size={14} />
                    NOVO PLANO
                  </span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};

export default DashboardHome;
