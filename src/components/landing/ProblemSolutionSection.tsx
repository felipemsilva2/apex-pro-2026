import { AlertCircle, CheckCircle, ArrowRight } from "lucide-react";

const problems = [
  "Dificuldade em acompanhar múltiplos clientes simultaneamente",
  "Falta de ferramentas profissionais para gestão de treinos e dietas",
  "Comunicação dispersa entre WhatsApp, planilhas e papel",
  "Alto custo para desenvolver uma plataforma própria",
];

const solutions = [
  "Gerencie centenas de clientes em um único dashboard",
  "Ferramentas completas para planos alimentares e treinos",
  "Comunicação centralizada com histórico completo",
  "Plataforma pronta, com sua marca, por uma fração do custo",
];

const ProblemSolutionSection = () => {
  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="section-container">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Pare de Perder Tempo com Processos Manuais
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubra como o NutriManage Pro resolve os maiores desafios do seu dia a dia
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Problems */}
          <div className="card-elevated p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="text-destructive" size={24} />
              </div>
              <h3 className="text-xl font-bold text-foreground">Sem o NutriManage Pro</h3>
            </div>
            <ul className="space-y-4">
              {problems.map((problem, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-destructive text-sm">✕</span>
                  </div>
                  <span className="text-muted-foreground">{problem}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div className="card-elevated p-6 lg:p-8 border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-bold text-foreground">Com o NutriManage Pro</h3>
              </div>
              <ul className="space-y-4">
                {solutions.map((solution, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="text-primary" size={14} />
                    </div>
                    <span className="text-foreground">{solution}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <a
            href="#funcionalidades"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Ver todas as funcionalidades
            <ArrowRight size={18} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolutionSection;
