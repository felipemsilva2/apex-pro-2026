import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Phone, Scale, Target, Loader2, Save, Calendar } from "lucide-react";
import { useUpdateClient } from "@/hooks/useCoachData";
import { clientEditSchema, type ClientEditInput } from "@/api/validators/client.schema";
import { type Client } from "@/lib/supabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface EditClientDialogProps {
    client: Client;
    trigger?: React.ReactNode;
}

export function EditClientDialog({ client, trigger }: EditClientDialogProps) {
    const [open, setOpen] = useState(false);
    const [month, setMonth] = useState<Date>(new Date());
    const updateMutation = useUpdateClient();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<ClientEditInput>({
        resolver: zodResolver(clientEditSchema),
        defaultValues: {
            full_name: client.full_name,
            phone: client.phone || "",
            current_weight: client.current_weight || undefined,
            target_weight: client.target_weight || undefined,
            status: client.status as any,
            gender: (client.gender as any) || undefined,
            birth_date: client.birth_date || "",
            notes: client.notes || "",
        }
    });

    const status = watch("status");

    const onSubmit = async (data: ClientEditInput) => {
        try {
            await updateMutation.mutateAsync({
                id: client.id,
                ...data
            });
            setOpen(false);
        } catch (error) {
            // Error handled by hook
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <button className="btn-athletic text-[10px] px-8 py-3 bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all flex items-center gap-2">
                        EDITAR PERFIL
                    </button>
                )}
            </DialogTrigger>
            <DialogContent className="bg-[#0A0A0B] border-white/10 text-white rounded-none sm:max-w-[600px] p-0 overflow-hidden shadow-2xl shadow-primary/5">
                {/* Accent line and kinetic feel */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                <div className="absolute top-0 left-0 w-[2px] h-full bg-primary" />

                <DialogHeader className="p-8 pb-6 bg-gradient-to-b from-white/[0.02] to-transparent relative">
                    <div className="absolute top-8 right-8 w-24 h-24 bg-primary/5 -skew-x-12 blur-2xl rounded-full -z-10" />
                    <DialogTitle className="font-display font-black italic uppercase text-3xl lg:text-4xl tracking-tighter flex flex-col leading-none">
                        <span className="text-white/40 text-[10px] tracking-[0.4em] mb-2 not-italic font-bold">EDIÇÃO DO ALUNO</span>
                        <span className="flex items-center gap-3">
                            DADOS DO <span className="text-primary">ALUNO</span>
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit, (errors) => {
                    const failedFields = Object.keys(errors).join(", ");
                    toast.error(`Erro nos campos: ${failedFields}`);
                })} className="p-8 pt-2 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar relative">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                        {/* Name */}
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="full_name" className="font-display font-bold text-[9px] uppercase tracking-[0.2em] text-primary/60 flex items-center gap-2 mb-1">
                                <User size={10} className="text-primary" /> NOME COMPLETO
                            </Label>
                            <div className="relative group">
                                <Input
                                    id="full_name"
                                    {...register("full_name")}
                                    className="bg-white/[0.03] border-white/10 rounded-none font-display font-black italic text-sm tracking-widest focus:border-primary/50 focus:ring-0 transition-all h-14 pl-4"
                                />
                                <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary group-focus-within:w-full transition-all duration-500" />
                            </div>
                            {errors.full_name && <p className="text-[10px] font-black text-destructive uppercase italic tracking-tighter mt-1">{errors.full_name.message}</p>}
                        </div>

                        {/* Status & Gender Row */}
                        <div className="space-y-2 col-span-2 md:col-span-1">
                            <Label className="font-display font-bold text-[9px] uppercase tracking-[0.2em] text-primary/60 mb-1">STATUS DA CONTA</Label>
                            <Select
                                value={status}
                                onValueChange={(val) => setValue("status", val as any)}
                            >
                                <SelectTrigger className="bg-white/[0.03] border-white/10 rounded-none font-display font-black italic uppercase text-xs tracking-widest focus:border-primary/50 transition-all h-12">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0A0A0B] border-white/10 text-white rounded-none">
                                    <SelectItem value="active" className="uppercase font-display font-black italic text-xs focus:bg-primary focus:text-black">ATIVO</SelectItem>
                                    <SelectItem value="inactive" className="uppercase font-display font-black italic text-xs focus:bg-primary focus:text-black">INATIVO</SelectItem>
                                    <SelectItem value="suspended" className="uppercase font-display font-black italic text-xs focus:bg-primary focus:text-black">SUSPENSO</SelectItem>
                                    <SelectItem value="cancelled" className="uppercase font-display font-black italic text-xs focus:bg-primary focus:text-black">CANCELADO</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 col-span-2 md:col-span-1">
                            <Label htmlFor="gender" className="font-display font-bold text-[9px] uppercase tracking-[0.2em] text-primary/60 mb-1">GÊNERO</Label>
                            <Select
                                value={watch("gender") || ""}
                                onValueChange={(val) => setValue("gender", val as "male" | "female" | "other")}
                            >
                                <SelectTrigger className="bg-white/[0.03] border-white/10 rounded-none font-display font-black italic uppercase text-xs tracking-widest focus:border-primary/50 transition-all h-12">
                                    <SelectValue placeholder="SELECIONE" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0A0A0B] border-white/10 text-white rounded-none">
                                    <SelectItem value="male" className="uppercase font-display font-black italic text-xs focus:bg-primary focus:text-black">MASCULINO</SelectItem>
                                    <SelectItem value="female" className="uppercase font-display font-black italic text-xs focus:bg-primary focus:text-black">FEMININO</SelectItem>
                                    <SelectItem value="other" className="uppercase font-display font-black italic text-xs focus:bg-primary focus:text-black">OUTRO</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Birth Date */}
                        <div className="space-y-2 col-span-2 md:col-span-1">
                            <Label htmlFor="birth_date" className="font-display font-bold text-[9px] uppercase tracking-[0.2em] text-primary/60 flex items-center gap-2 mb-1">
                                <Calendar size={10} className="text-primary" /> DATA DE NASCIMENTO
                            </Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-display font-black italic uppercase text-xs tracking-widest h-12 rounded-none bg-white/[0.03] border-white/10 hover:bg-white/10 hover:border-primary/30 transition-all",
                                            !watch("birth_date") && "text-white/20"
                                        )}
                                    >
                                        {watch("birth_date") ? (
                                            format(new Date(watch("birth_date") + "T12:00:00"), "dd 'DE' MMMM, yyyy", { locale: ptBR })
                                        ) : (
                                            <span>SELECIONE DATA</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-4 bg-[#0A0A0B] border-white/10 rounded-none shadow-2xl shadow-primary/10" align="start">
                                    <div className="mb-4">
                                        <Select
                                            value={month.getFullYear().toString()}
                                            onValueChange={(year) => {
                                                const newDate = new Date(month);
                                                newDate.setFullYear(parseInt(year));
                                                setMonth(newDate);
                                            }}
                                        >
                                            <SelectTrigger className="w-full bg-white/5 border-white/10 rounded-none h-10 font-display font-black text-xs uppercase italic focus:border-primary/50">
                                                <SelectValue placeholder="ANO" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#0A0A0B] border-white/10 text-white rounded-none max-h-[250px]">
                                                {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                                                    <SelectItem key={year} value={year.toString()} className="uppercase font-display font-bold italic text-xs focus:bg-primary focus:text-black">
                                                        {year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <CalendarComponent
                                        mode="single"
                                        selected={watch("birth_date") ? new Date(watch("birth_date")! + "T12:00:00") : undefined}
                                        onSelect={(date) => {
                                            setValue("birth_date", date ? format(date, "yyyy-MM-dd") : "");
                                            if (date) setMonth(date);
                                        }}
                                        month={month}
                                        onMonthChange={setMonth}
                                        initialFocus
                                        locale={ptBR}
                                        className="bg-transparent"
                                        classNames={{
                                            day_selected: "bg-primary text-black hover:bg-primary hover:text-black focus:bg-primary focus:text-black rounded-none font-bold",
                                            day_today: "bg-white/10 text-primary rounded-none",
                                            head_cell: "text-white/40 font-display font-bold text-[10px] uppercase",
                                            day: "rounded-none h-9 w-9 p-0 font-display font-bold text-xs uppercase italic hover:bg-primary/20 hover:text-primary transition-colors",
                                            nav_button: "border-white/10 hover:bg-primary hover:text-black transition-colors rounded-none",
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Phone */}
                        <div className="space-y-2 col-span-2 md:col-span-1">
                            <Label htmlFor="phone" className="font-display font-bold text-[9px] uppercase tracking-[0.2em] text-primary/60 flex items-center gap-2 mb-1">
                                <Phone size={10} className="text-primary" /> CONTATO
                            </Label>
                            <Input
                                id="phone"
                                {...register("phone")}
                                placeholder="(00) 00000-0000"
                                className="bg-white/[0.03] border-white/10 rounded-none font-display font-black italic text-xs tracking-widest focus:border-primary/50 transition-all h-12 placeholder:text-white/10"
                            />
                        </div>

                        {/* Weights */}
                        <div className="space-y-2 col-span-2 md:col-span-1">
                            <Label htmlFor="current_weight" className="font-display font-bold text-[9px] uppercase tracking-[0.2em] text-primary/60 flex items-center gap-2 mb-1">
                                <Scale size={10} className="text-primary" /> PESO ATUAL (KG)
                            </Label>
                            <div className="relative group">
                                <Input
                                    id="current_weight"
                                    type="number"
                                    step="0.1"
                                    {...register("current_weight", { valueAsNumber: true })}
                                    className="bg-white/[0.03] border-white/10 rounded-none font-display font-black italic text-xl tracking-tighter focus:border-primary/50 transition-all h-16 pl-4"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 font-display font-black italic text-xs">KG</div>
                            </div>
                        </div>

                        <div className="space-y-2 col-span-2 md:col-span-1">
                            <Label htmlFor="target_weight" className="font-display font-bold text-[9px] uppercase tracking-[0.2em] text-primary/60 flex items-center gap-2 mb-1">
                                <Target size={10} className="text-primary" /> META DE PESO (KG)
                            </Label>
                            <div className="relative group">
                                <Input
                                    id="target_weight"
                                    type="number"
                                    step="0.1"
                                    {...register("target_weight", { valueAsNumber: true })}
                                    className="bg-white/[0.03] border-white/10 rounded-none font-display font-black italic text-xl tracking-tighter focus:border-primary/50 transition-all h-16 pl-4"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 font-display font-black italic text-xs">KG</div>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes" className="font-display font-bold text-[9px] uppercase tracking-[0.2em] text-primary/60 mb-1 flex items-center gap-2">
                            <Save size={10} className="text-primary" /> NOTAS E OBSERVAÇÕES
                        </Label>
                        <Textarea
                            id="notes"
                            {...register("notes")}
                            className="bg-white/[0.03] border-white/10 rounded-none font-display font-medium italic text-xs tracking-wide focus:border-primary/50 transition-all min-h-[120px] resize-none p-4 leading-relaxed"
                            placeholder="REDOBRAR ATENÇÃO AO TREINO DE PERNAS, CARDIO EM JEJUM OBRIGATÓRIO..."
                        />
                    </div>

                    <DialogFooter className="pt-8 pb-10 md:pb-4 flex flex-col sm:flex-row gap-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            className="flex-1 rounded-none border border-white/5 hover:bg-white/5 text-white/40 uppercase font-display font-black italic text-[10px] tracking-widest h-14"
                        >
                            CANCELAR
                        </Button>
                        <Button
                            type="submit"
                            disabled={updateMutation.isPending}
                            className="flex-[2] btn-athletic h-14 flex items-center justify-center gap-3 group text-xs font-black italic"
                        >
                            {updateMutation.isPending ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <span>SALVAR ALTERAÇÕES</span>
                                    <Save size={18} className="group-hover:translate-y-[-2px] transition-transform" />
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
