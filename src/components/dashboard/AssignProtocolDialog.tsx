import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardCopy, Dumbbell, FileText, Loader2, Zap } from "lucide-react";
import { useTrainingTemplates, useMealTemplates, useAssignTemplate } from "@/hooks/useCoachData";
import { cn } from "@/lib/utils";

interface AssignProtocolDialogProps {
    clientId: string;
    trigger?: React.ReactNode;
    defaultType?: 'workout' | 'meal';
}

export function AssignProtocolDialog({ clientId, trigger, defaultType = 'workout' }: AssignProtocolDialogProps) {
    const [open, setOpen] = useState(false);
    const [protocolType, setProtocolType] = useState<'workout' | 'meal'>(defaultType);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

    const { data: trainingTemplates } = useTrainingTemplates();
    const { data: mealTemplates } = useMealTemplates();
    const assignMutation = useAssignTemplate();

    const templates = protocolType === 'workout' ? trainingTemplates : mealTemplates;

    const handleAssign = async () => {
        if (!selectedTemplateId) return;
        try {
            await assignMutation.mutateAsync({
                type: protocolType,
                templateId: selectedTemplateId,
                clientId: clientId
            });
            setOpen(false);
            setSelectedTemplateId("");
        } catch (error) {
            // Handled by hook
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <button className="w-full h-24 border border-dashed border-white/10 hover:border-primary/50 hover:bg-white/5 transition-all group flex flex-col items-center justify-center gap-2">
                        <Zap size={20} className="text-white/20 group-hover:text-primary transition-colors" />
                        <span className="font-display font-black italic uppercase text-[10px] tracking-widest text-white/20 group-hover:text-white transition-colors">
                            ATRIBUIR PLANO
                        </span>
                    </button>
                )}
            </DialogTrigger>
            <DialogContent className="bg-[#0A0A0B] border-white/10 text-white rounded-none sm:max-w-[500px] p-0 overflow-hidden shadow-2xl shadow-primary/5">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                <div className="absolute top-0 left-0 w-[2px] h-full bg-primary" />

                <DialogHeader className="p-8 pb-6 bg-gradient-to-b from-white/[0.02] to-transparent relative">
                    <div className="absolute top-8 right-8 w-20 h-20 bg-primary/5 -skew-x-12 blur-2xl rounded-full -z-10" />
                    <DialogTitle className="font-display font-black italic uppercase text-3xl tracking-tighter flex flex-col leading-none">
                        <span className="text-white/40 text-[10px] tracking-[0.4em] mb-2 not-italic font-bold">ATRIBUIÇÃO DE PLANO</span>
                        <span className="flex items-center gap-3">
                            ATRIBUIR <span className="text-primary">NOVO</span>
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <div className="p-8 pt-2 space-y-8">
                    <div className="space-y-4">
                        <Label className="font-display font-bold text-[9px] uppercase tracking-[0.2em] text-primary/60 mb-1">TIPO DE PLANO</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => {
                                    setProtocolType('workout');
                                    setSelectedTemplateId("");
                                }}
                                className={cn(
                                    "py-4 text-[11px] font-display font-black italic uppercase tracking-[0.15em] border transition-all flex flex-col items-center justify-center gap-2 relative overflow-hidden group",
                                    protocolType === 'workout'
                                        ? "bg-primary text-black border-primary shadow-[0_0_20px_rgba(212,255,0,0.2)]"
                                        : "bg-white/[0.03] border-white/10 text-white/40 hover:border-white/20 hover:bg-white/[0.05]"
                                )}
                            >
                                <Dumbbell size={18} className={cn(protocolType === 'workout' ? "text-black" : "text-white/20 group-hover:text-white/40")} />
                                <span>TREINAMENTO</span>
                                {protocolType === 'workout' && <div className="absolute top-0 right-0 w-6 h-6 bg-black translate-x-3 -translate-y-3 rotate-45" />}
                            </button>
                            <button
                                onClick={() => {
                                    setProtocolType('meal');
                                    setSelectedTemplateId("");
                                }}
                                className={cn(
                                    "py-4 text-[11px] font-display font-black italic uppercase tracking-[0.15em] border transition-all flex flex-col items-center justify-center gap-2 relative overflow-hidden group",
                                    protocolType === 'meal'
                                        ? "bg-primary text-black border-primary shadow-[0_0_20px_rgba(212,255,0,0.2)]"
                                        : "bg-white/[0.03] border-white/10 text-white/40 hover:border-white/20 hover:bg-white/[0.05]"
                                )}
                            >
                                <FileText size={18} className={cn(protocolType === 'meal' ? "text-black" : "text-white/20 group-hover:text-white/40")} />
                                <span>NUTRIÇÃO</span>
                                {protocolType === 'meal' && <div className="absolute top-0 right-0 w-6 h-6 bg-black translate-x-3 -translate-y-3 rotate-45" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="font-display font-bold text-[9px] uppercase tracking-[0.2em] text-primary/60 mb-1">
                            MODELO DA BIBLIOTECA
                        </Label>
                        <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                            <SelectTrigger className="bg-white/[0.03] border-white/10 rounded-none font-display font-black italic uppercase text-xs tracking-widest focus:border-primary/50 transition-all h-14">
                                <SelectValue placeholder="ESCOLHA UM MODELO..." />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0A0A0B] border-white/10 text-white rounded-none">
                                {templates?.length === 0 && (
                                    <div className="p-6 text-center text-white/20 font-display font-bold text-[10px] uppercase tracking-widest">
                                        NENHUM MODELO DISPONÍVEL
                                    </div>
                                )}
                                {templates?.map((template) => (
                                    <SelectItem
                                        key={template.id}
                                        value={template.id}
                                        className="uppercase font-display font-black italic text-xs py-3 focus:bg-primary focus:text-black transition-colors"
                                    >
                                        {template.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="p-5 bg-primary/5 border-l-2 border-primary relative overflow-hidden group">
                        <div className="absolute right-0 bottom-0 opacity-10 group-hover:scale-110 transition-transform">
                            <Zap size={40} fill="currentColor" className="text-primary" />
                        </div>
                        <p className="text-[9px] font-bold text-white/60 uppercase tracking-[0.1em] leading-relaxed relative z-10">
                            AO ATRIBUIR, UMA CÓPIA DO MODELO SERÁ CRIADA ESPECIFICAMENTE PARA ESTE ALUNO. <span className="text-primary">VOCÊ PODERÁ PERSONALIZAR OS DETALHES POSTERIORMENTE.</span>
                        </p>
                    </div>

                    <DialogFooter className="pt-4 pb-4">
                        <Button
                            onClick={handleAssign}
                            disabled={!selectedTemplateId || assignMutation.isPending}
                            className="w-full btn-athletic h-16 flex items-center justify-center gap-3 group text-xs font-black italic"
                        >
                            {assignMutation.isPending ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <>
                                    <span>CONFIRMAR ATRIBUIÇÃO</span>
                                    <Zap size={20} fill="currentColor" className="group-hover:scale-125 transition-transform" />
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
