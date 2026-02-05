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
import { Loader2, Key, Copy } from "lucide-react";

interface ResetPasswordDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string | null;
    userName: string;
}

export function ResetPasswordDialog({ open, onOpenChange, userId, userName }: ResetPasswordDialogProps) {
    const [loading, setLoading] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    const generatePassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let result = "";
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setNewPassword(result);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId || !newPassword) return;

        setLoading(true);
        try {
            await AdminService.resetPassword(userId, newPassword);
            setShowSuccess(true);
            toast.success("Senha alterada com sucesso!");
        } catch (err: any) {
            toast.error(err.message || "Erro ao resetar senha.");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(newPassword);
        toast.success("Senha copiada!");
    };

    const handleClose = () => {
        setNewPassword("");
        setShowSuccess(false);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="bg-[#0A0A0B] border-white/10 text-white max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 font-display font-black italic uppercase text-xl tracking-tight">
                        <Key className="text-primary" size={24} />
                        RESETAR SENHA
                    </DialogTitle>
                    <DialogDescription className="text-white/40 text-xs font-bold uppercase italic tracking-wide">
                        Usuário: {userName}
                    </DialogDescription>
                </DialogHeader>

                {!showSuccess ? (
                    <form onSubmit={handleSubmit} className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Nova Senha</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="NOVA SENHA"
                                    required
                                    minLength={6}
                                    className="bg-white/5 border-white/10 rounded-none h-12 font-display font-bold italic uppercase text-xs tracking-widest flex-1"
                                />
                                <Button type="button" variant="outline" onClick={generatePassword} className="rounded-none border-white/10 h-12">
                                    GERAR
                                </Button>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={handleClose} className="rounded-none">
                                CANCELAR
                            </Button>
                            <Button type="submit" disabled={loading} className="btn-athletic rounded-none">
                                {loading ? <Loader2 className="animate-spin" size={18} /> : "RESETAR SENHA"}
                            </Button>
                        </DialogFooter>
                    </form>
                ) : (
                    <div className="space-y-6 py-4">
                        <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 space-y-4">
                            <p className="text-emerald-400 font-display font-black italic uppercase text-sm">SENHA ALTERADA COM SUCESSO!</p>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 p-4 bg-black/40 border border-white/10">
                                    <span className="font-mono text-lg text-white">{newPassword}</span>
                                </div>
                                <Button type="button" variant="outline" onClick={copyToClipboard} className="rounded-none border-white/10 h-14">
                                    <Copy size={18} />
                                </Button>
                            </div>
                            <p className="text-[10px] text-white/40 italic">Envie esta senha para o usuário de forma segura.</p>
                        </div>

                        <DialogFooter>
                            <Button type="button" onClick={handleClose} className="btn-athletic rounded-none w-full">
                                FECHAR
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
