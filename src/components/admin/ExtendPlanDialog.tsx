import { useState } from "react";
import { AdminService } from "@/api/services/adminService";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, CalendarPlus } from "lucide-react";

interface ExtendPlanDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    userId: string | null;
    userName: string;
}

export function ExtendPlanDialog({ open, onOpenChange, onSuccess, userId, userName }: ExtendPlanDialogProps) {
    const [loading, setLoading] = useState(false);
    const [days, setDays] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId || !days) return;

        const daysNum = parseInt(days);
        if (isNaN(daysNum) || daysNum <= 0) {
            toast.error("Informe um número válido de dias.");
            return;
        }

        setLoading(true);
        try {
            const result = await AdminService.extendUserPlan(userId, daysNum);
            toast.success(`Plano estendido! Total de dias bônus: ${result.newTotalDays}`);
            onSuccess();
            onOpenChange(false);
            setDays("");
        } catch (err: any) {
            toast.error(err.message || "Erro ao estender plano.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#0A0A0B] border-white/10 text-white max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 font-display font-black italic uppercase text-xl tracking-tight">
                        <CalendarPlus className="text-emerald-500" size={24} />
                        ESTENDER PLANO
                    </DialogTitle>
                    <DialogDescription className="text-white/40 text-xs font-bold uppercase italic tracking-wide">
                        Usuário: {userName}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Dias de Bônus</Label>
                        <Input
                            type="number"
                            value={days}
                            onChange={(e) => setDays(e.target.value)}
                            placeholder="7"
                            min="1"
                            required
                            className="bg-white/5 border-white/10 rounded-none h-12 font-display font-bold italic text-xl tracking-widest text-center"
                        />
                        <p className="text-[9px] text-white/30 italic text-center">Estes dias serão ADICIONADOS ao plano atual do aluno.</p>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                        {[7, 15, 30, 60].map((d) => (
                            <Button
                                key={d}
                                type="button"
                                variant="outline"
                                onClick={() => setDays(d.toString())}
                                className="rounded-none border-white/10 h-10 font-display font-bold italic text-xs"
                            >
                                +{d}
                            </Button>
                        ))}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-none">
                            CANCELAR
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 rounded-none">
                            {loading ? <Loader2 className="animate-spin" size={18} /> : "ADICIONAR DIAS"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
