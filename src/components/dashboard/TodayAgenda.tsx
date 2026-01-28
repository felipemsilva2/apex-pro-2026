import { Clock, Play, MoreVertical, Phone, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Appointment } from "@/data/mockData";

interface TodayAgendaProps {
  appointments: Appointment[];
}

const TodayAgenda = ({ appointments }: TodayAgendaProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-success/10 text-success";
      case "pending":
        return "bg-warning/10 text-warning";
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
      default:
        return status;
    }
  };

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-foreground">Agenda de Hoje</h3>
          <p className="text-sm text-muted-foreground">{appointments.length} consultas agendadas</p>
        </div>
        <Button variant="outline" size="sm" className="text-xs">
          Ver Agenda Completa
        </Button>
      </div>

      <div className="space-y-3">
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>Nenhuma consulta agendada para hoje</p>
          </div>
        ) : (
          appointments.map((appointment, index) => (
            <div
              key={appointment.id}
              className={cn(
                "flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors",
                "animate-fade-in"
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Time */}
              <div className="text-center min-w-[60px]">
                <div className="text-lg font-semibold text-foreground">{appointment.time}</div>
              </div>

              {/* Client Info */}
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                  {appointment.clientAvatar}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {appointment.clientName}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{appointment.type}</span>
                  <Badge variant="secondary" className={cn("text-xs", getStatusColor(appointment.status))}>
                    {getStatusLabel(appointment.status)}
                  </Badge>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button size="sm" className="btn-dashboard gap-1.5">
                  <Play size={14} />
                  <span className="hidden sm:inline">Iniciar</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Phone size={14} className="mr-2" /> Ligar
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Video size={14} className="mr-2" /> Videochamada
                    </DropdownMenuItem>
                    <DropdownMenuItem>Remarcar</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Cancelar</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TodayAgenda;
