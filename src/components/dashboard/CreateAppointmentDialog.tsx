import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar, Clock, User, Loader2, Target, Trash2, Edit2, Link as LinkIcon } from "lucide-react";
import { useCoachClients, useCreateAppointment, useUpdateAppointment, useDeleteAppointment } from "@/hooks/useCoachData";
import { appointmentSchema, type AppointmentInput } from "@/api/validators/appointment.schema";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { type Appointment } from "@/lib/supabase";

interface CreateAppointmentDialogProps {
    trigger?: React.ReactNode;
    appointmentToEdit?: Appointment | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function CreateAppointmentDialog({ trigger, appointmentToEdit, open: controlledOpen, onOpenChange: controlledOnOpenChange }: CreateAppointmentDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen;

    const { profile } = useAuth();
    const { data: clients } = useCoachClients();

    const generateMeetingLink = (clientName: string = "") => {
        const timestamp = Date.now();
        const cleanName = clientName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
        const coachId = profile?.id?.split('-')[0] || "coach";
        return `https://meet.jit.si/ApexPro-${coachId}-${cleanName || "Atleta"}-${timestamp}`;
    };

    const createMutation = useCreateAppointment();
    const updateMutation = useUpdateAppointment();
    const deleteMutation = useDeleteAppointment();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors }
    } = useForm<AppointmentInput>({
        resolver: zodResolver(appointmentSchema),
        defaultValues: {
            tenant_id: profile?.tenant_id || "",
            status: 'confirmed',
            type: 'session',
        }
    });

    // Reset form when opening or changing appointment
    useEffect(() => {
        if (open) {
            if (appointmentToEdit) {
                setValue("client_id", appointmentToEdit.client_id);
                setValue("title", appointmentToEdit.title);
                setValue("description", appointmentToEdit.description || "");
                // Ensure dates are valid ISO strings for Zod
                setValue("start_time", new Date(appointmentToEdit.start_time).toISOString());
                setValue("end_time", new Date(appointmentToEdit.end_time).toISOString());
                setValue("status", appointmentToEdit.status);
                // @ts-ignore - Handle legacy data without type
                setValue("type", appointmentToEdit.type || 'session');
                setValue("tenant_id", appointmentToEdit.tenant_id);
                setValue("video_link", appointmentToEdit.video_link || "");
            } else {
                reset({
                    tenant_id: profile?.tenant_id || "",
                    status: 'confirmed',
                    type: 'session',
                    client_id: "",
                    title: "",
                    video_link: "",
                });
            }
        }
    }, [open, appointmentToEdit, profile, reset, setValue]);

    const selectedClientId = watch("client_id");
    const selectedType = watch("type");
    const videoLink = watch("video_link");

    // Auto-generate link when type changes to call
    useEffect(() => {
        if (selectedType === 'call' && !videoLink) {
            const client = clients?.find(c => c.id === selectedClientId);
            setValue("video_link", generateMeetingLink(client?.full_name));
        }
    }, [selectedType, selectedClientId]);

    const onSubmit = async (data: AppointmentInput) => {
        try {
            // Robust Link Generation: If it's a call and video_link is empty, generate it now
            if (data.type === 'call' && (!data.video_link || data.video_link.trim() === '')) {
                const client = clients?.find(c => c.id === data.client_id);
                data.video_link = generateMeetingLink(client?.full_name);
            }

            if (appointmentToEdit) {
                await updateMutation.mutateAsync({ id: appointmentToEdit.id, ...data });
            } else {
                await createMutation.mutateAsync(data);
            }
            if (setOpen) setOpen(false);
        } catch (error) {
            // Error is handled by the hook
        }
    };

    const handleDelete = async () => {
        if (!appointmentToEdit) return;
        if (confirm("Tem certeza que deseja excluir esta missão?")) {
            try {
                await deleteMutation.mutateAsync(appointmentToEdit.id);
                if (setOpen) setOpen(false);
            } catch (error) {
                // Error handled by hook
            }
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="bg-[#0A0A0B] border-white/10 text-white rounded-none sm:max-w-[500px] p-0 overflow-hidden shadow-2xl shadow-primary/5">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                <div className="absolute top-0 left-0 w-[2px] h-full bg-primary" />
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />

                <DialogHeader className="p-8 pb-4 bg-gradient-to-b from-white/[0.02] to-transparent relative">
                    <div className="absolute top-8 right-8 w-16 h-16 bg-primary/5 -skew-x-12 blur-2xl rounded-full -z-10" />
                    <DialogTitle className="font-display font-black italic uppercase text-3xl tracking-tighter flex flex-col leading-none">
                        <span className="text-white/40 text-[10px] tracking-[0.4em] mb-2 not-italic font-bold">CRONOGRAMA TÁTICO</span>
                        <span className="flex items-center gap-3">
                            {appointmentToEdit ? (
                                <>AJUSTE DE <span className="text-primary">MISSÃO</span></>
                            ) : (
                                <>PROGRAMAR <span className="text-primary">MISSÃO</span></>
                            )}
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8 pt-4 space-y-6">
                    {/* Athlete Selection */}
                    <div className="space-y-2">
                        <Label className="font-display font-bold text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <User size={12} /> SELECIONAR ATLETA
                        </Label>
                        <Select
                            value={selectedClientId}
                            onValueChange={(val) => setValue("client_id", val)}
                            disabled={!!appointmentToEdit} // Disable client change on edit? Or allow it? Let's allow it but users usually don't.
                        >
                            <SelectTrigger className="bg-black/50 border-white/10 rounded-none font-display font-bold italic text-xs tracking-widest focus:border-primary transition-all h-12">
                                <SelectValue placeholder="ESCOLHA O ALUNO" />
                            </SelectTrigger>
                            <SelectContent className="bg-surface border-white/10 text-white rounded-none">
                                {clients?.map((client) => (
                                    <SelectItem
                                        key={client.id}
                                        value={client.id}
                                        className="uppercase font-display font-bold italic text-[10px]"
                                    >
                                        {client.full_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.client_id && <p className="text-[10px] font-bold text-destructive uppercase italic">{errors.client_id.message}</p>}
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title" className="font-display font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
                            OBJETIVO DA SESSÃO
                        </Label>
                        <Input
                            id="title"
                            placeholder="EX: TREINO DE FORÇA A, AVALIAÇÃO FÍSICA..."
                            {...register("title")}
                            className="bg-black/50 border-white/10 rounded-none font-display font-bold italic text-xs tracking-widest focus:border-primary transition-all h-12"
                        />
                        {errors.title && <p className="text-[10px] font-bold text-destructive uppercase italic">{errors.title.message}</p>}
                        {errors.title && <p className="text-[10px] font-bold text-destructive uppercase italic">{errors.title.message}</p>}
                    </div>

                    {/* Video Link */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="video_link" className="font-display font-bold text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <LinkIcon size={12} /> LINK DA VIDEOCONFERÊNCIA
                            </Label>
                            <button
                                type="button"
                                onClick={() => {
                                    const client = clients?.find(c => c.id === selectedClientId);
                                    setValue("video_link", generateMeetingLink(client?.full_name));
                                }}
                                className="text-[9px] font-black text-primary uppercase italic hover:underline"
                            >
                                GERAR LINK INSTANTÂNEO
                            </button>
                        </div>
                        <Input
                            id="video_link"
                            placeholder="EX: GOOGLE MEET, ZOOM (OPCIONAL)"
                            {...register("video_link")}
                            className="bg-black/50 border-white/10 rounded-none font-display font-bold italic text-xs tracking-widest focus:border-primary transition-all h-12"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Date */}
                        <div className="space-y-2">
                            <Label className="font-display font-bold text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Calendar size={12} /> DATA
                            </Label>
                            <Input
                                type="date"
                                // Pre-fill date input if value exists
                                defaultValue={watch("start_time") ? format(new Date(watch("start_time")), "yyyy-MM-dd") : ""}
                                onChange={(e) => {
                                    const date = e.target.value;
                                    const currentTime = watch("start_time") ? new Date(watch("start_time")).toLocaleTimeString('pt-BR', { hour12: false }) : "08:00";
                                    // Handle '08:00:00' format vs '08:00'
                                    const timeStr = currentTime.length === 8 ? currentTime : currentTime + ':00';
                                    setValue("start_time", new Date(`${date}T${timeStr}`).toISOString());
                                    // Ensure end_time is preserved or defaulted
                                    const currentEnd = watch("end_time") ? new Date(watch("end_time")) : new Date(`${date}T${timeStr}`);
                                    setValue("end_time", currentEnd.toISOString());
                                }}
                                className="bg-black/50 border-white/10 rounded-none font-display font-bold italic text-xs tracking-widest focus:border-primary transition-all h-12"
                            />
                        </div>

                        {/* Time */}
                        <div className="space-y-2">
                            <Label className="font-display font-bold text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Clock size={12} /> HORA
                            </Label>
                            <Select
                                value={watch("start_time") ? format(new Date(watch("start_time")), "HH:00") : ""}
                                onValueChange={(val) => {
                                    const currentDate = watch("start_time") ? format(new Date(watch("start_time")), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
                                    const start = new Date(`${currentDate}T${val}:00`);
                                    const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 hour
                                    setValue("start_time", start.toISOString());
                                    setValue("end_time", end.toISOString());
                                }}
                            >
                                <SelectTrigger className="bg-black/50 border-white/10 rounded-none font-display font-bold italic text-xs tracking-widest focus:border-primary transition-all h-12">
                                    <SelectValue placeholder="INÍCIO" />
                                </SelectTrigger>
                                <SelectContent className="bg-surface border-white/10 text-white rounded-none">
                                    {Array.from({ length: 15 }, (_, i) => i + 6).map(h => (
                                        <SelectItem key={h} value={`${String(h).padStart(2, '0')}:00`} className="uppercase font-display font-bold italic text-[10px]">
                                            {String(h).padStart(2, '0')}:00
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Type Selection */}
                    <div className="space-y-3">
                        <Label className="font-display font-bold text-[10px] uppercase tracking-widest text-muted-foreground">CATEGORIA TÁTICA</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {['session', 'evaluation', 'call'].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setValue("type", type as any)}
                                    className={cn(
                                        "py-2 text-[8px] font-display font-black italic uppercase tracking-widest border transition-all",
                                        selectedType === type
                                            ? "bg-primary text-black border-primary -skew-x-12"
                                            : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                                    )}
                                >
                                    {type === 'session' ? 'PRESENCIAL' : type === 'evaluation' ? 'AVALIAÇÃO' : 'CALL'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <DialogFooter className="pt-4 flex gap-2">
                        {appointmentToEdit && (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={isPending}
                                className="h-14 px-6 bg-red-500/10 border border-red-500/50 hover:bg-red-500/20 text-red-500"
                            >
                                <Trash2 size={20} />
                            </Button>
                        )}
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 btn-athletic h-14 flex items-center justify-center gap-2 group text-sm"
                        >
                            {isPending ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <span>{appointmentToEdit ? "SALVAR ALTERAÇÕES" : "CONFIRMAR AGENDAMENTO"}</span>
                                    {appointmentToEdit ? <Edit2 size={16} /> : <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
