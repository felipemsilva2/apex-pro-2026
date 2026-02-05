
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, CalendarIcon, Loader2, FileText, Save } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useCreateHormonalProtocol } from "@/hooks/useCoachData";

const compoundSchema = z.object({
    name: z.string().min(1, "Nome do composto é obrigatório"),
    dosage: z.string().min(1, "Dose é obrigatória"),
    frequency: z.string().min(1, "Frequência é obrigatória"),
    notes: z.string().optional(),
});

const protocolSchema = z.object({
    name: z.string().min(1, "Nome do protocolo é obrigatório"),
    description: z.string().optional(),
    start_date: z.string().min(1, "Data de início é obrigatória"),
    end_date: z.string().optional(),
    compounds: z.array(compoundSchema).min(1, "Adicione pelo menos um composto"),
});

type ProtocolFormValues = z.infer<typeof protocolSchema>;

interface CreateHormonalProtocolDialogProps {
    clientId: string;
    trigger?: React.ReactNode;
}

export function CreateHormonalProtocolDialog({ clientId, trigger }: CreateHormonalProtocolDialogProps) {
    const [open, setOpen] = useState(false);
    const createProtocol = useCreateHormonalProtocol();

    const form = useForm<ProtocolFormValues>({
        resolver: zodResolver(protocolSchema),
        defaultValues: {
            name: "",
            description: "",
            start_date: format(new Date(), "yyyy-MM-dd"),
            compounds: [{ name: "", dosage: "", frequency: "", notes: "" }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "compounds",
    });

    const onSubmit = async (data: ProtocolFormValues) => {
        try {
            await createProtocol.mutateAsync({
                client_id: clientId,
                name: data.name,
                description: data.description,
                start_date: new Date(data.start_date).toISOString(),
                end_date: data.end_date ? new Date(data.end_date).toISOString() : null,
                status: "active",
                compounds: data.compounds as any,
            });
            setOpen(false);
            form.reset();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button>Novo Protocolo</Button>}
            </DialogTrigger>
            <DialogContent className="bg-[#0A0A0B] border-white/10 text-white rounded-none sm:max-w-[700px] p-0 overflow-hidden shadow-2xl shadow-primary/5">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                <div className="absolute top-0 left-0 w-[2px] h-full bg-primary" />

                <DialogHeader className="p-8 pb-6 bg-gradient-to-b from-white/[0.02] to-transparent relative">
                    <div className="absolute top-8 right-8 w-24 h-24 bg-primary/5 -skew-x-12 blur-2xl rounded-full -z-10" />
                    <DialogTitle className="font-display font-black italic uppercase text-3xl lg:text-4xl tracking-tighter flex flex-col leading-none">
                        <span className="text-white/40 text-[10px] tracking-[0.4em] mb-2 not-italic font-bold">PLANO HORMONAL</span>
                        <span className="flex items-center gap-3">
                            NOVO <span className="text-primary">PLANO</span>
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 pt-2 space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar relative">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                        <div className="space-y-2 col-span-2 md:col-span-1">
                            <Label htmlFor="name" className="font-display font-bold text-[9px] uppercase tracking-[0.2em] text-primary/60 mb-1 flex items-center gap-2">
                                <FileText size={10} className="text-primary" /> NOME DO PLANO
                            </Label>
                            <Input
                                id="name"
                                placeholder="EX: BLAST & CRUISE"
                                className="bg-white/[0.03] border-white/10 rounded-none font-display font-black italic text-xs tracking-widest focus:border-primary/50 transition-all h-12 pl-4"
                                {...form.register("name")}
                            />
                            {form.formState.errors.name && (
                                <p className="text-destructive text-[10px] font-black uppercase italic italic tracking-tighter mt-1">{form.formState.errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2 col-span-2 md:col-span-1">
                            <Label className="font-display font-bold text-[9px] uppercase tracking-[0.2em] text-primary/60 mb-1 flex items-center gap-2">
                                <CalendarIcon size={10} className="text-primary" /> DATA DE INÍCIO
                            </Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-display font-black italic uppercase text-xs tracking-widest h-12 rounded-none bg-white/[0.03] border-white/10 hover:bg-white/10 hover:border-primary/30 transition-all",
                                            !form.watch("start_date") && "text-white/20"
                                        )}
                                    >
                                        {form.watch("start_date") ? (
                                            format(new Date(form.watch("start_date") + "T12:00:00"), "dd 'DE' MMMM, yyyy", { locale: ptBR })
                                        ) : (
                                            <span>SELECIONE DATA</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-4 bg-[#0A0A0B] border-white/10 rounded-none" align="end">
                                    <Calendar
                                        mode="single"
                                        selected={new Date(form.watch("start_date") + "T12:00:00")}
                                        onSelect={(date) =>
                                            form.setValue("start_date", date ? format(date, "yyyy-MM-dd") : "")
                                        }
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

                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="description" className="font-display font-bold text-[9px] uppercase tracking-[0.2em] text-primary/60 mb-1 flex items-center gap-2">
                                <Save size={10} className="text-primary" /> OBJETIVO E OBSERVAÇÕES
                            </Label>
                            <Textarea
                                id="description"
                                placeholder="DESCREVER O OBJETIVO DO PLANO E OBSERVAÇÕES GERAIS..."
                                className="bg-white/[0.03] border-white/10 rounded-none font-display font-medium italic text-xs tracking-wide focus:border-primary/50 transition-all min-h-[100px] resize-none p-4 leading-relaxed"
                                {...form.register("description")}
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-primary/20 pb-4">
                            <Label className="font-display font-black italic uppercase text-xl text-white tracking-widest flex items-center gap-3">
                                <Plus size={18} className="text-primary" /> COMPOSTOS
                            </Label>
                            <Button
                                type="button"
                                onClick={() => append({ name: "", dosage: "", frequency: "", notes: "" })}
                                className="bg-white/5 border border-white/10 hover:bg-primary hover:text-black text-white rounded-none uppercase text-[10px] font-black italic tracking-widest px-4 h-10 transition-all hover:-skew-x-12"
                            >
                                ADICIONAR ITEM
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="p-6 bg-white/[0.02] border border-white/5 relative group transition-all hover:bg-white/[0.04]">
                                    <div className="absolute top-0 right-0 p-2">
                                        {fields.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => remove(index)}
                                                className="text-white/10 hover:text-destructive transition-colors p-2"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-12 gap-6">
                                        <div className="col-span-12 md:col-span-6 space-y-2">
                                            <Label className="font-display font-bold text-[9px] uppercase tracking-[0.2em] text-primary/60 flex items-center gap-2">
                                                SUBSTÂNCIA
                                            </Label>
                                            <Input
                                                placeholder="EX: TESTOSTERONA ENANTATO"
                                                className="bg-black/40 border-white/10 rounded-none font-display font-black italic text-xs tracking-widest focus:border-primary/50 transition-all h-10"
                                                {...form.register(`compounds.${index}.name`)}
                                            />
                                            {form.formState.errors.compounds?.[index]?.name && (
                                                <p className="text-destructive text-[9px] font-black uppercase italic">{form.formState.errors.compounds[index]?.name?.message}</p>
                                            )}
                                        </div>

                                        <div className="col-span-6 md:col-span-3 space-y-2">
                                            <Label className="font-display font-bold text-[9px] uppercase tracking-[0.2em] text-primary/60">DOSAGEM</Label>
                                            <Input
                                                placeholder="EX: 250MG"
                                                className="bg-black/40 border-white/10 rounded-none font-display font-black italic text-xs tracking-widest focus:border-primary/50 transition-all h-10"
                                                {...form.register(`compounds.${index}.dosage`)}
                                            />
                                        </div>

                                        <div className="col-span-6 md:col-span-3 space-y-2">
                                            <Label className="font-display font-bold text-[9px] uppercase tracking-[0.2em] text-primary/60">FREQUÊNCIA</Label>
                                            <Input
                                                placeholder="EX: 1ML/SEM"
                                                className="bg-black/40 border-white/10 rounded-none font-display font-black italic text-xs tracking-widest focus:border-primary/50 transition-all h-10"
                                                {...form.register(`compounds.${index}.frequency`)}
                                            />
                                        </div>

                                        <div className="col-span-12 space-y-2">
                                            <Label className="font-display font-bold text-[9px] uppercase tracking-[0.2em] text-primary/40">INSTRUÇÕES DE USO</Label>
                                            <Input
                                                placeholder="EX: APLICAÇÃO INTRAMUSCULAR PROFUNDA NO VASTO LATERAL..."
                                                className="bg-black/20 border-white/5 rounded-none font-display font-medium italic text-[11px] tracking-wide focus:border-primary/30 transition-all h-10"
                                                {...form.register(`compounds.${index}.notes`)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
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
                            disabled={createProtocol.isPending}
                            className="flex-[2] btn-athletic h-14 flex items-center justify-center gap-3 group text-xs font-black italic"
                        >
                            {createProtocol.isPending ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <span>CRIAR PLANO</span>
                                    <Plus size={18} className="group-hover:scale-125 transition-transform" />
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
