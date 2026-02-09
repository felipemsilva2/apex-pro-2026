import { useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { Button } from "@/components/ui/button";
import { Download, Instagram, Share2, Palette, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

const MarketingAssetsPage = () => {
    const { tenant } = useTenant();
    const [generating, setGenerating] = useState<string | null>(null);

    const handleDownload = (type: string) => {
        setGenerating(type);
        setTimeout(() => {
            setGenerating(null);
            toast.success(`Asset "${type}" gerado com sucesso!`, {
                description: "O download começará em instantes."
            });
        }, 1500);
    };

    const templates = [
        { id: 'story-welcome', title: 'Boas-vindas (Story)', aspect: '9/16' },
        { id: 'post-result', title: 'Resultado Aluno (Post)', aspect: '1/1' },
        { id: 'post-service', title: 'Nossos Serviços (Post)', aspect: '1/1' },
    ];

    return (
        <div className="p-8 space-y-12 pb-24">
            <header className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-1 h-12 bg-primary" />
                    <div>
                        <h1 className="font-display font-black italic uppercase text-5xl tracking-tighter leading-none">
                            MARKETING <span className="text-primary text-glow-primary">AUTO</span>
                        </h1>
                        <p className="text-xs text-white/40 font-bold uppercase tracking-[0.3em] font-display">
                            ASSETS BRANQUEADOS AUTOMATICAMENTE
                        </p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {templates.map((template) => (
                    <div key={template.id} className="bg-white/5 border border-white/10 p-6 space-y-6 group hover:border-primary/50 transition-all">
                        <div className="flex justify-between items-start">
                            <h3 className="font-display font-black italic uppercase text-sm tracking-tight">{template.title}</h3>
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                <Instagram size={14} className="text-white/40" />
                            </div>
                        </div>

                        <div
                            className="relative overflow-hidden border border-white/5"
                            style={{ aspectRatio: template.aspect === '9/16' ? '9/16' : '1/1' }}
                        >
                            {/* Mock Template Preview */}
                            <div
                                className="absolute inset-0 flex flex-col items-center justify-between p-8"
                                style={{ backgroundColor: tenant?.secondary_color || '#09090b' }}
                            >
                                <div className="w-32 h-1 bg-primary/20 rounded-full" />

                                {tenant?.logo_url ? (
                                    <img src={tenant.logo_url} className="w-24 object-contain brightness-200" alt="Logo" />
                                ) : (
                                    <div className="w-24 h-24 border border-dashed border-white/10 flex items-center justify-center">
                                        <ImageIcon className="text-white/10" />
                                    </div>
                                )}

                                <div className="space-y-4 w-full text-center">
                                    <div className="h-4 bg-primary/30 w-3/4 mx-auto" />
                                    <div className="h-4 bg-primary/10 w-1/2 mx-auto" />
                                </div>

                                <div
                                    className="w-full h-12 flex items-center justify-center font-display font-black italic text-sm tracking-tighter uppercase"
                                    style={{ backgroundColor: tenant?.primary_color || '#d4ff00', color: '#000' }}
                                >
                                    COMECE AGORA
                                </div>
                            </div>

                            {/* Overlay on Hover */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                                <Button
                                    onClick={() => handleDownload(template.title)}
                                    disabled={generating !== null}
                                    className="btn-athletic gap-2 font-black italic uppercase text-xs"
                                >
                                    {generating === template.title ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />}
                                    BAIXAR ASSET
                                </Button>
                                <Button variant="outline" className="rounded-none border-white/20 text-white/60 font-black italic uppercase text-xs hover:bg-white/10 gap-2">
                                    <Share2 size={14} /> COMPARTILHAR
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-2">
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
                                <div className="w-3 h-3 rounded-sm border border-white/10" style={{ backgroundColor: tenant?.primary_color }} />
                                PRIMÁRIA
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
                                <div className="w-3 h-3 rounded-sm border border-white/10" style={{ backgroundColor: tenant?.secondary_color }} />
                                SECUNDÁRIA
                            </div>
                        </div>
                    </div>
                ))}

                {/* Custom Template Placeholder */}
                <div className="bg-white/5 border border-dashed border-white/10 p-6 flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
                    <div className="w-16 h-16 border border-dashed border-white/10 flex items-center justify-center">
                        <Palette size={24} className="text-white/10" />
                    </div>
                    <div>
                        <h3 className="font-display font-black italic uppercase text-sm tracking-tight text-white/20">NOVO TEMPLATE</h3>
                        <p className="text-[10px] uppercase tracking-widest text-white/10 mt-2">SOLICITE UM DESIGN EXCLUSIVO</p>
                    </div>
                    <Button variant="outline" className="rounded-none border-white/5 text-white/10 font-black italic uppercase text-[10px] tracking-widest pointer-events-none">
                        EM BREVE
                    </Button>
                </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 p-8 flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="font-display font-black italic uppercase text-lg">KIT DE <span className="text-primary text-glow-primary">LANÇAMENTO</span></h3>
                    <p className="text-[10px] uppercase tracking-widest text-white/40">GENERE TODOS OS ASSETS PARA SEU INSTAGRAM EM UM CLIQUE</p>
                </div>
                <Button className="btn-athletic h-14 px-12 font-black italic uppercase tracking-widest">
                    GERAR KIT COMPLETO (.ZIP)
                </Button>
            </div>
        </div>
    );
};

export default MarketingAssetsPage;
