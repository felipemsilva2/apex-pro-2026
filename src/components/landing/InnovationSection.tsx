import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Zap, Rocket, Globe, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SuggestionDialog from '@/components/dashboard/SuggestionDialog';

const InnovationSection = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const cards = [
        {
            icon: <Lightbulb className="w-6 h-6 text-primary" />,
            title: "IDEIA NOVA?",
            description: "Pensou em algo para melhorar sua assessoria ou a experiência do seu aluno? Nós queremos ouvir."
        },
        {
            icon: <Globe className="w-6 h-6 text-primary" />,
            title: "APP ESTRANGEIRO?",
            description: "Viu uma funcionalidade incrível lá fora e gostaria de ter aqui? Nós trazemos para você."
        },
        {
            icon: <Rocket className="w-6 h-6 text-primary" />,
            title: "AGILIDADE APEX",
            description: "Dependendo da complexidade, entregamos o que você precisa em até 60 dias úteis."
        }
    ];

    return (
        <section className="py-24 lg:py-32 bg-[#0A0A0B] relative overflow-hidden border-y border-white/5">
            {/* Decorative Glows */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <SuggestionDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />

                <div className="max-w-4xl mx-auto flex flex-col items-center text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-2 mb-6"
                    >
                        <div className="h-[2px] w-8 bg-primary" />
                        <span className="text-primary font-display font-black italic uppercase tracking-[0.3em] text-[10px]">Co-Criação</span>
                        <div className="h-[2px] w-8 bg-primary" />
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl lg:text-7xl font-display font-black italic uppercase italic leading-none tracking-tighter mb-8"
                    >
                        A VOZ DO <span className="text-primary">TREINADOR</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-white/60 text-lg lg:text-xl font-medium max-w-2xl leading-relaxed"
                    >
                        Diferente das grandes plataformas engessadas, o Apex Pro evolui com você.
                        Sugeriu, foi aprovado? <span className="text-white font-bold italic">Nós construímos.</span>
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {cards.map((card, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 * idx }}
                            className="p-8 bg-zinc-900/40 border border-white/5 backdrop-blur-sm relative group hover:border-primary/30 transition-all duration-500 hover:-translate-y-2"
                            style={{
                                clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)'
                            }}
                        >
                            <div className="mb-6 p-3 bg-primary/10 w-fit -skew-x-12 border border-primary/20">
                                {card.icon}
                            </div>
                            <h3 className="text-xl font-display font-black italic uppercase tracking-tight text-white mb-4 group-hover:text-primary transition-colors">
                                {card.title}
                            </h3>
                            <p className="text-white/50 text-sm leading-relaxed font-medium">
                                {card.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="flex justify-center"
                >
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-primary blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                        <button
                            onClick={() => setIsDialogOpen(true)}
                            className="relative px-12 py-6 bg-primary text-black font-display font-black italic uppercase tracking-widest text-sm -skew-x-12 hover:scale-105 transition-transform active:scale-95 shadow-[8px_8px_0px_#000]"
                        >
                            Sugerir Funcionalidade
                        </button>
                    </div>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 0.3 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    className="text-center mt-12 text-[10px] font-bold text-white uppercase tracking-[0.4em] italic"
                >
                    * Viabilidade técnica e prazo de entrega sujeitos a análise da equipe de engenharia.
                </motion.p>
            </div>
        </section>
    );
};

export default InnovationSection;
