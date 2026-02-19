import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { type Appointment } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, Target, MessageCircle, Video, CheckCircle2, ChevronRight, Weight, Activity, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useUpdateAppointment } from "@/hooks/useCoachData";
import { toast } from "sonner";

interface AppointmentContextSheetProps {
    appointment: Appointment | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit: (appointment: Appointment) => void;
}

export function AppointmentContextSheet({ appointment, open, onOpenChange, onEdit }: AppointmentContextSheetProps) {
    const updateMutation = useUpdateAppointment();
    const navigate = useNavigate();

    if (!appointment) return null;

    const handleMarkAsCompleted = async () => {
        try {
            await updateMutation.mutateAsync({
                id: appointment.id,
                status: 'completed'
            });
            toast.success("Sessão marcada como realizada!");
            onOpenChange(false);

            // Redirect to training page
            // @ts-ignore
            if (appointment.client_id) {
                // @ts-ignore
                navigate(`/dashboard/clients/${appointment.client_id}?tab=training`);
            }
        } catch (error) {
            // Error handled by hook
        }
    };

    const handleWhatsApp = () => {
        // @ts-ignore
        const phone = appointment.client?.phone;
        if (!phone) {
            toast.error("Atleta sem telefone cadastrado");
            return;
        }
        const message = `Olá! Confirmando nosso atendimento: ${appointment.title} às ${format(new Date(appointment.start_time), "HH:mm")}.`;
        window.open(`https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`, "_blank");
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="bg-[#0A0A0B] border-l border-white/10 text-white w-full sm:max-w-md p-0 overflow-y-auto">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />

                <SheetHeader className="p-8 pb-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16 border-2 border-primary/20 rounded-none -skew-x-6">
                                {/* @ts-ignore */}
                                <AvatarImage src={appointment.client?.avatar_url} className="object-cover" />
                                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                                    {/* @ts-ignore */}
                                    {appointment.client?.full_name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <SheetTitle className="text-2xl font-display font-black italic uppercase tracking-tighter text-white">
                                    {/* @ts-ignore */}
                                    {appointment.client?.full_name}
                                </SheetTitle>
                                <SheetDescription className="text-primary font-bold italic text-[10px] uppercase tracking-widest flex items-center gap-2">
                                    <Badge variant="outline" className="rounded-none border-primary/20 text-primary text-[8px] h-5 bg-primary/5 uppercase">
                                        {appointment.type === 'session' ? 'Presencial' : appointment.type === 'evaluation' ? 'Avaliação' : 'Online'}
                                    </Badge>
                                    {appointment.status === 'completed' && (
                                        <Badge className="bg-green-500 text-white border-0 rounded-none text-[8px] h-5 uppercase">Realizado</Badge>
                                    )}
                                </SheetDescription>
                            </div>
                        </div>
                    </div>
                </SheetHeader>

                <div className="p-8 space-y-8">
                    {/* Time Details */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 border border-white/10">
                            <div className="flex items-center gap-2 text-primary mb-1">
                                <Calendar size={14} />
                                <span className="text-[10px] font-black uppercase italic">Data</span>
                            </div>
                            <p className="text-sm font-bold white capitalize">
                                {format(new Date(appointment.start_time), "dd 'de' MMMM", { locale: ptBR })}
                            </p>
                        </div>
                        <div className="p-4 bg-white/5 border border-white/10">
                            <div className="flex items-center gap-2 text-primary mb-1">
                                <Clock size={14} />
                                <span className="text-[10px] font-black uppercase italic">Horário</span>
                            </div>
                            <p className="text-sm font-bold white">
                                {format(new Date(appointment.start_time), "HH:mm")} - {format(new Date(appointment.end_time), "HH:mm")}
                            </p>
                        </div>
                    </div>

                    {/* Quick Stats (Command Center Feel) */}
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">PANORAMA DO ATLETA</h4>
                        <div className="grid grid-cols-1 gap-2">
                            <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/5 text-primary">
                                        <Weight size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Peso Atual</p>
                                        <p className="text-sm font-black italic text-white flex items-center gap-1">
                                            {/* @ts-ignore */}
                                            {appointment.client?.current_weight || "--"} <span className="text-[10px] not-italic text-white/40">KG</span>
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-white/20 group-hover:text-primary transition-colors" />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/5 text-primary">
                                        <Activity size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Adesão Dieta</p>
                                        <p className="text-sm font-black italic text-white">85% <span className="text-[10px] not-italic text-white/40">(ÚLT. 7 DIAS)</span></p>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-white/20 group-hover:text-primary transition-colors" />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                onClick={handleWhatsApp}
                                className="bg-[#25D366] hover:bg-[#20ba59] text-white border-0 font-display font-black italic uppercase text-[10px] tracking-widest h-12 rounded-none -skew-x-12"
                            >
                                <MessageCircle size={16} className="mr-2" />
                                WHATSAPP
                            </Button>
                            <Button
                                onClick={() => {
                                    if (appointment.video_link) window.open(appointment.video_link, "_blank");
                                    else toast.error("Sem link de vídeo");
                                }}
                                className="bg-primary hover:bg-primary/90 text-black font-display font-black italic uppercase text-[10px] tracking-widest h-12 rounded-none -skew-x-12"
                            >
                                <Video size={16} className="mr-2" />
                                INICIAR CALL
                            </Button>
                        </div>

                        {appointment.status !== 'completed' && (
                            <Button
                                onClick={handleMarkAsCompleted}
                                disabled={updateMutation.isPending}
                                className="w-full bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/50 font-display font-black italic uppercase text-xs tracking-[0.2em] h-14 rounded-none"
                            >
                                <CheckCircle2 size={18} className="mr-3" />
                                FINALIZAR ATENDIMENTO
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            onClick={() => onEdit(appointment)}
                            className="w-full border-white/10 hover:bg-white/5 text-white/60 font-display font-bold italic uppercase text-[10px] tracking-widest h-12 rounded-none"
                        >
                            AJUSTAR AGENDAMENTO
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
