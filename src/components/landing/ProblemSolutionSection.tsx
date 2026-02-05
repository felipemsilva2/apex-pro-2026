import { AlertCircle, CheckCircle, ArrowRight, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const problems = [
  "Dificuldade em monitorar múltiplos alvos simultaneamente",
  "Gestão de planos de dieta e treino não sistematizada",
  "Comunicação fragmentada (WhatsApp, Planilhas)",
  "Logística de pagamento e cobrança ineficiente",
];

const solutions = [
  "Monitoramento de múltiplos alunos em dashboard unificado",
  "Gestão profissional de protocolo de treino e dieta",
  "Centralização de informações com histórico total",
  "Automação financeira e recorrência garantida",
];

const ProblemSolutionSection = () => {
  return (
    <section className="py-24 lg:py-32 bg-black relative overflow-hidden">
      <div className="section-container relative z-10">
        <div className="text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-red-500/20 bg-red-500/5 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Por que sua consultoria está estagnada</span>
          </div>

          <h2 className="text-2xl sm:text-5xl lg:text-6xl font-display font-black mb-6 italic uppercase tracking-tighter text-white">
            ❌ VOCÊ ESTÁ <span className="text-red-500 text-blur-sm">PERDENDO TEMPO</span> COM FRAGMENTAÇÃO
          </h2>
          <p className="font-display font-bold uppercase italic text-sm tracking-widest text-white/40 max-w-xl mx-auto">
            A desorganização que impede sua escala e sua autoridade.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {/* THE DIALOGUES */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-b from-red-500/20 to-transparent opacity-50 blur-sm rounded-lg" />
            <div className="relative h-full bg-[#0a0a0a] border border-red-500/20 p-8 lg:p-10 flex flex-col justify-center">
              <div className="space-y-6">
                <div className="bg-white/5 p-4 rounded-tl-none rounded-2xl border-l-4 border-red-500 max-w-[90%]">
                  <p className="font-sans text-sm italic text-white/60">"O treino está no WhatsApp e a dieta no e-mail?"</p>
                </div>
                <div className="bg-white/5 p-4 rounded-tl-none rounded-2xl border-l-4 border-red-500 max-w-[90%] ml-4">
                  <p className="font-sans text-sm italic text-white/60">"Não lembro onde anotei minhas cargas da semana..."</p>
                </div>
                <div className="bg-white/5 p-4 rounded-tl-none rounded-2xl border-l-4 border-red-500 max-w-[90%]">
                  <p className="font-sans text-sm italic text-white/60">"Onde eu vejo quais suplementos devo tomar hoje?"</p>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-red-500/10">
                <p className="font-display font-black italic uppercase text-xs text-red-500 tracking-widest">
                  O problema hoje:
                </p>
                <p className="mt-2 text-white/40 text-sm">Informações espalhadas que confundem o aluno e tomam seu tempo.</p>
              </div>
            </div>
          </div>

          {/* THE CONSEQUENCES */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-b from-red-500/10 to-transparent opacity-30 blur-sm rounded-lg" />
            <div className="relative h-full bg-[#050505] border border-white/5 p-8 lg:p-10">
              <h3 className="font-display font-black italic uppercase text-xl text-white mb-8 border-b border-white/10 pb-6">
                O RESULTADO É FATAL:
              </h3>

              <ul className="space-y-8">
                <li className="flex items-start gap-4">
                  <span className="text-xl">👉</span>
                  <div>
                    <p className="font-display font-black italic uppercase text-xs text-white tracking-widest">No Zap eles esquecem</p>
                    <p className="text-white/40 text-sm mt-1">Seus alunos esquecem, não treinam, não veem resultado.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-xl">👉</span>
                  <div>
                    <p className="font-display font-black italic uppercase text-xs text-white tracking-widest">Falta de autoridade</p>
                    <p className="text-white/40 text-sm mt-1">Você parece um amador mandando PDF e áudio.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-xl">👉</span>
                  <div>
                    <p className="font-display font-black italic uppercase text-xs text-red-500 tracking-widest">Cancelamento em 60 dias</p>
                    <p className="text-white/40 text-sm mt-1 font-bold">Sem valor percebido, eles abandonam a consultoria.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <a
            href="#funcionalidades"
            className="group inline-flex items-center gap-3 font-display font-black italic uppercase text-sm tracking-widest text-white/50 hover:text-primary transition-colors"
          >
            VER EXPERIÊNCIA COMPLETA
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolutionSection;
