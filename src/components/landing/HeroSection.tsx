import { ArrowRight, LayoutDashboard, Zap, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { InteractiveDemoModal } from "./InteractiveDemoModal";

const HeroSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showDemo, setShowDemo] = useState(false);

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      navigate("/dashboard");
    } else {
      setShowDemo(true);
    }
  };
  return (
    <section className="relative pt-32 lg:pt-48 pb-24 lg:pb-32 overflow-hidden bg-black">
      {/* Background Kinetic Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 opacity-40" />
        <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -translate-x-1/2" />

        {/* Giant Data Text - Positioned to side to not obscure text */}
        <div className="absolute top-1/2 -right-20 -translate-y-1/2 hidden xl:block">
          <span className="data-text-bg rotate-90 origin-center translate-x-1/2">
            GESTÃO_APEX
          </span>
        </div>
      </div>

      <div className="section-container relative z-10 flex flex-col items-center text-center">
        <div className="max-w-4xl">
          <div className="flex items-center justify-center gap-4 mb-8 animate-fade-in mx-auto">
            <span className="h-px w-8 bg-primary"></span>
            <span className="font-display font-black italic uppercase text-[10px] tracking-[0.4em] text-primary">
              iOS & ANDROID - 100% NO SEU NOME
            </span>
            <span className="h-px w-8 bg-primary"></span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-[72px] font-display font-black mb-8 animate-fade-in uppercase italic leading-[0.95] tracking-tighter">
            SEU PRÓPRIO APP <br />
            <span className="text-primary text-blur-sm">DE TREINO NAS LOJAS</span>
          </h1>

          <p className="font-display font-bold uppercase italic text-sm lg:text-base tracking-[0.15em] text-white mb-10 max-w-2xl mx-auto border-y border-primary/20 py-8 animate-fade-in decoration-primary/30 underline-offset-8" style={{ animationDelay: '0.1s' }}>
            Pare de perder alunos para planilhas do Excel. <br />
            <span className="text-primary">Dê a eles um APP PROFISSIONAL que eles vão ABRIR TODO DIA.</span>
          </p>

          <div className="flex flex-col items-center gap-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <button
              onClick={() => navigate("/signup")}
              className="btn-athletic text-[12px] px-16 py-6 shadow-[0_20px_50px_rgba(212,255,0,0.4)] group scale-110 active:scale-95 transition-all"
            >
              <span className="flex items-center gap-3">
                TESTAR GRÁTIS POR 30 DIAS
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-2" />
              </span>
            </button>

            <div className="flex flex-col items-center gap-2">
              <p className="font-display font-black italic uppercase text-[10px] tracking-widest text-white/60">
                Apenas R$ 39,90/mês depois. Cancele quando quiser.
              </p>
              <button
                onClick={handlePreviewClick}
                className="flex items-center gap-2 group opacity-50 hover:opacity-100 transition-opacity mt-4"
              >
                <LayoutDashboard size={14} className="text-primary" />
                <span className="font-display font-black italic uppercase text-[9px] tracking-widest text-white border-b border-primary/30 pb-1">
                  VER PREVIEW DO DASHBOARD
                </span>
              </button>
            </div>
          </div>

          {/* Aggressive Feature Badges */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mt-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 -skew-x-12">
              <span className="text-primary font-bold">✅</span>
              <span className="font-display font-black italic uppercase text-[9px] tracking-widest text-white/80">Seu logo, suas cores, seu app</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 -skew-x-12">
              <span className="text-primary font-bold">✅</span>
              <span className="font-display font-black italic uppercase text-[9px] tracking-widest text-white/80">Alunos ilimitados</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 -skew-x-12">
              <span className="text-primary font-bold">✅</span>
              <span className="font-display font-black italic uppercase text-[9px] tracking-widest text-white/80">Disponível na App Store e Google Play</span>
            </div>
          </div>
        </div>
      </div>

      <InteractiveDemoModal
        isOpen={showDemo}
        onClose={() => setShowDemo(false)}
      />
    </section>
  );
};

export default HeroSection;
