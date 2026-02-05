import { Mail, Phone, MessageSquare, MapPin, ArrowRight, Zap, Globe, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const ContactPage = () => {
    const whatsappNumber = "556196032164";
    const whatsappMessage = encodeURIComponent("Olá, gostaria de saber mais sobre o Apex Pro");
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

    const contactMethods = [
        {
            icon: MessageSquare,
            title: "WHATSAPP DIRETO",
            value: "61 9603-2164",
            description: "Suporte imediato via linha criptografada.",
            actionLabel: "INICIAR CONVERSA",
            href: whatsappLink,
            primary: true,
        },
        {
            icon: Mail,
            title: "E-MAIL OFICIAL",
            value: "ola@apexpro.fit",
            description: "Para parcerias e questões administrativas.",
            actionLabel: "ENVIAR E-MAIL",
            href: "mailto:ola@apexpro.fit",
        },
        {
            icon: Shield,
            title: "CENTRAL DE PRIVACIDADE",
            value: "privacy@apexpro.fit",
            description: "Solicitações sobre seus dados e LGPD.",
            actionLabel: "REQUISITAR DADOS",
            href: "mailto:ola@apexpro.fit",
        },
    ];

    return (
        <div className="min-h-screen bg-black">
            <Header />

            <main className="pt-32 pb-24">
                <div className="section-container">
                    <div className="text-center mb-20 animate-fade-in">
                        <div className="flex items-center justify-center gap-4 mb-8">
                            <span className="h-px w-8 bg-primary"></span>
                            <span className="font-display font-black italic uppercase text-[10px] tracking-[0.4em] text-primary">
                                CANAL DE COMANDO
                            </span>
                            <span className="h-px w-8 bg-primary"></span>
                        </div>
                        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black mb-8 italic leading-[0.95] tracking-tighter uppercase">
                            ENTRE EM <br />
                            <span className="text-primary text-blur-sm">CONTATO AGORA</span>
                        </h1>
                        <p className="font-display font-bold uppercase italic text-sm tracking-[0.15em] text-white/40 max-w-2xl mx-auto border-y border-white/5 py-8">
                            Dúvidas técnicas, suporte ou parcerias. Nossa equipe de elite está pronta para responder.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {contactMethods.map((method, index) => (
                            <div
                                key={index}
                                className="athletic-card group p-8 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500 animate-fade-in"
                                style={{ animationDelay: `${index * 0.15}s` }}
                            >
                                <div className="kinetic-border" />
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className={`w-14 h-14 ${method.primary ? 'bg-primary' : 'bg-primary/10'} border border-primary/20 -skew-x-12 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                                        <method.icon className={method.primary ? 'text-black' : 'text-primary'} size={28} />
                                    </div>

                                    <h3 className="font-display font-black text-xl text-white italic uppercase mb-2 tracking-tighter">
                                        {method.title}
                                    </h3>
                                    <p className="font-display font-black text-2xl text-primary italic uppercase mb-4 tracking-tighter">
                                        {method.value}
                                    </p>
                                    <p className="font-display font-bold uppercase italic text-[11px] leading-relaxed tracking-widest text-white/40 mb-8 border-l-2 border-white/10 pl-4">
                                        {method.description}
                                    </p>

                                    <div className="mt-auto">
                                        <a
                                            href={method.href}
                                            target={method.href.startsWith('http') ? '_blank' : undefined}
                                            rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                            className={`block w-full text-center py-4 font-display font-black italic uppercase text-[11px] tracking-widest transition-all ${method.primary
                                                    ? 'bg-primary text-black hover:scale-105 shadow-[0_10px_30px_rgba(212,255,0,0.2)]'
                                                    : 'bg-white/5 text-white hover:bg-white/10'
                                                }`}
                                            style={{ clipPath: 'polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)' }}
                                        >
                                            {method.actionLabel}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Map/Location Section */}
                    <div className="mt-24 athletic-card p-1 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 overflow-hidden">
                        <div className="bg-[#050505] p-12 lg:p-20 text-center relative overflow-hidden">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03]">
                                <Globe className="w-[400px] h-[400px] text-white" />
                            </div>
                            <div className="relative z-10">
                                <h2 className="text-3xl font-display font-black italic uppercase text-white mb-6">OPERAÇÃO GLOBAL</h2>
                                <p className="font-display font-bold uppercase italic text-sm tracking-widest text-white/40 max-w-xl mx-auto mb-10">
                                    Sediados em Brasília, atendendo coaches e personal trainers em todo o território nacional.
                                </p>
                                <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/5 border border-white/10 -skew-x-12">
                                    <MapPin className="text-primary" size={18} />
                                    <span className="font-display font-black italic uppercase text-xs text-white tracking-widest">Brasília, DF - Setor de Clubes Norte</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ContactPage;
