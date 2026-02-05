import { Star, Quote, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    name: "RAFAEL COSTA",
    role: "PERSONAL TRAINER",
    location: "GOIÂNIA, GO",
    image: "RC",
    rating: 5,
    text: "Antes eu passava treino no Zap e metade nem abria. Agora eles têm MEU APP no celular deles. Virei referência na cidade. Fila de espera de 20 pessoas.",
    highlight: "DOBREI MEUS ALUNOS EM 3 MESES",
    metric: "FILA DE ESPERA",
  },
  {
    name: "JULIANA ALVES",
    role: "NUTRICIONISTA",
    location: "SÃO PAULO, SP",
    image: "JA",
    rating: 5,
    text: "Taxa de retenção subiu de 60% para 92%. O app tá sempre na mão deles, eles treinam mais, veem resultado, e ficam comigo anos.",
    highlight: "MEUS ALUNOS NÃO CANCELAM MAIS",
    metric: "92% RETENÇÃO",
  },
  {
    name: "PEDRO HENRIQUE",
    role: "COACH ONLINE",
    location: "CURITIBA, PR",
    image: "PH",
    rating: 5,
    text: "Meus alunos acham que eu tenho empresa grande. É só eu, mas com o app personalizado ninguém imagina. Cobro 3x mais agora.",
    highlight: "PAREÇO UM PROFISSIONAL DE R$ 10K/MÊS",
    metric: "TICKER 3X+",
  },
];

const TestimonialsSection = () => {
  return (
    <section id="depoimentos" className="py-24 lg:py-32 bg-[#050505] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="section-container relative z-10">
        <div className="flex flex-col lg:flex-row items-end justify-between gap-12 mb-20 text-center lg:text-left">
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-6 justify-center lg:justify-start">
              <span className="h-px w-12 bg-primary"></span>
              <span className="font-display font-black italic uppercase text-[10px] tracking-[0.4em] text-primary">
                PROVA SOCIAL AGRESSIVA
              </span>
            </div>
            <h2 className="text-3xl sm:text-6xl lg:text-[70px] font-display font-black mb-6 italic leading-[0.9] tracking-tighter uppercase">
              QUEM DOMINA <br /><span className="text-primary text-blur-sm">O JOGO</span> USA.
            </h2>
            <p className="font-display font-bold uppercase italic text-sm tracking-[0.2em] text-white/50 max-w-xl mx-auto lg:mx-0">
              Junte-se à elite de profissionais que pararam de amadorismo e escalaram com autoridade.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="athletic-card group p-8 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500 animate-fade-in relative"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="kinetic-border" />

              {/* Quote Marker */}
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                <Quote className="text-primary w-8 h-8 rotate-180" strokeWidth={1} />
              </div>

              {/* Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-white/5 border border-white/10 -skew-x-12 flex items-center justify-center text-primary font-display font-black italic text-xl group-hover:scale-110 transition-transform duration-300 relative overflow-hidden">
                  <span className="relative z-10">{testimonial.image}</span>
                  <div className="absolute inset-0 bg-primary/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </div>
                <div>
                  <h4 className="font-display font-black italic uppercase text-lg leading-none mb-1 text-white">
                    {testimonial.name}
                  </h4>
                  <p className="text-[11px] lg:text-[9px] font-bold uppercase tracking-widest text-primary/60">
                    {testimonial.role}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="mb-8 relative z-10">
                <h5 className="font-display font-black italic uppercase text-sm text-primary mb-4 tracking-tighter line-clamp-1">
                  "{testimonial.highlight}"
                </h5>
                <p className="font-sans text-sm leading-relaxed text-white/60 group-hover:text-white/80 transition-colors italic">
                  "{testimonial.text}"
                </p>
              </div>

              {/* Footer / Metric */}
              <div className="pt-6 border-t border-white/5 flex items-center justify-between group-hover:border-primary/20 transition-colors">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-primary" />
                  <span className="text-[9px] font-black uppercase italic tracking-widest text-primary">
                    RESULTADO REAL
                  </span>
                </div>
                <div className="text-[11px] lg:text-[10px] font-black uppercase italic tracking-widest text-white px-2 py-1 bg-white/5 -skew-x-12 ring-1 ring-white/10">
                  {testimonial.metric}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
