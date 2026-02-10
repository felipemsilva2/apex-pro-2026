import { useState, useEffect } from "react";
import { AdminService, type UserAdminInfo } from "@/api/services/adminService";
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
import { Loader2, CalendarPlus, Building2 } from "lucide-react";

interface ExtendPlanDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    user: UserAdminInfo | null;
}

export function ExtendPlanDialog({ open, onOpenChange, onSuccess, user }: ExtendPlanDialogProps) {
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState("");

    // Reset form when user changes
    useEffect(() => {
        setAmount("");
    }, [user]);

    const isCoach = user?.role === 'coach';
    const unitLabel = isCoach ? "Meses" : "Dias";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !amount) return;

        const valueNum = parseInt(amount);
        if (isNaN(valueNum) || valueNum <= 0) {
            toast.error(`Informe um número válido de ${unitLabel.toLowerCase()}.`);
            return;
        }

        setLoading(true);
        try {
            if (isCoach) {
                // Logic for Coach (Tenant) - Add Months
                if (!user.tenant_id) throw new Error("Usuário não possui um Tenant vinculado.");

                await AdminService.manageSubscription({
                    tenantId: user.tenant_id,
                    monthsToAdd: valueNum
                });
                toast.success(`Plano do Profissional estendido em ${valueNum} meses!`);
            } else {
                // Logic for Client (Legacy/Fallback) - Add Days
                const result = await AdminService.extendUserPlan(user.id, valueNum);
                toast.success(`Plano estendido! Total de dias bônus: ${result.newTotalDays}`);
            }

            onSuccess();
            onOpenChange(false);
            setAmount("");
        } catch (err: any) {
            toast.error(err.message || "Erro ao estender plano.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#0A0A0B] border-white/10 text-white max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 font-display font-black italic uppercase text-xl tracking-tight">
                        {isCoach ? <Building2 className="text-indigo-500" size={24} /> : <CalendarPlus className="text-emerald-500" size={24} />}
                        {isCoach ? "PLANO PROFISSIONAL" : "ESTENDER PLANO"}
                    </DialogTitle>
                    <DialogDescription className="text-white/40 text-xs font-bold uppercase italic tracking-wide">
                        {isCoach ? `Tenant: ${user.tenants?.business_name || 'N/A'}` : `Usuário: ${user.full_name}`}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">
                            {isCoach ? "Meses Adicionais" : "Dias de Bônus"}
                        </Label>
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder={isCoach ? "1" : "7"}
                            min="1"
                            required
                            className="bg-white/5 border-white/10 rounded-none h-12 font-display font-bold italic text-xl tracking-widest text-center"
                        />
                        <p className="text-[9px] text-white/30 italic text-center">
                            {isCoach
                                ? "Estes meses serão somados à data de expiração do ambiente."
                                : "Estes dias serão ADICIONADOS ao plano atual do aluno."}
                        </p>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                        {(isCoach ? [1, 3, 6, 12] : [7, 15, 30, 60]).map((val) => (
                            <Button
                                key={val}
                                type="button"
                                variant="outline"
                                onClick={() => setAmount(val.toString())}
                                className="rounded-none border-white/10 h-10 font-display font-bold italic text-xs"
                            >
                                +{val}
                            </Button>
                        ))}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-none">
                            CANCELAR
                        </Button>
                        <Button type="submit" disabled={loading} className={isCoach ? "bg-indigo-600 hover:bg-indigo-700 rounded-none" : "bg-emerald-600 hover:bg-emerald-700 rounded-none"}>
                            {loading ? <Loader2 className="animate-spin" size={18} /> : (isCoach ? "ADICIONAR MESES" : "ADICIONAR DIAS")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
