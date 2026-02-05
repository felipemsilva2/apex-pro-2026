import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, Loader2, Copy, CheckCircle, MessageCircle, UserPlus } from "lucide-react";
import { TenantService } from "@/api/services/tenantService";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { toast } from "sonner";

export function InviteCoachDialog() {
    const { profile } = useAuth();
    const { tenant } = useTenant();
    const [email, setEmail] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [open, setOpen] = useState(false);
    const [inviteLink, setInviteLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile?.tenant_id) return;

        setIsSending(true);
        try {
            const service = new TenantService(profile.tenant_id);
            const invitation = await service.inviteUser({
                email,
                tenant_id: profile.tenant_id,
                role: 'coach'
            });

            // Generate the invite link
            const baseUrl = window.location.origin;
            const link = `${baseUrl}/invite/${invitation.token}`;
            setInviteLink(link);

            toast.success("Convite de Staff criado!", {
                description: "Copie o link e envie para o novo técnico"
            });
        } catch (error: any) {
            toast.error("Erro ao criar convite", {
                description: error.message || "Tente novamente mais tarde."
            });
        } finally {
            setIsSending(false);
        }
    };

    const handleCopyLink = async () => {
        if (!inviteLink) return;

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(inviteLink);
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = inviteLink;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }
            setCopied(true);
            toast.success("Link copiado!");
            setTimeout(() => setCopied(false), 3000);
        } catch {
            window.prompt("Copie o link manualmente:", inviteLink);
        }
    };

    const handleWhatsApp = () => {
        if (!inviteLink) return;

        const coachName = profile?.full_name?.split(" ")[0] || "Admin";
        const businessName = tenant?.business_name || "ApexPro";
        const message = encodeURIComponent(
            `🛡️ *CONVITE STAFF - ${businessName}*\n\n` +
            `Olá! ${coachName} está te convidando para integrar a equipe técnica.\n\n` +
            `Acesse este link para configurar seu acesso administrativo:\n${inviteLink}\n\n` +
            `Bem-vindo ao time!`
        );

        window.open(`https://wa.me/?text=${message}`, '_blank');
    };

    const handleClose = () => {
        setOpen(false);
        setTimeout(() => {
            setEmail("");
            setInviteLink(null);
            setCopied(false);
        }, 300);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="btn-athletic h-12 text-[10px] gap-2 uppercase tracking-widest font-black italic">
                    <UserPlus size={16} /> CONVIDAR TÉCNICO
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0A0A0B] border-white/10 text-white rounded-none sm:max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-4">
                    <DialogTitle className="font-display font-black italic uppercase text-xl tracking-tight flex flex-col leading-none">
                        <span className="text-white/40 text-[9px] tracking-[0.3em] mb-2 not-italic font-bold uppercase">GESTÃO DE EQUIPE</span>
                        <span className="flex items-center gap-2">
                            NOVO <span className="text-primary">MEMBRO</span>
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {!inviteLink ? (
                        <form onSubmit={handleInvite} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-white/40">Email do Técnico</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="coach@exemplo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-white/5 border-white/10 h-12 rounded-none"
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={isSending}
                                className="w-full btn-athletic h-12 text-xs uppercase tracking-widest font-black italic items-center justify-center gap-2 rounded-none"
                            >
                                {isSending ? <Loader2 className="animate-spin" /> : <Send size={16} />}
                                {isSending ? "GERANDO ACESSO..." : "GERAR CONVITE"}
                            </Button>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            {/* Success Header */}
                            <div className="p-6 bg-primary/10 border border-primary/20 flex flex-col items-center gap-3 text-center">
                                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                                    <CheckCircle className="text-black" size={24} />
                                </div>
                                <div>
                                    <h4 className="font-display font-black italic uppercase text-xl text-white">CONVITE GERADO</h4>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary mt-1">ENVIE O LINK ABAIXO</p>
                                </div>
                            </div>

                            {/* Link Section */}
                            <div className="space-y-3">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Link de Acesso Único</Label>
                                <div className="bg-white/5 border border-white/10 p-4 rounded-sm">
                                    <p className="font-mono text-xs text-white/80 break-all leading-relaxed">
                                        {inviteLink}
                                    </p>
                                </div>
                                <Button
                                    onClick={handleCopyLink}
                                    variant="outline"
                                    className={`w-full h-12 rounded-none border-white/10 font-bold uppercase text-xs tracking-widest gap-2 ${copied ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-white/5 hover:bg-white/10"}`}
                                >
                                    {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                                    {copied ? "LINK COPIADO!" : "COPIAR LINK"}
                                </Button>
                            </div>

                            {/* WhatsApp Button */}
                            <Button
                                onClick={handleWhatsApp}
                                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-display font-black italic uppercase text-xs tracking-widest h-12 gap-2 rounded-none"
                            >
                                <MessageCircle size={18} /> ENVIAR NO WHATSAPP
                            </Button>

                            {/* Close Button */}
                            <Button
                                variant="ghost"
                                onClick={handleClose}
                                className="w-full text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white rounded-none"
                            >
                                FECHAR
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
