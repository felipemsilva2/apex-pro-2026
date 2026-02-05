import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { TenantService } from "@/api/services/tenantService";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InviteOnboarding() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [invitation, setInvitation] = useState<any>(null);

    useEffect(() => {
        async function validate() {
            if (!token) return;
            try {
                const data = await TenantService.validateToken(token);
                setInvitation(data);
            } catch (err: any) {
                setError(err.message || "Link inválido");
            } finally {
                setLoading(false);
            }
        }
        validate();
    }, [token]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
                <Loader2 className="animate-spin text-primary mb-4" size={48} />
                <h1 className="font-display font-black italic uppercase text-2xl">Validando seu convite...</h1>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6 text-center">
                <AlertCircle className="text-destructive mb-4" size={64} />
                <h1 className="font-display font-black italic uppercase text-3xl mb-2">LINK INVÁLIDO</h1>
                <p className="text-muted-foreground mb-8 max-w-md">{error}</p>
                <Button asChild variant="outline" className="rounded-none border-primary text-primary hover:bg-primary hover:text-black">
                    <Link to="/">VOLTAR PARA HOME</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
            <div className="max-w-md w-full athletic-card p-8 border-primary/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -skew-x-[30deg] translate-x-16 -translate-y-8" />

                <div className="relative z-10 text-center">
                    <CheckCircle2 className="text-primary mx-auto mb-6" size={64} />
                    <h1 className="font-display font-black italic uppercase text-4xl leading-none mb-2">
                        VOCÊ FOI <span className="text-primary">CONVIDADO!</span>
                    </h1>
                    <p className="font-display font-bold uppercase italic text-xs tracking-widest text-muted-foreground mb-8">
                        {invitation.tenants?.name} está te esperando
                    </p>

                    <div className="space-y-4">
                        <Button
                            onClick={() => navigate(`/signup?token=${token}&email=${invitation.email}`)}
                            className="w-full btn-athletic h-14 text-lg font-black italic uppercase"
                        >
                            CRIAR MINHA CONTA
                        </Button>
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
                            Convite enviado para: {invitation.email}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
