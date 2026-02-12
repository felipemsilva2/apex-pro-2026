import { useState } from "react";
import { Link } from "react-router-dom";
import { Zap, Check, ArrowRight, Shield, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PricingSection = () => {
  const [selectedCycle, setSelectedCycle] = useState<'MENSAL' | 'ANUAL'>('MENSAL');

  return (
    <section id="planos" className="py-24 lg:py-32 bg-black relative overflow-hidden">
      {/* HUD Decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="section-container relative z-10">
        <div className="text-center mb-20 animate-fade-in">
          <div className="flex items-center gap-4 justify-center mb-6">
            <span className="h-px w-12 bg-primary"></span>
            <span className="font-display font-black italic uppercase text-[10px] tracking-[0.4em] text-primary">
              INVISTA NA SUA ESTRUTURA PROFISSIONAL
            </span>
            <span className="h-px w-12 bg-primary"></span>
          </div>
          <h2 className="text-3xl sm:text-6xl lg:text-[70px] font-display font-black mb-6 italic leading-[0.9] tracking-tighter uppercase">
            PLANO ÚNICO <br />
            <span className="text-primary text-blur-sm">ECOSSISTEMA COMPLETO</span>
          </h2>
          <p className="font-display font-bold uppercase italic text-sm tracking-widest text-white/40 max-w-2xl mx-auto">
            O valor mais justo do mercado para a gestão definitiva da sua consultoria.
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="flex gap-2 p-1 bg-white/5 border border-white/10 w-fit -skew-x-12">
            <button
              onClick={() => setSelectedCycle('MENSAL')}
              className={cn(
                "px-8 py-3 font-display font-black italic text-[11px] uppercase tracking-[0.2em] transition-all",
                selectedCycle === 'MENSAL' ? "bg-primary text-black" : "text-white/40 hover:text-white"
              )}
            >
              Faturamento Mensal
            </button>
            <button
              onClick={() => setSelectedCycle('ANUAL')}
              className={cn(
                "px-8 py-3 font-display font-black italic text-[11px] uppercase tracking-[0.2em] transition-all",
                selectedCycle === 'ANUAL' ? "bg-primary text-black" : "text-white/40 hover:text-white"
              )}
            >
              Plano Anual (-20%)
            </button>
          </div>
        </div>

        <div className="max-w-xl mx-auto relative">
          {/* Price Kinetic Glow */}
          <div className="absolute -inset-4 bg-primary/10 blur-[100px] rounded-full animate-pulse" />

          <div className="athletic-card group p-8 lg:p-12 relative bg-[#0a0a0a] border-2 border-primary/30 shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
            <div className="kinetic-border" />

            <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-8 py-2 bg-primary text-black font-display font-black italic text-[11px] uppercase tracking-widest -skew-x-12 z-20">
              30 DIAS GRÁTIS
            </div>

            <div className="text-center mb-12">
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-xl font-black text-primary italic uppercase tracking-tighter">R$</span>
                <span className="text-6xl lg:text-8xl font-display font-black text-white italic uppercase leading-none tracking-tighter">
                  {selectedCycle === 'MENSAL' ? '49,99' : '39,99'}
                </span>
                <span className="text-xs font-bold text-white/30 uppercase tracking-widest">/mês</span>
              </div>
              <p className="text-primary/60 font-display font-black italic uppercase text-[9px] tracking-[0.2em]">
                {selectedCycle === 'MENSAL' ? '(MENOS QUE 2 CAFÉS POR SEMANA)' : '(ECONOMIA DE R$ 120 NO ANO)'}
              </p>
            </div>

            <div className="bg-white/5 p-6 border-y border-white/10 mb-10 -mx-8 lg:-mx-12">
              <p className="font-display font-black italic uppercase text-xs text-center text-white">
                {selectedCycle === 'MENSAL' ? 'MIGRE PARA O ANUAL POR R$ 39,99/mês' : 'VALOR TOTAL: R$ 479,88/ano'}
              </p>
            </div>

            <ul className="space-y-6 mb-12 text-left">
              {[
                { label: "App nativo nas lojas (Seu Nome)", green: "INCLUSO" },
                { label: "Módulo de Dieta e Macronutrientes", green: "LIBERADO" },
                { label: "Gestão de Protocolos", green: "LIBERADO" },
                { label: "Alunos Ilimitados", green: "CHECK" },
                { label: "Treinos com vídeos e GIFs", green: "CHECK" },
                { label: "Dashboard de Resultados", green: "CHECK" }
              ].map((item, i) => (
                <li key={i} className="flex items-center justify-between gap-4 border-b border-white/5 pb-2">
                  <span className="font-display font-bold uppercase italic text-[11px] lg:text-[10px] tracking-widest text-white/60">{item.label}</span>
                  <span className="font-display font-black italic uppercase text-[11px] lg:text-[10px] text-primary">{item.green}</span>
                </li>
              ))}
            </ul>

            <div className="space-y-6 pt-4">
              <Button
                onClick={() => window.location.href = `/checkout?plan=${selectedCycle === 'ANUAL' ? 'ANUAL' : 'MENSAL'}`}
                className="w-full btn-athletic h-16 group text-base"
              >
                COMEÇAR TESTE GRÁTIS AGORA
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </Button>
              <p className="mt-4 text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] text-center">
                Ao iniciar, você concorda com nossos <Link to="/terms" className="underline hover:text-white transition-colors">Termos</Link> e <Link to="/privacy" className="underline hover:text-white transition-colors">Privacidade</Link>.
              </p>

              <div className="text-center space-y-2">
                <p className="font-display font-bold uppercase italic text-[9px] tracking-widest text-white/30">
                  Após 30 dias: cobrança automática de {selectedCycle === 'MENSAL' ? 'R$ 49,99' : 'R$ 479,88'}
                </p>
                <p className="font-display font-black italic uppercase text-[9px] tracking-[0.2em] text-primary/60">
                  Cancele quando quiser. Sem multas. Sem pegadinhas.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tactical Footer */}
        <div className="mt-20 text-center animate-fade-in opacity-40 group hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-center gap-6 mb-4">
            <Shield size={20} className="text-primary" />
            <div className="h-px w-20 bg-white/10"></div>
            <p className="font-display font-bold uppercase italic text-[10px] tracking-[0.3em]">
              RESULTADOS GARANTIDOS // 30 DIAS DE SATISFAÇÃO COMPLETA
            </p>
            <div className="h-px w-20 bg-white/10"></div>
            <Target size={20} className="text-primary" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
