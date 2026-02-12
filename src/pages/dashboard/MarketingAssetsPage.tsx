import { useState } from "react";
import { Rocket, Sparkles, Palette, Instagram, Download, Wand2, CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const features = [
    {
        icon: Palette,
        title: "Templates Personalizados",
        description: "Crie posts e stories com a identidade visual da sua marca automaticamente."
    },
    {
        icon: Instagram,
        title: "Otimizado para Instagram",
        description: "Assets nos tamanhos corretos para Feed, Stories e Reels — prontos para publicar."
    },
    {
        icon: Download,
        title: "Download em 1 Clique",
        description: "Gere e baixe kits completos de marketing em segundos, sem precisar de designer."
    },
    {
        icon: Wand2,
        title: "Geração com IA",
        description: "Textos e layouts sugeridos automaticamente com base no perfil dos seus alunos."
    }
];

const MarketingAssetsPage = () => {
    const { profile } = useAuth();
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [comment, setComment] = useState("");

    const surveyOptions = [
        { id: "super_util", label: "Super útil! Preciso disso", emoji: "🔥" },
        { id: "interessante", label: "Interessante, usaria às vezes", emoji: "👍" },
        { id: "talvez", label: "Talvez, depende de como funciona", emoji: "🤔" },
        { id: "nao_preciso", label: "Não preciso disso agora", emoji: "😐" },
    ];

    const handleSubmit = async () => {
        if (!selectedOption || !profile) return;

        setSubmitting(true);
        try {
            const selected = surveyOptions.find(o => o.id === selectedOption);
            const { error } = await supabase.from('feature_surveys').insert({
                tenant_id: profile.tenant_id,
                user_id: profile.id,
                feature_name: 'marketing_auto',
                response: `${selected?.emoji} ${selected?.label}`,
                comment: comment.trim() || null,
            });

            if (error) throw error;

            setSubmitted(true);
            toast.success("Feedback enviado com sucesso!", {
                description: "Obrigado por ajudar a construir o Apex Pro."
            });
        } catch (err: any) {
            console.error('Survey error:', err);
            toast.error("Erro ao enviar feedback. Tente novamente.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-8 space-y-12 pb-24 animate-fade-in">
            {/* Header */}
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

            {/* Coming Soon Hero */}
            <div className="relative overflow-hidden border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/3 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4" />

                <div className="relative z-10 p-12 md:p-16 text-center space-y-8">
                    <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-5 py-2 -skew-x-12">
                        <Rocket size={14} className="text-primary skew-x-12" />
                        <span className="font-display font-black italic uppercase text-[10px] tracking-[0.3em] text-primary skew-x-12">
                            EM DESENVOLVIMENTO
                        </span>
                    </div>

                    <div className="space-y-4 max-w-2xl mx-auto">
                        <h2 className="font-display font-black italic uppercase text-3xl md:text-4xl tracking-tighter leading-tight">
                            CRIE CONTEÚDO <span className="text-primary">PROFISSIONAL</span>
                            <br />SEM SER DESIGNER
                        </h2>
                        <p className="text-sm text-white/50 leading-relaxed max-w-lg mx-auto">
                            Estamos desenvolvendo uma ferramenta que gera automaticamente posts, stories e materiais
                            de marketing usando a identidade visual da sua marca. Tudo pronto para publicar no Instagram
                            em segundos — sem Canva, sem designer.
                        </p>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {features.map((feature, i) => (
                    <div
                        key={feature.title}
                        className="group border border-white/5 bg-white/[0.02] p-6 space-y-4 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
                        style={{ animationDelay: `${i * 0.1}s` }}
                    >
                        <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center -skew-x-12 group-hover:bg-primary group-hover:text-black transition-all">
                            <feature.icon size={18} className="skew-x-12" />
                        </div>
                        <h3 className="font-display font-black italic uppercase text-xs tracking-tight">{feature.title}</h3>
                        <p className="text-[11px] text-white/40 leading-relaxed">{feature.description}</p>
                    </div>
                ))}
            </div>

            {/* Survey Section */}
            <div className="border border-primary/20 bg-primary/[0.03] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-full bg-primary/5 -skew-x-[30deg] translate-x-16" />

                <div className="relative z-10 p-8 md:p-12">
                    {!submitted ? (
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <Sparkles className="text-primary" size={24} />
                                <div>
                                    <h3 className="font-display font-black italic uppercase text-xl tracking-tighter">
                                        O QUE VOCÊ <span className="text-primary">ACHA?</span>
                                    </h3>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mt-1">
                                        SUA OPINIÃO DEFINE O QUE CONSTRUÍMOS PRIMEIRO
                                    </p>
                                </div>
                            </div>

                            <p className="text-sm text-white/50 max-w-xl">
                                Essa ferramenta faz sentido para você? Queremos entender se o Marketing Auto seria
                                útil no seu dia a dia como coach. Sua resposta nos ajuda a priorizar.
                            </p>

                            {/* Options */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {surveyOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => setSelectedOption(option.id)}
                                        className={cn(
                                            "flex items-center gap-4 p-4 border text-left transition-all duration-200 group/opt",
                                            selectedOption === option.id
                                                ? "border-primary bg-primary/10 -skew-x-3"
                                                : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/5"
                                        )}
                                    >
                                        <span className="text-2xl">{option.emoji}</span>
                                        <span className={cn(
                                            "font-display font-bold italic uppercase text-xs tracking-tight transition-colors",
                                            selectedOption === option.id ? "text-primary" : "text-white/60"
                                        )}>
                                            {option.label}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Optional comment */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                                    COMENTÁRIO (OPCIONAL)
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Tem alguma ideia ou sugestão? Compartilhe aqui..."
                                    className="w-full bg-black/40 border border-white/10 p-4 text-sm font-medium text-white/80 placeholder:text-white/15 resize-none h-20 focus:border-primary/40 focus:outline-none transition-colors"
                                />
                            </div>

                            {/* Submit */}
                            <button
                                onClick={handleSubmit}
                                disabled={!selectedOption || submitting}
                                className={cn(
                                    "flex items-center gap-3 px-8 py-4 font-display font-black italic uppercase text-xs tracking-widest transition-all -skew-x-12",
                                    selectedOption && !submitting
                                        ? "bg-primary text-black hover:bg-white cursor-pointer shadow-[0_10px_30px_rgba(212,255,0,0.2)]"
                                        : "bg-white/5 text-white/20 cursor-not-allowed"
                                )}
                            >
                                <span className="skew-x-12 flex items-center gap-2">
                                    {submitting ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" />
                                            ENVIANDO...
                                        </>
                                    ) : (
                                        <>
                                            ENVIAR RESPOSTA
                                            <ArrowRight size={14} />
                                        </>
                                    )}
                                </span>
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-12 space-y-6">
                            <div className="w-16 h-16 bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto -skew-x-12">
                                <CheckCircle size={32} className="text-primary skew-x-12" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-display font-black italic uppercase text-2xl tracking-tighter">
                                    VALEU, <span className="text-primary">COACH!</span>
                                </h3>
                                <p className="text-sm text-white/50 max-w-md mx-auto">
                                    Sua opinião foi registrada. Vamos usar esse feedback para construir
                                    a melhor ferramenta de marketing para personal trainers.
                                </p>
                            </div>
                            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                                <Rocket size={12} />
                                PREVISÃO: EM BREVE
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MarketingAssetsPage;
