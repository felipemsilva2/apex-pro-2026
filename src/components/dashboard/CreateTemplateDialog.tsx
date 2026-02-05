import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, Dumbbell, ClipboardList, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCreateTrainingTemplate, useCreateMealTemplate } from "@/hooks/useCoachData";
import { useAuth } from "@/contexts/AuthContext";
import { workoutSchema } from "@/api/validators/workout.schema";
import { mealPlanSchema } from "@/api/validators/meal.schema";
import { cn } from "@/lib/utils";

interface CreateTemplateDialogProps {
    defaultType?: 'training' | 'meal';
    clientId?: string;
    trigger?: React.ReactNode;
}

export function CreateTemplateDialog({ defaultType = 'training', clientId, trigger }: CreateTemplateDialogProps) {
    const [open, setOpen] = useState(false);
    const [templateType, setTemplateType] = useState<'training' | 'meal'>(defaultType);
    const { profile } = useAuth();
    const navigate = useNavigate();

    const trainingMutation = useCreateTrainingTemplate();
    const mealMutation = useCreateMealTemplate();

    const currentSchema = templateType === 'training' ? workoutSchema : mealPlanSchema;

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(currentSchema),
        defaultValues: {
            tenant_id: profile?.tenant_id || undefined,
            name: "",
            description: "",
            client_id: clientId || null
        }
    });

    // Ensure tenant_id is set when profile loads
    useEffect(() => {
        if (profile?.tenant_id) {
            setValue("tenant_id", profile.tenant_id);
        }
    }, [profile?.tenant_id, setValue]);

    // Update client_id if clientId prop changes
    useEffect(() => {
        if (clientId) {
            setValue("client_id", clientId);
        }
    }, [clientId, setValue]);

    // Reset template type to default when dialog opens
    useEffect(() => {
        if (open) {
            setTemplateType(defaultType);
        }
    }, [open, defaultType]);

    const onSubmit = async (data: any) => {
        console.log("Submitting template data:", data);
        try {
            if (templateType === 'training') {
                const result = await trainingMutation.mutateAsync(data);
                console.log("Template saved successfully", result);
                reset();
                setOpen(false);
                if (result?.id) {
                    navigate(`/dashboard/plans/${result.id}`);
                }
            } else {
                const result = await mealMutation.mutateAsync(data);
                console.log("Template saved successfully", result);
                reset();
                setOpen(false);
                if (result?.id) {
                    navigate(`/dashboard/meal-plans/${result.id}`);
                }
            }
        } catch (error) {
            console.error("Error saving template:", error);
            // Error handled by hooks
        }
    };

    const onError = (formErrors: any) => {
        console.log("Form validation failed:", formErrors);
    };

    const isLoading = trainingMutation.isPending || mealMutation.isPending;
    const isPersonalized = !!clientId;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <button className="btn-athletic text-[10px] px-8 py-3 shadow-[0_5px_15px_rgba(212,255,0,0.15)] flex items-center gap-2 group transition-all">
                        <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                        <span className="relative z-10">NOVO MODELO</span>
                    </button>
                )}
            </DialogTrigger>
            <DialogContent className="bg-[#0A0A0B] border-white/10 text-white rounded-none sm:max-w-[500px] p-0 overflow-hidden shadow-2xl shadow-primary/5">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                <div className="absolute top-0 left-0 w-[2px] h-full bg-primary" />
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />

                <DialogHeader className="p-8 pb-4 bg-gradient-to-b from-white/[0.02] to-transparent relative">
                    <div className="absolute top-8 right-8 w-16 h-16 bg-primary/5 -skew-x-12 blur-2xl rounded-full -z-10" />
                    <DialogTitle className="font-display font-black italic uppercase text-3xl tracking-tighter flex flex-col leading-none">
                        <span className="text-white/40 text-[10px] tracking-[0.4em] mb-2 not-italic font-bold">
                            {isPersonalized ? "CADASTRO RÁPIDO" : "BIBLIOTECA TÁTICA"}
                        </span>
                        <span className="flex items-center gap-3">
                            {isPersonalized ? "PROTOCOLO" : "NOVO"} <span className="text-primary">{isPersonalized ? "EM ANDAMENTO" : "MODELO"}</span>
                        </span>
                    </DialogTitle>
                </DialogHeader>

                {!isPersonalized && (
                    <div className="px-8 pb-4">
                        <Tabs value={templateType} onValueChange={(v) => setTemplateType(v as any)} className="w-full">
                            <TabsList className="grid grid-cols-2 bg-black/50 p-1 border border-white/10 rounded-none h-12">
                                <TabsTrigger
                                    value="training"
                                    className="rounded-none font-display font-black italic uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black"
                                >
                                    <Dumbbell size={14} className="mr-2" /> TREINO
                                </TabsTrigger>
                                <TabsTrigger
                                    value="meal"
                                    className="rounded-none font-display font-black italic uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black"
                                >
                                    <FileText size={14} className="mr-2" /> DIETA
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit, onError)} className={cn("p-8 pt-2 space-y-6", isPersonalized && "pt-6")}>
                    <div className="space-y-2">
                        <Label htmlFor="name" className="font-display font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
                            {isPersonalized ? "NOME DO PLANO" : "NOME DO MODELO"}
                        </Label>
                        <Input
                            id="name"
                            placeholder={templateType === 'training' ? "EX: TREINO DE HIPERTROFIA A" : "EX: PLANO CUTTING"}
                            {...register("name")}
                            className="bg-black/50 border-white/10 rounded-none font-display font-bold italic text-xs tracking-widest focus:border-primary transition-all h-12"
                        />
                        {errors.name && <p className="text-[10px] font-bold text-destructive uppercase italic">{(errors.name as any).message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="font-display font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
                            OBSERVAÇÕES GERAIS
                        </Label>
                        <Textarea
                            id="description"
                            placeholder="DESCREVA OS DETALHES DESTE PLANO..."
                            {...register("description")}
                            className="bg-black/50 border-white/10 rounded-none font-display font-bold italic text-xs tracking-widest focus:border-primary transition-all min-h-[100px] resize-none"
                        />
                    </div>

                    <div className="p-4 bg-primary/5 border border-primary/10 -skew-x-3">
                        <p className="text-[9px] font-black italic text-primary uppercase tracking-[0.2em] leading-tight">
                            {isPersonalized
                                ? "ESTE PROTOCOLO SERÁ VINCULADO DIRETAMENTE AO ATLETA E VOCÊ SERÁ REDIRECIONADO PARA O EDITOR."
                                : "ESTE MODELO FICARÁ DISPONÍVEL NA BIBLIOTECA PARA ATRIBUIÇÃO RÁPIDA A QUALQUER ATLETA DO ROSTER."
                            }
                        </p>
                    </div>

                    <DialogFooter className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-athletic h-14 flex items-center justify-center gap-2 group text-sm disabled:opacity-50"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <span>{isPersonalized ? "CRIAR E EDITAR PLANO" : "SALVAR NA BIBLIOTECA"}</span>
                                    {isPersonalized ? <Plus size={20} strokeWidth={3} /> : <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />}
                                </>
                            )}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
