import { useNavigate } from "react-router-dom";
import { ShieldAlert, CreditCard, MessageCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const BlockedPage = () => {
    const { signOut } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center p-4 overflow-hidden relative">
            {/* Kinetic Background */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/30 blur-[150px] rounded-full animate-pulse" />
                <div className="scanline" />
            </div>

            <div className="max-w-md w-full relative z-10 text-center space-y-8 animate-in zoom-in duration-500">
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-red-500 blur-xl opacity-20 animate-pulse" />
                    <div className="w-24 h-24 rounded-full border-2 border-red-500/50 flex items-center justify-center bg-black/60 backdrop-blur-xl relative">
                        <ShieldAlert size={48} className="text-red-500 neon-glow-red" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="font-display font-black italic text-4xl lg:text-5xl uppercase tracking-tighter leading-none">
                        SISTEMA <br />
                        <span className="text-red-500">BLOQUEADO</span>
                    </h1>
                    <p className="text-zinc-400 font-bold uppercase tracking-[0.2em] text-[10px] max-w-xs mx-auto leading-relaxed">
                        Sua licença Apex Pro encontra-se suspensa por pendências financeiras.
                    </p>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-8 h-8 bg-red-500/10 -rotate-45 translate-x-4 -translate-y-4" />
                    <p className="text-white/60 text-[11px] font-medium uppercase tracking-widest leading-relaxed">
                        Para reativar sua conta e recuperar o acesso aos seus alunos e protocolos, regularize sua assinatura.
                    </p>

                    <Button
                        onClick={() => navigate('/dashboard/billing')}
                        className="w-full bg-red-600 hover:bg-red-500 text-white rounded-none h-14 font-display font-black italic uppercase tracking-widest text-xs border-0"
                    >
                        REGULARIZAR AGORA
                        <CreditCard size={18} className="ml-2" />
                    </Button>
                </div>

                <div className="flex flex-col gap-3">
                    <Button
                        variant="link"
                        onClick={() => window.open('https://wa.me/your-support-number', '_blank')}
                        className="text-white/40 hover:text-white uppercase tracking-widest text-[10px] font-bold"
                    >
                        <MessageCircle size={14} className="mr-2" />
                        Falar com Suporte
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={signOut}
                        className="text-white/20 hover:text-white uppercase tracking-widest text-[9px] font-bold"
                    >
                        <ArrowLeft size={12} className="mr-2" />
                        Sair da Conta
                    </Button>
                </div>

                <p className="text-[9px] font-bold text-white/10 uppercase tracking-[0.3em]">
                    APEX PRO ECOSYSTEM // LICENSING SYSTEM
                </p>
            </div>
        </div>
    );
};

export default BlockedPage;
