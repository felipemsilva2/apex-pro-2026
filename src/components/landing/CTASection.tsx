import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, CheckCircle2 } from "lucide-react";

import { useTenant } from "@/contexts/TenantContext";

const CTASection = () => {
  const { tenant } = useTenant();
  return (
    <section className="py-24 lg:py-40 relative overflow-hidden bg-primary px-4 sm:px-0">
      {/* Background kinetic textures */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(0,0,0,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.2)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="absolute top-0 right-0 opacity-20 hidden lg:block">
        <span className="font-display font-black text-[200px] leading-none text-black italic uppercase select-none translate-x-1/4 -translate-y-1/4">
          EMPIRE
        </span>
      </div>

      <div className="section-container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Urgency Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-black text-primary font-display font-black italic text-[10px] uppercase tracking-[0.3em] -skew-x-12 mb-10 shadow-2xl">
            <Zap size={14} className="fill-current animate-pulse" />
            <span>VAGAS LIMITADAS PARA O PLANO DE R$ 39,90</span>
          </div>

          {/* Headline */}
          <h2 className="text-4xl sm:text-6xl lg:text-8xl font-display font-black text-black mb-8 italic uppercase tracking-tighter leading-[0.85]">
            O PRÓXIMO PASSO <br />
            <span className="text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.3)]">PARA O SEU IMPÉRIO</span>
          </h2>

          {/* Scarcity Text */}
          <div className="bg-black/5 border-l-4 border-black p-4 mb-12 max-w-lg mx-auto transform -skew-x-6">
            <p className="font-display font-black italic uppercase text-sm tracking-widest text-black">
              Apenas 7 vagas disponíveis com esse valor hoje.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-8">
            <button
              onClick={() => window.location.href = '/signup'}
              className="w-full sm:w-auto bg-black text-primary px-16 py-8 font-display font-black italic uppercase text-xl tracking-[0.2em] shadow-[0_30px_70px_rgba(0,0,0,0.4)] hover:scale-105 active:scale-95 transition-all group"
              style={{ clipPath: 'polygon(25px 0, 100% 0, calc(100% - 25px) 100%, 0 100%)' }}
            >
              <span className="flex items-center justify-center gap-4">
                QUERO MEU APP PRÓPRIO AGORA
                <ArrowRight size={24} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
              </span>
            </button>

            {/* Value Checklist */}
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {[
                "Liberação imediata",
                "30 dias grátis",
                "Sem contrato de fidelidade"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-black rounded-sm flex items-center justify-center -skew-x-12">
                    <CheckCircle2 size={12} className="text-primary" />
                  </div>
                  <span className="font-display font-black italic uppercase text-[10px] tracking-widest text-black/80">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
