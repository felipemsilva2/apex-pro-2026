import { useState, useEffect } from "react";
import { AdminService } from "@/api/services/adminService";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Pencil } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface EditUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    user: {
        id: string;
        full_name: string;
        email: string;
        role: string;
        tenant_id: string | null;
    } | null;
}

export function EditUserDialog({ open, onOpenChange, onSuccess, user }: EditUserDialogProps) {
    const [loading, setLoading] = useState(false);
    const [tenants, setTenants] = useState<{ id: string; business_name: string }[]>([]);
    const [formData, setFormData] = useState({
        full_name: "",
        role: "client",
        tenant_id: ""
    });

    useEffect(() => {
        if (open && user) {
            setFormData({
                full_name: user.full_name || "",
                role: user.role || "client",
                tenant_id: user.tenant_id || ""
            });
            fetchTenants();
        }
    }, [open, user]);

    const fetchTenants = async () => {
        const { data } = await supabase.from('tenants').select('id, business_name').order('business_name');
        setTenants(data || []);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            await AdminService.updateUser(user.id, formData);
            toast.success("Usuário atualizado com sucesso!");
            onSuccess();
            onOpenChange(false);
        } catch (err: any) {
            toast.error(err.message || "Erro ao atualizar usuário.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#0A0A0B] border-white/10 text-white max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 font-display font-black italic uppercase text-xl tracking-tight">
                        <Pencil className="text-primary" size={24} />
                        EDITAR USUÁRIO
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">E-mail (Read-Only)</Label>
                        <Input
                            value={user?.email || ""}
                            disabled
                            className="bg-white/5 border-white/10 rounded-none h-12 font-display font-bold italic text-xs tracking-widest opacity-50"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Nome Completo</Label>
                        <Input
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            placeholder="JOÃO SILVA"
                            required
                            className="bg-white/5 border-white/10 rounded-none h-12 font-display font-bold italic uppercase text-xs tracking-widest"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Papel</Label>
                            <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                                <SelectTrigger className="bg-white/5 border-white/10 rounded-none h-12 font-display font-bold italic uppercase text-xs tracking-widest">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0A0A0B] border-white/10">
                                    <SelectItem value="client">ALUNO</SelectItem>
                                    <SelectItem value="coach">COACH</SelectItem>
                                    <SelectItem value="admin">ADMIN</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Ambiente</Label>
                            <Select value={formData.tenant_id} onValueChange={(v) => setFormData({ ...formData, tenant_id: v })}>
                                <SelectTrigger className="bg-white/5 border-white/10 rounded-none h-12 font-display font-bold italic uppercase text-xs tracking-widest">
                                    <SelectValue placeholder="GLOBAL" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0A0A0B] border-white/10">
                                    {tenants.map((t) => (
                                        <SelectItem key={t.id} value={t.id}>{t.business_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-none">
                            CANCELAR
                        </Button>
                        <Button type="submit" disabled={loading} className="btn-athletic rounded-none">
                            {loading ? <Loader2 className="animate-spin" size={18} /> : "SALVAR ALTERAÇÕES"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
