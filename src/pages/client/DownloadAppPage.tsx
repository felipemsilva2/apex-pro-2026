import { useNavigate } from "react-router-dom";
import { Smartphone, Apple, PlayCircle, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function DownloadAppPage() {
    const { signOut, profile } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate("/login");
        toast.success("Desconectado com sucesso.");
    };

    return (
        <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center p-6 relative overflow-hidden text-white">
            {/* HUD Decorations */}
            <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-blue-600/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="max-w-[480px] w-full relative z-10 text-center">
                {/* Logo Section */}
                <div className="inline-flex items-center gap-3 group mb-12">
                    <div className="w-14 h-14 bg-primary flex items-center justify-center -skew-x-12">
                        <span className="text-black font-display font-black text-3xl italic leading-none">A</span>
                    </div>
                    <div className="text-left">
                        <span className="font-display font-black text-3xl text-white italic uppercase tracking-tighter block leading-none">
                            APEX<span className="text-primary text-blur-sm">PRO</span>
                        </span>
                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.3em] italic">Athlete Portal</span>
                    </div>
                </div>

                {/* Identity Card */}
                <div className="athletic-card p-6 bg-white/[0.02] border-primary/20 mb-10 -skew-x-2">
                    <div className="flex items-center gap-4 text-left">
                        <div className="w-12 h-12 rounded-none bg-primary/10 border border-primary/30 flex items-center justify-center">
                            <Smartphone className="text-primary" size={24} />
                        </div>
                        <div>
                            <h2 className="font-display font-black italic uppercase text-lg leading-none tracking-tight">
                                OLÁ, <span className="text-primary">{profile?.full_name?.split(' ')[0] || 'ATLETA'}</span>
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                                <ShieldCheck size={12} className="text-primary/50" />
                                <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest italic">Acesso Autorizado</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Instruction */}
                <div className="space-y-6 mb-12">
                    <h1 className="text-4xl font-display font-black italic uppercase leading-none tracking-tighter">
                        O COMANDO AGORA É <br />
                        <span className="text-primary">NO SEU BOLSO</span>
                    </h1>
                    <p className="text-sm text-white/40 leading-relaxed font-medium uppercase italic tracking-wide">
                        Para acessar seus treinos, dieta e falar com seu treinador,
                        utilize nosso aplicativo oficial nativo.
                    </p>
                </div>

                {/* Download Buttons */}
                <div className="grid gap-4 mb-12">
                    <Button
                        onClick={() => window.open('https://apps.apple.com', '_blank')}
                        className="h-16 bg-white hover:bg-white/90 text-black rounded-none flex items-center justify-center gap-4 transition-all group overflow-hidden"
                    >
                        <Apple size={28} />
                        <div className="text-left">
                            <p className="text-[10px] uppercase font-bold leading-none mb-1">Download on the</p>
                            <p className="text-xl font-display font-black italic uppercase leading-none tracking-tight">App Store</p>
                        </div>
                    </Button>

                    <Button
                        onClick={() => window.open('https://play.google.com', '_blank')}
                        className="h-16 bg-[#0A0A0B] hover:bg-white/5 text-white border-2 border-white/10 rounded-none flex items-center justify-center gap-4 transition-all group overflow-hidden"
                    >
                        <PlayCircle size={28} className="text-primary" />
                        <div className="text-left">
                            <p className="text-[10px] uppercase font-bold leading-none mb-1">Get it on</p>
                            <p className="text-xl font-display font-black italic uppercase leading-none tracking-tight">Google Play</p>
                        </div>
                    </Button>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-8 border-t border-white/5">
                    <button
                        onClick={() => window.location.href = '/'}
                        className="text-[10px] font-bold text-white/30 hover:text-white uppercase tracking-widest italic transition-colors"
                    >
                        Voltar para Home
                    </button>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-[10px] font-bold text-destructive/60 hover:text-destructive uppercase tracking-widest italic transition-colors group"
                    >
                        <span>Desconectar</span>
                        <LogOut size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Bottom HUD bar */}
                <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[200%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent rotate-12" />
            </div>
        </div>
    );
}
