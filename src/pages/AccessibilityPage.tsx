import { Accessibility, Eye, Hand, Shield, ArrowRight, CheckCircle2 } from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const AccessibilityPage = () => {
    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const features = [
        {
            title: "VISIBILIDADE TÁTICA",
            icon: Eye,
            description: "Interface nativamente em Modo Escuro de alto contraste, otimizada para reduzir a fadiga ocular e garantir legibilidade extrema em qualquer ambiente.",
            items: ["Contraste 4.5:1 (WCAG AA)", "Suporte a Dynamic Type (iOS)", "Redução de brilho e luz azul"]
        },
        {
            title: "NAVEGAÇÃO FLUIDA",
            icon: Hand,
            description: "Componentes desenhados com áreas de toque ampliadas (mínimo 44px) e fluxo de foco lógico para quem utiliza dispositivos de assistência.",
            items: ["Áreas de toque 44x44px", "Navegação por teclado", "Feedback tátil em ações"]
        },
        {
            title: "TECNOLOGIA ASSISTIVA",
            icon: Accessibility,
            description: "Totalmente compatível com leitores de tela modernos, garantindo que cada métrica de performance seja ouvida com clareza.",
            items: ["Suporte a VoiceOver (iOS)", "Suporte a TalkBack (Android)", "Rótulos ARIA e semantic HTML"]
        }
    ];

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-primary selection:text-black">
            <Header />

            <main className="pt-32 pb-24 overflow-hidden relative">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />

                <div className="section-container relative z-10">
                    {/* Hero Section */}
                    <div className="max-w-4xl mb-24">
                        <div className="flex items-center gap-3 mb-6 animate-fade-in">
                            <div className="w-12 h-1 bg-primary" />
                            <span className="font-display font-black text-primary italic uppercase tracking-[0.4em] text-[10px]">
                                MANIFESTO DE INCLUSÃO
                            </span>
                        </div>

                        <h1 className="font-display font-black text-6xl md:text-8xl italic uppercase tracking-tighter leading-none mb-8 animate-slide-up">
                            ACESSI<span className="text-primary text-blur-sm">BILIDADE</span> <br />
                            SEM LIMITES
                        </h1>

                        <p className="text-xl md:text-2xl text-white/60 font-medium max-w-2xl leading-relaxed mb-12 animate-fade-in delay-200">
                            Acreditamos que a alta performance é um direito universal. O ecossistema Apex Pro foi construído para ser a infraestrutura mais acessível e poderosa do mercado fitness.
                        </p>

                        <button className="btn-primary group -skew-x-12 px-10 py-5 flex items-center gap-3 hover:scale-105 transition-transform animate-fade-in delay-300">
                            <span className="font-display font-black italic uppercase tracking-wider text-black">SAIBA MAIS</span>
                            <ArrowRight size={20} className="text-black group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* Feature Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
                        {features.map((feature, idx) => (
                            <div
                                key={idx}
                                className="group relative bg-[#0A0A0B] border border-white/5 p-10 hover:border-primary/30 transition-all animate-fade-in"
                                style={{ transitionDelay: `${idx * 150}ms` }}
                            >
                                <div className="absolute top-0 right-0 w-16 h-16 border-t font-black border-r border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="w-14 h-14 bg-white/5 -skew-x-12 flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-black transition-colors">
                                    <feature.icon size={28} />
                                </div>

                                <h3 className="font-display font-black text-xl italic uppercase tracking-tighter mb-4">
                                    {feature.title}
                                </h3>

                                <p className="text-white/40 text-sm leading-relaxed mb-8">
                                    {feature.description}
                                </p>

                                <ul className="space-y-3">
                                    {feature.items.map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-white/60">
                                            <CheckCircle2 size={12} className="text-primary" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Mission Control Section */}
                    <div className="relative border border-white/5 p-12 md:p-20 overflow-hidden group">
                        <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />

                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div>
                                <Shield className="text-primary mb-8" size={48} />
                                <h2 className="font-display font-black text-4xl italic uppercase tracking-tighter mb-6">
                                    CONFORMIDADE <br /> DE ELITE
                                </h2>
                                <p className="text-white/60 leading-relaxed mb-8">
                                    Seguimos os padrões WCAG 2.1 e as diretrizes de interface humana da Apple e do Google para garantir que nossa tecnologia seja robusta, compreensível e operável por qualquer pessoa.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <div className="px-4 py-2 bg-white/5 border border-white/10 text-[9px] font-black tracking-widest uppercase">WCAG 2.1 COMPLIANT</div>
                                    <div className="px-4 py-2 bg-white/5 border border-white/10 text-[9px] font-black tracking-widest uppercase">SECTION 508 READY</div>
                                    <div className="px-4 py-2 bg-white/5 border border-white/10 text-[9px] font-black tracking-widest uppercase">ADA ACCESSIBLE</div>
                                </div>
                            </div>

                            <div className="bg-[#0D0D0E] border border-white/10 p-8 transform rotate-1 hover:rotate-0 transition-transform">
                                <h4 className="font-display font-black text-primary italic uppercase tracking-[0.2em] text-[10px] mb-4">FEEDBACK DIGITAL</h4>
                                <p className="text-sm text-white/40 mb-6">
                                    Encontrou alguma barreira técnica ou tem uma sugestão de melhoria? Nossa linha de suporte dedicada à acessibilidade está sempre aberta.
                                </p>
                                <a
                                    href="mailto:acessibilidade@apexpro.fit"
                                    className="inline-flex items-center gap-2 text-white hover:text-primary font-bold text-xs uppercase tracking-[3px] transition-colors"
                                >
                                    ABRIR CHAMADO TÁTICO <ArrowRight size={14} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AccessibilityPage;
