import { useState, useMemo } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, User, MessageCircle, Video, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCoachAgenda, useDeleteAppointment } from "@/hooks/useCoachData";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateAppointmentDialog } from "@/components/dashboard/CreateAppointmentDialog";
import { type Appointment } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { AppointmentContextSheet } from "@/components/dashboard/AppointmentContextSheet";

const AgendaPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"week" | "month">("week");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isContextOpen, setIsContextOpen] = useState(false);
  const [contextApt, setContextApt] = useState<Appointment | null>(null);
  const navigate = useNavigate();

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const hours = Array.from({ length: 12 }, (_, i) => i + 7); // 7:00 to 18:00

  const gridDates = useMemo(() => {
    const dates = [];
    if (view === "week") {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        dates.push(date);
      }
    } else {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const startOfGrid = new Date(startOfMonth);
      startOfGrid.setDate(1 - startOfMonth.getDay());
      for (let i = 0; i < 42; i++) { // 6 weeks grid
        const date = new Date(startOfGrid);
        date.setDate(startOfGrid.getDate() + i);
        dates.push(date);
      }
    }
    return dates;
  }, [currentDate, view]);

  const startDate = gridDates[0].toISOString();
  const endDate = gridDates[gridDates.length - 1].toISOString();

  const { data: appointments, isLoading } = useCoachAgenda(startDate, endDate);

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const navigatePeriod = (direction: number) => {
    const newDate = new Date(currentDate);
    if (view === "week") {
      newDate.setDate(currentDate.getDate() + direction * 7);
    } else {
      newDate.setMonth(currentDate.getMonth() + direction);
    }
    setCurrentDate(newDate);
  };

  const handleAppointmentClick = (e: React.MouseEvent, appointment: Appointment) => {
    e.stopPropagation();
    setContextApt(appointment);
    setIsContextOpen(true);
  };

  const handleEditFromContext = (appointment: Appointment) => {
    setIsContextOpen(false);
    setSelectedAppointment(appointment);
    setIsDialogOpen(true);
  };

  const handleStartProtocol = (e: React.MouseEvent, appointment: Appointment) => {
    e.stopPropagation();
    // Navigate to client plans/protocols
    navigate(`/dashboard/clients/${appointment.client_id}`);
    toast.success("Redirecionando para o perfil do atleta...");
  };

  const handleNewAppointment = () => {
    setSelectedAppointment(null);
    setIsDialogOpen(true);
  };

  const deleteMutation = useDeleteAppointment();

  const handleDeleteAppointment = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Tem certeza que deseja excluir este agendamento?")) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        // Error handled in hook
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl lg:text-6xl font-display font-black italic uppercase leading-tight tracking-tighter">
            AGENDA DE <span className="text-primary text-blur-sm">ATENDIMENTO</span>
          </h1>
          <p className="font-display font-bold uppercase italic text-xs tracking-[0.3em] text-primary/60 mt-2">
            GESTÃO DE HORÁRIOS E CONSULTAS
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => toast.info("Integração Google Calendar", { description: "Esta funcionalidade estará disponível na próxima atualização." })}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-[10px] font-display font-black italic uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            <CalendarIcon size={14} className="text-primary" />
            CONECTAR CALENDAR
          </button>

          <CreateAppointmentDialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) setSelectedAppointment(null);
            }}
            appointmentToEdit={selectedAppointment}
            trigger={
              <button
                onClick={handleNewAppointment}
                className="btn-athletic text-[10px] px-8 py-3 shadow-[0_5px_15px_rgba(212,255,0,0.15)] flex items-center gap-2 group transition-all"
              >
                <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                <span className="relative z-10">NOVO AGENDAMENTO</span>
              </button>
            }
          />
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="athletic-card p-0 overflow-hidden border-t-2 border-t-primary">
        <div className="flex flex-col md:flex-row items-center justify-between p-6 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-6">
            <div className="flex gap-2">
              <button
                onClick={() => navigatePeriod(-1)}
                className="w-10 h-10 flex items-center justify-center bg-black/50 border border-white/10 hover:border-primary transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => navigatePeriod(1)}
                className="w-10 h-10 flex items-center justify-center bg-black/50 border border-white/10 hover:border-primary transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <h2 className="text-2xl font-display font-black italic uppercase tracking-tighter text-white">
              {currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
            </h2>
          </div>
          <div className="flex bg-black/50 p-1 border border-white/10 mt-4 md:mt-0">
            <button
              onClick={() => setView("week")}
              className={cn(
                "px-6 py-2 text-[10px] font-display font-black italic uppercase tracking-widest transition-all",
                view === "week" ? "bg-primary text-primary-foreground -skew-x-12" : "text-white/40 hover:text-white"
              )}
            >
              SEMANAL
            </button>
            <button
              onClick={() => setView("month")}
              className={cn(
                "px-6 py-2 text-[10px] font-display font-black italic uppercase tracking-widest transition-all",
                view === "month" ? "bg-primary text-primary-foreground -skew-x-12" : "text-white/40 hover:text-white"
              )}
            >
              MENSAL
            </button>
          </div>
        </div>

        {/* Grid View */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {view === "week" ? (
              <>
                {/* Header */}
                <div className="grid grid-cols-8 border-b border-white/5">
                  <div className="p-4 text-[10px] font-black italic uppercase tracking-[0.2em] text-white/20">HORA</div>
                  {gridDates.map((date, i) => (
                    <div
                      key={i}
                      className={cn(
                        "p-4 text-center border-l border-white/5 transition-colors",
                        isToday(date) ? "bg-primary/5 border-l-primary/20" : ""
                      )}
                    >
                      <p className={cn(
                        "text-[10px] font-black uppercase italic tracking-widest",
                        isToday(date) ? "text-primary" : "text-white/40"
                      )}>{weekDays[i]}</p>
                      <p className={cn(
                        "text-2xl font-display font-black italic leading-none mt-2",
                        isToday(date) ? "text-primary" : "text-white"
                      )}>
                        {date.getDate()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Time Grid */}
                <div className="relative">
                  {hours.map(hour => (
                    <div key={hour} className="grid grid-cols-8 border-b border-white/5">
                      <div className="p-4 text-[11px] font-black text-white/30 text-right pr-6 italic uppercase">
                        {hour}:00
                      </div>
                      {gridDates.map((date, dayIndex) => {
                        const hourApps = appointments?.filter(app => {
                          const appDate = new Date(app.start_time);
                          return appDate.toDateString() === date.toDateString() && appDate.getHours() === hour;
                        });

                        return (
                          <div
                            key={dayIndex}
                            className={cn(
                              "h-24 border-l border-white/5 hover:bg-white/5 cursor-pointer transition-colors relative group",
                              isToday(gridDates[dayIndex]) && "bg-primary/[0.02]"
                            )}
                          >
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              <Plus size={14} className="text-primary/40" />
                            </div>

                            {hourApps?.map(app => (
                              <div
                                key={app.id}
                                onClick={(e) => handleAppointmentClick(e, app)}
                                className={cn(
                                  "absolute inset-1 p-2 border -skew-x-3 z-10 transition-colors hover:border-primary/50",
                                  app.status === "confirmed" ? "bg-primary/10 border-primary/20" : "bg-white/5 border-white/10"
                                )}
                              >
                                <p className={cn(
                                  "text-[9px] font-display font-black italic uppercase leading-tight truncate",
                                  app.status === "confirmed" ? "text-primary" : "text-white"
                                )}>
                                  {/* @ts-ignore */}
                                  {app.client?.full_name || "Desconhecido"}
                                </p>
                                <p className="text-[7px] font-black text-white/40 uppercase tracking-widest mt-0.5 truncate">
                                  {app.title}
                                </p>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="p-4">
                {/* Month Grid Header */}
                <div className="grid grid-cols-7 border-b border-white/5 mb-2">
                  {weekDays.map((day, i) => (
                    <div key={i} className="p-3 text-center text-[10px] font-black uppercase italic tracking-widest text-white/20">
                      {day}
                    </div>
                  ))}
                </div>
                {/* Month Grid Body */}
                <div className="grid grid-cols-7 gap-px bg-white/5 border border-white/5">
                  {gridDates.map((date, i) => {
                    const dayApps = appointments?.filter(app => {
                      const appDate = new Date(app.start_time);
                      return appDate.toDateString() === date.toDateString();
                    });
                    const isCurrentMonth = date.getMonth() === currentDate.getMonth();

                    return (
                      <div
                        key={i}
                        className={cn(
                          "min-h-[120px] bg-[#0A0A0B] p-2 transition-colors hover:bg-white/[0.02] relative group",
                          !isCurrentMonth && "opacity-20 grayscale",
                          isToday(date) && "ring-1 ring-inset ring-primary/30"
                        )}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={cn(
                            "text-sm font-display font-black italic",
                            isToday(date) ? "text-primary" : "text-white/40"
                          )}>
                            {date.getDate()}
                          </span>
                          {dayApps && dayApps.length > 0 && (
                            <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black -skew-x-12 px-1.5 h-4">
                              {dayApps.length}
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-1">
                          {dayApps?.slice(0, 3).map(app => (
                            <div
                              key={app.id}
                              onClick={(e) => handleAppointmentClick(e, app)}
                              className={cn(
                                "p-1 text-[8px] font-display font-bold uppercase italic truncate border border-white/5 cursor-pointer hover:border-primary/40",
                                app.status === "confirmed" ? "bg-primary/5 text-primary" : "bg-white/5 text-muted-foreground"
                              )}
                            >
                              {new Date(app.start_time).getHours()}:00 - {/* @ts-ignore */}
                              {app.client?.full_name?.split(' ')[0]}
                            </div>
                          ))}
                          {dayApps && dayApps.length > 3 && (
                            <p className="text-[7px] font-black text-white/20 uppercase text-center mt-1">
                              + {dayApps.length - 3} mais
                            </p>
                          )}
                        </div>

                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus size={10} className="text-primary/40" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Today's Appointments Summary */}
      <div className="athletic-card border-l-2 border-l-primary">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-primary -skew-x-12" />
            <h3 className="text-xl font-display font-black italic uppercase tracking-tighter">PRÓXIMOS ATENDIMENTOS</h3>
          </div>
          <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Sincronização em tempo real</p>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <Skeleton className="h-20 w-full" variant="shimmer" />
          ) : appointments?.length === 0 ? (
            <div className="text-center py-12 border border-white/5 bg-white/5 -skew-x-6">
              <Clock className="w-8 h-8 mx-auto mb-3 text-primary/40" />
              <p className="font-display font-bold italic uppercase text-xs tracking-widest opacity-50">Nenhum agendamento para este período</p>
            </div>
          ) : (
            appointments?.slice(0, 5).map((apt, index) => (
              <div
                key={apt.id}
                onClick={(e) => handleAppointmentClick(e, apt)}
                className={cn(
                  "group flex items-center gap-6 p-5 border transition-all relative overflow-hidden cursor-pointer",
                  apt.status === "completed"
                    ? "bg-green-500/10 border-green-500/20 hover:border-green-500/40"
                    : "bg-white/5 border-white/5 hover:border-primary/40"
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute top-0 right-0 w-24 h-full bg-primary/5 -skew-x-[30deg] translate-x-12 transition-transform duration-500 group-hover:translate-x-8" />

                <div className="flex items-center gap-4 border-r border-white/10 pr-6">
                  {/* @ts-ignore */}
                  {apt.client?.avatar_url ? (
                    <img
                      /* @ts-ignore */
                      src={apt.client.avatar_url}
                      className="w-10 h-10 rounded-none border border-primary/20 -skew-x-6 object-cover"
                      alt="Avatar"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-primary/10 flex items-center justify-center border border-primary/20 -skew-x-6">
                      <User size={16} className="text-primary" />
                    </div>
                  )}
                  <div className="flex flex-col items-center justify-center min-w-[70px]">
                    <p className="text-xl font-display font-black text-primary italic leading-none">
                      {new Date(apt.start_time).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <div className="text-[9px] font-bold text-muted-foreground uppercase mt-1 italic tracking-widest">INÍCIO</div>
                  </div>
                </div>

                <div className="flex-1 min-w-0 relative z-10">
                  <p className="font-display font-black text-lg text-white italic uppercase tracking-tight leading-none group-hover:text-primary transition-colors">
                    {/* @ts-ignore */}
                    {apt.client?.full_name || "Desconhecido"}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{apt.title}</span>
                    <div className={cn(
                      "text-[8px] font-black uppercase italic px-2 py-0.5 -skew-x-12",
                      apt.status === "confirmed" ? "bg-primary text-primary-foreground" :
                        apt.status === "completed" ? "bg-green-500 text-white" :
                          "bg-white/10 text-white/40"
                    )}>
                      {apt.status === "confirmed" ? "CONFIRMADO" :
                        apt.status === "completed" ? "REALIZADO" :
                          "PENDENTE"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 relative z-10">
                  {/* WhatsApp Action */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // @ts-ignore
                      const phone = apt.client?.phone;
                      if (!phone) {
                        toast.error("Atleta sem telefone cadastrado.");
                        return;
                      }
                      const date = new Date(apt.start_time).toLocaleDateString('pt-BR');
                      const time = new Date(apt.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                      // @ts-ignore
                      const message = `Olá ${apt.client?.full_name?.split(' ')[0]}, passando para lembrar da nossa sessão de ${apt.title} hoje (${date}) às ${time}.`;
                      window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                    }}
                    className="w-10 h-10 flex items-center justify-center bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 text-green-500 hover:scale-105 transition-all -skew-x-12"
                    title="Enviar lembrete via WhatsApp"
                  >

                    {/* Using a simple generic icon or importing MessageCircle/Phone */}
                    <MessageCircle size={16} strokeWidth={2.5} />
                  </button>

                  {/* Google Meet / Jitsi Action */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // @ts-ignore
                      if (apt.video_link) {
                        try {
                          // Open the meeting link immediately for the coach
                          window.open(apt.video_link, '_blank');

                          // @ts-ignore
                          const phone = apt.client?.phone;
                          if (phone) {
                            const date = new Date(apt.start_time).toLocaleDateString('pt-BR');
                            const time = new Date(apt.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                            // @ts-ignore
                            const firstName = apt.client?.full_name?.split(' ')[0] || 'Atleta';
                            // @ts-ignore
                            const message = `Olá ${firstName}, segue o link para nossa sessão de hoje (${date} às ${time}): ${apt.video_link}`;

                            // Ask to send via WhatsApp
                            if (confirm("Deseja enviar o link de acesso para o WhatsApp do aluno?")) {
                              window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                            }
                          } else {
                            toast.success("Link aberto. Lembre-se de compartilhar com o aluno caso ele não tenha o app.");
                          }
                        } catch (err) {
                          toast.error("Erro ao processar link.");
                        }
                      } else {
                        // Fallback to Google Calendar template if no link is saved
                        const start = new Date(apt.start_time).toISOString().replace(/-|:|\.\d\d\d/g, "");
                        const end = new Date(apt.end_time).toISOString().replace(/-|:|\.\d\d\d/g, "");
                        const title = encodeURIComponent(`Sessão: ${apt.title}`);
                        const details = encodeURIComponent(apt.description || "Sessão de treinamento/avaliação.");
                        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${start}/${end}&location=Google+Meet`;
                        window.open(url, '_blank');
                        toast.info("Redirecionando para o Google Calendar para gerar link.");
                      }
                    }}
                    className={cn(
                      "w-10 h-10 flex items-center justify-center border transition-all -skew-x-12 hover:scale-105",
                      // @ts-ignore
                      apt.video_link
                        ? "bg-purple-500/10 border-purple-500/20 text-purple-500 hover:bg-purple-500/20"
                        : "bg-blue-500/10 border-blue-500/20 text-blue-500 hover:bg-blue-500/20"
                    )}
                    title={
                      // @ts-ignore
                      apt.video_link ? "Entrar na Chamada e Notificar Aluno" : "Criar sala no Google Meet"
                    }
                  >
                    <Video size={16} strokeWidth={2.5} />
                  </button>

                  <button
                    onClick={(e) => handleDeleteAppointment(e, apt.id)}
                    className="w-10 h-10 flex items-center justify-center bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 hover:scale-105 transition-all -skew-x-12"
                    title="Excluir agendamento"
                  >
                    <Trash2 size={16} strokeWidth={2.5} />
                  </button>

                  <button
                    onClick={(e) => handleStartProtocol(e, apt)}
                    className="btn-athletic px-6 py-2 text-[10px] shadow-lg shadow-primary/5"
                  >
                    VER PERFIL
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AppointmentContextSheet
        appointment={contextApt}
        open={isContextOpen}
        onOpenChange={setIsContextOpen}
        onEdit={handleEditFromContext}
      />
    </div >
  );
};

export default AgendaPage;
