import { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { mockTodayAppointments } from "@/data/mockData";

const AgendaPage = () => {
  const [currentDate] = useState(new Date());
  const [view, setView] = useState<"week" | "month">("week");

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const hours = Array.from({ length: 12 }, (_, i) => i + 7); // 7:00 to 18:00

  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Agenda</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas consultas e compromissos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <CalendarIcon size={16} />
            Sincronizar Google Calendar
          </Button>
          <Button className="btn-dashboard gap-2">
            <Plus size={18} />
            Nova Consulta
          </Button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="dashboard-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon">
              <ChevronLeft size={18} />
            </Button>
            <h2 className="text-lg font-semibold">
              {currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
            </h2>
            <Button variant="outline" size="icon">
              <ChevronRight size={18} />
            </Button>
          </div>
          <div className="flex gap-1">
            <Button 
              variant={view === "week" ? "default" : "outline"} 
              size="sm"
              onClick={() => setView("week")}
            >
              Semana
            </Button>
            <Button 
              variant={view === "month" ? "default" : "outline"} 
              size="sm"
              onClick={() => setView("month")}
            >
              Mês
            </Button>
          </div>
        </div>

        {/* Week View */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header */}
            <div className="grid grid-cols-8 border-b border-border">
              <div className="p-3 text-sm text-muted-foreground"></div>
              {weekDates.map((date, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "p-3 text-center border-l border-border",
                    isToday(date) && "bg-primary/5"
                  )}
                >
                  <p className="text-xs text-muted-foreground">{weekDays[i]}</p>
                  <p className={cn(
                    "text-lg font-semibold mt-1",
                    isToday(date) && "text-primary"
                  )}>
                    {date.getDate()}
                  </p>
                </div>
              ))}
            </div>

            {/* Time Grid */}
            <div className="relative">
              {hours.map(hour => (
                <div key={hour} className="grid grid-cols-8 border-b border-border">
                  <div className="p-2 text-xs text-muted-foreground text-right pr-3">
                    {hour}:00
                  </div>
                  {weekDates.map((_, dayIndex) => (
                    <div 
                      key={dayIndex} 
                      className={cn(
                        "h-16 border-l border-border hover:bg-muted/30 cursor-pointer transition-colors",
                        isToday(weekDates[dayIndex]) && "bg-primary/5"
                      )}
                    >
                      {/* Sample appointments for today */}
                      {isToday(weekDates[dayIndex]) && hour === 9 && (
                        <div className="m-1 p-1.5 bg-primary/20 rounded text-xs">
                          <p className="font-medium text-primary">09:00 - João Silva</p>
                          <p className="text-muted-foreground">Retorno</p>
                        </div>
                      )}
                      {isToday(weekDates[dayIndex]) && hour === 10 && (
                        <div className="m-1 p-1.5 bg-success/20 rounded text-xs">
                          <p className="font-medium text-success">10:30 - Ana Beatriz</p>
                          <p className="text-muted-foreground">Avaliação</p>
                        </div>
                      )}
                      {isToday(weekDates[dayIndex]) && hour === 14 && (
                        <div className="m-1 p-1.5 bg-warning/20 rounded text-xs">
                          <p className="font-medium text-warning">14:00 - Maria Oliveira</p>
                          <p className="text-muted-foreground">Retorno</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Today's Appointments Summary */}
      <div className="dashboard-card">
        <h3 className="font-semibold mb-4">Consultas de Hoje</h3>
        <div className="space-y-3">
          {mockTodayAppointments.map(apt => (
            <div key={apt.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="text-center min-w-[50px]">
                <Clock size={14} className="mx-auto text-muted-foreground mb-1" />
                <p className="text-sm font-semibold">{apt.time}</p>
              </div>
              <div className="flex-1">
                <p className="font-medium">{apt.clientName}</p>
                <p className="text-sm text-muted-foreground">{apt.type}</p>
              </div>
              <Badge variant={apt.status === "confirmed" ? "default" : "secondary"}>
                {apt.status === "confirmed" ? "Confirmado" : "Pendente"}
              </Badge>
              <Button size="sm" className="btn-dashboard">Iniciar</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgendaPage;
