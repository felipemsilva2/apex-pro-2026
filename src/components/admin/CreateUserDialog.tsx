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
import { Loader2, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface CreateUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreateUserDialog({ open, onOpenChange, onSuccess }: CreateUserDialogProps) {
    const [loading, setLoading] = useState(false);
    const [tenants, setTenants] = useState<{ id: string; business_name: string }[]>([]);
    const [formData, setFormData] = useState({
        fullName: "",
        username: "",
        password: "",
        role: "client" as "coach" | "client",
        tenantId: "",
        // Coach-specific fields
        businessName: "",
        subdomain: ""
    });

    useEffect(() => {
        if (open) {
            fetchTenants();
        }
    }, [open]);

    const fetchTenants = async () => {
        const { data } = await supabase.from('tenants').select('id, business_name').order('business_name');
        setTenants(data || []);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation based on role
        if (formData.role === "client" && !formData.tenantId) {
            toast.error("Selecione um ambiente para o aluno.");
            return;
        }

        if (formData.role === "coach") {
            if (!formData.businessName) {
                toast.error("Informe o nome do negócio.");
                return;
            }
            if (!formData.subdomain) {
                toast.error("Informe o subdomínio.");
                return;
            }
        }

        setLoading(true);
        try {
            if (formData.role === "coach") {
                // Create coach using the create-tenant Edge Function
                const { data, error } = await supabase.functions.invoke('create-tenant', {
                    body: {
                        fullName: formData.fullName,
                        username: formData.username,
                        password: formData.password,
                        businessName: formData.businessName,
                        subdomain: formData.subdomain.toLowerCase().replace(/[^a-z0-9]/g, '')
                    }
                });

                if (error) throw error;
                if (data?.error) throw new Error(data.error);

                toast.success("Coach e ambiente criados com sucesso!");
            } else {
                // Create client using the manage-athlete Edge Function
                await AdminService.createUser(formData);
                toast.success("Aluno criado com sucesso!");
            }

            onSuccess();
            onOpenChange(false);
            setFormData({
                fullName: "",
                username: "",
                password: "",
                role: "client",
                tenantId: "",
                businessName: "",
                subdomain: ""
            });
        } catch (err: any) {
            toast.error(err.message || "Erro ao criar usuário.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#0A0A0B] border-white/10 text-white max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 font-display font-black italic uppercase text-xl tracking-tight">
                        <UserPlus className="text-primary" size={24} />
                        CRIAR NOVO USUÁRIO
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {/* Role Selection First */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Tipo de Usuário</Label>
                        <Select
                            value={formData.role}
                            onValueChange={(v: "coach" | "client") => setFormData({ ...formData, role: v, tenantId: "" })}
                        >
                            <SelectTrigger className="bg-white/5 border-white/10 rounded-none h-12 font-display font-bold italic uppercase text-xs tracking-widest">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0A0A0B] border-white/10">
                                <SelectItem value="client">ALUNO</SelectItem>
                                <SelectItem value="coach">COACH (NOVO AMBIENTE)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Nome Completo</Label>
                        <Input
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            placeholder="João Silva"
                            required
                            className="bg-white/5 border-white/10 rounded-none h-12 font-display font-bold text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Nome de Usuário</Label>
                        <Input
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9.]/g, '') })}
                            placeholder="joao.silva"
                            required
                            className="bg-white/5 border-white/10 rounded-none h-12 font-display font-bold text-sm"
                        />
                        <p className="text-[9px] text-white/30 italic">@managed.nutripro.pro será adicionado automaticamente</p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Senha Inicial</Label>
                        <Input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="********"
                            required
                            minLength={6}
                            className="bg-white/5 border-white/10 rounded-none h-12 font-display font-bold text-sm"
                        />
                    </div>

                    {/* Coach-specific fields */}
                    {formData.role === "coach" && (
                        <>
                            <div className="border-t border-white/10 pt-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary italic mb-4">
                                    Dados do Ambiente
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Nome do Negócio</Label>
                                <Input
                                    value={formData.businessName}
                                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                    placeholder="Studio Personal João"
                                    required={formData.role === "coach"}
                                    className="bg-white/5 border-white/10 rounded-none h-12 font-display font-bold text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Subdomínio</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={formData.subdomain}
                                        onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })}
                                        placeholder="joaosilva"
                                        required={formData.role === "coach"}
                                        className="bg-white/5 border-white/10 rounded-none h-12 font-display font-bold text-sm"
                                    />
                                    <span className="text-white/40 text-xs whitespace-nowrap">.nutripro.pro</span>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Client-specific: Tenant selection */}
                    {formData.role === "client" && (
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Ambiente do Coach</Label>
                            <Select value={formData.tenantId} onValueChange={(v) => setFormData({ ...formData, tenantId: v })}>
                                <SelectTrigger className="bg-white/5 border-white/10 rounded-none h-12 font-display font-bold italic uppercase text-xs tracking-widest">
                                    <SelectValue placeholder="SELECIONE" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0A0A0B] border-white/10">
                                    {tenants.length === 0 ? (
                                        <SelectItem value="_none" disabled>Nenhum ambiente encontrado</SelectItem>
                                    ) : (
                                        tenants.map((t) => (
                                            <SelectItem key={t.id} value={t.id}>{t.business_name}</SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            {tenants.length === 0 && (
                                <p className="text-[9px] text-amber-500 italic">Crie um Coach primeiro para ter um ambiente disponível</p>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-none">
                            CANCELAR
                        </Button>
                        <Button type="submit" disabled={loading} className="btn-athletic rounded-none">
                            {loading ? <Loader2 className="animate-spin" size={18} /> : formData.role === "coach" ? "CRIAR COACH" : "CRIAR ALUNO"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
