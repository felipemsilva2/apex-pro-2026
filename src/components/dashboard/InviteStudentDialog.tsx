import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, UserPlus, Loader2 } from "lucide-react";
import { TenantService } from "@/api/services/tenantService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function InviteStudentDialog() {
    const { profile } = useAuth();
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [open, setOpen] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile?.tenant_id) return;

        setIsSending(true);
        try {
            const service = new TenantService(profile.tenant_id);

            // Direct registration via Edge Function
            const result = await service.manageAthlete({
                fullName,
                username,
                password,
                phone,
                tenantId: profile.tenant_id
            });

            if (result.error) {
                throw new Error(result.error);
            }

            toast.success("Atleta cadastrado com sucesso!", {
                description: `${fullName} já pode logar no app com o usuário "${username}".`
            });
            setOpen(false);
        } catch (error: any) {
            toast.error("Erro no cadastro", {
                description: error.message || "Tente novamente mais tarde."
            });
        } finally {
            setIsSending(false);
        }
    };

    const handleClose = () => {
        setOpen(false);
        // Reset state when dialog closes
        setTimeout(() => {
            setFullName("");
            setUsername("");
            setPassword("");
            setPhone("");
        }, 200);
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => isOpen ? setOpen(true) : handleClose()}>
            <DialogTrigger asChild>
                <button className="btn-athletic text-sm px-6 py-3 shadow-[0_5px_15px_rgba(212,255,0,0.15)] flex items-center gap-2 group transition-all">
                    <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                    <span className="relative z-10">ADICIONAR ALUNO</span>
                </button>
            </DialogTrigger>
            <DialogContent className="bg-[#0A0A0B] border-white/10 text-white rounded-none sm:max-w-[480px] p-0 shadow-2xl shadow-primary/5 overflow-visible">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                <div className="absolute top-0 left-0 w-[2px] h-full bg-primary" />

                <DialogHeader className="p-8 pb-6 bg-gradient-to-b from-white/[0.02] to-transparent relative border-b border-white/5">
                    <div className="absolute top-8 right-8 w-16 h-16 bg-primary/5 -skew-x-12 blur-2xl rounded-full -z-10" />
                    <DialogTitle className="font-display font-black italic uppercase text-2xl tracking-tighter flex flex-col leading-none">
                        <span className="text-white/40 text-[9px] tracking-[0.4em] mb-2 not-italic font-bold">CADASTRO DE ALUNOS</span>
                        <span className="flex items-center gap-3">
                            CADASTRAR <span className="text-primary">NOVO</span>
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <div className="p-8 space-y-8 relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -skew-x-12 blur-3xl rounded-full -z-10" />

                    <form onSubmit={handleRegister} className="space-y-6 animate-fade-in">
                        <div className="relative group">
                            <Label className="font-display font-black text-[10px] uppercase tracking-[0.3em] text-primary/60 mb-3 block italic">
                                NOME COMPLETO
                            </Label>
                            <div className="relative">
                                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-[2px] h-8 bg-primary shadow-[0_0_10px_rgba(212,255,0,0.5)]" />
                                <Input
                                    placeholder="NOME DO ALUNO"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    className="bg-white/[0.03] border-white/10 rounded-none font-display font-bold italic uppercase text-sm tracking-widest focus:border-primary focus:ring-0 transition-all h-14 pl-6 placeholder:text-white/10"
                                />
                            </div>
                        </div>

                        <div className="relative group">
                            <Label className="font-display font-black text-[10px] uppercase tracking-[0.3em] text-primary/60 mb-3 block italic">
                                WHATSAPP (DDD + NÚMERO)
                            </Label>
                            <div className="relative">
                                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-[2px] h-8 bg-[#25D366] shadow-[0_0_10px_rgba(37,211,102,0.5)]" />
                                <Input
                                    placeholder="Ex: 11999999999"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="bg-white/[0.03] border-white/10 rounded-none font-display font-bold italic uppercase text-sm tracking-widest focus:border-[#25D366] focus:ring-0 transition-all h-14 pl-6 placeholder:text-white/10"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative group">
                                <Label className="font-display font-black text-[10px] uppercase tracking-[0.3em] text-primary/60 mb-3 block italic">
                                    NOME DE USUÁRIO
                                </Label>
                                <Input
                                    placeholder="JOAO123"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                                    required
                                    className="bg-white/[0.03] border-white/10 rounded-none font-display font-bold italic uppercase text-sm tracking-widest focus:border-primary focus:ring-0 transition-all h-12 pl-4 placeholder:text-white/10"
                                />
                            </div>
                            <div className="relative group">
                                <Label className="font-display font-black text-[10px] uppercase tracking-[0.3em] text-primary/60 mb-3 block italic">
                                    SENHA DE ACESSO
                                </Label>
                                <Input
                                    type="text"
                                    placeholder="******"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-white/[0.03] border-white/10 rounded-none font-display font-bold italic uppercase text-sm tracking-widest focus:border-primary focus:ring-0 transition-all h-12 pl-4 placeholder:text-white/10"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isSending || !fullName || !username || !password}
                            className="w-full btn-athletic h-14 flex items-center justify-center gap-4 group relative overflow-hidden shadow-[0_15px_30px_rgba(212,255,0,0.2)]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            {isSending ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <span className="text-sm tracking-[0.2em]">CADASTRAR</span>
                                    <UserPlus size={18} className="translate-x-0 group-hover:translate-x-2 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog >
    );
}
