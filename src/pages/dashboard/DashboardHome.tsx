import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import TodayAgenda from "@/components/dashboard/TodayAgenda";
import AlertsPanel from "@/components/dashboard/AlertsPanel";
import EvolutionChart from "@/components/dashboard/EvolutionChart";
import RecentMessages from "@/components/dashboard/RecentMessages";
import { mockClients, mockTodayAppointments, mockAlerts, mockMessages, mockNutritionist } from "@/data/mockData";

const DashboardHome = () => {
  const activeClients = mockClients.filter(c => c.status === "active").length;
  const avgAdherence = Math.round(
    mockClients.reduce((acc, c) => acc + c.adherence, 0) / mockClients.length
  );
  const topPerformers = mockClients.filter(c => c.adherence >= 90).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          Bem-vindo(a), {mockNutritionist.name.split(" ")[0]}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Aqui está o resumo do seu dia
        </p>
      </div>

      {/* Metrics */}
      <DashboardMetrics
        totalClients={activeClients}
        todayAppointments={mockTodayAppointments.length}
        weekAppointments={12}
        avgAdherence={avgAdherence}
        topPerformers={topPerformers}
      />

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Agenda */}
        <div className="lg:col-span-2">
          <TodayAgenda appointments={mockTodayAppointments} />
        </div>

        {/* Right Column - Alerts */}
        <div>
          <AlertsPanel alerts={mockAlerts} />
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2">
          <EvolutionChart />
        </div>

        {/* Messages */}
        <div>
          <RecentMessages messages={mockMessages} />
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
