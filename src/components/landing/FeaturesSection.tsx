import {
  Users,
  Utensils,
  Activity,
  Zap,
  Shield,
  Target
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "GESTÃO INTEGRADA",
    description: "Controle total da rotina dos seus alunos com inteligência e acompanhamento real.",
  },
  {
    icon: Activity,
    title: "PRESCRIÇÃO COMPLETA",
    description: "Crie protocolos de treino e planos alimentares dinâmicos em uma interface única.",
  },
  {
    icon: Utensils,
    title: "MÓDULO DE DIETA",
    description: "Biblioteca de alimentos e macros integrados para resultados consistentes.",
  },
  {
    icon: Zap,
    title: "PROTOCOLOS AVANÇADOS",
    description: "Gerencie protocolos hormonais e de suplementação com segurança e clareza.",
  },
  {
    icon: Shield,
    title: "COMUNICAÇÃO DIRETA",
    description: "Chat profissional integrado para feedbacks e suporte constante sem poluição.",
  },
  {
    icon: Target,
    title: "AUTORIDADE DE MARCA",
    description: "Tenha seu próprio aplicativo nas lojas e eleve o nível do seu atendimento.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="funcionalidades" className="py-24 lg:py-32 bg-[#050505] relative overflow-hidden">
      {/* Background HUD Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(#D4FF00 1px, transparent 1px), linear-gradient(90deg, #D4FF00 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="section-container relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20 animate-fade-in text-center lg:text-left">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-6 justify-center lg:justify-start">
              <span className="h-px w-12 bg-primary"></span>
              <span className="font-display font-black italic uppercase text-[10px] tracking-[0.4em] text-primary">
                EXPERIÊNCIA COMPLETA EM UM SÓ LUGAR
              </span>
            </div>
            <h2 className="text-3xl sm:text-6xl lg:text-[70px] font-display font-black mb-6 italic leading-[0.9] tracking-tighter uppercase">
              SEU <span className="text-primary text-blur-sm">APP PRÓPRIO</span> NAS LOJAS <br />
              <span className="text-white">100% GRÁTIS</span>
            </h2>
            <div className="bg-primary/10 border-l-4 border-primary p-6 mt-8 max-w-2xl">
              <p className="font-display font-bold uppercase italic text-sm tracking-widest text-white/90">
                Outros cobram <span className="line-through text-red-500">R$ 199/mês</span> por isso. <br />
                Você tem <span className="text-primary underline decoration-primary/30">DE GRAÇA</span> no ApexPro.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center lg:items-end gap-4">
            <div className="flex gap-4">
              <div className="p-4 bg-white/5 border border-white/10 -skew-x-12">
                <p className="font-display font-black italic uppercase text-[10px] tracking-widest text-white">App Store</p>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 -skew-x-12">
                <p className="font-display font-black italic uppercase text-[10px] tracking-widest text-white">Google Play</p>
              </div>
            </div>
            <p className="font-display font-black text-[100px] leading-none text-white/5 italic uppercase select-none hidden xl:block">NATIVO</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: Zap, title: "Personalização Total", desc: "Seu logo, suas cores, sua identidade visual completa." },
            { icon: Utensils, title: "Gestão Alimentar", desc: "Planos de dieta integrados ao acompanhamento de treino." },
            { icon: Shield, title: "Protocolos Claros", desc: "Organização impecável de rotinas hormonais e suplementação." },
            { icon: Zap, title: "Check-in Inteligente", desc: "Acompanhamento diário da rotina e evolução do aluno." },
            { icon: Shield, title: "Privacidade e Foco", desc: "Ambiente profissional para sua consultoria prosperar." },
            { icon: Target, title: "Resultados Reais", desc: "A junção de treino e dieta em um app que gera engajamento." }
          ].map((feature, index) => (
            <div
              key={index}
              className="athletic-card group p-8 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="kinetic-border" />

              <div className="relative z-10">
                <div className="w-14 h-14 bg-primary/10 border border-primary/20 -skew-x-12 flex items-center justify-center mb-8 group-hover:bg-primary transition-all duration-300">
                  <feature.icon className="text-primary group-hover:text-black transition-colors" size={28} />
                </div>

                <h3 className="font-display font-black text-2xl text-white italic uppercase mb-4 tracking-tighter group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>

                <p className="font-display font-bold uppercase italic text-[11px] leading-relaxed tracking-widest text-white/40 group-hover:text-white/70 transition-colors border-l-2 border-white/10 pl-4">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
