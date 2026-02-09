import { Card } from "@/components/ui/card";
import { ShieldAlert, Cog, Database, Globe } from "lucide-react";

const AdminSettings = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col gap-1">
                <h1 className="text-4xl font-display font-black italic uppercase text-white tracking-tighter">
                    CONFIGURAÇÕES DO <span className="text-primary text-blur-sm">SISTEMA</span>
                </h1>
                <p className="text-white/40 font-display font-bold uppercase italic text-[10px] tracking-[0.3em]">
                    Controle de infraestrutura e parâmetros globais
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-black/40 border-white/5 p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <Globe className="text-primary" size={24} />
                        <h2 className="text-lg font-display font-black uppercase italic tracking-tighter text-white">Domínio & Rede</h2>
                    </div>
                    <div className="space-y-6">
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">Domínio Principal</span>
                            <div className="p-4 bg-white/5 border border-white/5 font-display font-bold text-white italic">
                                apexpro.pro
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">Gateway de Autenticação</span>
                            <div className="p-4 bg-white/5 border border-white/5 font-display font-bold text-white italic text-xs">
                                auth.acesso.apexpro.fit
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="bg-black/40 border-white/5 p-8 border-red-500/10">
                    <div className="flex items-center gap-4 mb-8">
                        <ShieldAlert className="text-red-500" size={24} />
                        <h2 className="text-lg font-display font-black uppercase italic tracking-tighter text-white text-red-500">Protocolos de Segurança</h2>
                    </div>
                    <div className="space-y-4">
                        <p className="text-[11px] text-white/40 font-bold uppercase italic leading-loose">
                            Ajuste os níveis de restrição para novos cadastros e políticas de expiração de sessão global.
                        </p>
                        <div className="h-px bg-white/5 w-full my-4" />
                        <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 opacity-50 cursor-not-allowed">
                            <span className="text-[10px] font-black text-white italic uppercase tracking-widest">Modo Manutenção</span>
                            <div className="w-10 h-5 bg-white/10 rounded-full relative">
                                <div className="absolute left-1 top-1 w-3 h-3 bg-white/20 rounded-full" />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AdminSettings;
