import { Palette, UserPlus, BarChart2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  {
    number: "01",
    label: "PASSO 01",
    icon: Palette,
    title: "CONFIGURAÇÃO DE MARCA",
    description: "Em 5 minutos, você define o DNA da sua marca. Cores, logo e domínio. O sistema assume sua identidade visual automaticamente.",
    time: "TEMPO: 5 MIN",
  },
  {
    number: "02",
    label: "PASSO 02",
    icon: UserPlus,
    title: "CADASTRO E PRESCRIÇÃO",
    description: "Importe sua base de alunos ou cadastre novos usuários. Gere planos de treino e dieta com precisão e facilidade.",
    time: "LIMITE: ILIMITADO",
  },
  {
    number: "03",
    label: "PASSO 03",
    icon: BarChart2,
    title: "CONTROLE TOTAL",
    description: "O dashboard assume a organização. Monitore KPIs de evolução, adesão e retenção enquanto você escala sua consultoria.",
    time: "STATUS: AUTOMÁTICO",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="como-funciona" className="py-24 lg:py-32 bg-black relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: 'linear-gradient(#f0f0f0 1px, transparent 1px), linear-gradient(90deg, #f0f0f0 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="section-container relative z-10">
        {/* SECTION 1: IMAGINE */}
        <div className="text-center mb-20 animate-fade-in">
          <div className="flex items-center gap-4 justify-center mb-6">
            <span className="h-px w-12 bg-primary"></span>
            <span className="font-display font-black italic uppercase text-[10px] tracking-[0.4em] text-primary">
              VISÃO DE FUTURO
            </span>
            <span className="h-px w-12 bg-primary"></span>
          </div>
          <h2 className="text-4xl sm:text-6xl lg:text-[70px] font-display font-black mb-6 italic leading-[0.9] tracking-tighter uppercase">
            ✅ AGORA <span className="text-primary text-blur-sm">IMAGINE ISSO:</span>
          </h2>
        </div>

        <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 p-8 lg:p-12 mb-32 -skew-x-2 relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] -translate-y-1/2 translate-x-1/2" />

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="font-display font-bold uppercase italic text-lg tracking-widest text-white">
                Seu aluno abre o <span className="text-primary">CELULAR</span>.
              </p>
              <p className="text-white/60 leading-relaxed font-sans">
                Lá está <strong className="text-white">O SEU APP</strong> com a sua logo. <br />
                Treino do dia pronto. GIF de cada exercício. Timer. Check-in. <br />
                Plano alimentar na palma da mão.
              </p>
              <p className="font-display font-black italic uppercase text-primary tracking-tighter text-2xl">
                Ele treina. Você acompanha. Ele fica mais tempo.
              </p>
            </div>
            <div className="bg-black/50 p-8 border border-white/5 space-y-4">
              <p className="font-display font-black italic uppercase text-sm tracking-widest text-white/40">O Veredito:</p>
              <p className="font-display font-black italic uppercase text-4xl text-white tracking-tighter">Isso é ApexPro.</p>
              <p className="text-primary font-bold italic tracking-[0.2em] text-xs">E CUSTA MENOS QUE UMA PIZZA POR MÊS.</p>
            </div>
          </div>
        </div>

        {/* SECTION 2: COMPARISON */}
        <div className="text-center mb-16">
          <h3 className="text-3xl lg:text-5xl font-display font-black mb-12 italic uppercase tracking-tighter text-white">
            VOCÊ vs. O COACH QUE USA <span className="text-primary">APEXPRO</span>
          </h3>

          <div className="grid md:grid-cols-2 gap-0 max-w-5xl mx-auto border border-white/10 overflow-hidden">
            {/* THE OLD WAY */}
            <div className="p-8 lg:p-12 bg-white/[0.02] border-r border-white/10">
              <p className="font-display font-black italic uppercase text-2xl text-red-500 mb-8 border-b border-red-500/20 pb-4">VOCÊ:</p>
              <ul className="space-y-6 text-left">
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-bold">❌</span>
                  <span className="text-white/40 font-display font-bold italic uppercase text-xs tracking-widest">Manda treino em PDF no WhatsApp</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-bold">❌</span>
                  <span className="text-white/40 font-display font-bold italic uppercase text-xs tracking-widest">Aluno perde, você manda de novo (10x)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-bold">❌</span>
                  <span className="text-white/40 font-display font-bold italic uppercase text-xs tracking-widest">Sem controle se ele treinou ou não</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-bold">❌</span>
                  <span className="text-white/40 font-display font-bold italic uppercase text-xs tracking-widest">Parece amador</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-bold">❌</span>
                  <span className="text-white/40 font-display font-bold italic uppercase text-xs tracking-widest">Aluno cancela em 2 meses</span>
                </li>
              </ul>
            </div>

            {/* THE APEX WAY */}
            <div className="p-8 lg:p-12 bg-primary/5 relative">
              <div className="absolute inset-0 border-2 border-primary/30" />
              <p className="font-display font-black italic uppercase text-2xl text-primary mb-8 border-b border-primary/20 pb-4 relative z-10">COACH APEXPRO:</p>
              <ul className="space-y-6 text-left relative z-10">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✅</span>
                  <span className="text-white font-display font-black italic uppercase text-xs tracking-widest">Aluno abre O APP TODO DIA</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✅</span>
                  <span className="text-white font-display font-black italic uppercase text-xs tracking-widest">Treino sempre disponível com GIFs</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✅</span>
                  <span className="text-white font-display font-black italic uppercase text-xs tracking-widest">Vê em tempo real quem treinou</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✅</span>
                  <span className="text-white font-display font-black italic uppercase text-xs tracking-widest">Parece empresa de R$ 50K/mês</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">✅</span>
                  <span className="text-white font-display font-black italic uppercase text-xs tracking-widest">Aluno fica 12+ meses</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-20 text-center animate-fade-in">
          <h4 className="font-display font-black italic uppercase text-2xl text-white mb-8 tracking-tighter">
            Qual coach <span className="text-primary underline decoration-primary/30">VOCÊ</span> quer ser?
          </h4>
          <button
            onClick={() => window.location.href = '/checkout'}
            className="btn-athletic text-[11px] px-12 py-5 shadow-[0_15px_40px_rgba(212,255,0,0.15)] group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-3">
              ESCOLHO SER APEX PRO
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
