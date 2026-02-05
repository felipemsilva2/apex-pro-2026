import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useClientAssessments } from "@/hooks/useAssessments";
import { CreateAssessmentDialog } from "@/components/dashboard/CreateAssessmentDialog";
import { Client } from "@/lib/supabase";
import { Scale, Flame, Dumbbell, TrendingUp, TrendingDown, Plus, Calendar, Trash2, ChevronDown, Eye, EyeOff } from "lucide-react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { AssessmentService } from "@/api/services/assessmentService";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useUpdateAssessment } from "@/hooks/useAssessments";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

const parseLocalDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    // If it's already a full ISO string, just take the date part
    const datePart = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const [year, month, day] = datePart.split('-').map(Number);
    return new Date(year, month - 1, day);
};

type AssessmentsTabProps = {
    client: Client;
    tenantId: string;
};

function FeedbackSection({ assessment, onSave, isUpdating }: { assessment: any; onSave: (val: string, extraData?: any) => void; isUpdating: boolean }) {
    const [feedback, setFeedback] = useState(assessment.coach_feedback || '');
    const [bodyFat, setBodyFat] = useState(assessment.body_fat_percentage?.toString() || '');
    const [arm, setArm] = useState(assessment.arm_cm?.toString() || '');
    const [waist, setWaist] = useState(assessment.waist_cm?.toString() || '');

    const hasChanged = feedback !== (assessment.coach_feedback || '') ||
        bodyFat !== (assessment.body_fat_percentage?.toString() || '') ||
        arm !== (assessment.arm_cm?.toString() || '') ||
        waist !== (assessment.waist_cm?.toString() || '');

    useEffect(() => {
        setFeedback(assessment.coach_feedback || '');
        setBodyFat(assessment.body_fat_percentage?.toString() || '');
        setArm(assessment.arm_cm?.toString() || '');
        setWaist(assessment.waist_cm?.toString() || '');
    }, [assessment.coach_feedback, assessment.body_fat_percentage, assessment.arm_cm, assessment.waist_cm]);

    const handleSave = () => {
        onSave(feedback, {
            body_fat_percentage: bodyFat ? parseFloat(bodyFat.replace(',', '.')) : null,
            arm_cm: arm ? parseFloat(arm.replace(',', '.')) : null,
            waist_cm: waist ? parseFloat(waist.replace(',', '.')) : null,
        });
    };

    return (
        <div className="mt-6 pt-4 border-t border-white/5 space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Análise do Profissional</p>
                {assessment.status === 'reviewed' && !hasChanged && (
                    <span className="text-[9px] font-bold text-green-500 uppercase italic">Concluído</span>
                )}
                {hasChanged && (
                    <span className="text-[9px] font-bold text-primary uppercase italic animate-pulse">Alterações não salvas</span>
                )}
            </div>

            {/* Professional Data Entry */}
            <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Gordura %</label>
                    <TextInput
                        value={bodyFat}
                        onChange={(val) => setBodyFat(val)}
                        placeholder="0.0"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Braço (cm)</label>
                    <TextInput
                        value={arm}
                        onChange={(val) => setArm(val)}
                        placeholder="0.0"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Cintura (cm)</label>
                    <TextInput
                        value={waist}
                        onChange={(val) => setWaist(val)}
                        placeholder="0.0"
                    />
                </div>
            </div>

            <div className="relative group/feedback">
                <Textarea
                    placeholder="Sua análise técnica, ajustes e orientações para este check-in..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="min-h-[100px] bg-black/40 border-white/5 focus:border-primary/50 text-xs text-white/80 resize-none transition-all placeholder:text-white/20 pb-10"
                />
                <div className="absolute bottom-2 right-2 flex items-center gap-2">
                    {hasChanged && (
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={isUpdating}
                            className="h-7 px-3 bg-primary text-black text-[10px] font-black italic uppercase rounded-none hover:bg-primary/80 shadow-lg shadow-primary/20"
                        >
                            {isUpdating ? 'Gravando...' : 'Salvar Análise'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (val: string) => void; placeholder: string }) {
    return (
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-black/40 border border-white/5 focus:border-primary/40 px-3 py-2 text-xs text-white rounded-none outline-none transition-all placeholder:text-white/10"
        />
    );
}

export function AssessmentsTab({ client, tenantId }: AssessmentsTabProps) {
    const { data: assessments = [], isLoading, error } = useClientAssessments(client.id);
    const updateAssessment = useUpdateAssessment();
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [showLatestPhotos, setShowLatestPhotos] = useState(true);

    // Error state (likely table doesn't exist)
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Scale className="w-12 h-12 text-red-500/20" />
                <div className="text-center">
                    <p className="text-white/60 font-display italic uppercase mb-2">
                        Erro ao carregar avaliações
                    </p>
                    <p className="text-xs text-white/40 max-w-md">
                        A tabela de avaliações físicas ainda não foi criada no banco de dados.
                    </p>
                    <p className="text-xs text-white/40 max-w-md mt-1">
                        Execute a migration: <code className="text-primary">20260202_create_body_assessments.sql</code>
                    </p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-white/40">Carregando avaliações...</p>
            </div>
        );
    }

    const latestAssessment = assessments[0];
    const previousAssessment = assessments[1];

    const delta = latestAssessment && previousAssessment
        ? AssessmentService.calculateDelta(latestAssessment, previousAssessment)
        : null;

    return (
        <div className="space-y-6">
            {/* Header with action button */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-display font-black italic uppercase text-white">
                        Avaliações Físicas
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {assessments.length} avaliação{assessments.length !== 1 ? 'ões' : ''} registrada{assessments.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <Button
                    onClick={() => setCreateDialogOpen(true)}
                    className="rounded-none bg-primary text-black hover:bg-primary/80 font-display font-black italic uppercase text-xs tracking-wider"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Avaliação
                </Button>
            </div>

            {/* Latest Assessment Summary */}
            {latestAssessment && (
                <div className="athletic-card border-l-2 border-l-primary">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-primary -skew-x-12" />
                            <h3 className="text-xl font-display font-black italic uppercase tracking-tighter text-white">
                                Última Avaliação
                            </h3>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {format(parseLocalDate(latestAssessment.assessment_date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Weight */}
                        <div className="bg-white/5 p-4 border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-16 h-full bg-primary/5 -skew-x-[30deg] translate-x-12" />
                            <div className="flex items-center gap-2 mb-2">
                                <Scale className="w-4 h-4 text-primary/60" />
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Peso</p>
                            </div>
                            <p className="text-2xl font-display font-black text-white italic">
                                {latestAssessment.weight_kg?.toFixed(2) || '--'} kg
                            </p>
                            {delta && (
                                <p className={`text-xs flex items-center gap-1 mt-1 ${delta.weight_delta > 0 ? 'text-yellow-500' : delta.weight_delta < 0 ? 'text-green-500' : 'text-white/40'
                                    }`}>
                                    {delta.weight_delta > 0 ? <TrendingUp className="w-3 h-3" /> : delta.weight_delta < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                                    {delta.weight_delta > 0 ? '+' : ''}{delta.weight_delta.toFixed(2)}kg
                                </p>
                            )}
                        </div>

                        {/* Body Fat */}
                        <div className="bg-white/5 p-4 border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-16 h-full bg-primary/5 -skew-x-[30deg] translate-x-12" />
                            <div className="flex items-center gap-2 mb-2">
                                <Flame className="w-4 h-4 text-red-500/60" />
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Gordura</p>
                            </div>
                            <p className="text-2xl font-display font-black text-white italic">
                                {latestAssessment.body_fat_percentage?.toFixed(2) || '--'}%
                            </p>
                            {delta && (
                                <p className={`text-xs flex items-center gap-1 mt-1 ${delta.body_fat_delta < 0 ? 'text-green-500' : delta.body_fat_delta > 0 ? 'text-red-500' : 'text-white/40'
                                    }`}>
                                    {delta.body_fat_delta > 0 ? <TrendingUp className="w-3 h-3" /> : delta.body_fat_delta < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                                    {delta.body_fat_delta > 0 ? '+' : ''}{delta.body_fat_delta.toFixed(2)}%
                                </p>
                            )}
                        </div>

                        {/* Lean Mass */}
                        <div className="bg-white/5 p-4 border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-16 h-full bg-primary/5 -skew-x-[30deg] translate-x-12" />
                            <div className="flex items-center gap-2 mb-2">
                                <Dumbbell className="w-4 h-4 text-green-500/60" />
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Massa Magra</p>
                            </div>
                            <p className="text-2xl font-display font-black text-white italic">
                                {latestAssessment.lean_mass_kg?.toFixed(2) || '--'} kg
                            </p>
                            {delta && (
                                <p className={`text-xs flex items-center gap-1 mt-1 ${delta.lean_mass_delta > 0 ? 'text-green-500' : delta.lean_mass_delta < 0 ? 'text-red-500' : 'text-white/40'
                                    }`}>
                                    {delta.lean_mass_delta > 0 ? <TrendingUp className="w-3 h-3" /> : delta.lean_mass_delta < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                                    {delta.lean_mass_delta > 0 ? '+' : ''}{delta.lean_mass_delta.toFixed(2)}kg
                                </p>
                            )}
                        </div>

                        {/* Fat Mass */}
                        <div className="bg-white/5 p-4 border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-16 h-full bg-primary/5 -skew-x-[30deg] translate-x-12" />
                            <div className="flex items-center gap-2 mb-2">
                                <Flame className="w-4 h-4 text-orange-500/60" />
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Massa Gorda</p>
                            </div>
                            <p className="text-2xl font-display font-black text-white italic">
                                {latestAssessment.fat_mass_kg?.toFixed(2) || '--'} kg
                            </p>
                            {delta && (
                                <p className={`text-xs flex items-center gap-1 mt-1 ${delta.fat_mass_delta < 0 ? 'text-green-500' : delta.fat_mass_delta > 0 ? 'text-red-500' : 'text-white/40'
                                    }`}>
                                    {delta.fat_mass_delta > 0 ? <TrendingUp className="w-3 h-3" /> : delta.fat_mass_delta < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                                    {delta.fat_mass_delta > 0 ? '+' : ''}{delta.fat_mass_delta.toFixed(2)}kg
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Photos Grid with Collapsible */}
                    {(latestAssessment.front_photo || latestAssessment.back_photo || latestAssessment.side_photo) && (
                        <div className="mt-4 pt-4 border-t border-white/5">
                            <Collapsible open={showLatestPhotos} onOpenChange={setShowLatestPhotos}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Registros Fotográficos</p>
                                        <span className="w-1 h-1 rounded-full bg-primary/40" />
                                        <span className="text-[8px] font-bold text-primary uppercase">3 Imagens</span>
                                    </div>
                                    <CollapsibleTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-2 text-[9px] font-bold uppercase tracking-widest hover:bg-white/5 text-white/60 hover:text-primary transition-all group"
                                        >
                                            {showLatestPhotos ? (
                                                <>
                                                    <EyeOff className="w-3 h-3 mr-1 text-primary/60 group-hover:text-primary" />
                                                    Ocultar
                                                </>
                                            ) : (
                                                <>
                                                    <Eye className="w-3 h-3 mr-1 text-primary/60 group-hover:text-primary" />
                                                    Visualizar
                                                </>
                                            )}
                                            <ChevronDown className={`w-3 h-3 ml-1 transition-transform duration-300 ${showLatestPhotos ? 'rotate-180' : ''}`} />
                                        </Button>
                                    </CollapsibleTrigger>
                                </div>

                                <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden">
                                    <div className="grid grid-cols-3 gap-2 py-1">
                                        {latestAssessment.front_photo ? (
                                            <div className="aspect-[3/4] bg-black/40 rounded overflow-hidden border border-white/5 relative group cursor-pointer" onClick={() => window.open(latestAssessment.front_photo!, '_blank')}>
                                                <img src={latestAssessment.front_photo} alt="Frente" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                                <div className="absolute bottom-0 left-0 w-full bg-black/60 p-1 text-center">
                                                    <span className="text-[8px] font-bold text-white uppercase">Frente</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="aspect-[3/4] bg-white/5 rounded flex items-center justify-center border border-white/5 border-dashed">
                                                <span className="text-[8px] font-bold text-white/20 uppercase">Sem foto</span>
                                            </div>
                                        )}
                                        {latestAssessment.back_photo ? (
                                            <div className="aspect-[3/4] bg-black/40 rounded overflow-hidden border border-white/5 relative group cursor-pointer" onClick={() => window.open(latestAssessment.back_photo!, '_blank')}>
                                                <img src={latestAssessment.back_photo} alt="Costas" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                                <div className="absolute bottom-0 left-0 w-full bg-black/60 p-1 text-center">
                                                    <span className="text-[8px] font-bold text-white uppercase">Costas</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="aspect-[3/4] bg-white/5 rounded flex items-center justify-center border border-white/5 border-dashed">
                                                <span className="text-[8px] font-bold text-white/20 uppercase">Sem foto</span>
                                            </div>
                                        )}
                                        {latestAssessment.side_photo ? (
                                            <div className="aspect-[3/4] bg-black/40 rounded overflow-hidden border border-white/5 relative group cursor-pointer" onClick={() => window.open(latestAssessment.side_photo!, '_blank')}>
                                                <img src={latestAssessment.side_photo} alt="Lado" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                                <div className="absolute bottom-0 left-0 w-full bg-black/60 p-1 text-center">
                                                    <span className="text-[8px] font-bold text-white uppercase">Lado</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="aspect-[3/4] bg-white/5 rounded flex items-center justify-center border border-white/5 border-dashed">
                                                <span className="text-[8px] font-bold text-white/20 uppercase">Sem foto</span>
                                            </div>
                                        )}
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        </div>
                    )}

                    {latestAssessment.notes && (
                        <div className="mt-4 p-3 bg-white/5 border-l-2 border-primary/40">
                            <p className="text-xs text-white/60">{latestAssessment.notes}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Historical list */}
            <div className="athletic-card">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-1.5 h-6 bg-primary -skew-x-12" />
                    <h3 className="text-xl font-display font-black italic uppercase tracking-tighter text-white">
                        Histórico
                    </h3>
                </div>

                {assessments.length === 0 ? (
                    <div className="text-center py-12">
                        <Scale className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <p className="text-white/40 font-display italic uppercase">Nenhuma avaliação registrada</p>
                        <Button
                            onClick={() => setCreateDialogOpen(true)}
                            variant="outline"
                            className="mt-4 rounded-none"
                        >
                            Registrar Primeira Avaliação
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {assessments.map((assessment, index) => {
                            const prev = assessments[index + 1];
                            const itemDelta = prev ? AssessmentService.calculateDelta(assessment, prev) : null;

                            return (
                                <div
                                    key={assessment.id}
                                    className="p-4 bg-white/5 border border-white/5 hover:border-primary/30 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Calendar className="w-4 h-4 text-primary" />
                                                <p className="font-display font-bold text-white uppercase">
                                                    {format(parseLocalDate(assessment.assessment_date), "dd/MM/yyyy")}
                                                </p>
                                                {index === 0 && (
                                                    <span className="px-2 py-0.5 bg-primary/20 text-primary text-[9px] font-bold uppercase tracking-wider">
                                                        Mais Recente
                                                    </span>
                                                )}
                                                {assessment.status === 'reviewed' ? (
                                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-500 text-[9px] font-bold uppercase tracking-wider">
                                                        <CheckCircle2 className="w-2.5 h-2.5" />
                                                        Avaliado
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-[9px] font-bold uppercase tracking-wider">
                                                        Pendente
                                                    </span>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                <div>
                                                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Peso</p>
                                                    <p className="text-white font-bold">{assessment.weight_kg?.toFixed(2)} kg</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Gordura</p>
                                                    <p className="text-white font-bold">{assessment.body_fat_percentage?.toFixed(2)}%</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Massa Magra</p>
                                                    <p className="text-white font-bold">{assessment.lean_mass_kg?.toFixed(2)} kg</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Massa Gorda</p>
                                                    <p className="text-white font-bold">{assessment.fat_mass_kg?.toFixed(2)} kg</p>
                                                </div>
                                            </div>
                                            {assessment.notes && (
                                                <p className="mt-2 text-xs text-white/50 italic">{assessment.notes}</p>
                                            )}

                                            {/* Historical Photos Collapsible */}
                                            {(assessment.front_photo || assessment.back_photo || assessment.side_photo) && (
                                                <Collapsible className="mt-4">
                                                    <CollapsibleTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 px-0 text-[10px] font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-all hover:bg-transparent"
                                                        >
                                                            <Eye className="w-3 h-3 mr-1" />
                                                            Visualizar Fotos
                                                            <ChevronDown className="w-3 h-3 ml-1 transition-transform ui-open:rotate-180" />
                                                        </Button>
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent className="mt-3 overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {assessment.front_photo && (
                                                                <div className="aspect-[3/4] bg-black/40 rounded overflow-hidden border border-white/5 relative group cursor-pointer" onClick={(e) => { e.stopPropagation(); window.open(assessment.front_photo!, '_blank'); }}>
                                                                    <img src={assessment.front_photo} alt="Frente" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                                                    <div className="absolute bottom-0 left-0 w-full bg-black/60 p-1 text-center">
                                                                        <span className="text-[8px] font-bold text-white uppercase">Frente</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {assessment.back_photo && (
                                                                <div className="aspect-[3/4] bg-black/40 rounded overflow-hidden border border-white/5 relative group cursor-pointer" onClick={(e) => { e.stopPropagation(); window.open(assessment.back_photo!, '_blank'); }}>
                                                                    <img src={assessment.back_photo} alt="Costas" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                                                    <div className="absolute bottom-0 left-0 w-full bg-black/60 p-1 text-center">
                                                                        <span className="text-[8px] font-bold text-white uppercase">Costas</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {assessment.side_photo && (
                                                                <div className="aspect-[3/4] bg-black/40 rounded overflow-hidden border border-white/5 relative group cursor-pointer" onClick={(e) => { e.stopPropagation(); window.open(assessment.side_photo!, '_blank'); }}>
                                                                    <img src={assessment.side_photo} alt="Lado" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                                                    <div className="absolute bottom-0 left-0 w-full bg-black/60 p-1 text-center">
                                                                        <span className="text-[8px] font-bold text-white uppercase">Lado</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </CollapsibleContent>
                                                </Collapsible>
                                            )}
                                            {/* Coach Feedback Section */}
                                            <FeedbackSection
                                                assessment={assessment}
                                                isUpdating={updateAssessment.isPending}
                                                onSave={(newFeedback, extraData) => {
                                                    updateAssessment.mutate({
                                                        id: assessment.id,
                                                        input: {
                                                            coach_feedback: newFeedback,
                                                            status: 'reviewed',
                                                            ...extraData
                                                        }
                                                    });
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Create Dialog */}
            <CreateAssessmentDialog
                client={client}
                tenantId={tenantId}
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
            />
        </div >
    );
}
