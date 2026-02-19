import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateAssessment } from "@/hooks/useAssessments";
import { Client } from "@/lib/supabase";
import { Scale, Flame, Dumbbell, Ruler, Target, Activity } from "lucide-react";
import { calculateComposition, calculateWHR, calculateBMR, calculateBMI } from "@/lib/calculations";

type CreateAssessmentDialogProps = {
    client: Client;
    tenantId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function CreateAssessmentDialog({
    client,
    tenantId,
    open,
    onOpenChange,
}: CreateAssessmentDialogProps) {
    const createAssessment = useCreateAssessment();
    const [formData, setFormData] = useState({
        assessment_date: new Date().toISOString().split('T')[0],
        weight_kg: '',
        body_fat_percentage: '',
        waist_cm: '',
        hip_cm: '',
        arm_cm: '',
        thigh_cm: '',
        chest_cm: '',
        notes: '',
        target_weight_kg: '',
        target_body_fat_percentage: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Convert string values to numbers, filtering out empty strings
        const numericData: any = {
            client_id: client.id,
            tenant_id: tenantId,
            assessment_date: formData.assessment_date,
        };

        // Add numeric fields if they have values
        if (formData.weight_kg) numericData.weight_kg = parseFloat(formData.weight_kg);
        if (formData.body_fat_percentage) numericData.body_fat_percentage = parseFloat(formData.body_fat_percentage);
        if (formData.waist_cm) numericData.waist_cm = parseFloat(formData.waist_cm);
        if (formData.hip_cm) numericData.hip_cm = parseFloat(formData.hip_cm);
        if (formData.arm_cm) numericData.arm_cm = parseFloat(formData.arm_cm);
        if (formData.thigh_cm) numericData.thigh_cm = parseFloat(formData.thigh_cm);
        if (formData.chest_cm) numericData.chest_cm = parseFloat(formData.chest_cm);
        if (formData.target_weight_kg) numericData.target_weight_kg = parseFloat(formData.target_weight_kg);
        if (formData.target_body_fat_percentage) numericData.target_body_fat_percentage = parseFloat(formData.target_body_fat_percentage);
        if (formData.notes) numericData.notes = formData.notes;
        if (bmr) numericData.basal_metabolic_rate = bmr;

        await createAssessment.mutateAsync(numericData);
        onOpenChange(false);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            assessment_date: new Date().toISOString().split('T')[0],
            weight_kg: '',
            body_fat_percentage: '',
            waist_cm: '',
            hip_cm: '',
            arm_cm: '',
            thigh_cm: '',
            chest_cm: '',
            notes: '',
            target_weight_kg: '',
            target_body_fat_percentage: '',
        });
    };

    // Calculate Lean/Fat Mass automatically
    const getComposition = () => {
        if (formData.weight_kg && formData.body_fat_percentage) {
            const weight = parseFloat(formData.weight_kg);
            const bf = parseFloat(formData.body_fat_percentage);
            return calculateComposition(weight, bf);
        }
        return null;
    };

    const comp = getComposition();

    // Calculate WHR automatically
    const getWHR = () => {
        if (formData.waist_cm && formData.hip_cm) {
            const waist = parseFloat(formData.waist_cm);
            const hip = parseFloat(formData.hip_cm);
            return calculateWHR(waist, hip);
        }
        return null;
    };

    const whr = getWHR();

    // Calculate BMR automatically
    const getBMR = () => {
        if (formData.weight_kg && client.birth_date && client.gender) {
            const weight = parseFloat(formData.weight_kg);
            const height = client.height || 170; // fallback height if missing
            const birth = new Date(client.birth_date);
            const age = new Date().getFullYear() - birth.getFullYear();
            return calculateBMR(weight, height, age, client.gender);
        }
        return null;
    };

    const bmr = getBMR();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Nova Avaliação Física - {client.full_name}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Data */}
                    <div>
                        <Label htmlFor="assessment_date" className="flex items-center gap-2">
                            📅 Data da Avaliação
                        </Label>
                        <Input
                            id="assessment_date"
                            type="date"
                            value={formData.assessment_date}
                            onChange={(e) => setFormData({ ...formData, assessment_date: e.target.value })}
                            required
                        />
                    </div>

                    {/* Peso e Composição */}
                    <div className="space-y-3">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Scale className="w-4 h-4" />
                            Peso e Composição Corporal
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="weight_kg">Peso (kg) *</Label>
                                <Input
                                    id="weight_kg"
                                    type="number"
                                    step="0.01"
                                    placeholder="84.10"
                                    value={formData.weight_kg}
                                    onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="body_fat_percentage">
                                    <Flame className="w-3 h-3 inline mr-1" />
                                    Gordura (%) *
                                </Label>
                                <Input
                                    id="body_fat_percentage"
                                    type="number"
                                    step="0.01"
                                    placeholder="13.04"
                                    value={formData.body_fat_percentage}
                                    onChange={(e) => setFormData({ ...formData, body_fat_percentage: e.target.value })}
                                />
                            </div>
                        </div>
                        {/* Auto-calculated fields */}
                        {comp && (
                            <div className="grid grid-cols-3 gap-4 p-3 bg-muted/50 rounded-lg">
                                <div>
                                    <Label className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase font-bold tracking-tighter">
                                        <Dumbbell className="w-3 h-3" />
                                        Massa Magra
                                    </Label>
                                    <p className="text-sm font-semibold">{comp.leanMassKg} kg</p>
                                </div>
                                <div>
                                    <Label className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase font-bold tracking-tighter">
                                        Massa Gorda
                                    </Label>
                                    <p className="text-sm font-semibold">{comp.fatMassKg} kg</p>
                                </div>
                                {bmr && (
                                    <div>
                                        <Label className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase font-bold tracking-tighter">
                                            <Activity className="w-3 h-3" />
                                            TMB (Metab.)
                                        </Label>
                                        <p className="text-sm font-semibold text-primary">{bmr} kcal</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Perímetros */}
                    <div className="space-y-3">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Ruler className="w-4 h-4" />
                            Perímetros (Opcional)
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="waist_cm">Cintura (cm)</Label>
                                <Input
                                    id="waist_cm"
                                    type="number"
                                    step="0.1"
                                    placeholder="85"
                                    value={formData.waist_cm}
                                    onChange={(e) => setFormData({ ...formData, waist_cm: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="hip_cm">Quadril (cm)</Label>
                                <Input
                                    id="hip_cm"
                                    type="number"
                                    step="0.1"
                                    placeholder="98"
                                    value={formData.hip_cm}
                                    onChange={(e) => setFormData({ ...formData, hip_cm: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="arm_cm">Braço (cm)</Label>
                                <Input
                                    id="arm_cm"
                                    type="number"
                                    step="0.1"
                                    placeholder="35"
                                    value={formData.arm_cm}
                                    onChange={(e) => setFormData({ ...formData, arm_cm: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="thigh_cm">Coxa (cm)</Label>
                                <Input
                                    id="thigh_cm"
                                    type="number"
                                    step="0.1"
                                    placeholder="58"
                                    value={formData.thigh_cm}
                                    onChange={(e) => setFormData({ ...formData, thigh_cm: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="chest_cm">Peitoral (cm)</Label>
                                <Input
                                    id="chest_cm"
                                    type="number"
                                    step="0.1"
                                    placeholder="105"
                                    value={formData.chest_cm}
                                    onChange={(e) => setFormData({ ...formData, chest_cm: e.target.value })}
                                />
                            </div>
                        </div>
                        {/* Show WHR if available */}
                        {whr && (
                            <div className="p-3 bg-muted/50 rounded-lg">
                                <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">RCQ - Relação Cintura/Quadril</Label>
                                <p className="text-sm font-semibold">{whr}</p>
                            </div>
                        )}
                    </div>

                    {/* Metas */}
                    <div className="space-y-3">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Metas (Opcional)
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="target_weight_kg">Meta Peso (kg)</Label>
                                <Input
                                    id="target_weight_kg"
                                    type="number"
                                    step="0.01"
                                    placeholder="80"
                                    value={formData.target_weight_kg}
                                    onChange={(e) => setFormData({ ...formData, target_weight_kg: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="target_body_fat_percentage">Meta Gordura (%)</Label>
                                <Input
                                    id="target_body_fat_percentage"
                                    type="number"
                                    step="0.01"
                                    placeholder="10"
                                    value={formData.target_body_fat_percentage}
                                    onChange={(e) => setFormData({ ...formData, target_body_fat_percentage: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Notas */}
                    <div>
                        <Label htmlFor="notes">Observações</Label>
                        <Textarea
                            id="notes"
                            placeholder="Ex: Cliente relatou boa evolução muscular. Aumentar carga nos exercícios..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                        />
                    </div>

                    {/* Ações */}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                onOpenChange(false);
                                resetForm();
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={createAssessment.isPending}>
                            {createAssessment.isPending ? 'Salvando...' : 'Salvar Avaliação'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
